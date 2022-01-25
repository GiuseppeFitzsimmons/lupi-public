const {handler} = require('../index.js');
const Fabric = require('lupi-dal/Fabric');

const mocks=require('../../../mocks')

console.log('process.env.ENVIRONMENT',process.env.ENVIRONMENT);

let fabric;
let tokens;
let mocked;
beforeAll(async() => {
  mocked=await mocks.setup();
  tokens=mocked.tokens;
}, 15000);
  
  afterAll(async() => {
    await mocks.teardown();
  }, 15000);

test('put fabric', async ()=>{
    Fabric.template.name='Silk'
    Fabric.template.pricedMethod='yes'
    Fabric.template.price='8'
    Fabric.template.currency='Euro'
    Fabric.template.surchargedPrice='10'
    Fabric.template.supplierId=mocked.supplier.id;
    Fabric.template.compositionId=mocked.composition.id
    Fabric.template.brandId=mocked.brand.id
    console.log("Creating...",Fabric.template)
    delete Fabric.template.id;
    mocks.event.body=JSON.stringify(Fabric.template);
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    result=JSON.parse(result.body);
    fabric=result.fabric;
    console.log("CREATE fabric", fabric);
})

test('get fabric', async ()=>{
    mocks.event.queryStringParameters.id=fabric.id;
    mocks.event.httpMethod='get';
    let result = await handler(mocks.event);
    console.log("GET fabric", result);
})

test('get fabric for supplier', async ()=>{
    mocks.event.httpMethod='get';
    delete mocks.event.queryStringParameters.id;
    mocks.event.queryStringParameters.supplierId=mocked.supplier.id
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    console.log("GET fabric for supplier result", result);
})

test('get fabric for composition', async ()=>{
    mocks.event.httpMethod='get';
    delete mocks.event.queryStringParameters.id;
    mocks.event.queryStringParameters.compositionId=mocked.composition.id
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    console.log("GET fabric for size result", result);
})

test('get fabric for brand', async ()=>{
  mocks.event.httpMethod='get';
  delete mocks.event.queryStringParameters.id;
  mocks.event.queryStringParameters.brandId=mocked.brand.id
  mocks.event.headers.Authorization=tokens.access_token;
  let result = await handler(mocks.event);
  console.log("GET fabric for brand result", result);
})

test('delete fabric', async ()=>{
    mocks.event.queryStringParameters.id=fabric.id;
    mocks.event.httpMethod='delete';
    let result = await handler(mocks.event);
    console.log("DELETE fabric result from handler", result);
})