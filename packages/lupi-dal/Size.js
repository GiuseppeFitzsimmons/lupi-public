const {getDocumentDbClient, putItem, getItem, removeItem, getByParams} = require('./index.js')

const template={
    id:'',
    productSizeId:'',
    collectionId:'',
    name:''
}

const save = async productSize => {
    return await putItem(productSize, `LupiSize-${process.env.ENVIRONMENT}`)
}
const get = async id => {
    console.log("SIZE GETTING BY ID", id);
    let size=await getItem(id, `LupiSize-${process.env.ENVIRONMENT}`)
    return size;
}
const remove = async id => {
    return await removeItem(id, `LupiSize-${process.env.ENVIRONMENT}`)
}
const getSizeForProductSize = async id => {
    const params = {
        TableName: `LupiSize-${process.env.ENVIRONMENT}`,
        KeyConditionExpression: 'productSizeId = :id',
        IndexName: 'productsize_index',
        ExpressionAttributeValues: {
            ':id': id
        }
    }
    let size = await getByParams(params);
    return size;
}
module.exports = {
    save,
    get,
    remove,
    getSizeForProductSize,
    template
}