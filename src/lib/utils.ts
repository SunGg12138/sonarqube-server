export async function sleep(time: number) {
    return new Promise(resolve => {
        setTimeout(function () {
            resolve({});
        }, time);
    });
}
