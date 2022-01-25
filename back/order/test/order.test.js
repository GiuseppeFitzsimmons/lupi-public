const {handler} = require('../index.js');
const Order = require('lupi-dal/Order');

const mocks=require('../../../mocks')

console.log('process.env.ENVIRONMENT',process.env.ENVIRONMENT);

let order;
let tokens;
let mocked;
beforeAll(async() => {
    try {

        mocked=await mocks.setup();
    } catch (err) {
        console.log('ERRORTAG',err)
    }
  tokens=mocked.tokens;
}, 45000);
  
afterAll(async() => {
    console.log('calling teardown')
    await mocks.teardown();
}, 15000);

test('put order', async ()=>{
    Order.template.date=new Date().getTime();
    Order.template.customerId=mocked.customer.id
    console.log("Creating...",Order.template)
    //delete Order.template.id;
    mocks.event.body=JSON.stringify(Order.template);
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    result=JSON.parse(result.body);
    order=result.order;
    expect(order.id).not.toBe(null);
})

test('get order', async ()=>{
    mocks.event.queryStringParameters.id=order.id;
    mocks.event.httpMethod='get';
    let result = await handler(mocks.event);
    console.log("GET product", result);
    expect(result).not.toBe(null);
})

test('get orders for customer', async ()=>{
    mocks.event.httpMethod='get';
    delete mocks.event.queryStringParameters.id;
    mocks.event.queryStringParameters.customerId=mocked.customer.id
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    console.log("GET orders for customer result", result);
    expect(result).not.toBe(null);
})

test('delete order', async ()=>{
    mocks.event.queryStringParameters.id=order.id;
    mocks.event.httpMethod='delete';
    let result = await handler(mocks.event);
    console.log("DELETE order result from handler", result);
    expect(result).not.toBe(null);
})