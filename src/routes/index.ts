import { Context } from 'koa';
import * as Router from '@koa/router';
import redis from '../lib/redis';
import * as config from 'config';

const router = new Router({ prefix: '/api' });

/**
 * 扫描代码接口
*/
router.get('/sonarqube/scan', async (ctx: Context) => {
    const {
        packageName, repoUrl, language, sources, commitSha, actor,
    }= ctx.request.query;

    if (!packageName || !repoUrl || !language || !sources || !commitSha || !actor) {
        ctx.status = 400;
        ctx.body = { msg: '参数缺失' };
        return;
    }

    // 保存到队列里，依次执行
    const redisSonarqubeScanListKey = config.get('redis_key.sonarqube_scan_list');
    await redis.lpush(redisSonarqubeScanListKey, JSON.stringify({
        packageName, repoUrl, language, sources, commitSha, actor,
    }));

    ctx.body = {
        msg: '发现代码问题后，发送飞书群通知，请关注群“共同照护-技术部”'
    };
});

export default router;
