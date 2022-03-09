const Brand = require('lupi-dal/Brand');
const Collection = require('lupi-dal/Collection');
const Product = require('lupi-dal/Product');
const Role = require('lupi-dal/Role');
const tokenUtility = require('token-utility');

const returnObject = { statusCode: 200 };
returnObject.headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "OPTIONS,HEAD,GET,PUT,POST"
}

exports.handler = async (event, context) => {
    console.log(event)
    var reply = {}
    var body = {}
    returnObject.statusCode = 200;
    if (typeof event.body === 'string' && event.body != '') {
        event.body = JSON.parse(event.body)
    }
    const method = event.httpMethod.toLowerCase();
    let token;
    try {
        token = tokenUtility.validateToken(event);
        console.log("BRAND token TODO all security", token);
        console.log('tokenutility', tokenUtility.allowedScope(token, event.body.id, 'brand:write'))
        if (method === 'get') {
            let id = event?.queryStringParameters?.id;
            if (id && id != '') {
                //We only want one brand
                if (tokenUtility.allowedScope(token, id, 'brand:read')) {
                    let brand = await Brand.get(id);
                    let collections = await Collection.getCollectionsForBrand(brand.id);
                    for (let i in collections) {
                        let collection = collections[i];
                        collection.products = [];
                        let newProducts = await Product.getProductsForCollection(collection.id);
                        if (newProducts && newProducts.length > 0) {
                            collection.products.push(newProducts);
                        }
                    }
                    returnObject.body = JSON.stringify({ brand, collections });
                    console.log('returnObject logger', returnObject)
                } else {
                    throw tokenUtility.fourOhOne();
                }
            }
        }
    } catch (err) {
        console.log("error ", err)
        returnObject.statusCode = err.statusCode ? err.statusCode : 401;
        returnObject.body = JSON.stringify(err);
    }
    console.log('brand lambda returnObject', returnObject)
    return returnObject;
}