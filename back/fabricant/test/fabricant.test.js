const {handler} = require('../index.js');
const Fabricant = require('lupi-dal/Fabricant');

const mocks=require('../../../mocks')

console.log('process.env.ENVIRONMENT',process.env.ENVIRONMENT);

let fabricant;
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

test('put fabricant', async ()=>{
    Fabricant.template.name='fabricant0';
    Fabricant.template.supplierId=mocked.supplier.id;
    console.log("Creating...",Fabricant.template)
    delete Fabricant.template.id;
    mocks.event.body=JSON.stringify(Fabricant.template);
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    result=JSON.parse(result.body);
    fabricant=result.fabricant;
})

test('get fabricant', async ()=>{
    mocks.event.queryStringParameters.id=fabricant.id;
    mocks.event.httpMethod='get';
    let result = await handler(mocks.event);
    console.log("GET product", result);
})

test('get fabricants for contact', async ()=>{
    mocks.event.httpMethod='get';
    delete mocks.event.queryStringParameters.id;
    mocks.event.queryStringParameters.contactId=mocked.contact.id
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    console.log("GET fabricants for contact result", result);
})

test('delete fabricant', async ()=>{
    mocks.event.queryStringParameters.id=fabricant.id;
    mocks.event.httpMethod='delete';
    let result = await handler(mocks.event);
    console.log("DELETE fabricant result from handler", result);
})