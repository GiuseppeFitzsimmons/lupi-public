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

const save = async fourniture => {
    return await putItem(fourniture, `LupiFourniture-${process.env.ENVIRONMENT}`)
}
const get = async id => {
    console.log("FOURNITURE GETTING BY ID", id);
    let fourniture=await getItem(id, `LupiFourniture-${process.env.ENVIRONMENT}`)
    return fourniture;
}
const remove = async id => {
    return await removeItem(id, `LupiFourniture-${process.env.ENVIRONMENT}`)
}
const getFournitureForSupplier = async id => {
    const params = {
        TableName: `LupiFourniture-${process.env.ENVIRONMENT}`,
        KeyConditionExpression: 'supplierId = :id',
        IndexName: 'supplier_index',
        ExpressionAttributeValues: {
            ':id': id
        }
    }
    let fourniture = await getByParams(params);
    return fourniture;
}
const getFournitureForBrand=async id=>{
    const params = {
        TableName: `LupiFourniture-${process.env.ENVIRONMENT}`,
        KeyConditionExpression: 'brandId = :id',
        IndexName: 'brand_index',
        ExpressionAttributeValues: {
            ':id': id
        }
    }
    let fourniture = await getByParams(params);
    return fourniture;
}
module.exports = {
    save,
    get,
    remove,
    getFournitureForSupplier,
    getFournitureForBrand,
    template
}