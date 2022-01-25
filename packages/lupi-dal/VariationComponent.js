const {getDocumentDbClient, putItem, getItem, removeItem, getByParams} = require('./index.js')

const template={
    id:'',
    variationId:'',
    fabricOrFournitureId:'',
    quantity: '',
    fabricantId: ''
}

const save = async variationComponent => {
    return await putItem(variationComponent, `LupiVariationComponent-${process.env.ENVIRONMENT}`)
}
const get = async id => {
    console.log("VARIATIONCOMPONENT GETTING BY ID", id);
    let variationComponent=await getItem(id, `LupiVariationComponent-${process.env.ENVIRONMENT}`)
    return variationComponent;
}
const remove = async id => {
    return await removeItem(id, `LupiVariationComponent-${process.env.ENVIRONMENT}`)
}
const getVariationComponentsForVariation = async id => {
    const params = {
        TableName: `LupiVariationComponent-${process.env.ENVIRONMENT}`,
        KeyConditionExpression: 'variationId = :id',
        IndexName: 'variation_index',
        ExpressionAttributeValues: {
            ':id': id
        }
    }
    let variationComponent = await getByParams(params);
    return variationComponent;
}
module.exports = {
    save,
    get,
    remove,
    getVariationComponentsForVariation,
    template
}