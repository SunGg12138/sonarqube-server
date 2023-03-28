import axios from 'axios';
import * as config from 'config';
import {
    CreateProjectOptions, GenerateUserTokenOptions,
    GenerateProjectTokenOptions, DeleteProjectOptions,
    SearchMeasuresOptions,
} from '../@types/sonarqube';

const sonarqubeApiUrl = config.get('sonarqube.api_url');
const request = axios.create({
    baseURL: sonarqubeApiUrl,
    auth: {
        username: config.get('sonarqube.username'), 
        password: config.get('sonarqube.password'), 
    },
});
request.interceptors.response.use((response) => {
    return response.data;
}, function (err) {
    console.log('[SonarQube Error]', err?.response?.data || err);
});

/**
 * 创建项目
*/
export async function createProject (options: CreateProjectOptions) {
    return request({
        method: 'POST',
        url: '/api/projects/create',
        params: options,
    });
}

/**
 * 生成token
*/
export async function generateUserToken(
    options: GenerateUserTokenOptions
) {
    return request({
        method: 'POST',
        url: '/api/user_tokens/generate',
        params: options,
    }) as Promise<any>;
}

/**
 * 创建项目后生成token
*/
export async function generateProjectToken(
    options: GenerateProjectTokenOptions
): Promise<string> {
    const { projectKey } = options;
    // 创建项目并生成token
    await createProject({
        name: projectKey,
        project: projectKey,
        mainBranch: 'master',
    });
    const { token } = await generateUserToken({
        name: projectKey,
        type: 'PROJECT_ANALYSIS_TOKEN',
        projectKey: projectKey,
    });
    return token;
}

/**
 * 删除项目
*/
export async function deleteProject(options: DeleteProjectOptions) {
    return request({
        method: 'POST',
        url: '/api/projects/delete',
        params: {
            project: options.projectKey,
        },
    }) as Promise<any>;
}

/**
 * 查询项目检测结果
*/
export async function searchMeasures(options: SearchMeasuresOptions) {
    return request({
        method: 'GET',
        url: '/api/measures/search',
        params: {
            projectKeys: options.projectKeys.join(','),
            metricKeys: options.metricKeys.join(','),
        },
    }) as Promise<any>;
}
