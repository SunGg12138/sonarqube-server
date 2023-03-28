export type MsgType = 'text' | 'post' | 'share_chat' | 'image' | 'interactive';

export interface CodeQualityOptions {
    packageName: string;
    projectKey: string;
    commitSha: string;
    actor: string;
}

export interface CodeQualityFailOptions extends CodeQualityOptions {
    measures: Array<Record<string, any>>;
}
