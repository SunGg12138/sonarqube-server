import * as moment from 'moment';

/**
 * 记录访问请求和响应的信息以及访问速度的中间件
 */
export default async function(ctx, next) {
  const start = Date.now();

  console.log(`${moment(start).format('YYYY-MM-DD hh:mm:ss.SSS')}: Request start | ${ctx.request.method} ${ctx.request.url}`);

  await next();

  // 计算响应时间
  const end = Date.now();
  const responseTime = end - start;

  console.log(`${moment(end).format('YYYY-MM-DD hh:mm:ss.SSS')}: Request end | ${ctx.request.method} ${ctx.request.url} status-${ctx.status} time: ${responseTime}ms`);
};
