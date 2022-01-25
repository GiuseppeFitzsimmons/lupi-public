const {putItem, getItem, removeItem} = require('./index.js')

const ACTIVE='ACTIVE',SUSPENDED='SUSPENDED'

const template={
    id:'',
    firstName:'',
    lastName:'',
    password:'',
    state:ACTIVE,
    validationToken:''
}
const save = async brand => {
    console.log('saving... ', process.env.ENVIRONMENT)
    return await putItem(brand, `LupiUser-${process.env.ENVIRONMENT}`)
}
const get = async id => {
    console.log("about to call get item with ",id, `User-${process.env.ENVIRONMENT}`)
    return await getItem(id, `LupiUser-${process.env.ENVIRONMENT}`)
}
const getClean = async id => {
    let _user=await get(id);
    if (_user.password) delete _user.password;
    return _user;
}
const remove = async id => {
    return await removeItem(id, `LupiUser-${process.env.ENVIRONMENT}`)
}
module.exports = {
    save,
    get,
    remove,
    template,
    getClean
}