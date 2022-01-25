const {handler} = require('../index.js');
const Customer = require('lupi-dal/Customer');

const mocks=require('../../../mocks')

console.log('process.env.ENVIRONMENT',process.env.ENVIRONMENT);

let customer;
let tokens;
let mocked;
beforeAll(async() => {
  mocked=await mocks.setup();
  tokens=mocked.tokens;
}, 15000);
  
  afterAll(async() => {
    await mocks.teardown();
  }, 15000);

test('put customer', async ()=>{
    Customer.template.name='customer1';
    Customer.template.markup='2';
    Customer.template.shippingAddress='14, Rue de Trétaigne, 75018 Paris';
    Customer.template.businessAddress='62, Rue Custine, 75018 Paris';
    Customer.template.siret='12345';
    Customer.template.paymentConditions='N/A'
    console.log("Creating...",Customer.template)
    delete Customer.template.id;
    mocks.event.body=JSON.stringify(Customer.template);
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    result=JSON.parse(result.body);
    customer=result.customer;
})

test('get customer', async ()=>{
    console.log('mocked.customer.id', customer.id)
    mocks.event.queryStringParameters.id=customer.id;
    mocks.event.httpMethod='get';
    let result = await handler(mocks.event);
    console.log("GET customer", result);
})

test('get customers for contact', async ()=>{
    mocks.event.httpMethod='get';
    delete mocks.event.queryStringParameters.id;
    console.log('mocked.contact.id', mocked.contact.id)
    mocks.event.queryStringParameters.contactId=mocked.contact.id
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    console.log("GET customers for contact result", result);
})

test('delete customer', async ()=>{
    mocks.event.queryStringParameters.id=customer.id;
    mocks.event.httpMethod='delete';
    let result = await handler(mocks.event);
    console.log("DELETE customer result from handler", result);
})