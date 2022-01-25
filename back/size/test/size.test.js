const {handler} = require('../index.js');
const Size = require('lupi-dal/Size');

const mocks=require('../../../mocks')

console.log('process.env.ENVIRONMENT',process.env.ENVIRONMENT);

let size;
let tokens;
let mocked;
beforeAll(async() => {
  mocked=await mocks.setup();
  tokens=mocked.tokens;
}, 15000);
  
  afterAll(async() => {
    await mocks.teardown();
  }, 15000);

test('put size', async ()=>{
    Size.template.name='Large';
    Size.template.productSizeId=mocked.productSize.id;
    console.log("Creating...",Size.template)
    delete Size.template.id;
    mocks.event.body=JSON.stringify(Size.template);
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    result=JSON.parse(result.body);
    size=result.size;
    console.log("CREATE size", size);
})

test('get size', async ()=>{
    mocks.event.queryStringParameters.id=size.id;
    mocks.event.httpMethod='get';
    let result = await handler(mocks.event);
    console.log("GET size", result);
})

test('get sizes for productSize', async ()=>{
    mocks.event.httpMethod='get';
    delete mocks.event.queryStringParameters.id;
    mocks.event.queryStringParameters.productSizeId=mocked.productSize.id
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    console.log("GET sizes for productSize result", result);
})

test('delete size', async ()=>{
    mocks.event.queryStringParameters.id=size.id;
    mocks.event.httpMethod='delete';
    let result = await handler(mocks.event);
    console.log("DELETE variation result from handler", result);
})