const {handler} = require('../index.js');
const PerUnitProductionCost = require('lupi-dal/PerUnitProductionCost');

const mocks=require('../../../mocks')

console.log('process.env.ENVIRONMENT',process.env.ENVIRONMENT);

let perUnitProductionCost;
let tokens;
let mocked;
beforeAll(async() => {
  mocked=await mocks.setup();
  //console.log('mocked.contact', mocked)
  tokens=mocked.tokens;
}, 15000);
  
  afterAll(async() => {
    await mocks.teardown();
  }, 15000);

test('put perUnitProductionCost', async ()=>{
    PerUnitProductionCost.template.currency='Euro'
    PerUnitProductionCost.template.productId=mocked.product.id;
    PerUnitProductionCost.template.fabricantId=mocked.fabricant.id;
    console.log("Creating...",PerUnitProductionCost.template)
    delete PerUnitProductionCost.template.id;
    mocks.event.body=JSON.stringify(PerUnitProductionCost.template);
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    result=JSON.parse(result.body);
    perUnitProductionCost=result.perUnitProductionCost;
})

test('get perUnitProductionCost', async ()=>{
    mocks.event.queryStringParameters.id=perUnitProductionCost.id;
    mocks.event.httpMethod='get';
    let result = await handler(mocks.event);
    console.log("GET product", result);
})

test('get perUnitProductionCost for fabricant', async ()=>{
    mocks.event.httpMethod='get';
    delete mocks.event.queryStringParameters.id;
    mocks.event.queryStringParameters.fabricantId=mocked.fabricant.id
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    console.log("GET fabricants for contact result", result);
})

test('get perUnitProductionCost for product', async ()=>{
  mocks.event.httpMethod='get';
  delete mocks.event.queryStringParameters.id;
  mocks.event.queryStringParameters.productId=mocked.product.id
  mocks.event.headers.Authorization=tokens.access_token;
  let result = await handler(mocks.event);
  console.log("GET perUnitProductionCosts for product result", result);
})

test('delete perUnitProductionCost', async ()=>{
    mocks.event.queryStringParameters.id=perUnitProductionCost.id;
    mocks.event.httpMethod='delete';
    let result = await handler(mocks.event);
    console.log("DELETE perUnitProductionCost result from handler", result);
})