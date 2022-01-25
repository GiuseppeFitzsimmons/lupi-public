const {getDocumentDbClient, putItem, getItem, removeItem, getByParams} = require('./index.js')

const template={
    id:'',
    brandId:'',
    collectionName:'',
    deliveryDate: 1,
    markup: 1.1
}

const save = async collection => {
    console.log('putting collection', collection)
    if (collection.deliveryDate && collection.deliveryDate.getTime) {
        collection.deliveryDate=collection.deliveryDate.getTime();
    }
    return await putItem(collection, `LupiCollection-${process.env.ENVIRONMENT}`)
}
const get = async id => {
    console.log("COLLECTION GETTING BY ID", id);
    let collection=await getItem(id, `LupiCollection-${process.env.ENVIRONMENT}`)
    if (collection){
        if (collection.deliveryDate) {
            collection.deliveryDate=new Date(collection.deliveryDate);
        }
    }
    return collection;
}
const remove = async id => {
    return await removeItem(id, `LupiCollection-${process.env.ENVIRONMENT}`)
}
const getCollectionsForBrand = async id => {
    const params = {
        TableName: `LupiCollection-${process.env.ENVIRONMENT}`,
        KeyConditionExpression: 'brandId = :id',
        IndexName: 'brand_index',
        ExpressionAttributeValues: {
            ':id': id
        }
    }
    let collections = await getByParams(params);
    if (collections) {
        collections.forEach(collection=>{
            if (collection.deliveryDate) {
                collection.deliveryDate=new Date(collection.deliveryDate);
            }
        })
    }
    return collections;
}
module.exports = {
    save,
    get,
    remove,
    getCollectionsForBrand,
    template
}