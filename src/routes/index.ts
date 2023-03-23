import * as Router from '@koa/router';
import * as sonarqube from '../lib/sonarqube';
import sonarqubeScan from '../lib/sonarqube-scan';
import * as git from '../lib/git';
import * as path from 'path';
import * as fs from 'fs-extra';

const router = new Router({ prefix: '/api' });

// 扫描
router.get('/sonarqube/scan', async (ctx) => {
    const {
        packageName, branchName = 'develop',
        username, commit, language, sources,
        repoUrl,
    }= ctx.request.query;

    console.log('请求参数: %o', ctx.request.query);

    if (!repoUrl || !language || !sources || !branchName) {
        ctx.status = 400;
        ctx.body = { msg: '参数缺失' };
        return;
    }

    // 项目key
    const projectKey = `${packageName}-${username}-${commit.slice(-7)}-${Date.now()}`;

    const [
        token, { path: repoPath }
    ] = await Promise.all([
        // 生成项目token
        sonarqube.generateProjectToken({ projectKey }),
        // clone项目到本地
        git.clone({
            url: repoUrl.toString(),
            branchName: 'master',
        }),
    ]);

    // 扫描参数
    const scanOptions = {
        token,
        projectKey,
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
    // 扫码指定分支代码
    await sonarqubeScan(scanOptions);
    // 删除代码
    await fs.remove(repoPath);

    ctx.body = {
        packageName,
        projectName: projectKey,
        projectKey,
        token,
        branchName,
        username,
        commit,
        language,
    };
});

export default router;
