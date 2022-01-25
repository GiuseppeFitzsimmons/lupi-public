const {handler} = require('../index.js');
const Signup = require('lupi-dal/Signup');

const mocks=require('../../../mocks')

console.log('process.env.ENVIRONMENT',process.env.ENVIRONMENT);

let signup;
let tokens;
let mocked;
beforeAll(async() => {
  mocked=await mocks.setup();
  tokens=mocked.tokens;
}, 15000);
  
  afterAll(async() => {
    await mocks.teardown();
  }, 15000);

test('put signup', async ()=>{
    Signup.template.email='test@email.com';
    console.log("Creating...",Signup.template)
    delete Signup.template.id;
    mocks.event.body=JSON.stringify(Signup.template);
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    result=JSON.parse(result.body);
    signup=result.signup;
    console.log("CREATE signup", signup);
})

test('get signup', async ()=>{
    mocks.event.queryStringParameters.email=signup.email;
    mocks.event.httpMethod='get';
    let result = await handler(mocks.event);
    console.log("GET signup", result);
})

test('delete signup', async ()=>{
    mocks.event.queryStringParameters.email=signup.email;
    mocks.event.httpMethod='delete';
    let result = await handler(mocks.event);
    console.log("DELETE signup result from handler", result);
})