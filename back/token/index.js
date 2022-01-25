const User = require('lupi-dal/User');
const tokenUtility = require('token-utility');
const Role = require('lupi-dal/Role');

const returnObject = {statusCode:200};
returnObject.headers={
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "OPTIONS,HEAD,GET,PUT,POST"
}
const ohOh=new Error('Invalid credentials');

exports.handler = async (event, context) => {
    console.log('token event', event)
    var reply = {};
    var body={};
    returnObject.statusCode=200;
    if (typeof event.body === 'string' && event.body!='') {
        event.body=JSON.parse(event.body)
    }
    console.log("EVENT",event);
    const method=event.httpMethod.toLowerCase();
    ohOh.error={};
    try {
        if (method === 'post') {
            if (event.body.grant_type=='password') {
                console.log("id from request",event.body.id) 
                let user;
                try {
                    user=await User.get(event.body.id);
                } catch (badId) {
                    ohOh.error={message:'Invalid credentials', fields:{'password':'Invalid credentials','id': 'Invalid credentials'}};
                    throw ohOh;
                }
                if (user) {
                    //TODO verify that the user is not suspended.
                    console.log("password from request",event.body.password)
                    let hashedPassword=tokenUtility.hashAPass(event.body.password);
                    console.log("hashed pass", hashedPassword, user.password)
                    if (user.password===hashedPassword) {
                        let roles=await Role.getRolesForUser(event.body.id);
                        //for testing expiry...
                        let tokens;
                        if (event.body.preExpiredDevToken) {
                            tokens=tokenUtility.generateNewPair(event.body.id, '*', roles, -1);
                        } else {
                            tokens=tokenUtility.generateNewPair(event.body.id, '*', roles);
                        }
                        returnObject.body=JSON.stringify(tokens);
                    } else {
                        ohOh.error={message:'Invalid credentials', fields:{'password':'Invalid credentials','id': 'Invalid credentials'}};
                        throw ohOh;
                    }
                } else {
                    ohOh.error={message:'Invalid credentials', fields:{'password':'Invalid credentials','id': 'Invalid credentials'}};
                    throw ohOh;
                }
            } else if (event.body.grant_type=='refresh') {
                let token=tokenUtility.validateToken(event, true);
                event.authorizationToken=event.body.token;
                let refreshToken=tokenUtility.validateToken({authorizationToken: event.body.token});
                let user;
                try {
                    user=await User.get(token.sub);
                } catch (badId) {
                }
                //TODO verify that the user is not suspended.
                //token.status is a proposed idea to check whether the user is "invited" or not
                let tokens=tokenUtility.generateNewPair(token.sub, token.scope, token.roles, token.status);
                returnObject.body=JSON.stringify(tokens);
            }
        }
        returnObject.statusCode = 200;
    } catch (err) {
        console.log("error ",JSON.stringify(err.error))
        returnObject.statusCode = err.statusCode ? err.statusCode : 403;
        returnObject.body = JSON.stringify(err.error);
    }
    return returnObject;
}