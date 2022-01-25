const {handler} = require('../index.js');
const Collection = require('lupi-dal/Collection');

const mocks=require('../../../mocks')

console.log('process.env.ENVIRONMENT',process.env.ENVIRONMENT);

beforeAll(async() => {
});
  
  afterAll(async() => {
  });

test('copy objects', async ()=>{
console.log("CURRENT WORKING DIRECTORY", process.cwd(), __dirname);
    mocks.event.ResourceProperties={
      Bucket:'lupi-image-bucket-dev',
      TargetDirectory:'test',
      PhysicalResourceId:'PhysicalResourceId',
      SourceDirectory: `${process.cwd()}/back/static-deployer/build`
    }
    mocks.event.ResponseURL='http://localhost:8080/role';
    mocks.event.RequestId='RequestId';
    mocks.event.RequestType='Create';
    let mockContext={}
    mockContext.getRemainingTimeInMillis=()=>{console.log('somebody called getRemainingTimeInMillis'); return 30000}
    let result = await handler(mocks.event, mockContext);
    console.log("copy", result);
},30000)