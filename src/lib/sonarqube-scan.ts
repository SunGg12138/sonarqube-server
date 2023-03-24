import * as config from 'config';

const scanner = require('sonarqube-scanner').async;
const serverUrl = config.get('sonarqube.api_url');

interface SonarqubeScanOptions {
    token: string;
    projectKey: string;
    projectName: string;
    language: string;
    sources: string;
}

export default function sonarqubeScan(options: SonarqubeScanOptions) {
    const token = options.token;
    const projectKey = options.projectKey;
    const projectName = options.projectName;

    const params = {
        serverUrl,
        token,
        options: {
            'sonar.projectKey': projectKey,
            'sonar.projectName': projectName,
            'sonar.sources': options.sources,
            'sonar.language': options.language,
            'sonar.javascript.lcov.reportPaths' : 'coverage/lcov.info',
            'sonar.sourceEncoding': 'UTF-8',
            'analysis.mode': 'incremental',
            'sonar.projectVersion': '1.0.1',
            'sonar.scm.exclusions.disabled': 'true',
        },
    };
    return scanner(params);
}
