const {getDocumentDbClient, putItem, getItem, removeItem, getByParams} = require('./index.js')

const template={
    id:'',
    fabricantId:'',
    productId:'',
    currency: ''
}

const save = async perUnitProductionCost => {
    return await putItem(perUnitProductionCost, `LupiPerUnitProductionCost-${process.env.ENVIRONMENT}`)
}
const get = async id => {
    console.log("PERUNITPRODUCTIONCOST GETTING BY ID", id);
    let perUnitProductionCost=await getItem(id, `LupiPerUnitProductionCost-${process.env.ENVIRONMENT}`)
    return perUnitProductionCost;
}
const remove = async id => {
    return await removeItem(id, `LupiPerUnitProductionCost-${process.env.ENVIRONMENT}`)
}
const getPerUnitProductionCostForFabricant = async id => {
    const params = {
        TableName: `LupiPerUnitProductionCost-${process.env.ENVIRONMENT}`,
        KeyConditionExpression: 'fabricantId = :id',
        IndexName: 'fabricant_index',
        ExpressionAttributeValues: {
            ':id': id
        }
    }
    let perUnitProductionCost = await getByParams(params);
    return perUnitProductionCost;
}
const getPerUnitProductionCostForProduct = async id => {
    const params = {
        TableName: `LupiPerUnitProductionCost-${process.env.ENVIRONMENT}`,
        KeyConditionExpression: 'productId = :id',
        IndexName: 'product_index',
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
    getPerUnitProductionCostForFabricant,
    getPerUnitProductionCostForProduct,
    template
}