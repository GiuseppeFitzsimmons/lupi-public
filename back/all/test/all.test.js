const { handler } = require('../index.js');

const mocks = require('../../../mocks');

let tokens;
let mocked;
beforeAll(async (done) => {
    mocked = await mocks.setup();
    tokens = mocked.tokens;
    console.log('tokens', tokens)
    done()
}, 25000);

afterAll(async () => {
    await mocks.teardown();
}, 45000);

test('get all', async () => {
    mocks.event.headers.Authorization = tokens.access_token;
    mocks.event.queryStringParameters.id = mocked.brand.id;
    mocks.event.httpMethod = 'get';
    let result = await handler(mocks.event);
    console.log("GET result from handler", result);
}, 15000);