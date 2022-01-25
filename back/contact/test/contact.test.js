const {handler} = require('../index.js');
const Contact = require('lupi-dal/Contact');

const mocks=require('../../../mocks')

console.log('process.env.ENVIRONMENT',process.env.ENVIRONMENT);

let contact;
let tokens;
let mocked;
beforeAll(async() => {
  mocked=await mocks.setup();
  tokens=mocked.tokens;
}, 15000);
  
  afterAll(async() => {
    await mocks.teardown();
  }, 15000);

test('put contact', async ()=>{
    Contact.template.name='contactTest';
    Contact.template.supplierId=mocked.supplier.id;
    console.log("Creating...",Contact.template)
    delete Contact.template.id;
    mocks.event.body=JSON.stringify(Contact.template);
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    result=JSON.parse(result.body);
    contact=result.contact;
})

test('get contact', async ()=>{
    mocks.event.queryStringParameters.id=contact.id;
    mocks.event.httpMethod='get';
    let result = await handler(mocks.event);
    console.log("GET product", result);
})

test('get contacts for supplier', async ()=>{
    mocks.event.httpMethod='get';
    delete mocks.event.queryStringParameters.id;
    mocks.event.queryStringParameters.supplierId=mocked.supplier.id
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    console.log("GET contacts for supplier result", result);
})

test('delete contact', async ()=>{
    mocks.event.queryStringParameters.id=contact.id;
    mocks.event.httpMethod='delete';
    let result = await handler(mocks.event);
    console.log("DELETE contact result from handler", result);
})