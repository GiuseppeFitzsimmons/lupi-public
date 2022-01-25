const Supplier = require('lupi-dal/Supplier');
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
        console.log("SUPPLIER token TODO all security", token);
        if (method === 'post') {
            if (event.body && event.body) {
                console.log(event.body);
                let supplier = await Supplier.save(event.body);
                returnObject.body = JSON.stringify({supplier});
            }
        } else if (method === 'get') {
            let id = event?.queryStringParameters?.id;
            console.log("SUPPLIERS", event.queryStringParameters);
            if (id && id != '') {
                let supplier = await Supplier.get(id);
                returnObject.body = JSON.stringify({supplier});
            } else {
                let fabricOrFournitureId = event?.queryStringParameters?.fabricOrFournitureId;
                console.log("SUPPLIER fabricOrFournitureId", fabricOrFournitureId);
                let supplier = await Supplier.getSupplierForFabricOrFourniture(fabricOrFournitureId);
                console.log("SUPPLIERS supplier", supplier);
                returnObject.body = JSON.stringify({supplier});
            }
        } else if (method === 'delete') {
            let id = event?.queryStringParameters?.id;
            let removed = await Supplier.remove(id);
            returnObject.body = JSON.stringify({ removed });
        }
    } catch (err) {
        console.log("error ",err)
        returnObject.statusCode = err.statusCode ? err.statusCode : 401;
        returnObject.body = JSON.stringify(err);
    }
    return returnObject;
}