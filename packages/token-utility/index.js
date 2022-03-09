const jwt = require('jsonwebtoken');

function getSigningSecret() {
    //TODO something better than this
    return process.env.SIGNING_SECRET
}
function validateToken(event, ignoreExpiration, scope) {
    console.log('tokenevent', event)
    signingSecret=getSigningSecret();
    var token = event.authorizationToken;
    if ((!token || token == '') && event.headers) {
        token = event.headers.Authorization;
        if (!token || token == '') {
            token = event.headers.authorization;
        }
    } else {
        if (event.body){
            let _body=event.body;
            if (typeof _body=='string') {
                _body=JSON.parse(_body);
            }
            token = _body.token
        }
    }
    if (!token) {
        err=new Error("Unauthorized");
        err.statusCode=401;
        err.message="Unauthorized";
        console.log("No token, rejecting", err);
        throw err;
    }
    if (token.toLowerCase().indexOf("bearer") == 0) {
        token = token.substr(7);
    }
    var decoded;
    if (!token || token == '') {
        console.log("No token, rejecting...");
        throw fourOhOne();
    }
    try {
        decoded = jwt.verify(token, signingSecret,{ignoreExpiration: true});
        console.log("decoded", decoded)
    } catch (err) {
        console.log(err);
        throw fourOhOne();
    }
    if (scope) {
        if (!decoded.scope.split(' ').find(s=>s==scope)) {
            throw fourOhOne('invalid scope', scope);
        }
    }
    if (decoded) {
        console.log("CHECKING EXPIRY", new Date().getTime(), decoded.exp)
        if (ignoreExpiration || new Date().getTime() < decoded.exp) {
            return decoded;
        } else {
            console.log("Token is expired, rejecting...");
            throw fourOhOne("Token has expired", 'exp');
        }
    }
};
function fourOhOne(message, code) {
    if (!message) {
        message="Unauthorized";
    }
    err=new Error(message);
    err.statusCode=401;
    err.message=message;
    if (code) {
        err.code=code;
    }
    return err;
}

function generateNewPair(userId, scope, roles, duration) {
    signingSecret=getSigningSecret();
    console.log("generateNewPair SIGNING SECRET", signingSecret);
    tokenPayload = {};
    tokenPayload.iss = 'flashgang';
    tokenPayload.sub = userId;
    tokenPayload.scope=scope;
    if (roles) tokenPayload.roles=roles;
    var now = new Date();
    let expiry=duration ? duration : process.env.TOKEN_DURATION ? (process.env.TOKEN_DURATION*1) : 30;
    now.setMinutes(now.getMinutes() + expiry);
    now = new Date(now);
    tokenPayload.exp = now.getTime();
    var access_token = jwt.sign(tokenPayload, signingSecret);
    if (tokenPayload.scope!="PASSWORD") {
        refreshTokenPayload={};
        refreshTokenPayload.sub = userId;
        refreshTokenPayload.uuid = tokenPayload.uuid;
        now.setMinutes(now.getMinutes() + 6*60);
        refreshTokenPayload.exp = now.getTime();
        var refresh_token = jwt.sign(refreshTokenPayload, signingSecret);
    }
    return {access_token, refresh_token};
}
function hashAPass(password) {
    const crypto = require('crypto');
    const hashingSecret = process.env.HASHING_SECRET;
    const plainText = password;
    const hashedPass = crypto.createHmac('sha256', hashingSecret)
                .update(plainText)
                .digest('hex');
    return hashedPass;
}
function getScopesForBrand(token, brandId) {
    let result={
        allowedScopes:[],
        disallowedScope:[]
    }
    console.log('tokenlog', token)
    token.roles.forEach(role => {
        if (role.brandId===brandId) {
            if (role.allowedScopes) {
                result.allowedScopes=Object.assign(result.allowedScopes, role.allowedScopes);
            }
            if (role.disallowedScope) {
                result.disallowedScope=Object.assign(result.disallowedScope, role.disallowedScope);
            }
        }
    });
    console.log("SCOPES FOR BRAND", token, brandId, result);
    return result;
}
function allowedScope(token, brandId, scope) {
    console.log('allowedScope token', token, brandId)
    let allowed=false;
    let scopes=getScopesForBrand(token, brandId);
    console.log('scopes', scopes)
    let requestedScopeSplit=scope.split(':');
    let requestedObject=requestedScopeSplit[0];
    let requestedAction=requestedScopeSplit[1];
    scopes.allowedScopes.forEach(scope=>{
        let thisScopeSplit=scope.split(':');
        let thisObject=thisScopeSplit[0];
        let thisAction=thisScopeSplit[1];
        if (thisObject==='*'|| thisObject===requestedObject) {
            if (thisAction==='*' || thisAction===requestedAction) {
                allowed=true;
            }
        }
    })
    scopes.disallowedScope.forEach(scope=>{
        let thisScopeSplit=scope.split(':');
        let thisObject=thisScopeSplit[0];
        let thisAction=thisScopeSplit[1];
        if (thisObject==='*'|| thisObject===requestedObject) {
            if (thisAction==='*' || thisAction===requestedAction) {
                allowed=false;
            }
        }
    })
    return allowed;
}


module.exports = {
    validateToken,
    generateNewPair,
    hashAPass,
    getScopesForBrand,
    allowedScope,
    fourOhOne
};