const {getDocumentDbClient, putItem, getItem, removeItem, getByParams} = require('./index.js')

const template={
    id:'',
    name:'',
    contactId:'',
    markup: '',
    shippingAddress:'',
    businessAddress:'',
    siret:'',
    paymentConditions:''
}

const save = async customer => {
    return await putItem(customer, `LupiCustomer-${process.env.ENVIRONMENT}`)
}
const get = async id => {
    console.log("CUSTOMER GETTING BY ID", id);
    let customer=await getItem(id, `LupiCustomer-${process.env.ENVIRONMENT}`)
    return customer;
}
const remove = async id => {
    return await removeItem(id, `LupiCustomer-${process.env.ENVIRONMENT}`)
}
const getCustomerForContact = async id => {
    const params = {
        TableName: `LupiCustomer-${process.env.ENVIRONMENT}`,
        KeyConditionExpression: 'contactId = :id',
        IndexName: 'contact_index',
        ExpressionAttributeValues: {
            ':id': id
        }
    }
    let customer = await getByParams(params);
    return customer;
}
module.exports = {
    save,
    get,
    remove,
    getCustomerForContact,
    template
}