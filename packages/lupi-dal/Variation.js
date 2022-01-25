const {getDocumentDbClient, putItem, getItem, removeItem, getByParams} = require('./index.js')

const template={
    id:'',
    productId:'',
    variationName:'',
    depiction: '',
    productionCost: ''
}

const save = async variation => {
    return await putItem(variation, `LupiVariation-${process.env.ENVIRONMENT}`)
}
const get = async id => {
    console.log("VARIATION GETTING BY ID", id);
    let variation=await getItem(id, `LupiVariation-${process.env.ENVIRONMENT}`)
    return variation;
}
const remove = async id => {
    return await removeItem(id, `LupiVariation-${process.env.ENVIRONMENT}`)
}
const getVariationsForProduct = async id => {
    const params = {
        TableName: `LupiVariation-${process.env.ENVIRONMENT}`,
        KeyConditionExpression: 'productId = :id',
        IndexName: 'product_index',
        ExpressionAttributeValues: {
            ':id': id
        }
    }
    let variation = await getByParams(params);
    return variation;
}
module.exports = {
    save,
    get,
    remove,
    getVariationsForProduct,
    template
}