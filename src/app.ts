import Koa from 'koa';
import router from './routes';

const app = new Koa();

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.status = 500;
        ctx.body = { msg: '代码质量检测出错', error: err };
        console.log(err);
    }
});

app
.use(router.routes())
.use(router.allowedMethods());

export default app;
