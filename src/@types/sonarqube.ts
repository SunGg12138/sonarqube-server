export interface CreateProjectOptions {
    name: string;
    project: string;
    mainBranch: string;
    visibility?: string;
}

export interface GenerateUserTokenOptions {
    name: string;
    type: string;
    projectKey: string;
    expirationDate?: string;
}

export interface GenerateProjectTokenOptions {
    projectKey: string;
}

export interface DeleteProjectOptions {
    projectKey: string;
}

export interface SearchMeasuresOptions {
    projectKeys: string[];
    metricKeys: string[];
}
