const {handler} = require('../index.js');
const Collection = require('lupi-dal/Collection');

const mocks=require('../../../mocks')

console.log('process.env.ENVIRONMENT',process.env.ENVIRONMENT);

let collection;
let collection2;
let tokens;
let mocked;
beforeAll(async() => {
  mocked=await mocks.setup();
  tokens=mocked.tokens;
}, 25000);
  
afterAll(async() => {
  await mocks.teardown();
}, 15000);

test('put collection', async ()=>{
  Collection.template.collectionName='Autumn 21';
  Collection.template.deliveryDate=new Date();
  Collection.template.markup=3.3;
  Collection.template.brandId=mocked.brand.id;
  console.log("Creating...",Collection.template)
  delete Collection.template.id;
  mocks.event.body=JSON.stringify(Collection.template);
  mocks.event.headers.Authorization=tokens.access_token;
  let result = await handler(mocks.event);
  result=JSON.parse(result.body);
  collection=result.collection;
  console.log("CREATE collection", collection);

  Collection.template.collectionName='Winter 21';
  delete Collection.template.id;
  console.log("Creating a second collection...",Collection.template)
  mocks.event.body=JSON.stringify(Collection.template);
  result = await handler(mocks.event);
  result=JSON.parse(result.body);
  collection2=result.collection;
  console.log("CREATE collection 2", result);
})

test('get collection', async ()=>{
  mocks.event.queryStringParameters.id=collection.id;
  mocks.event.httpMethod='get';
  let result = await handler(mocks.event);
  console.log("GET collection", result);
})

test('get collections for brand', async ()=>{
  mocks.event.httpMethod='get';
  delete mocks.event.queryStringParameters.id;
  mocks.event.queryStringParameters.brandId=mocked.brand.id
  mocks.event.headers.Authorization=tokens.access_token;
  let result = await handler(mocks.event);
  console.log("GET collections for brand result", result);
})

test('get siblings for collection', async ()=>{
  mocks.event.httpMethod='get';
  delete mocks.event.queryStringParameters.id;
  mocks.event.queryStringParameters.siblingId=mocked.collection.id
  mocks.event.headers.Authorization=tokens.access_token;
  let result = await handler(mocks.event);
  console.log("GET siblings for collection result", result);
})

test('delete collection', async ()=>{
  mocks.event.queryStringParameters.id=collection.id;
  mocks.event.httpMethod='delete';
  let result = await handler(mocks.event);
  console.log("DELETE collection result from handler", result);
  mocks.event.queryStringParameters.id=collection2.id;
  result = await handler(mocks.event);
  console.log("DELETE collection2 result from handler", result);
})