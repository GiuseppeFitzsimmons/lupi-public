const {getDocumentDbClient, putItem, getItem, removeItem, getByParams} = require('./index.js')

const template={
    id:'',
    name:'',
    email:'',
    phoneNumber: '',
    supplierId:''
}

const save = async contact => {
    return await putItem(contact, `LupiContact-${process.env.ENVIRONMENT}`)
}
const get = async id => {
    console.log("VARIATION GETTING BY ID", id);
    let contact=await getItem(id, `LupiContact-${process.env.ENVIRONMENT}`)
    return contact;
}
const remove = async id => {
    return await removeItem(id, `LupiContact-${process.env.ENVIRONMENT}`)
}
const getContactForSupplier = async id => {
    const params = {
        TableName: `LupiContact-${process.env.ENVIRONMENT}`,
        KeyConditionExpression: 'supplierId = :id',
        IndexName: 'supplier_index',
        ExpressionAttributeValues: {
            ':id': id
        }
    }
    let contact = await getByParams(params);
    return contact;
}
module.exports = {
    save,
    get,
    remove,
    getContactForSupplier,
    template
}