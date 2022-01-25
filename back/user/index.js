const User = require('lupi-dal/User');
const tokenUtility = require('token-utility');
const Role = require('lupi-dal/Role');

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
    try {
        if (method === 'post') {
            if (event.body && event.body) {
                //If there's a password, then this user should be new.
                //If not, then this is an error - there shouldn't be a password
                //in an update of an existing user - resetting the password is separate 
                //functionality.
                let tokens;
                if (event.body.password) {
                    console.log("Calling get user", event.body.id);
                    let existingUser=await User.get(event.body.id);
                    if (existingUser) {
                        console.log("User exists? How?", event.body.id, existingUser);
                        throw new Error("Cannot create user");
                    } else {
                        event.body.password=tokenUtility.hashAPass(event.body.password);
                        console.log("created user ", event.body.password)
                        event.body.creationDate=new Date().getTime();
                        //assuming that this is a new user, we'll generate a token set
                        //now, but TODO this trigger an email verification which in turn
                        //calls this API to confirm the user
                        //So at this writing the user is logged in on creation
                        tokens=tokenUtility.generateNewPair(event.body.id, '*',[]);
                    }
                }
                console.log("Calling save user", event.body.id);
                let user = await User.save(event.body);
                if (user.password) delete user.password;
                if (tokens) {
                    returnObject.body=JSON.stringify(tokens);
                } else {
                    returnObject.body=JSON.stringify({user});
                }
            }
        } else if (method === 'get') {
            token = tokenUtility.validateToken(event);
            let id=event?.queryStringParameters?.id;
            let brandId=event?.queryStringParameters?.brandId;
            if (id) {
                console.log('getting user by id', id)
                let user=await User.getClean(id);
                if (user){
                    returnObject.body=JSON.stringify({user});
                } else {
                    returnObject.body = {}
                }
            } else if (brandId) {
                console.log('getting roles for brand', brandId)
                let roles = await Role.getRolesForBrand(brandId);
                let users=[];
                for (r in roles) {
                    let role=roles[r];
                    console.log('getting user by role.userId', role.userId)
                    let user = await User.getClean(role.userId);
                    users.push(user);
                }
                console.log('returning users', users)
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
            //TODO cascade this to all related objects
            //If this user is the last ADMIN of a brand, remove the brand, too.
            returnObject.body=JSON.stringify({removed});
        }
    } catch (err) {
        returnObject.statusCode=401;
        returnObject.body=JSON.stringify({message:err.message});
    }
    return returnObject;
}