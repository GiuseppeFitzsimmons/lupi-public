const {getDocumentDbClient, putItem, getItem, removeItem, getByParams} = require('./index.js')

const template={
    id:'',
    collectionId:'',
    productName:'',
    markup: 1.1,
    depiction: '',
    metrage: '',
    digitalPattern: '',
    price: '',
    perUnitProductionCostId: ''
}

const save = async product => {
    return await putItem(product, `LupiProduct-${process.env.ENVIRONMENT}`)
}
const get = async id => {
    console.log("PRODUCT GETTING BY ID", id);
    let product=await getItem(id, `LupiProduct-${process.env.ENVIRONMENT}`)
    return product;
}
const remove = async id => {
    return await removeItem(id, `LupiProduct-${process.env.ENVIRONMENT}`)
}
const getProductsForCollection = async id => {
    const params = {
        TableName: `LupiProduct-${process.env.ENVIRONMENT}`,
        KeyConditionExpression: 'collectionId = :id',
        IndexName: 'collection_index',
        ExpressionAttributeValues: {
            ':id': id
        }
    }
    let products = await getByParams(params);
    return products;
}
module.exports = {
    save,
    get,
    remove,
    getProductsForCollection,
    template
}