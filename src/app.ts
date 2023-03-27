import Koa from 'koa';
import router from './routes';
import catchErrorMiddleware from './middlewares/catchError';
import visitMiddleware from './middlewares/visit';

const app = new Koa();

app.use(catchErrorMiddleware);
app.use(visitMiddleware);

app.use(async (ctx, next) => {
    console.log(`[${new Date()}] GET `);
    await next();
});

app
.use(router.routes())
.use(router.allowedMethods());

export default app;
