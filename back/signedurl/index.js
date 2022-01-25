const AWS = require('aws-sdk')

const tokenUtility = require('token-utility');
const uuid = require('uuid');
const s3 = new AWS.S3()
AWS.config.update({region: process.env.REGION})

// Tried with and without this. Since s3 is not region-specific, I don't
// think it should be necessary.
// AWS.config.update({region: 'us-west-2'})

const signedUrlExpireSeconds = 60 * 5

const returnObject = { statusCode: 200 };
returnObject.headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "OPTIONS,HEAD,GET,PUT,POST"
}
const guessContentType = event => {
    let extension = event.queryStringParameters.fileName.substr(event.queryStringParameters.fileName.lastIndexOf('.')+1, event.queryStringParameters.fileName.length).toLowerCase();
    let contentType='image/';
    if (extension==='svg') {
        contentType+='svg+xml'
    } else {
        contentType+=extension;
    }
    return contentType;
}
 
exports.handler = async (event, context) => {
    let token;
    try {
        token = tokenUtility.validateToken(event);
        let key=`images/${event.queryStringParameters.brandId ? event.queryStringParameters.brandId : token.sub}/${uuid.v4()}-${event.queryStringParameters.fileName}`;
        let contentType=event.headers["Content-Type"] ? event.headers["Content-Type"] : guessContentType(event);
        //Yes, the key is 'images/...' and the key that we pass to S3 is 'images/images/...'
        //this is because we're using a cloudfront behaviour to serve the images which points all requests for 'images/*' to a folder
        //called images on the S3 bucket.
        const url = s3.getSignedUrl('putObject', {
            Bucket: 'lupi-web-bucket-'+process.env.ENVIRONMENT,
            Key: 'images/'+key,
            ContentType: contentType,
            Expires: signedUrlExpireSeconds
        })
        returnObject.body = JSON.stringify({ url,contentType, key });
    } catch (err) {
        console.log("error ",err)
        returnObject.statusCode = err.statusCode ? err.statusCode : 401;
        returnObject.body = JSON.stringify({ message: err.message });
    }
    return returnObject;
}