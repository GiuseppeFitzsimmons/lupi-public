const {handler} = require('../index.js');
const Brand = require('lupi-dal/Brand');

const mocks=require('../../../mocks')

console.log('process.env.ENVIRONMENT',process.env.ENVIRONMENT);

let brand;
let brand2;
let tokens;
let mocked;
beforeAll(async(done) => {
  mocked=await mocks.setup();
  tokens=mocked.tokens;
  console.log('tokens', tokens)
  done()
}, 25000);
  
afterAll(async() => {
  await mocks.teardown();
}, 45000);

test('put brand', async ()=>{
    console.log(Brand.template)
    Brand.template.brandName='Atelier Fitzsimmons';
    Brand.template.postalCode='75018';
    Brand.template.addressLine1='62 rue Custine'
    delete Brand.template.id;
    mocks.event.body=JSON.stringify(Brand.template);
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    result=JSON.parse(result.body);
    brand=result.brand;
    console.log('result.brand', result)
    if (result?.tokens){
      tokens=result.tokens;
    }
    mocks.event.headers.Authorization=tokens.access_token;
    console.log("CREATE first result from handler", result);

    Brand.template.brandName='Maison Morra';
    Brand.template.postalCode='75018';
    Brand.template.addressLine1='10 rue de Trétaigne'
    delete Brand.template.id;
    mocks.event.body=JSON.stringify(Brand.template);
    result = await handler(mocks.event);
    result=JSON.parse(result.body);
    brand2=result.brand;
    if (result?.tokens){
      tokens=result.tokens;
    }
    mocks.event.headers.Authorization=tokens.access_token;
    console.log("CREATE second result from handler", result);
})

test('get brand', async ()=>{
    mocks.event.queryStringParameters.id=brand.id;
    mocks.event.httpMethod='get';
    let result = await handler(mocks.event);
    console.log("GET result from handler", result);
}, 15000)

test('get brands for user', async ()=>{
  mocks.event.path='/v1/brand'
    mocks.event.httpMethod='get';
    delete mocks.event.queryStringParameters.id
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    console.log("GET brands for user result", result);
}, 15000)

test('delete brand', async ()=>{
    mocks.event.queryStringParameters.id=brand.id;
    mocks.event.httpMethod='delete';
    let result = await handler(mocks.event);
    console.log("DELETE result from handler", result);
    mocks.event.queryStringParameters.id=brand2.id;
    result = await handler(mocks.event);
    console.log("DELETE second result from handler", result);
}, 15000)