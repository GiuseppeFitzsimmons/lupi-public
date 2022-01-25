const {getDocumentDbClient, putItem, getItem, removeItem} = require('./index.js')

const template={
    email:''
}
const save = async signup => {
    return await putItem(signup, `LupiSignup-${process.env.ENVIRONMENT}`)
}
const get = async email => {
    return await getItem(email, `LupiSignup-${process.env.ENVIRONMENT}`)
}
const remove = async email => {
    return await removeItem(email, `LupiSignup-${process.env.ENVIRONMENT}`)
}
module.exports = {
    save,
    get,
    remove,
    template
}