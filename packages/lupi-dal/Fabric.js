const {getDocumentDbClient, putItem, getItem, removeItem, getByParams} = require('./index.js')

const template={
    id:'',
    name:'',
    pricedMethod:'',
    price:'',
    currency:'',
    surchargedPrice:'',
    supplierId:'',
    compositionId:'',
    brandId:''
}

const save = async fabric => {
    return await putItem(fabric, `LupiFabric-${process.env.ENVIRONMENT}`)
}
const get = async id => {
    console.log("FABRIC GETTING BY ID", id);
    let fabric=await getItem(id, `LupiFabric-${process.env.ENVIRONMENT}`)
    return fabric;
}
const remove = async id => {
    return await removeItem(id, `LupiFabric-${process.env.ENVIRONMENT}`)
}
const getFabricForSupplier = async id => {
    const params = {
        TableName: `LupiFabric-${process.env.ENVIRONMENT}`,
        KeyConditionExpression: 'supplierId = :id',
        IndexName: 'supplier_index',
        ExpressionAttributeValues: {
            ':id': id
        }
    }
    let fabric = await getByParams(params);
    return fabric;
}
const getFabricForComposition = async id => {
    const params = {
        TableName: `LupiFabric-${process.env.ENVIRONMENT}`,
        KeyConditionExpression: 'compositionId = :id',
        IndexName: 'composition_index',
        ExpressionAttributeValues: {
            ':id': id
        }
    }
    let fabric = await getByParams(params);
    return fabric;
}
const getFabricForBrand=async id=>{
    const params = {
        TableName: `LupiFabric-${process.env.ENVIRONMENT}`,
        KeyConditionExpression: 'brandId = :id',
        IndexName: 'brand_index',
        ExpressionAttributeValues: {
            ':id': id
        }
    }
    let fabric = await getByParams(params);
    return fabric;
}
module.exports = {
    save,
    get,
    remove,
    getFabricForSupplier,
    getFabricForComposition,
    getFabricForBrand,
    template
}