const {handler} = require('../index.js');
const Variation = require('lupi-dal/Variation');

const mocks=require('../../../mocks')

console.log('process.env.ENVIRONMENT',process.env.ENVIRONMENT);

let variation;
let variation2;
let tokens;
let mocked;
beforeAll(async() => {
  mocked=await mocks.setup();
  tokens=mocked.tokens;
}, 15000);
  
  afterAll(async() => {
    await mocks.teardown();
  }, 15000);

test('put variation', async ()=>{
    Variation.template.variationName='Zipper variation';
    Variation.template.depiction='zipperVariation.png';
    Variation.template.perUnitProductionCost='2e'
    Variation.template.productId=mocked.product.id;
    console.log("Creating...",Variation.template)
    delete Variation.template.id;
    mocks.event.body=JSON.stringify(Variation.template);
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    result=JSON.parse(result.body);
    variation=result.variation;
    console.log("CREATE variation", variation);

    Variation.template.variationName='Button variation';
    delete Variation.template.id;
    console.log("Creating a second variation...",Variation.template)
    mocks.event.body=JSON.stringify(Variation.template);
    result = await handler(mocks.event);
    result=JSON.parse(result.body);
    variation2=result.variation;
    console.log("CREATE variation 2", result);
})

test('get variation', async ()=>{
    mocks.event.queryStringParameters.id=variation.id;
    mocks.event.httpMethod='get';
    let result = await handler(mocks.event);
    console.log("GET variation", result);
})

test('get variations for product', async ()=>{
    mocks.event.httpMethod='get';
    delete mocks.event.queryStringParameters.id;
    mocks.event.queryStringParameters.productId=mocked.product.id
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    console.log("GET variations for product result", result);
})

test('delete variation', async ()=>{
    mocks.event.queryStringParameters.id=variation.id;
    mocks.event.httpMethod='delete';
    let result = await handler(mocks.event);
    console.log("DELETE variation result from handler", result);
    mocks.event.queryStringParameters.id=variation2.id;
    result = await handler(mocks.event);
    console.log("DELETE variation2 result from handler", result);
})