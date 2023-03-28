import redis from './lib/redis';
import * as config from 'config';
import * as notify from './lib/notify';
import * as services from './services/sonarqubeScan';
import { HandleSonarqubeScanOptions } from './@types/service';

const errorWebhookUrl = config.get('notification.error_webhook_url');
const redisSonarqubeScanListKey = config.get('redis_key.sonarqube_scan_list');

main();

async function main() {
    const res = await redis.brpop(redisSonarqubeScanListKey, 5);

    // 超时返回null
    if (res == null) return main();

    console.log('[consume data]:');
    console.log(res);

    const [ , value ] = res;
    try {
        const params = JSON.parse(value);
        await services.handleSonarqubeScan(<HandleSonarqubeScanOptions>params);
    } catch (error) {
        console.log('[handleSonarqubeScan Error]:');
        console.log(error);
        if (
            !error.message.includes('Unexpected') ||
            !error.message.includes('JSON')
        ) {
            await redis.rpush(redisSonarqubeScanListKey, value);
        }
        await notify.paramsError(
            errorWebhookUrl,
            {
                text: `[SonarQube Error] ${error.message}`
            }
        );
    }

    main();
}
