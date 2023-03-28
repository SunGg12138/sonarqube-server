import * as path from 'path';
import * as fs from 'fs-extra';
import * as git from '../lib/git';
import * as config from 'config';
import * as utils from '../lib/utils';
import redis from '../lib/redis';
import * as notify from '../lib/notify';
import * as sonarqube from '../lib/sonarqube';
import sonarqubeScan from '../lib/sonarqube-scan';
import { EnsureRepositoryOptions, HandleSonarqubeScanOptions } from '../@types/service';

const TMP_PATH = path.join(__dirname, '../../tmp');
const msgWebhookUrl = config.get('notification.msg_webhook_url');
const errorWebhookUrl = config.get('notification.error_webhook_url');
const redisSonarqubeScanListKey = config.get('redis_key.sonarqube_scan_list');
const redisSonarqubeScanStartCommitKey = config.get('redis_key.sonarqube_scan_start_commit');

/**
 * 确保仓库存在
*/
export async function ensureRepository(
    options: EnsureRepositoryOptions
): Promise<{ localRepoPath: string }> {

    const localRepoPath = path.join(TMP_PATH, options.name);
    const hasLocal = await fs.pathExists(`${localRepoPath}/.git`);

    if (hasLocal) {
        await git.pull({ dir: localRepoPath });
    } else {
        await fs.remove(localRepoPath);
        await fs.ensureDir(localRepoPath);
        await git.clone({
            url: options.url,
            dir: localRepoPath,
            branchName: 'develop',
        });
    }

    return { localRepoPath };
}

/**
 * 代码质量检测
*/
export async function handleSonarqubeScan(
    options: HandleSonarqubeScanOptions
) {
    const {
        packageName, repoUrl, actor, commitSha, sources, language, 
    } = options;

    // clone代码到本地
    const { localRepoPath } = await ensureRepository({ name: packageName, url: repoUrl });

    // 获取分支当前所在的commit
    const startCommitSha = await redis.hget(redisSonarqubeScanStartCommitKey, packageName);
    // 防止未设置起始commit
    if (!startCommitSha) {
        await redis.rpush(redisSonarqubeScanListKey, JSON.stringify(options));
        await notify.paramsError(
            errorWebhookUrl,
            {
                text: `[SonarQube Error]项目未设置起始commit \npackageName=${packageName} \nrepoUrl=${repoUrl}`
            }
        );
        // 防止不断循环
        await utils.sleep(5000);
        return;
    }

    // reset代码到指定commit
    await git.reset({ dir: localRepoPath, commitSha: startCommitSha });
    
    // 生成项目token
    const now = Date.now(), projectKey = `${packageName}-${now}`;
    const projectName = `${packageName}-${actor}-${commitSha.slice(-7)}-${startCommitSha.slice(-7)}`;
    const token = await sonarqube.generateProjectToken({ projectKey });

    // 扫描参数
    const scanOptions = {
        token,
        projectKey,
        projectName,
        language,
        sources: path.join(localRepoPath, sources),
    };
    // 扫码当前代码
    await sonarqubeScan(scanOptions);
    // 重置代码到提交的最新commit
    await git.reset({ dir: localRepoPath, commitSha });
    // 扫码当前代码
    await sonarqubeScan(scanOptions);

    // 发送代码质量通知
    await notify.codeQuality(errorWebhookUrl, msgWebhookUrl, {
        packageName,
        projectKey,
        commitSha,
        actor,
    });

    // 重新设置起点commit
    await redis.hset(redisSonarqubeScanStartCommitKey, packageName, commitSha);
}
