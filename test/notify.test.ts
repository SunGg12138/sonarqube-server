import * as notify from '../src/lib/notify';
import * as config from 'config';

const errorWebhookUrl = config.get('notification.error_webhook_url');
const msgWebhookUrl = config.get('notification.msg_webhook_url');

describe('Notify Test', function () {
    it('代码质量检测-未发现异常', async function () {
        await notify.codeQualitySuccess(errorWebhookUrl, {
            packageName: 'test',
            projectKey: 'test-1679992073683',
            commitSha: '1ab36e44dab9540d92da63dad69c60b55c42ef2c',
            actor: 'sungg',
        });
    });

    it('代码质量检测-发现异常', async function () {
        await notify.codeQuality(errorWebhookUrl, msgWebhookUrl, {
            packageName: 'test',
            projectKey: 'test-1679992073683',
            commitSha: '1ab36e44dab9540d92da63dad69c60b55c42ef2c',
            actor: 'sungg',
        });
    });
});
