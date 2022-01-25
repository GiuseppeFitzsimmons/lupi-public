const AWS = require('aws-sdk');
const { v4 } = require( 'uuid');

let documentDbClient;
const getDocumentDbClient=()=>{
    if (documentDbClient) {
        return documentDbClient;
    }
    let _config;
    if (process.env.REGION) {
        _config={region: process.env.REGION};
        if (process.env.DYNAMODB_ENDPOINT && process.env.DYNAMODB_ENDPOINT != '' 
            && process.env.DYNAMODB_ENDPOINT != '::') {
            _config.endpoint=process.env.DYNAMODB_ENDPOINT
        }
        if (process.env.ACCESS_KEY_ID && process.env.ACCESS_KEY_ID != '' 
            && process.env.ACCESS_KEY_ID != '::') {
            _config.accessKeyId = process.env.ACCESS_KEY_ID;
            _config.secretAccessKey = process.env.SECRET_ACCESS_KEY
        }
        console.log("configuring AWS", _config, process.env.ACCESS_KEY_ID)
        AWS.config.update(_config);
    }
    if (process.env.RUNNING_LOCAL_REGION) {
        const _config = {
            region: process.env.RUNNING_LOCAL_REGION
        }
        if (process.env.ACCESS_KEY_ID && process.env.ACCESS_KEY_ID != '' && process.env.ACCESS_KEY_ID != '::') {
            _config.accessKeyId = process.env.ACCESS_KEY_ID,
                _config.secretAccessKey = process.env.SECRET_ACCESS_KEY
        }
        console.log(_config);
        AWS.config.update(_config);
    }
    documentDbClient = new AWS.DynamoDB.DocumentClient();
    return documentDbClient;
}
const putItem = async (item, tableName) => {
    console.log('saving item', item, tableName)
    if (!item.id) {
        item.id=v4();
        item.creationDate=new Date().getTime();
    } else {
        console.log('item.id', item.id, tableName)
        let existingItem=await getItem(item.id, tableName);
        console.log('existingItem', existingItem)
        if (existingItem) {
            item=Object.assign(existingItem, item);
        }
    }
    item.lastModifiedDate=new Date().getTime();
    var params = {
        TableName: tableName,
        Item: cleanItem(item)
    };
    console.log("putting item ", item, "into table", tableName)
    var documentClient = getDocumentDbClient();
    let updatedItem = await new Promise((resolve, reject) => {
        documentClient.put(params, function (err, data) {
            if (err) {
                console.log("putItem error ", JSON.stringify(params), err);
                reject(err);
            } else {
                console.log(data);
                resolve(data);
            }
        });
    });
    console.log("updatedItem ", item)
    return item;
}

const getItem = async (id, tableName) => {
    console.log("GET ITEM", id, tableName)
    var params = {
        TableName: tableName,
        Key: {id}
    };
    var documentClient = getDocumentDbClient();
    let item = await new Promise((resolve, reject) => {
        documentClient.get(params, function (err, data) {
            console.log('documentClient.get')
            if (err) {
                console.log("Error", id, tableName, err);
                reject(err);
            } else {
                console.log("Success", data.Item);
                resolve(data.Item);
            }
        });
    });
    console.log('item', item)
    return item;
}
const removeItem = async (id, tableName) => {
    var params = {
        TableName: tableName,
        Key: {
            'id': id
        }
    };
    var documentClient = getDocumentDbClient();
    let removed = await new Promise((resolve, reject) => {
        documentClient.delete(params, function (err, data) {
            console.log('deleteparams', params)
            if (err) {
                console.log("Error", err);
                reject(false);
            } else {
                console.log("success deleting", id);
                resolve(true);
            }
        });
    });
    return removed;
}
const removeByParams = async params => {
    let result = await new Promise((resolve, reject) => {
        getDocumentDbClient().delete(params, function (err, data) {
            if (err) {
                console.log("Failed to delete", params);
                resolve(false);
            } else {
                console.log("Deleted", params);
                resolve(true)
            }
        });
    })
    return result;
}
const getByParams = async params => {
    let items = await new Promise((resolve, reject) => {
        getDocumentDbClient().query(params, function (err, data) {
            console.log('getByParams params', params)
            if (err) {
                console.log(err);
                resolve();
            } else {
                resolve(data.Items)
            }
        });
    })
    return items
}
function cleanItem(item) {
    for (var i in item) {
        if (typeof item[i] === 'object') {
            item[i] = cleanItem(item[i]);
        } else if (item[i] === '') {
            delete item[i]
        }
    }
    return item;
}

module.exports = {
    getDocumentDbClient,
    putItem,
    getItem,
    removeItem,
    removeByParams,
    getByParams
}