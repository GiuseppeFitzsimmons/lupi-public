
//import { store } from '../app/store';

const restfulResources = {
    token: '/token',
    user: '/user',
    brand: '/brand',
    signedurl: '/signedurl',
    collection: '/collection',
    product:'/product',
    fabric: '/fabric',
    branduser: '/branduser',
    role: '/role',
    fourniture: '/fourniture'
}
const env = require('./environment.js');

let store;
const getStore = async () => {
    if (store) return store;
    store = import('../app/store')
        .then(obj => obj)
        .catch(err => { console.log('error loading store in serverCalls') })
    return store
}

const testAsync = async (questObject) => {
    console.log("testAsyn center");
    var environment = env.getEnvironment(window.location.origin);
    console.log("environment should be", environment.url)
    //const state=store.getState();
    //console.log("getting store state",state);
    let tokens = await new Promise((resolve, reject) => {
        setTimeout(() => resolve({ accessToken: "a token", refreshToken: "another token" }), 3000)
    })
    console.log("testAsyn exist")
    return tokens
}
const getTokensFromStorage = () => {
    var tokens = localStorage.getItem('tokens');
    if (tokens) {
        try {
            return JSON.parse(tokens);
        } catch (e) { }
    }
}
const getAccessToken = () => {
    let tokens = getTokensFromStorage();
    if (tokens) {
        return tokens.accessToken;
    }
}
const putTokensInStorage = async tokens => {
    localStorage.setItem('tokens', typeof (tokens) === 'object' ? JSON.stringify(tokens) : tokens);
    //TO BE TESTED
    var store = await getStore();
    store.getState().login.tokens = tokens;
}

const postToServer = async questObject => {
    var token = getAccessToken();
    var environment = env.getEnvironment(window.location.origin);
    var restfulResource = questObject.resource;
    var params = questObject.params;
    var isFormData = false
    if (typeof (params) === 'object') {
        for (let _name in params) {
            let param = params[_name];
            if (param && param.source) {
                //We need to upload the file and replace the value with the URL
                let signedUrlQuestObject = {
                    resource: 'signedurl',
                    params: {
                        fileName: param.name,
                    }
                }
                //slices can optionally put a brandId into the request, and this
                //will cause the image to be stored in a folder named for the brand id
                //otherwise the image is stored in a folder named for the user ID.
                if (questObject.brandId) {
                    signedUrlQuestObject.params.brandId = questObject.brandId
                }
                let signedUrl = await getFromServer(signedUrlQuestObject);
                //try to upload
                let uploadParameters = {
                    method: 'PUT',
                    headers: {
                        'Content-Type': signedUrl.contentType
                    },
                    body: param.file
                };
                await new Promise((resolve, reject) => {
                    fetch(signedUrl.url, uploadParameters)
                        .then(function (response) {
                            console.log("UPLOADBUG sucess", response.responseCode);
                            resolve(response.responseCode);
                        })
                        .catch(function (err) {
                            //TODO something with this error.
                            console.log("UPLOADBUG failure", err);
                            reject(err);
                        })
                })
                //Now we replace the parameter in the object with URL to the now hosted image
                params[_name] = signedUrl.key;
            }
        }
        params = JSON.stringify(params)
    }
    if (questObject.resource === 'setpw') {
        token = questObject.params.token
    }
    var responseCode = 0;
    var method = 'POST'
    if (questObject.update) {
        method = 'PUT'
    } else if (questObject.delete) {
        method = 'DELETE'
    }
    var _headers = {}
    _headers.Authorization = token
    _headers.Accept = 'application/json, text/plain, */*'
    if (!isFormData) {
        _headers['Content-Type'] = 'application/json'
    }
    const requestParameters = {
        method: method,
        credentials: "same-origin",
        headers: _headers,
        body: params
    };
    console.log("postToServer", environment.url + restfulResources[restfulResource]);
    let reply = await fetch(environment.url + restfulResources[restfulResource], requestParameters)
        .then(function (response) {
            console.log('response.status', response.status)
            responseCode = response.status;
            return response.json();

        })
        .then(function (json) {
            return json
        })
        .catch(function (err) {
            console.log('postToServer err', err)
            responseCode = 0
            return {}
        })
    if (responseCode === 401 && reply.code === 'exp' && !questObject.retry) {
        //the token expired, refresh it and try again
        await refreshToken();
        questObject.retry = true;
        return await postToServer(questObject);
    }
    reply.responseCode = responseCode;
    console.log('server reply', reply)
    return reply
}

const getFromServer = async (questObject) => {
    console.log('questObject', questObject)
    var token = getAccessToken();
    var environment = env.getEnvironment(window.location.origin);
    var restfulResource = questObject.resource;
    var params = questObject.params;
    var responseCode = 0;
    var _url = environment.url + restfulResources[restfulResource];
    if (params) {
        let keys = Object.keys(params)
        _url += '?'
        for (var i in keys) {
            let key = keys[i]
            let value = params[key]
            if (Array.isArray(value)) {
                for (var j in value) {
                    _url += '&' + key + '=' + value[j]
                }
            } else {
                _url += '&' + key + '=' + value
            }
        }
    }
    const requestOptons = {
        method: questObject.method ? questObject.method : "GET",
        credentials: "same-origin", // send cookies
        headers: {
            'Authorization': token,
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        }
    }
    console.log("getFromServer", _url, requestOptons)
    let reply = await fetch(_url, requestOptons)
        .then(function (response) {
            responseCode = response.status;
            console.log('getFromServer response', response)
            return response.json();

        })
        .then(function (json) {
            console.log("getFromServer then", json);
            return json
        })
    if (responseCode === 401 && reply.code === 'exp' && !questObject.retry) {
        console.log("getFromServer failed with expired token, retrying");
        await refreshToken();
        questObject.retry = true;
        return await getFromServer(questObject);
    } else {
        reply.responseCode = responseCode;
        return reply
    }
}

async function refreshToken() {
    let _refreshToken;
    var tokens = getTokensFromStorage();
    if (tokens) {
        _refreshToken = tokens.refreshToken;
    }
    const params = {
        "grant_type": "refresh",
        "token": _refreshToken
    }
    var questObject = { resource: 'login', params: params };
    let refresh = await postToServer(questObject);
    if (refresh.responseCode !== 200 && refresh.responseCode !== 201) {
        console.log("failed to refresh token TODO clear the storage, return to login");
    } else {
        console.log("token is refreshed, storing new tokens in local storage")
        await putTokensInStorage(refresh);
    }
    return refresh;

}
export {
    postToServer,
    getFromServer,
    restfulResources,
    testAsync
}