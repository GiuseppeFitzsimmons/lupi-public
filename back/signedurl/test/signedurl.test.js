const { handler } = require('../index.js');
const Brand = require('lupi-dal/Brand');

const mocks = require('../../../mocks')

console.log('process.env.ENVIRONMENT', process.env.ENVIRONMENT);

const fs = require('fs');
const fetch = require('node-fetch');

let brand;
let brand2;
let tokens;
let mocked;
beforeAll(async () => {
  mocked = await mocks.setup();
  tokens = mocked.tokens;
}, 15000);

afterAll(async () => {
  await mocks.teardown();
}, 15000);

test('getSignedUrl', async () => {
  mocks.event.headers.Authorization = tokens.access_token;
  mocks.event.queryStringParameters.brandId = mocked.brand.id;
  mocks.event.queryStringParameters.fileName = 'animage.jpg';
  let result = await handler(mocks.event);
  result = JSON.parse(result.body)
  console.log("getSignedUrl", result.url);
  var bufferContent = fs.readFileSync(process.cwd()+'/back/signedurl/test/animage.jpg');
  const stats = fs.statSync(process.cwd()+'/back/signedurl/test/animage.jpg');
  const fileSizeInBytes = stats.size;
  var params = {
    method: 'PUT',
    headers: {
      'Content-Type':result.contentType
    },
    body: bufferContent,
  };
  console.log("getSignedUrl params", params, result.url);
  let uploadResult=await new Promise( (resolve, reject) => {
    fetch(result.url, params)
    .then(res => res)
    .then(function (json) {
      console.log("getSignedUrl json", json);
      resolve(json);
    }).catch(err=>{
      console.log("getSignedUrl error", err);
      reject(err)
    });
  });
  console.log("getSignedUrl finished", uploadResult);
}, 180000)
