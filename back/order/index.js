const Order = require('lupi-dal/Order');
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
        console.log("ORDER token TODO all security", token);
        if (method === 'post') {
            if (event.body && event.body) {
                console.log(event.body);
                let order = await Order.save(event.body);
                returnObject.body = JSON.stringify({order});
            }
        } else if (method === 'get') {
            let id = event?.queryStringParameters?.id;
            console.log("ORDERS", event.queryStringParameters);
            if (id && id != '') {
                let order = await Order.get(id);
                returnObject.body = JSON.stringify({order});
            } else {
                let customerId = event?.queryStringParameters?.customerId;
                console.log("ORDER customerId", customerId);
                let order = await Order.getOrderForCustomer(customerId);
                console.log("ORDERS order", order);
                returnObject.body = JSON.stringify({order});
            }
        } else if (method === 'delete') {
            let id = event?.queryStringParameters?.id;
            let removed = await Order.remove(id);
            returnObject.body = JSON.stringify({ removed });
        }
    } catch (err) {
        console.log("error ",err)
        returnObject.statusCode = err.statusCode ? err.statusCode : 401;
        returnObject.body = JSON.stringify(err);
    }
    return returnObject;
}