const Product = require('lupi-dal/Product');
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
        //token = tokenUtility.validateToken(event);
        console.log("PRODUCT token TODO all security", token, event);
        if (method === 'post') {
            if (event.body && event.body) {
                console.log(event.body);
                let product = await Product.save(event.body);
                returnObject.body = JSON.stringify({product});
            }
        } else if (method === 'get') {
            let id = event?.queryStringParameters?.id;
            console.log("PRODUCTS", event.queryStringParameters);
            if (id && id != '') {
                let product = await Product.get(id);
                returnObject.body = JSON.stringify({product});
            } else if(event?.queryStringParameters?.collectionId){
                let collectionId = event?.queryStringParameters?.collectionId;
                console.log("PRODUCT collectionId", collectionId);
                let products = await Product.getProductsForCollection(collectionId);
                console.log("PRODUCTS products", products);
                returnObject.body = JSON.stringify({products});
            } else if (event?.queryStringParameters?.siblingId){
                let siblingId = event?.queryStringParameters?.siblingId;
                console.log('PRODUCTS siblingId', siblingId);
                let product = await Product.get(id);
                let siblingCollectionId = product.collectionId;
                console.log('PRODUCTS siblingCollectionId', siblingCollectionId);
                let products = await Products.getProductsForCollection(siblingCollectionId);
                console.log("PRODUCTS products", products);
                returnObject.body=JSON.stringify({products});
            }
        } else if (method === 'delete') {
            let id = event?.queryStringParameters?.id;
            let removed = await Product.remove(id);
            returnObject.body = JSON.stringify({ removed });
        }
    } catch (err) {
        console.log("error ",err)
        returnObject.statusCode = err.statusCode ? err.statusCode : 401;
        returnObject.body = JSON.stringify(err);
    }
    return returnObject;
}