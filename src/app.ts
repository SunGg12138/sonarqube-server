import Koa from 'koa';
import router from './routes';
import catchErrorMiddleware from './middlewares/catchError';
import visitMiddleware from './middlewares/visit';
import './consumer';

const app = new Koa();

app
.use(catchErrorMiddleware)
.use(visitMiddleware)
.use(router.routes())
.use(router.allowedMethods());

export default app;
