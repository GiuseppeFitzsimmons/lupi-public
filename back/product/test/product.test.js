const {handler} = require('../index.js');
const Product = require('lupi-dal/Product');

const mocks=require('../../../mocks')

console.log('process.env.ENVIRONMENT',process.env.ENVIRONMENT);

let product;
let product2;
let tokens;
let mocked;
beforeAll(async() => {
  mocked=await mocks.setup();
  tokens=mocked.tokens;
}, 15000);
  
  afterAll(async() => {
    await mocks.teardown();
  }, 15000);

test('put product', async ()=>{
    Product.template.productName='Jean Jacket';
    Product.template.markup=3.3;
    Product.template.collectionId=mocked.collection.id;
    console.log("Creating...",Product.template)
    delete Product.template.id;
    mocks.event.body=JSON.stringify(Product.template);
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    result=JSON.parse(result.body);
    product=result.product;
    console.log("CREATE product", product);

    Product.template.productName='Wedding Basketball Cap';
    delete Product.template.id;
    console.log("Creating a second product...",Product.template)
    mocks.event.body=JSON.stringify(Product.template);
    result = await handler(mocks.event);
    result=JSON.parse(result.body);
    product2=result.product;
    console.log("CREATE product 2", result);
})

test('get product', async ()=>{
    mocks.event.queryStringParameters.id=product.id;
    mocks.event.httpMethod='get';
    let result = await handler(mocks.event);
    console.log("GET product", result);
})

test('get products for collection', async ()=>{
    mocks.event.httpMethod='get';
    delete mocks.event.queryStringParameters.id;
    mocks.event.queryStringParameters.collectionId=mocked.collection.id
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    console.log("GET products for collection result", result);
})

test('get siblings for product', async ()=>{
  mocks.event.httpMethod='get';
  delete mocks.event.queryStringParameters.id;
  mocks.event.queryStringParameters.siblingId=mocked.product.id
  mocks.event.headers.Authorization=tokens.access_token;
  let result = await handler(mocks.event);
  console.log("GET siblings for product result", result);
})

test('delete product', async ()=>{
    mocks.event.queryStringParameters.id=product.id;
    mocks.event.httpMethod='delete';
    let result = await handler(mocks.event);
    console.log("DELETE product result from handler", result);
    mocks.event.queryStringParameters.id=product2.id;
    result = await handler(mocks.event);
    console.log("DELETE product2 result from handler", result);
})