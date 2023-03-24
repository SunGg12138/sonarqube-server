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
        language, sources,
        repoUrl,
    }= ctx.request.query;

    console.log('请求参数: %o', ctx.request.query);

    if (!repoUrl || !language || !sources) {
        ctx.status = 400;
        ctx.body = { msg: '参数缺失' };
        return;
    }

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
    };
});

export default router;
