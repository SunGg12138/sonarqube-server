import { simpleGit } from 'simple-git';
import {
    CloneMultiOptions, CheckoutOptions, LogOptions, CloneOptions, ResetOptions,
} from '../@types/git';

/**
 * git clone 多个分支(优化clone, 使用了git fetch)
 * - 优化了clone多个分支的流程
*/
export async function cloneMulti (
    options: CloneMultiOptions,
    // 尝试次数
    times = 5
): Promise<void> {
    const git = simpleGit(options.dir, {
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
    ]);

    try {
        await git.fetch([ 'origin', '--depth', '1' ]);
    } catch (error) {
        console.log(`Git fetch origin Error [times=${times}]:`);
        console.log(error);
        return times <= 0? Promise.reject(error) : cloneMulti(options, --times);
    }

    await checkout({
        dir: options.dir,
        branchName: options.branchNames[0],
    });
}

/**
 * 本地仓库checkout到指定分支
*/
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

/**
 * git log 获取日志
*/
export async function log(options: LogOptions) {
    const git = simpleGit(options.dir, {
        timeout: {
            block: 5000,
        },
    });
    return git.log([ options.depth || '-1' ]);
}

/**
 * git clone(优化clone, 使用了git fetch)
*/
export async function clone(
    options: CloneOptions,
    // 尝试次数
    times = 5
) {
    const git = simpleGit(options.dir, {
        progress({ method, stage, progress }) {
            console.log(`git.${method} ${stage} stage ${progress}% complete`);
        },
        timeout: {
            block: 30000,
        },
    });

    await git.init().remote([
        'add',
        '-t', options.branchName,
        'origin', options.url, 
    ]);

    try {
        await git.fetch([
            'origin',
            '--depth', '100'
        ]);
    } catch (error) {
        console.log(`Git fetch origin Error [times=${times}]:`);
        console.log(error);
        return times <= 0? Promise.reject(error) : clone(options, --times);
    }
}

/**
 * git pull
*/
export async function pull(
    options: { dir: string },
    // 尝试次数
    times = 5
) {
    const git = simpleGit(options.dir, {
        timeout: {
            block: 5000,
        },
    });
    try {
        await git.pull();
    } catch (error) {
        console.log(`Git pull Error [times=${times}]:`);
        console.log(error);
        return times <= 0? Promise.reject(error) : pull(options, --times);
    }
}

export async function reset(options: ResetOptions) {
    const git = simpleGit(options.dir, {
        timeout: {
            block: 5000,
        },
    });
    console.log(`[Git Reset]: reset to ${options.commitSha}`);
    return git.reset([
        '--hard',
        options.commitSha,
    ]);
}
