const {handler} = require('../index.js');
const OrderVariation = require('lupi-dal/OrderVariation');

const mocks=require('../../../mocks')

console.log('process.env.ENVIRONMENT',process.env.ENVIRONMENT);

let orderVariation;
let tokens;
let mocked;
beforeAll(async() => {
  mocked=await mocks.setup();
  tokens=mocked.tokens;
}, 15000);
  
  afterAll(async() => {
    await mocks.teardown();
  }, 15000);

test('put orderVariation', async ()=>{
    OrderVariation.template.orderId=mocked.order.id;
    OrderVariation.template.variationId=mocked.variation.id
    OrderVariation.template.quantity='4'
    OrderVariation.template.size='Medium'
    console.log("Creating...",OrderVariation.template)
    delete OrderVariation.template.id;
    mocks.event.body=JSON.stringify(OrderVariation.template);
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    result=JSON.parse(result.body);
    orderVariation=result.orderVariation;
})

test('get orderVariation', async ()=>{
    mocks.event.queryStringParameters.id=orderVariation.id;
    mocks.event.httpMethod='get';
    let result = await handler(mocks.event);
    console.log("GET product", result);
})

test('get orderVariation for order', async ()=>{
    mocks.event.httpMethod='get';
    delete mocks.event.queryStringParameters.id;
    mocks.event.queryStringParameters.orderId=mocked.order.id
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    console.log("GET orderVariation for order result", result);
})

test('get orderVariation for variation', async ()=>{
    mocks.event.httpMethod='get';
    delete mocks.event.queryStringParameters.id;
    mocks.event.queryStringParameters.variationId=mocked.variation.id
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    console.log("GET orderVariation for order result", result);
})

test('delete orderVariation', async ()=>{
    mocks.event.queryStringParameters.id=orderVariation.id;
    mocks.event.httpMethod='delete';
    let result = await handler(mocks.event);
    console.log("DELETE orderVariation result from handler", result);
})