const ProductSize = require('lupi-dal/ProductSize');
const tokenUtility = require('token-utility');

const returnObject = { statusCode: 200 };
returnObject.headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "OPTIONS,HEAD,GET,PUT,POST"
}

exports.handler = async (event, context) => {
    var reply = {}
    var body = {}
    returnObject.statusCode=200;
    if (typeof event.body === 'string' && event.body != '') {
        event.body = JSON.parse(event.body)
    }
    const method = event.httpMethod.toLowerCase();
    let token;
    try {
        token = tokenUtility.validateToken(event);
        console.log("PRODUCTSIZE token TODO all security", token);
        if (method === 'post') {
            if (event.body && event.body) {
                console.log(event.body);
                let productSize = await ProductSize.save(event.body);
                returnObject.body = JSON.stringify({productSize});
            }
        } else if (method === 'get') {
            let id = event?.queryStringParameters?.id;
            console.log("PRODUCTSIZE", event.queryStringParameters);
            if (id && id != '') {
                let productSize = await ProductSize.get(id);
                returnObject.body = JSON.stringify({productSize});
            } else {
                if (event?.queryStringParameters?.productId){

                    let productId = event?.queryStringParameters?.productId;
                    console.log("PRODUCTSIZE productId", productId);
                    let productSize = await ProductSize.getProductSizeForProduct(productId);
                    console.log("PRODUCTSIZE productsize", productSize);
                    returnObject.body = JSON.stringify({productSize});

                } else if (event?.queryStringParameters?.sizeId){

                    let productId = event?.queryStringParameters?.productId;
                    console.log("PRODUCTSIZE productId", productId);
                    let productSize = await ProductSize.getProductSizeForSize(sizeId);
                    console.log("PRODUCTSIZES productSize", productSize);
                    returnObject.body = JSON.stringify({productSize});
                }
                
            }
        } else if (method === 'delete') {
            let id = event?.queryStringParameters?.id;
            let removed = await ProductSize.remove(id);
            returnObject.body = JSON.stringify({ removed });
        }
    } catch (err) {
        console.log("error ",err)
        returnObject.statusCode = err.statusCode ? err.statusCode : 401;
        returnObject.body = JSON.stringify(err);
    }
    return returnObject;
}