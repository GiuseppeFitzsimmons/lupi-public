const Collection = require('lupi-dal/Collection');
const tokenUtility = require('token-utility');

const returnObject = { statusCode: 200 };
returnObject.headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "OPTIONS,HEAD,GET,PUT,POST"
}

exports.handler = async (event, context) => {
    var reply = {}
    var body = {}
    returnObject.statusCode=200;
    if (typeof event.body === 'string' && event.body != '') {
        event.body = JSON.parse(event.body)
    }
    const method = event.httpMethod.toLowerCase();
    let token;
    try {
        token = tokenUtility.validateToken(event);
        console.log("COLLECTION token TODO all security", token);
        if (method === 'post') {
            if (event.body && event.body) {
                console.log(event.body);
                let updatedCollection = event.body
                updatedCollection.collectionName = updatedCollection.collectionName.toLowerCase().replace(' ', '')
                console.log('updatedCollection', updatedCollection)
                if (!updatedCollection.oldId){
                    if (updatedCollection.id && updatedCollection.id.includes('-')){
                        updatedCollection.oldId = updatedCollection.id
                        updatedCollection.id = updatedCollection.collectionName //updatedCollection.brandId + '/' + updatedCollection.collectionName
                    }
                    let collectionChecker = await Collection.get(updatedCollection.id)
                    if (collectionChecker){
                        suffix = Date.now()
                        updatedCollection.id = updatedCollection.id + '-' + suffix
                    }
                }
                await Collection.save(updatedCollection);
                returnObject.body = JSON.stringify({collection:updatedCollection});
            }
        } else if (method === 'get') {
            let id = event?.queryStringParameters?.id;
            console.log("COLLECTIONS", event.queryStringParameters);
            if (id && id != '') {
                //We only want one brand
                let collection = await Collection.get(id);
                returnObject.body = JSON.stringify({collection});
            } else if (event?.queryStringParameters?.brandId) {
                let brandId = event?.queryStringParameters?.brandId;
                console.log("COLLECTIONS brandId", brandId);
                let collections = await Collection.getCollectionsForBrand(brandId);
                console.log("COLLECTIONS collections", collections);
                returnObject.body = JSON.stringify({collections});
            } else if (event?.queryStringParameters?.siblingId){
                let siblingId = event?.queryStringParameters?.siblingId;
                console.log('COLLECTIONS siblingId', siblingId);
                let collection = await Collection.get(id);
                let siblingBrandId = collection.brandId;
                console.log('COLLECTIONS siblingBrandId', siblingBrandId);
                let collections = await Collection.getCollectionsForBrand(siblingBrandId);
                console.log("COLLECTIONS collections", collections);
                returnObject.body=JSON.stringify({collections});
            }
        } else if (method === 'delete') {
            let id = event?.queryStringParameters?.id;
            let removed = await Collection.remove(id);
            returnObject.body = JSON.stringify({ removed });
        }
    } catch (err) {
        console.log("error ",err)
        returnObject.statusCode = err.statusCode ? err.statusCode : 401;
        returnObject.body = JSON.stringify(err);
    }
    console.log('collection returnObject', returnObject)
    return returnObject;
}