import { Context } from 'koa';
import * as Router from '@koa/router';
import * as sonarqube from '../lib/sonarqube';
import sonarqubeScan from '../lib/sonarqube-scan';
import * as git from '../lib/git';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as config from 'config';

const sonarqubeWebUrl = config.get('sonarqube.web_url');
const router = new Router({ prefix: '/api' });
const localRepoPath = path.join(__dirname, '../../repositories');

// 扫描
router.get('/sonarqube/scan', async (ctx: Context) => {
    const {
        packageName, repoUrl, language, sources,
    }= ctx.request.query;

    console.log('请求参数: %o', ctx.request.query);

    if (!packageName || !repoUrl || !language || !sources) {
        ctx.status = 400;
        ctx.body = { msg: '参数缺失' };
        return;
    }

    await scanRemoteRepo(ctx);

    // 本地仓库和远程仓库两种模式
    // if (
    //     branchName === 'develop' &&
    //     await fs.pathExists(localRepoPath + '/' + packageName)
    // ) {
    //     await scanLocalRepo(ctx);
    // } else {
    //     await scanRemoteRepo(ctx);
    // }
});

/**
 * 扫描本地仓库
*/
async function scanLocalRepo (ctx: Context) {
    const {
        packageName, branchName = 'develop',
        language, sources,
        repoUrl,
    }= ctx.request.query;
}

/**
 * 扫描远程仓库
*/
async function scanRemoteRepo (ctx: Context) {
    const {
        packageName, branchName = 'develop',
        language, sources,
        repoUrl,
    }= ctx.request.query;

    // 项目key
    const now = Date.now(), projectKey = `${packageName}-${now}`;

    const [
        token, { path: repoPath }
    ] = await Promise.all([
        // 生成项目token
        sonarqube.generateProjectToken({ projectKey }),
        // clone项目到本地
        git.clone({
            url: repoUrl.toString(),
            branchNames: [ 'master', <string>branchName ],
        }),
    ]);

    // 扫描参数
    const scanOptions = {
        token,
        projectKey,
        // projectKey当做临时名称
        projectName: projectKey,
        language: language.toString(),
        sources: path.join(repoPath, sources.toString()),
    };
    // 扫码当前代码
    await sonarqubeScan(scanOptions)
    // 切换到指定分支
    await git.checkout({
        branchName: branchName.toString(),
        dir: repoPath,
    });

    const { latest: { hash, author_name } } = await git.log({ 
        dir: repoPath
    });

    // 项目名称
    const projectName = `${packageName}-${author_name}-${hash.slice(-7)}-${now}`;
    // 扫码指定分支代码
    await sonarqubeScan({
        ...scanOptions,
        projectName,
    });
    // 删除代码
    await fs.remove(repoPath);

    ctx.body = {
        projectName,
        projectKey,
        token,
        projectUrl: `${sonarqubeWebUrl}/dashboard?id=${projectKey}`,
    };
}

export default router;
