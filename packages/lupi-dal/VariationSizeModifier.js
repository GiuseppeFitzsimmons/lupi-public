const {getDocumentDbClient, putItem, getItem, removeItem, getByParams} = require('./index.js')

const template={
    id:'',
    variationComponentId:'',
    quantity: '',
    size: ''
}

const save = async variationSizeModifier => {
    return await putItem(variationSizeModifier, `LupiVariationSizeModifier-${process.env.ENVIRONMENT}`)
}
const get = async id => {
    console.log("VARIATIONSIZEMODIFIER GETTING BY ID", id);
    let variationSizeModifier=await getItem(id, `LupiVariationSizeModifier-${process.env.ENVIRONMENT}`)
    return variationSizeModifier;
}
const remove = async id => {
    return await removeItem(id, `LupiVariationSizeModifier-${process.env.ENVIRONMENT}`)
}
const getVariationSizeModifiersForVariationComponent = async id => {
    const params = {
        TableName: `LupiVariationSizeModifier-${process.env.ENVIRONMENT}`,
        KeyConditionExpression: 'variationComponentId = :id',
        IndexName: 'variationcomponent_index',
        ExpressionAttributeValues: {
            ':id': id
        }
    }
    let variationSizeModifier = await getByParams(params);
    return variationSizeModifier;
}
module.exports = {
    save,
    get,
    remove,
    getVariationSizeModifiersForVariationComponent,
    template
}