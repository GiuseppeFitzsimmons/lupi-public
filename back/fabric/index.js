const Fabric = require('lupi-dal/Fabric');
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
        console.log("FABRIC token TODO all security", token);
        if (method === 'post') {
            if (event.body && event.body) {
                console.log(event.body);
                let fabric = await Fabric.save(event.body);
                returnObject.body = JSON.stringify({fabric});
            }
        } else if (method === 'get') {
            let id = event?.queryStringParameters?.id;
            console.log("FABRIC", event.queryStringParameters);
            if (id && id != '') {
                let fabric = await Fabric.get(id);
                returnObject.body = JSON.stringify({fabric});
            } else {
                if (event?.queryStringParameters?.supplierId){

                    let supplierId = event?.queryStringParameters?.supplierId;
                    console.log("FABRIC supplierId", supplierId);
                    let fabrics = await Fabric.getFabricForSupplier(supplierId);
                    console.log("FABRIC fabric", fabrics);
                    returnObject.body = JSON.stringify({fabrics});

                } else if (event?.queryStringParameters?.compositionId){

                    let compositionId = event?.queryStringParameters?.compositionId;
                    console.log("FABRIC compositionId", compositionId);
                    let fabrics = await Fabric.getFabricForComposition(compositionId);
                    console.log("FABRIC fabric", fabrics);
                    returnObject.body = JSON.stringify({fabrics});
                } else {
                    
                    let brandId = token.roles[0].brandId
                    console.log("FABRIC brandId", brandId);
                    let fabrics = await Fabric.getFabricForBrand(brandId);
                    console.log("FABRIC fabric", fabrics);
                    returnObject.body = JSON.stringify({fabrics});
                }
                
            }
        } else if (method === 'delete') {
            let id = event?.queryStringParameters?.id;
            let removed = await Fabric.remove(id);
            returnObject.body = JSON.stringify({ removed });
        }
    } catch (err) {
        console.log("error ",err)
        returnObject.statusCode = err.statusCode ? err.statusCode : 401;
        returnObject.body = JSON.stringify(err);
    }
    return returnObject;
}