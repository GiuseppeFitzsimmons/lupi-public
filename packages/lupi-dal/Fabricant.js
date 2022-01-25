const {getDocumentDbClient, putItem, getItem, removeItem, getByParams} = require('./index.js')

const template={
    id:'',
    name:'',
    contactId:'',
    madeIn: ''
}

const save = async fabricant => {
    return await putItem(fabricant, `LupiFabricant-${process.env.ENVIRONMENT}`)
}
const get = async id => {
    console.log("FABRICANT GETTING BY ID", id);
    let fabricant=await getItem(id, `LupiFabricant-${process.env.ENVIRONMENT}`)
    return fabricant;
}
const remove = async id => {
    return await removeItem(id, `LupiFabricant-${process.env.ENVIRONMENT}`)
}
const getFabricantForContact = async id => {
    const params = {
        TableName: `LupiFabricant-${process.env.ENVIRONMENT}`,
        KeyConditionExpression: 'contactId = :id',
        IndexName: 'contact_index',
        ExpressionAttributeValues: {
            ':id': id
        }
    }
    let fabricant = await getByParams(params);
    return fabricant;
}
const getFabricantForPerUnitProductionCost = async id => {
    const params = {
        TableName: `LupiFabricant-${process.env.ENVIRONMENT}`,
        KeyConditionExpression: 'perUnitProductionCostId = :id',
        IndexName: 'perunitproductioncost_index',
        ExpressionAttributeValues: {
            ':id': id
        }
    }
    let fabricant = await getByParams(params);
    return fabricant;
}
module.exports = {
    save,
    get,
    remove,
    getFabricantForContact,
    getFabricantForPerUnitProductionCost,
    template
}