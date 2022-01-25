const Fabricant = require('lupi-dal/Fabricant');
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
        console.log("FABRICANT token TODO all security", token);
        if (method === 'post') {
            if (event.body && event.body) {
                console.log(event.body);
                let fabricant = await Fabricant.save(event.body);
                returnObject.body = JSON.stringify({fabricant});
            }
        } else if (method === 'get') {
            let id = event?.queryStringParameters?.id;
            console.log("FABRICANTS", event.queryStringParameters);
            if (id && id != '') {
                let fabricant = await Fabricant.get(id);
                returnObject.body = JSON.stringify({fabricant});
            } else {
                let contactId = event?.queryStringParameters?.contactId;
                console.log("FABRICANT contactId", contactId);
                let fabricant = await Fabricant.getFabricantForContact(contactId);
                console.log("FABRICANT fabricant", fabricant);
                returnObject.body = JSON.stringify({fabricant});
            }
        } else if (method === 'delete') {
            let id = event?.queryStringParameters?.id;
            let removed = await Fabricant.remove(id);
            returnObject.body = JSON.stringify({ removed });
        }
    } catch (err) {
        console.log("error ",err)
        returnObject.statusCode = err.statusCode ? err.statusCode : 401;
        returnObject.body = JSON.stringify(err);
    }
    return returnObject;
}