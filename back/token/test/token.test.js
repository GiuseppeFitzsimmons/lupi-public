const {handler} = require('../index.js');
const {handler:userHandler} = require('../../user/index.js');
const User = require('lupi-dal/User');
const Brand = require('lupi-dal/Brand');
const {handler:brandHandler} = require('../../brand/index.js');

const mocks=require('../../../mocks')

console.log('process.env.ENVIRONMENT',process.env.ENVIRONMENT);

let user;
let tokens;

test('create user', async ()=>{
    User.template.id='phillip@lupi.com';
    User.template.firstName='Phillip';
    User.template.lastName='Fitzsimmons';
    User.template.password='password';
    mocks.event.httpMethod='post';
    mocks.event.body=JSON.stringify(User.template);
    let result = await userHandler(mocks.event);
    user=JSON.parse(result.body);
    console.log("CREATE USER result from userHandler", result);
},10000)

test('login', async ()=>{
    mocks.event.httpMethod='post';
    mocks.event.body=JSON.stringify({
        id:'phillip@lupi.com',
        password:'password',
        grant_type:'password'
    })
    tokens = await handler(mocks.event);
    tokens=JSON.parse(tokens.body)
    console.log("GET LOGIN result from handler", tokens);
})

test('login failed', async ()=>{
    mocks.event.httpMethod='post';
    mocks.event.body=JSON.stringify({
        id:'phillip@lupi.com',
        password:'bad password',
        grant_type:'password'
    })
    let result = await handler(mocks.event);
    console.log("GET LOGIN result from handler - should be an error", result);
})
test('get pre-expired token', async ()=>{
    mocks.event.httpMethod='post';
    mocks.event.body=JSON.stringify({
        id:'phillip@lupi.com',
        password:'password',
        grant_type:'password',
        preExpiredDevToken:true
    })
    tokens = await handler(mocks.event);
    tokens=JSON.parse(tokens.body)
    console.log("GET LOGIN result should be an already expired token", tokens);
    mocks.event.headers.Authorization=tokens.access_token;
    mocks.event.queryStringParameters.id='brand.id';
    mocks.event.httpMethod='get';
    let brandResult = await brandHandler(mocks.event);
    console.log("GET BRAND result should an error with an errorCode of exp", brandResult);
})
test('refresh token', async ()=>{
    mocks.event.httpMethod='post';
    console.log("getting refresh tokens", tokens)
    mocks.event.headers.Authorization=tokens.access_token;
    mocks.event.body=JSON.stringify({
        grant_type:'refresh',
        token:tokens.refresh_token
    })
    tokens = await handler(mocks.event);
    console.log("GET refresh token:", tokens);
})

test('delete user', async ()=>{
    mocks.event.httpMethod='delete';
    mocks.event.headers.Authorization=tokens.access_token;
    mocks.event.queryStringParameters.id=User.template.id;
    let result = await userHandler(mocks.event);
    console.log("DELETE USER result from handler", result);
})