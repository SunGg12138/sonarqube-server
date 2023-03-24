import axios from 'axios';
import * as config from 'config';

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
interface CreateProjectOptions {
    name: string;
    project: string;
    mainBranch: string;
    visibility?: string;
}
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
interface GenerateUserTokenOptions {
    name: string;
    type: string;
    projectKey: string;
    expirationDate?: string;
}
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
interface GenerateProjectTokenOptions {
    projectKey: string;
}
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
interface DeleteProjectOptions {
    projectKey: string;
}
export async function deleteProject(options: DeleteProjectOptions) {
    return request({
        method: 'POST',
        url: '/api/projects/delete',
        params: {
            project: options.projectKey,
        },
    }) as Promise<any>;
}
