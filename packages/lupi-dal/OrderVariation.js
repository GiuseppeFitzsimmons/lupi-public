const {getDocumentDbClient, putItem, getItem, removeItem, getByParams} = require('./index.js')

const template={
    id:'',
    orderId:'',
    variationId:'',
    quantity:'',
    size:''
}

const save = async orderVariation => {
    return await putItem(orderVariation, `LupiOrderVariation-${process.env.ENVIRONMENT}`)
}
const get = async id => {
    console.log("ORDERVARIATION GETTING BY ID", id);
    let orderVariation=await getItem(id, `LupiOrderVariation-${process.env.ENVIRONMENT}`)
    return orderVariation;
}
const remove = async id => {
    return await removeItem(id, `LupiOrderVariation-${process.env.ENVIRONMENT}`)
}
const getOrderVariationForOrder = async id => {
    const params = {
        TableName: `LupiOrderVariation-${process.env.ENVIRONMENT}`,
        KeyConditionExpression: 'orderId = :id',
        IndexName: 'order_index',
        ExpressionAttributeValues: {
            ':id': id
        }
    }
    let orderVariation = await getByParams(params);
    return orderVariation;
}
const getOrderVariationForVariation = async id => {
    const params = {
        TableName: `LupiOrderVariation-${process.env.ENVIRONMENT}`,
        KeyConditionExpression: 'variationId = :id',
        IndexName: 'variation_index',
        ExpressionAttributeValues: {
            ':id': id
        }
    }
    let orderVariation = await getByParams(params);
    return orderVariation;
}
module.exports = {
    save,
    get,
    remove,
    getOrderVariationForOrder,
    getOrderVariationForVariation,
    template
}