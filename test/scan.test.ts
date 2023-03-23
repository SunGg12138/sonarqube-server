import * as supertest from 'supertest';
import app from '../src/app';

describe('SonarQube Scan', function () {
    it('Scan Test', async function () {
        await supertest(app.callback())
            .get('/api/sonarqube/scan')
            .query({
                packageName: 'test',
                branchName: 'develop',
                username: 'sun',
                commit: 'sadsad1203akjdhsa81ej',
                language: 'javascript',
                sources: 'src',
                repoUrl: 'https://github.com/SunGg12138/yunxin-im.git',
            })
            .expect(200);
    });
});
