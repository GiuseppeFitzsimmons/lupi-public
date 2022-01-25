const {getDocumentDbClient, putItem, getItem, removeItem, getByParams} = require('./index.js')

const template={
    id:'',
    name:'',
    contactId:'',
    surcharge:'',
    fabricOrFournitureId:''

}
const save = async supplier => {
    return await putItem(supplier, `LupiSupplier-${process.env.ENVIRONMENT}`)
}
const get = async id => {
    console.log("SUPPLIER GETTING BY ID", id);
    let supplier=await getItem(id, `LupiSupplier-${process.env.ENVIRONMENT}`)
    return supplier;
}
const remove = async id => {
    return await removeItem(id, `LupiSupplier-${process.env.ENVIRONMENT}`)
}
const getSupplierForFabricOrFourniture = async id => {
    const params = {
        TableName: `LupiSupplier-${process.env.ENVIRONMENT}`,
        KeyConditionExpression: 'fabricOrFournitureId = :id',
        IndexName: 'fabricorfourniture_index',
        ExpressionAttributeValues: {
            ':id': id
        }
    }
    let supplier = await getByParams(params);
    return supplier;
}
module.exports = {
    save,
    get,
    remove,
    getSupplierForFabricOrFourniture,
    template
}