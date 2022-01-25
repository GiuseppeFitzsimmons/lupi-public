const {handler} = require('../index.js');
const Supplier = require('lupi-dal/Supplier');

const mocks=require('../../../mocks')

console.log('process.env.ENVIRONMENT',process.env.ENVIRONMENT);

let supplier;
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

test('put supplier', async ()=>{
    Supplier.template.name='supplierTest';
    Supplier.template.contactId=mocked.contact.id;
    Supplier.template.surcharge='10';
    console.log("Creating...",Supplier.template)
    delete Supplier.template.id;
    mocks.event.body=JSON.stringify(Supplier.template);
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    result=JSON.parse(result.body);
    supplier=result.supplier;
})

test('get supplier', async ()=>{
    mocks.event.queryStringParameters.id=supplier.id;
    mocks.event.httpMethod='get';
    let result = await handler(mocks.event);
    console.log("GET product", result);
})

test('get suppliers for fabricOrFourniture', async ()=>{
    mocks.event.httpMethod='get';
    delete mocks.event.queryStringParameters.id;
    mocks.event.queryStringParameters.fabricOrFournitureId=mocked.fabricOrFourniture.id
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    console.log("GET suppliers for fabricOrFourniture result", result);
})

test('delete supplier', async ()=>{
    mocks.event.queryStringParameters.id=supplier.id;
    mocks.event.httpMethod='delete';
    let result = await handler(mocks.event);
    console.log("DELETE supplier result from handler", result);
})