import * as fs from 'fs-extra';
import { simpleGit } from 'simple-git';

const cwd = process.cwd();

/**
 * git clone 远程仓库
*/
interface CloneOptions {
    url: string;
    branchNames: string[];
}
export async function clone (
    options: CloneOptions
): Promise<{ name: string; path: string; }> {
    // 随机文件夹名称
    const name = `repo-${Date.now()}-${Math.random().toString().slice(-6)}`;
    const path = `${cwd}/tmp/${name}`;

    await fs.ensureDir(path);
    const git = simpleGit(path, {
        progress({ method, stage, progress }) {
            console.log(`git.${method} ${stage} stage ${progress}% complete`);
        },
        timeout: {
            block: 30000,
        },
    });

    await git.init().remote([
        'add',
        ...options.branchNames.reduce((result, item) => {
            result.push('-t', item);
            return result;
        }, []),
        'origin', options.url, 
    ]).fetch([ 'origin' ]);

    await checkout({
        dir: path,
        branchName: 'master',
    });

    return { name, path };
}

/**
 * 本地仓库checkout到指定分支
*/
interface CheckoutOptions {
    dir: string;
    branchName: string;
}
export async function checkout (
    options: CheckoutOptions
): Promise<void> {
    const git = simpleGit(options.dir, {
        timeout: {
            block: 5000,
        },
    });
    await git.checkout(options.branchName);
}

interface LogOptions {
    dir: string;
}
export async function log(options: LogOptions) {
    const git = simpleGit(options.dir, {
        timeout: {
            block: 5000,
        },
    });
    return git.log([ '-1' ]);
}
