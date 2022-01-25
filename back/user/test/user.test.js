const {handler} = require('../index.js');
const User = require('lupi-dal/User');

const mocks=require('../../../mocks')

console.log('process.env.ENVIRONMENT',process.env.ENVIRONMENT);

let user;
let mocked;
const email='phillip@lupi.com';
beforeAll(async() => {
  mocked=await mocks.setup();
}, 15000);
  
  afterAll(async() => {
    await mocks.teardown();
  }, 15000);

test('create user', async ()=>{
    User.template.id=email;
    User.template.firstName='Phillip';
    User.template.lastName='Fitzsimmons';
    User.template.password='password';
    mocks.event.body=JSON.stringify(User.template);
    let result = await handler(mocks.event);
    result=JSON.parse(result.body);
    user=result.user;
    console.log("CREATE result from handler", user);
},10000)

test('create user sad path - use exists', async ()=>{
    mocks.event.body=JSON.stringify(User.template);
    let result = await handler(mocks.event);
    console.log("CREATE result from handler, sad path", result);
},10000)

test('get user ', async ()=>{
    console.log("get user...", user);
    mocks.event.httpMethod='get';
    mocks.event.queryStringParameters.id=email;
    let result = await handler(mocks.event);
    console.log("GET result from handler", result);
    let realUser=await User.get(User.template.id);
    console.log('realUser',realUser);
})
test('get users for brand ', async ()=>{
    console.log("get users for brand...", mocked.brand.id);
    mocks.event.httpMethod='get';
    delete mocks.event.queryStringParameters.id;
    mocks.event.queryStringParameters.brandId=mocked.brand.id;
    let result = await handler(mocks.event);
    console.log("GET users from handler", result);
})

test('delete user', async ()=>{
    mocks.event.queryStringParameters.id=email;
    mocks.event.httpMethod='delete';
    console.log("delete use case", email);
    let result = await handler(mocks.event);
    console.log("DELETE result from handler", result);
})