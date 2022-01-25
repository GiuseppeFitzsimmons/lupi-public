const Variation = require('lupi-dal/Variation');
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
        console.log("VARIATION token TODO all security", token);
        if (method === 'post') {
            if (event.body && event.body) {
                console.log(event.body);
                let variation = await Variation.save(event.body);
                returnObject.body = JSON.stringify({variation});
            }
        } else if (method === 'get') {
            let id = event?.queryStringParameters?.id;
            console.log("VARIATIONS", event.queryStringParameters);
            if (id && id != '') {
                let variation = await Variation.get(id);
                returnObject.body = JSON.stringify({variation});
            } else {
                let productId = event?.queryStringParameters?.productId;
                console.log("VARIATION productId", productId);
                let variations = await Variation.getVariationsForProduct(productId);
                console.log("VARIATIONS variations", variations);
                returnObject.body = JSON.stringify({variation});
            }
        } else if (method === 'delete') {
            let id = event?.queryStringParameters?.id;
            let removed = await Variation.remove(id);
            returnObject.body = JSON.stringify({ removed });
        }
    } catch (err) {
        console.log("error ",err)
        returnObject.statusCode = err.statusCode ? err.statusCode : 401;
        returnObject.body = JSON.stringify(err);
    }
    return returnObject;
}