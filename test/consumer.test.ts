import * as config from 'config';
import redis from '../src/lib/redis';
import * as utils from '../src/lib/utils';
import '../src/consumer';

const redisSonarqubeScanListKey = config.get('redis_key.sonarqube_scan_list');
const redisSonarqubeScanStartCommitKey = config.get('redis_key.sonarqube_scan_start_commit');

describe.only('Consumer Test', function () {
    before(async () => {
        await setData();
    });

    it('等待消费', async () => {
        await utils.sleep(1000000)
    });
});

async function setData () {
    await redis.hset(redisSonarqubeScanStartCommitKey, 'test', '3ead89239f43fdc9c7ca532863cd9bb37a33a989');

    await redis.rpush(redisSonarqubeScanListKey, JSON.stringify({
        packageName: 'mochatest',
        actor: 'mochatest',
        commitSha: '1ab36e44dab9540d92da63dad69c60b55c42ef2c',
        language: 'javascript',
        sources: 'src',
        repoUrl: 'https://github.com/SunGg12138/yunxin-im.git',
    }));

}