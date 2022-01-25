const {handler} = require('../index.js');
const ProductSize = require('lupi-dal/ProductSize');

const mocks=require('../../../mocks')

console.log('process.env.ENVIRONMENT',process.env.ENVIRONMENT);

let productSize;
let tokens;
let mocked;
beforeAll(async() => {
  mocked=await mocks.setup();
  tokens=mocked.tokens;
}, 15000);
  
  afterAll(async() => {
    await mocks.teardown();
  }, 15000);

test('put productSize', async ()=>{
    ProductSize.template.productId=mocked.product.id
    ProductSize.template.sizeId=mocked.size.id;
    console.log("Creating...",ProductSize.template)
    delete ProductSize.template.id;
    mocks.event.body=JSON.stringify(ProductSize.template);
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    result=JSON.parse(result.body);
    productSize=result.productSize;
    console.log("CREATE productSize", productSize);
})

test('get productSize', async ()=>{
    mocks.event.queryStringParameters.id=productSize.id;
    mocks.event.httpMethod='get';
    let result = await handler(mocks.event);
    console.log("GET productSize", result);
})

test('get productSize for product', async ()=>{
    mocks.event.httpMethod='get';
    delete mocks.event.queryStringParameters.id;
    mocks.event.queryStringParameters.productId=mocked.product.id
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    console.log("GET productSize for product result", result);
})

test('get productSize for size', async ()=>{
    mocks.event.httpMethod='get';
    delete mocks.event.queryStringParameters.id;
    mocks.event.queryStringParameters.sizeId=mocked.size.id
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    console.log("GET productSize for size result", result);
})

test('delete productSize', async ()=>{
    mocks.event.queryStringParameters.id=productSize.id;
    mocks.event.httpMethod='delete';
    let result = await handler(mocks.event);
    console.log("DELETE productSize result from handler", result);
})