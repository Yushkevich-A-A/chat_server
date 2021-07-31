const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const  Router = require('koa-router');
const json = require('koa-json');
const WS = require('ws');
const router = new Router();
const app = new Koa();
const { Subscriptions } = require('./db/db');
const db = new Subscriptions();
const chat = [];

app.use( koaBody({
  urlencoded: true,
  multipart: true,
}));

app.use(json());

app.use( async (ctx, next) => {
  const origin = ctx.request.get('Origin');
  if (!origin) {
    return await next();
  }

  const headers = { 'Access-Control-Allow-Origin': '*' };

  if (ctx.request.method !== 'OPTIONS') {
    console.log('! OPTIONS');
    ctx.response.set({ ...headers });
    try {
      return await next();
    } catch (e) {
      e.headers = { ...e.headers, ...headers };
      throw e;
    }
  }

  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, PUD SOLI, DELETE, PATCH',
    });

    if (ctx.request.get('Access-Control-Request-Headers')) {
      ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
    }
    ctx.response.status = 204;
  }
})

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback());
const wsServer = new WS.Server({
  server
});

router.post('/', async (ctx) => {
  const { nickname } = ctx.request.body;
  if(db.existUser(nickname)) {
    ctx.response.body = { status: false };
    return;
  }
  ctx.response.body = { status: true };
})

app.use(router.routes()).use(router.allowedMethods());

wsServer.on('connection', (ws) => {
  ws.id = +new Date();
  db.add({id: ws.id})
  ws.on('message', (msg) => {
    const message = JSON.parse(msg);
    if (message.status === 'init') {
      db.update(ws.id, message.nickname);

      ws.send(JSON.stringify({
        status: 'init',
        chat: chat,
      }));

      Array.from(wsServer.clients)
      .filter(client => client.readyState === WS.OPEN)
      .forEach(client => client.send(JSON.stringify({
        status: 'uploadParticipant',
        users: db.getAllUsers(),
      })));
      return;
    }

    if (message.status === 'message') {
      chat.push(message.message);
      Array.from(wsServer.clients)
      .filter(client => client.readyState === WS.OPEN)
      .forEach(client => client.send(JSON.stringify({
        status: 'message',
        data: message.message,
      })));
    }
  });

  ws.on('close', () => {
    db.delete(ws.id);
    Array.from(wsServer.clients)
    .filter(client => client.readyState === WS.OPEN)
    .forEach(client => client.send(JSON.stringify({
      status: 'uploadParticipant',
      users: db.getAllUsers(),
    })));
  });
});

server.listen(port);