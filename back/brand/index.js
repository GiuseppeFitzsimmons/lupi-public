const Brand = require('lupi-dal/Brand');
const Role = require('lupi-dal/Role');
const tokenUtility = require('token-utility');

const returnObject = { statusCode: 200 };
returnObject.headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "OPTIONS,HEAD,GET,PUT,POST"
}

exports.handler = async (event, context) => {
    console.log(event)
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
        console.log("BRAND token TODO all security", token);
        //console.log('tokenutility', tokenUtility.allowedScope(token, event.body.id, 'brand:write'))
        if (method === 'post') {
            if (event.body && event.body) {
                //look at id, if it's a uuid (dashes), keep it, brand.uuid = brand.id,
                //clean name (lowercase, no spaces, check if it doesn't already exist, if it does suffix a number)
                //=> add property called oldId, it takes the 
                //brand.id is now the name that we received
                //in collection, we also prefix with brandId
                let updatedBrand = event.body
                updatedBrand.brandName = updatedBrand.brandName.toLowerCase().replace(' ', '')
                console.log('updatedBrand', updatedBrand)
                if (!updatedBrand.oldId){
                    if (updatedBrand.id && updatedBrand.id.includes('-')){
                        updatedBrand.oldId = updatedBrand.id
                        updatedBrand.id = updatedBrand.brandName
                    }
                    let brandChecker = await Brand.get(updatedBrand.id)
                    console.log('brandChecker', brandChecker)
                    if (brandChecker){
                        suffix = Date.now()//.toString
                        updatedBrand.id = updatedBrand.brandName + '-' + suffix//.slice(-4)
                    }
                }
                await Brand.save(updatedBrand);
                let roles=await Role.getRolesForBrand(updatedBrand.id);
                let role;
                if (roles) {
                    role=roles.find(r=>r.role==='ADMIN');
                }
                let tokens;
                if (!role) {
                    //Then this is a new brand and the person creating it is the administrator
                    role = Object.assign(Role.template, Role.roles.ADMIN);
                    role.userId = token.sub;
                    role.brandId = updatedBrand.id;
                    role=await Role.save(role);
                    token.roles.push(role);
                    tokens=tokenUtility.generateNewPair(token.sub, token.scope, token.roles);
                    console.log("role is saved", role)
                }
                returnObject.body = JSON.stringify({tokens, brand:updatedBrand});
            }
        } else if (method === 'get') {
            let id = event?.queryStringParameters?.id;
            if (id && id != '') {
                //We only want one brand
                if (tokenUtility.allowedScope(token, id, 'brand:read')) {
                    let brand = await Brand.get(id);
                    returnObject.body = JSON.stringify({brand});
                } else {
                    throw tokenUtility.fourOhOne();
                }
            } else {
                let roles = await Role.getRolesForUser(token.sub);
                //console.log('LOGGER roles', roles)
                let brands = [];
                for (r in roles) {
                    let role = roles[r];
                    let brand = await Brand.get(role.brandId);
                    //console.log('LOGGER brand', brand)
                    brands.push(brand);
                    //console.log('LOGGER brands', brands)
                }
                returnObject.body = JSON.stringify({brands});
            }
        } else if (method === 'delete') {
            let id = event?.queryStringParameters?.id;
            let removed = await Brand.remove(id);
            let roles = await Role.getRolesForBrand(id);
            for (r in roles) {
                let role = roles[r];
                await Role.remove(role);
            }
            returnObject.body = JSON.stringify({ removed });
        }
    } catch (err) {
        console.log("error ",err)
        returnObject.statusCode = err.statusCode ? err.statusCode : 401;
        returnObject.body = JSON.stringify(err);
    }
    console.log('brand lambda returnObject', returnObject)
    return returnObject;
}