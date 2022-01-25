const ADMIN={name:'ADMIN',allowedScopes:['*:*']};
const PARTNER={name:'PARTNER',allowedScopes:['*:*'],disallowedScopes:['brand:write']};
const COLLABORATOR={name:'COLLABORATOR',allowedScopes:['*:read','fabric:write']};

const template={
    userId:'',
    brandId:'',
    role:'',
    allowedScopes:'',
    disallowedScopes:''
}
const newRole=Object.assign(template, ADMIN);
console.log(newRole);