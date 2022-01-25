const {handler} = require('../index.js');
const Role = require('lupi-dal/Role');

const mocks=require('../../../mocks')

console.log('process.env.ENVIRONMENT',process.env.ENVIRONMENT);

let role;
let tokens;
let mocked;
beforeAll(async() => {
    mocked=await mocks.setup();
    tokens=mocked.tokens;
}, 15000);
afterAll(async() => {
    await mocks.teardown();
}, 15000);
test('put role', async ()=>{
    console.log(Role.template)
    Role.template.userId='phillip@lupi.fr';
    Role.template.brandId='1234';
    Role.template.role=Role.roles.ADMIN;
    delete Role.template.allowedScopes;
    delete Role.template.disallowedScopes;
    mocks.event.body=JSON.stringify(Role.template);
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    result=JSON.parse(result.body);
    role=result.role;
    console.log("CREATE result from handler", result, role);
})

test('get roles', async ()=>{
    mocks.event.httpMethod='get';
    mocks.event.queryStringParameters.userId='phillip@lupi.fr';
    mocks.event.queryStringParameters.brandId='1234';
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    console.log("GET result from handler", result);
})

test('delete role', async ()=>{
    mocks.event.httpMethod='delete';
    mocks.event.queryStringParameters.userId='phillip@lupi.fr';
    mocks.event.queryStringParameters.brandId='1234';
    mocks.event.headers.Authorization=tokens.access_token;
    let result = await handler(mocks.event);
    console.log("DELETE result from handler", result);
    mocks.event.httpMethod='get';
    result = await handler(mocks.event);
    console.log("After DELETE result there should be no roles...", result);
})