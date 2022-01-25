const {getDocumentDbClient, putItem, getItem, removeItem} = require('./index.js')

const template={
    id:'',
    brandName:'',
    siret:'',
    addressLine1:'',
    addressLine2:'',
    postalCode:'',
    clientPaymentConditions:'',
    operatingCurrency:'',
    roundingRules:''
}
const save = async brand => {
    return await putItem(brand, `LupiBrand-${process.env.ENVIRONMENT}`)
}
const get = async id => {
    return await getItem(id, `LupiBrand-${process.env.ENVIRONMENT}`)
}
const remove = async id => {
    return await removeItem(id, `LupiBrand-${process.env.ENVIRONMENT}`)
}
module.exports = {
    save,
    get,
    remove,
    template
}