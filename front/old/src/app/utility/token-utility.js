
function getScopesForBrand(token, brandId) {
    let result={
        allowedScopes:[],
        disallowedScope:[]
    }
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
    return result;
}
function allowedScope(brandId, scope) {
    let tokens=localStorage.getItem('tokens');
    let token;
    if (tokens) {
        tokens=JSON.parse(tokens);
        token=tokens.payload;
    }
    let allowed=false;
    if (!token) {
        return false;
    }
    let scopes=getScopesForBrand(token, brandId);
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
    getScopesForBrand,
    allowedScope
};