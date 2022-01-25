const {getDocumentDbClient, putItem, getItem, removeItem, getByParams} = require('./index.js')

const template={
    id:'',
    productId:'',
    sizeId:''
}

const save = async productSize => {
    return await putItem(productSize, `LupiProductSize-${process.env.ENVIRONMENT}`)
}
const get = async id => {
    console.log("PRODUCTSIZE GETTING BY ID", id);
    let productSize=await getItem(id, `LupiProductSize-${process.env.ENVIRONMENT}`)
    return productSize;
}
const remove = async id => {
    return await removeItem(id, `LupiProductSize-${process.env.ENVIRONMENT}`)
}
const getProductSizeForProduct = async id => {
    const params = {
        TableName: `LupiProductSize-${process.env.ENVIRONMENT}`,
        KeyConditionExpression: 'productId = :id',
        IndexName: 'product_index',
        ExpressionAttributeValues: {
            ':id': id
        }
    }
    let productSize = await getByParams(params);
    return productSize;
}
const getProductSizeForSize = async id => {
    const params = {
        TableName: `LupiProductSize-${process.env.ENVIRONMENT}`,
        KeyConditionExpression: 'sizeId = :id',
        IndexName: 'size_index',
        ExpressionAttributeValues: {
            ':id': id
        }
    }
    let productSize = await getByParams(params);
    return productSize;
}
module.exports = {
    save,
    get,
    remove,
    getProductSizeForProduct,
    getProductSizeForSize,
    template
}