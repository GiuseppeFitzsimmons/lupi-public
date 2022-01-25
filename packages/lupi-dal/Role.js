const {getDocumentDbClient, putItem, getItem, removeByParams, getByParams} = require('./index.js')

const ADMIN={name:'ADMIN',allowedScopes:['*:*']};
const PARTNER={name:'PARTNER',allowedScopes:['*:*'],disallowedScopes:['brand:write']};
const COLLABORATOR={name:'COLLABORATOR',allowedScopes:['*:read','fabric:write']};

const template={
    userId:'',
    brandId:'',
    name:'',
    allowedScopes:'',
    disallowedScopes:''
}
const save = async role => {
    
    role.lastModifiedDate=new Date().getTime();
    var params = {
        TableName: `LupiRole-${process.env.ENVIRONMENT}`,
        Item: role
    };
    var documentClient = getDocumentDbClient();
    let updatedItem = await new Promise((resolve, reject) => {
        documentClient.put(params, function (err, data) {
            if (err) {
                console.log("putItem error ", JSON.stringify(params), err);
                reject(err);
            } else {
                console.log(data);
                resolve(data);
            }
        });
    });
    console.log("updatedItem ", role)
    return role;
}
const get = async id => {
    console.log("who's calling role get ",id)
    return await getItem(id, `LupiRole-${process.env.ENVIRONMENT}`)
}
const remove = async role => {
    const params = {
        TableName: `LupiRole-${process.env.ENVIRONMENT}`,
        Key: {
            userId:role.userId,
            brandId:role.brandId
        }
    }
    return await removeByParams(params);
}
const getRolesForUser = async id => {
    const params = {
        TableName: `LupiRole-${process.env.ENVIRONMENT}`,
        KeyConditionExpression: 'userId = :id',
        ExpressionAttributeValues: {
            ':id': id
        }
    }
    return await getByParams(params)
}
const getRolesForBrand = async id => {
    const params = {
        TableName: `LupiRole-${process.env.ENVIRONMENT}`,
        KeyConditionExpression: 'brandId = :id',
        IndexName: 'brand_index',
        ExpressionAttributeValues: {
            ':id': id
        }
    }
    return await getByParams(params)
}
module.exports = {
    save,
    get,
    remove,
    template,
    getRolesForUser,
    getRolesForBrand,
    roles:{ADMIN,PARTNER,COLLABORATOR}
}