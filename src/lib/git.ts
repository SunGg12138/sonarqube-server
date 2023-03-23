import { simpleGit } from 'simple-git';

const cwd = process.cwd();

/**
 * git clone 远程仓库
*/
interface CloneOptions {
    url: string;
    branchName: string;
}
export async function clone (
    options: CloneOptions
): Promise<{ name: string; path: string; }> {
    const git = simpleGit(cwd, {
        timeout: {
            block: 20000,
        },
    });
    // 随机文件夹名称
    const name = `repo-${Date.now()}-${Math.random().toString().slice(-6)}`;
    const path = `${cwd}/tmp/${name}`;
    await git.clone(options.url, path, {
        // '--depth': 1,
        '--branch': options.branchName,
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
