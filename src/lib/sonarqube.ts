import axios from 'axios';
import * as config from 'config';

const sonarqube_url = config.get('sonarqube_url');
const request = axios.create({
    baseURL: sonarqube_url,
    auth: {
        username: 'admin', 
        password: 'admin123' 
    },
});
request.interceptors.response.use((response) => {
    return response.data;
}, function (err) {
    console.log('[SonarQube Error]', err?.response?.data || err);
});

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

export async function searchUserTokens() {
    return request({
        method: 'GET',
        url: '/api/user_tokens/search',
    });
}

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
