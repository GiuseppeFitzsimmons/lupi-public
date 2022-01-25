const OrderVariation = require('lupi-dal/OrderVariation');
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
        console.log("ORDERVARIATION token TODO all security", token);
        if (method === 'post') {
            if (event.body && event.body) {
                console.log(event.body);
                let orderVariation = await OrderVariation.save(event.body);
                returnObject.body = JSON.stringify({orderVariation});
            }
        } else if (method === 'get') {
            let id = event?.queryStringParameters?.id;
            console.log("ORDERVARIATION", event.queryStringParameters);
            if (id && id != '') {
                let orderVariation = await OrderVariation.get(id);
                returnObject.body = JSON.stringify({orderVariation});
            } else if (event?.queryStringParameters?.orderId){

                let orderId = event?.queryStringParameters?.orderId;
                console.log("ORDERVARIATION orderId", orderId);
                let orderVariation = await OrderVariation.getOrderVariationForOrder(orderId);
                console.log("ORDERVARIATION orderVariation", orderVariation);
                returnObject.body = JSON.stringify({orderVariation});

            } else if (event?.queryStringParameters?.variationId){

                let variationId = event?.queryStringParameters?.variationId;
                console.log("ORDERVARIATION variationId", variationId);
                let orderVariation = await OrderVariation.getOrderVariationForVariation(variationId);
                console.log("ORDERVARIATION orderVariation", orderVariation);
                returnObject.body = JSON.stringify({orderVariation});

            }
        } else if (method === 'delete') {
            let id = event?.queryStringParameters?.id;
            let removed = await OrderVariation.remove(id);
            returnObject.body = JSON.stringify({ removed });
        }
    } catch (err) {
        console.log("error ",err)
        returnObject.statusCode = err.statusCode ? err.statusCode : 401;
        returnObject.body = JSON.stringify(err);
    }
    return returnObject;
}