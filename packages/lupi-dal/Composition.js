const {getDocumentDbClient, putItem, getItem, removeItem, getByParams} = require('./index.js')

const template={
    id:'',
    productId:'',
    variationId:'',
    logos:'',
    funText:'',
    madeIn:''
}

const save = async composition => {
    return await putItem(composition, `LupiComposition-${process.env.ENVIRONMENT}`)
}
const get = async id => {
    console.log("COMPOSITION GETTING BY ID", id);
    let composition=await getItem(id, `LupiComposition-${process.env.ENVIRONMENT}`)
    return composition;
}
const remove = async id => {
    return await removeItem(id, `LupiComposition-${process.env.ENVIRONMENT}`)
}
const getCompositionForProduct = async id => {
    const params = {
        TableName: `LupiComposition-${process.env.ENVIRONMENT}`,
        KeyConditionExpression: 'productId = :id',
        IndexName: 'product_index',
        ExpressionAttributeValues: {
            ':id': id
        }
    }
    let composition = await getByParams(params);
    return composition;
}
const getCompositionForVariation = async id => {
    const params = {
        TableName: `LupiComposition-${process.env.ENVIRONMENT}`,
        KeyConditionExpression: 'variationId = :id',
        IndexName: 'variation_index',
        ExpressionAttributeValues: {
            ':id': id
        }
    }
    let composition = await getByParams(params);
    return composition;
}
module.exports = {
    save,
    get,
    remove,
    getCompositionForProduct,
    getCompositionForVariation,
    template
}