const Signup = require('lupi-dal/Signup');
const tokenUtility = require('token-utility');

const returnObject = { statusCode: 200 };
returnObject.headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "OPTIONS,HEAD,GET,PUT,POST"
}

exports.handler = async (event, context) => {
    console.log('eventLogger', event)
    var reply = {}
    var body = {}
    returnObject.statusCode=200;
    const method = event.httpMethod.toLowerCase();
    try {
        if (method === 'post') {
            if (typeof event.body === 'string' && event.body != '') {
                event.body = JSON.parse(event.body)
            }
            if (event.body && event.body) {
                console.log(event.body["email"]);
                let email = JSON.stringify(event.body["email"]).toLowerCase()
                let signup = await Signup.save({email:email});
                returnObject.body = JSON.stringify({signup});
            }
        } else if (method === 'get') {
            let email = event?.queryStringParameters?.email;
            let signup = await Signup.get(email);
            returnObject.body = JSON.stringify({signup});
        } else if (method === 'delete') {
            let email = event?.queryStringParameters?.email;
            let removed = await Signup.remove(email);
            returnObject.body = JSON.stringify({ removed });
        }
    } catch (err) {
        console.log("error ",err)
        returnObject.statusCode = err.statusCode ? err.statusCode : 401;
        returnObject.body = JSON.stringify(err);
    }
    console.log('returnObject', returnObject)
    return returnObject;
}