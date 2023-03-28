import * as supertest from 'supertest';
import app from '../src/app';

describe('SonarQube Scan', function () {
    it('Scan Test', async function () {
        await supertest(app.callback())
            .get('/api/sonarqube/scan')
            .query({
                packageName: 'mochatest',
                actor: 'mochatest',
                commitSha: '1ab36e44dab9540d92da63dad69c60b55c42ef2c',
                language: 'javascript',
                sources: 'src',
                repoUrl: 'https://github.com/SunGg12138/yunxin-im.git',
            })
            .expect(200);
    });
});
