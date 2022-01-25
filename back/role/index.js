const Role = require('lupi-dal/Role');

const returnObject = {statusCode:200};
returnObject.headers={
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "OPTIONS,HEAD,GET,PUT,POST"
}

exports.handler = async (event, context) => {
    var reply = {}
    var body={}
    returnObject.statusCode=200;
    if (typeof event.body === 'string' && event.body!='') {
        event.body=JSON.parse(event.body)
    }
    const method=event.httpMethod.toLowerCase();
    if (method === 'post') {
        if (event.body && event.body) {
            console.log(event.body);
            let role = await Role.save(event.body);
            returnObject.body=JSON.stringify({role});
        }
    } else if (method === 'get') {
        let userId=event.queryStringParameters.userId;
        let roles=await Role.getRolesForUser(userId);
        console.log("userId", userId, "roles", roles);
        returnObject.body=JSON.stringify({roles});
    } else if (method === 'delete') {
        let userId=event.queryStringParameters.userId;
        let brandId=event.queryStringParameters.brandId
        let removed=await Role.remove({userId,brandId});
        returnObject.body=JSON.stringify({removed});
    }
    return returnObject;
}