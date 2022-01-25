const User = require('lupi-dal/User');
const tokenUtility = require('token-utility')
const Role = require('lupi-dal/Role')
const Brand = require('lupi-dal/Brand')
const Crypto = require('crypto')

const returnObject = {statusCode:200};
returnObject.headers={
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "OPTIONS,HEAD,GET,PUT,POST"
}

exports.handler = async (event, context) => {
    console.log('eventLogger', event)
    var reply = {}
    var body={}
    returnObject.statusCode=200;
    if (typeof event.body === 'string' && event.body!='') {
        event.body=JSON.parse(event.body)
    }
    const method=event.httpMethod.toLowerCase();
    let token;
    let randomString = (size = 8) => {  
        return Crypto
          .randomBytes(size)
          .toString('base64')
          .slice(0, size)
    }
    try {
        if (method === 'post') {
            if (event.body && event.body) {
                //If there's a password, then this user should be new.
                //If not, then this is an error - there shouldn't be a password
                //in an update of an existing user - resetting the password is separate 
                //functionality.
                console.log("Calling get user", event.body.email);
                let existingUser=await User.get(event.body.email);
                if (existingUser) {
                    console.log("User exists? How?", event.body.email, existingUser);
                    returnObject.statusCode=401;
                    returnObject.body=JSON.stringify({message:'user already exists'});
                } else {
                    let newPassword = randomString()
                    let hashedPassword = tokenUtility.hashAPass(newPassword)
                    let user = await User.save({id: event.body.email, password: hashedPassword, status:'invited'});
                    returnObject.body=JSON.stringify({id:user.id, password:newPassword})
                }
                console.log("Calling save user", event.body.email);
                let role = await Role.save({userId: event.body.email, brandId: event.body.brand, allowedScopes:['*:*'], disallowedScopes:['brand:write']});
            }
        } else if (method === 'get') {
            token = tokenUtility.validateToken(event);
            let id=event?.queryStringParameters?.id;
            let brandId=event?.queryStringParameters?.brandId;
            if (id) {
                let user=await User.getClean(id);
                returnObject.body=JSON.stringify({user});
            } else if (brandId) {
                let roles = await Role.getRolesForBrand(brandId);
                let users=[];
                for (r in roles) {
                    let role=roles[r];
                    let user = await User.getClean(role.userId);
                    users.push({user});
                }
                returnObject.body=JSON.stringify({users});
            } else {
                let user=await User.getClean(token.sub);
                returnObject.body=JSON.stringify({user});
            }
        } else if (method === 'delete') {
            token = tokenUtility.validateToken(event);
            let id=event?.queryStringParameters?.id;
            console.log("removing user", id);
            let removed=await User.remove(id);
            //let rolesToRemove = await 
            //TODO cascade this to all related objects
            //If this user is the last ADMIN of a brand, remove the brand, too.
            returnObject.body=JSON.stringify({removed});
        }
    } catch (err) {
        returnObject.statusCode=401;
        returnObject.body=JSON.stringify({message:err.message});
    }
    console.log('brandUser returnObject', returnObject)
    return returnObject;
}