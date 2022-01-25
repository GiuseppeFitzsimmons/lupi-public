const Crypto = require('crypto')

const returnObject = {statusCode:200};
returnObject.headers={
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "OPTIONS,HEAD,GET,PUT,POST"
}

function randomString(size = 8) {  
    return Crypto
      .randomBytes(size)
      .toString('base64')
      .slice(0, size)
}
console.log(randomString())