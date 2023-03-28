export interface EnsureRepositoryOptions {
    name: string;
    url: string;
}

export interface HandleSonarqubeScanOptions {
    packageName: string;
    repoUrl: string;
    language: string;
    sources: string;
    commitSha: string;
    actor: string;
}

export interface NotificationOptions {
    webhook: string;
    
}
