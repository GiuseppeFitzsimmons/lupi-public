const Fourniture = require('lupi-dal/Fourniture');
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
        console.log("FOURNITURE token TODO all security", token);
        if (method === 'post') {
            if (event.body && event.body) {
                console.log(event.body);
                let fourniture = await Fourniture.save(event.body);
                returnObject.body = JSON.stringify({fourniture});
            }
        } else if (method === 'get') {
            let id = event?.queryStringParameters?.id;
            console.log("FOURNITURE", event.queryStringParameters);
            if (id && id != '') {
                let fourniture = await Fourniture.get(id);
                returnObject.body = JSON.stringify({fourniture});
            } else {
                if (event?.queryStringParameters?.supplierId){

                    let supplierId = event?.queryStringParameters?.supplierId;
                    console.log("FOURNITURE supplierId", supplierId);
                    let fournitures = await Fourniture.getFournitureForSupplier(supplierId);
                    console.log("FOURNITURE fourniture", fournitures);
                    returnObject.body = JSON.stringify({fournitures});

                } else if (event?.queryStringParameters?.compositionId){

                    let compositionId = event?.queryStringParameters?.compositionId;
                    console.log("FOURNITURE compositionId", compositionId);
                    let fournitures = await Fourniture.getFournitureForComposition(compositionId);
                    console.log("FOURNITURE fourniture", fournitures);
                    returnObject.body = JSON.stringify({fournitures});
                } else {
                    
                    let brandId = token.roles[0].brandId
                    console.log("FOURNITURE brandId", brandId);
                    let fournitures = await Fourniture.getFournitureForBrand(brandId);
                    console.log("FOURNITURE fourniture", fournitures);
                    returnObject.body = JSON.stringify({fournitures});
                }
                
            }
        } else if (method === 'delete') {
            let id = event?.queryStringParameters?.id;
            let removed = await Fourniture.remove(id);
            returnObject.body = JSON.stringify({ removed });
        }
    } catch (err) {
        console.log("error ",err)
        returnObject.statusCode = err.statusCode ? err.statusCode : 401;
        returnObject.body = JSON.stringify(err);
    }
    return returnObject;
}