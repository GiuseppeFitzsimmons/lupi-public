const PerUnitProductionCost = require('lupi-dal/PerUnitProductionCost');
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
        console.log("PERUNITPRODUCTIONCOST token TODO all security", token);
        if (method === 'post') {
            if (event.body && event.body) {
                console.log(event.body);
                let perUnitProductionCost = await PerUnitProductionCost.save(event.body);
                returnObject.body = JSON.stringify({perUnitProductionCost});
            }
        } else if (method === 'get') {
            let id = event?.queryStringParameters?.id;
            console.log("PERUNITPRODUCTIONCOSTS", event.queryStringParameters);
            if (id && id != '') {
                let perUnitProductionCost = await PerUnitProductionCost.get(id);
                returnObject.body = JSON.stringify({perUnitProductionCost});
            } else if (event?.queryStringParameters?.fabricantId){

                let fabricantId = event?.queryStringParameters?.fabricantId;
                console.log("PERUNITPRODUCTIONCOST fabricantId", fabricantId);
                let perUnitProductionCost = await PerUnitProductionCost.getPerUnitProductionCostForFabricant(fabricantId);
                console.log("PERUNITPRODUCTIONCOST perUnitProductionCost", perUnitProductionCost);
                returnObject.body = JSON.stringify({perUnitProductionCost});

            } else if (event?.queryStringParameters?.productId){

                let productId = event?.queryStringParameters?.productId;
                console.log("PERUNITPRODUCTIONCOST productId", productId);
                let perUnitProductionCost = await PerUnitProductionCost.getPerUnitProductionCostForProduct(productId);
                console.log("PERUNITPRODUCTIONCOST perUnitProductionCost", perUnitProductionCost);
                returnObject.body = JSON.stringify({perUnitProductionCost});

            }
        } else if (method === 'delete') {
            let id = event?.queryStringParameters?.id;
            let removed = await PerUnitProductionCost.remove(id);
            returnObject.body = JSON.stringify({ removed });
        }
    } catch (err) {
        console.log("error ",err)
        returnObject.statusCode = err.statusCode ? err.statusCode : 401;
        returnObject.body = JSON.stringify(err);
    }
    return returnObject;
}