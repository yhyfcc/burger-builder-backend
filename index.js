const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const {onConnectPromise} = require('./db');
const {register,login,addOrder,getOrders} = require('./service/userService');
const {getIngredients} = require('./service/ingredientsService');
const jwt = require('jsonwebtoken');
const secret = require('./constants/constants');

const app = new Koa();
const router = new Router();



router.post('/login',async ctx => {

    let body = ctx.request.body;
    let res = login(body.email,body.password);

    await res.then(res =>
        ctx.response.body = {
            localId: res.localId,
            idToken: jwt.sign({localId:res.localId},secret,{expiresIn: 3600}),
            expiresIn: 3600
        },
        rej => ctx.throw(401,rej)
    );
});

router.post('/register',async ctx => {
    let body = ctx.request.body;
    let res = register(body.email,body.password);
    await res.then(res =>
        ctx.response.body = {
            localId: res.localId,
            idToken: jwt.sign({localId: res.localId},secret,{expiresIn: 3600}),
            expiresIn: 3600
        },
        rej => ctx.throw(401,rej)
    );
});

router.get('/ingredients',async ctx => {
    let res = getIngredients();
    await res.then(res => ctx.response.body = res,rej => ctx.throw(500,'Something went wrong'));
});

router.post('/orders',async ctx => {
    let query = ctx.request.query;
    let body = ctx.request.body;
    if(!query.auth){
        ctx.throw(400,'Authentication field required');
    }
    let id;
    try{
        id = jwt.verify(query.auth,secret).localId;
    }catch (e) {
        ctx.throw(400,'Token is invalid');
    }

    if(body.userId !== id){
        ctx.throw(400,'Token is invalid');
    }

    let res = addOrder(id,body);
    await res.then(res => ctx.response.body = {
        name: res.name
        },
        rej => ctx.throw(500,'Something went wrong')
    )

})

router.get('/orders',async ctx => {
    let query = ctx.request.query;
    let body = ctx.request.body;
    if(!query.auth){
        ctx.throw(400,'Authentication field required');
    }
    let id;
    try{
        id = jwt.verify(query.auth,secret).localId;
    }catch (e) {
        ctx.throw(400,'Token is invalid');
    }

    let res = getOrders(id);
    await res.then(res => ctx.response.body = res,
        rej => ctx.throw(500,'Something went wrong')
    )
})

app.use(async (ctx,next) => {
    try{
        await next();
    }catch (e){
        ctx.response.status = e.status;
        ctx.response.body = {error: {message: e.message}};
    }

    ctx.response.set({
        'Access-Control-Allow-origin': 'http://49.234.92.131:3000',
        "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
        "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    });
});
app.use(bodyParser());
app.use(router.middleware()).use(router.allowedMethods());

onConnectPromise.then(() => app.listen(3001),() => console.log('connection error'));