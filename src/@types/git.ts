export interface CloneMultiOptions {
    url: string;
    dir: string;
    branchNames: string[];
}

export interface CheckoutOptions {
    dir: string;
    branchName: string;
}

export interface LogOptions {
    dir: string;
    depth: string;
}

export interface CloneOptions {
    dir: string;
    url: string;
    branchName: string;
}

export interface ResetOptions {
    dir: string;
    commitSha: string;
}
