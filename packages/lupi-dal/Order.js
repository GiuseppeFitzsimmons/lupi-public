const {getDocumentDbClient, putItem, getItem, removeItem, getByParams} = require('./index.js')

const template={
    id:'',
    customerId:'',
    date:''
}

const save = async order => {
    return await putItem(order, `LupiOrder-${process.env.ENVIRONMENT}`)
}
const get = async id => {
    console.log("ORDER GETTING BY ID", id);
    let order=await getItem(id, `LupiOrder-${process.env.ENVIRONMENT}`)
    return order;
}
const remove = async id => {
    return await removeItem(id, `LupiOrder-${process.env.ENVIRONMENT}`)
}
const getOrderForCustomer = async id => {
    const params = {
        TableName: `LupiOrder-${process.env.ENVIRONMENT}`,
        KeyConditionExpression: 'customerId = :id',
        IndexName: 'customer_index',
        ExpressionAttributeValues: {
            ':id': id
        }
    }
    let order = await getByParams(params);
    return order;
}
module.exports = {
    save,
    get,
    remove,
    getOrderForCustomer,
    template
}