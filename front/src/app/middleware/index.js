import {
    ENDSYNCHRONISE,NEW_DECK, SAVE_DECK,
    LOAD_DECKS, LOAD_FLASHDECK, SESSION_EXPIRED,
    LOGIN, LOADING, LOAD_BRANDS, SET_CURRENT_BRAND
} from '../action';

const axios = require('axios');
const env = require('./environment.js');
const uuidv4 = require('uuid');

async function synchronise(dispatch) {
    /*
    console.log('Synchronisation')
    console.log("websocket bug synchronise");
    connectionHandler.keepAlive(dispatch);
    var questObject = {}
    questObject.params = {}
    var decks = []
    var gangs = []
    var scores = []
    var keys = Object.entries(localStorage)
    console.log("synchronise ", keys);
    for (var i = 0; i < localStorage.length; i++) {
        var key = keys[i];
        if (key[0].indexOf('flashDeck-') == 0) {
            let _deck = JSON.parse(localStorage.getItem(key[0]))
            if (!_deck.lastModified) {
                decks.push(JSON.parse(localStorage.getItem(key[0])))
            }
        } else if (key[0].indexOf('flashGang-') == 0) {
            let _gang = JSON.parse(localStorage.getItem(key[0]))
            if (!_gang.lastModified) {
                gangs.push(JSON.parse(localStorage.getItem(key[0])))
            }
        } else if (key[0].indexOf('score-') == 0) {
            scores.push(JSON.parse(localStorage.getItem(key[0])))
        }
    }
    questObject.params.flashDecks = decks
    questObject.params.flashGangs = gangs
    questObject.params.scores = scores
    questObject.params.deletions = {}
    questObject.params.deletions.flashDecks = []
    questObject.params.deletions.flashGangs = []
    console.log('questObject', questObject)
    for (var i = 0; i < localStorage.length; i++) {
        var key = keys[i];
        if (key[0].indexOf('delete-flashDeck-') == 0) {
            questObject.params.deletions.flashDecks.push(JSON.parse(localStorage.getItem(key[0])))
        }
    }
    for (var i = 0; i < localStorage.length; i++) {
        var key = keys[i];
        if (key[0].indexOf('delete-flashGang-') == 0) {
            questObject.params.deletions.flashGangs.push(JSON.parse(localStorage.getItem(key[0])))
        }
    }
    questObject.resource = 'synchronise'
    let postResult = await postToServer(questObject)
    if (!postResult.errors && postResult.responseCode < 400) {
        if (postResult.flashDecks) {
            for (var i in postResult.flashDecks) {
                let _deck = postResult.flashDecks[i]
                localStorage.setItem('flashDeck-' + _deck.id, JSON.stringify(_deck))
            }
        }
        if (postResult.flashGangs) {
            for (var i in postResult.flashGangs) {
                let _gang = postResult.flashGangs[i]
                localStorage.setItem('flashGang-' + _gang.id, JSON.stringify(_gang))
            }
        }
        let currentUser;
        if (postResult.users) {
            for (var i in postResult.users) {
                let _user = postResult.users[i]
                localStorage.setItem('user-' + _user.id, JSON.stringify(_user))
                if (_user.isCurrentUser) {
                    currentUser = _user
                    localStorage.setItem('currentUser', JSON.stringify(_user))
                }
            }
        }
        var keys = Object.entries(localStorage)
        for (var i = 0; i < localStorage.length; i++) {
            var key = keys[i];
            if (key[0].indexOf('delete-flashGang-') == 0 || key[0].indexOf('delete-flashDeck-') == 0) {
                localStorage.removeItem(key[0])
            }
        }
        if (dispatch) {
            dispatch({ type: ENDSYNCHRONISE, data: { flashDecks: postResult.flashDecks, flashGangs: postResult.flashGangs } })
        }
        if (decks.length || gangs.length) {
            connectionHandler.sendUpdateMessage(decks.map(deck => deck.id), gangs.map(gang => gang.id));
        }
    } else {
        console.log("ERROR SYNCHRONISING", postResult);
        if (postResult.responseCode >= 400) {
            if (dispatch) {
                dispatch({ type: SESSION_EXPIRED })
            }
        }
        /*for (e in postResult.errors) {
            let error=postResult.errors[e];
            if (error) {

            }
        }*/
    //}
    console.log('Synchronisation complete')
}

const restfulResources = { token: '/token', brand: '/brand' }

async function postToServer(questObject) {
    var environment = env.getEnvironment(window.location.origin);
    var restfulResource = questObject.resource;
    var params = questObject.params;
    var isFormData = false
    if (typeof (params) == 'object') {
        for (var _name in params) {
            var param = params[_name]
            if (param && param.type == 'file') {
                isFormData = true
                //break
            }
        }
        if (isFormData) {
            var data = new FormData()
            for (var _name in params) {
                var param = params[_name]
                console.log('paramandname', param, _name)
                if (param && param.type == 'file') {
                    data.append('file', param.files[0])
                } else {
                    data.append(_name, param)
                }
            }
            params = data
        } else {
            params = JSON.stringify(params)
        }
    }
    var token = localStorage.getItem('flashJwt')
    if (questObject.resource == 'setpw') {
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
    console.log('fetching at ', environment.url + restfulResources[restfulResource])
    let reply = await fetch(environment.url + restfulResources[restfulResource], {
        method: method,
        credentials: "same-origin",
        headers: _headers,
        body: params
    })
        .then(function (response) {
            responseCode = response.status;
            return response.json();

        })
        .then(function (json) {
            console.log("REPLY FROM POST", json);
            return json
        })
        .catch(function (err) {
            responseCode = 0
            console.log('postToServer error', err)
            return {}
        })
    if (responseCode == 401 && reply.code === 'exp' && !questObject.retry) {
        //the token expired, refresh it and try again
        await refreshToken();
        questObject.retry = true;
        return await postToServer(questObject);
    }
    reply.responseCode = responseCode;
    console.log('server reply', reply)
    return reply
}

async function saveScore(flashDeck) {
    let score = localStorage.getItem('score-' + flashDeck.id)
    if (score) {
        score = JSON.parse(score)
    }
    let correctAnswers = 0
    let incorrectAnswers = 0
    let percentage = 0
    for (var i in flashDeck.flashCards) {
        let card = flashDeck.flashCards[i]
        if (card.correct) {
            correctAnswers++
        } else {
            incorrectAnswers++
        }
    }
    if (correctAnswers > 0) {
        percentage = (correctAnswers / flashDeck.flashCards.length) * 100
    }
    if (!score) {
        score = { flashDeckId: flashDeck.id, score: percentage, time: flashDeck.time, highScore: percentage }
    } else {
        if (score.percentage < percentage) {
            score.highScore = percentage
        }
        score.score = percentage
        score.time = flashDeck.time
    }
    localStorage.setItem('score-' + flashDeck.id, JSON.stringify(score))
}

async function getFromServer(questObject, method) {
    var environment = env.getEnvironment(window.location.origin);
    var restfulResource = questObject.resource;
    var params = questObject.params;
    var responseCode = 0;
    var token = JSON.parse(localStorage.getItem('tokens')).accessToken
    var _url = environment.url + restfulResources[restfulResource];
    if (params && params.id) {
        _url += '/' + params.id
    } else if (params) {
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
    console.log(_url, '_url')
    let reply = await fetch(_url, {
        method: method ? "DELETE" : "GET",
        credentials: "same-origin", // send cookies
        headers: {
            'Authorization': token,
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
    })
        .then(function (response) {
            responseCode = response.status;
            console.log('middleware response', response)
            return response.json();

        })
        .then(function (json) {
            console.log("getFromServer then", json);
            return json
        })
    if (responseCode == 401 && reply.code === 'exp' && !questObject.retry) {
        await refreshToken();
        questObject.retry = true;
        return await getFromServer(questObject);
    } else {
        reply.responseCode = responseCode;
        return reply
    }
}

async function deleteFromServer(questObject) {
    return await getFromServer(questObject, 'deletion')
}

async function refreshToken() {
    var _refreshToken = localStorage.getItem('flashJwtRefresh');
    const params = {
        "grant_type": "refresh",
        "token": _refreshToken
    }
    var questObject = { resource: 'login', params: params };
    let refresh = await postToServer(questObject);
    if (refresh.responseCode != 200 && refresh.responseCode != 201) {
        console.log("failed to refresh token TODO clear the session, return to login");
    } else {
        console.log("token is refreshed, storing new tokens in session")
        localStorage.setItem('flashJwt', refresh.token)
        localStorage.setItem('flashJwtRefresh', refresh.refreshToken)
    }
    return refresh;

}

function scoreCard(deck) {
    console.log('deck', deck)
    if (!deck.hasOwnProperty('currentIndex')) {
        return
    }
    let card = deck.flashCards[deck.currentIndex]
    card.correct = true
    if (card.userAnswer && Array.isArray(card.userAnswer)) {
        const userAnswersSorted = card.userAnswer.sort()
        const correctAnswersSorted = card.correctAnswers.sort()
        if (JSON.stringify(userAnswersSorted) != JSON.stringify(correctAnswersSorted)) {
            card.correct = false
        }
    } else if (!card.userAnswer || card.userAnswer == '') {
        card.correct = false
    }
}
function selectNextCard(deck) {
    const answerType = deck.answerType
    const testType = deck.testType
    if (testType == 'EXAM') {
        if (!deck.hasOwnProperty('currentIndex')) {
            deck.currentIndex = -1;
            deck.startTime = new Date().getTime()
        }
        if (deck.currentIndex + 1 >= deck.flashCards.length) {
            deck.mode = 'COMPLETE'
        } else {
            deck.currentIndex++
        }
    } else if (testType == 'REVISION') {
        if (!deck.hasOwnProperty('currentIndex')) {
            deck.startTime = new Date().getTime()
        }
        let unansweredCards = []
        for (var i in deck.flashCards) {
            let card = deck.flashCards[i]
            if (!card.hasOwnProperty('correct')) {
                unansweredCards.push(i)
            }
        }
        if (unansweredCards.length == 0) {
            deck.mode = 'COMPLETE'
        } else {
            deck.currentIndex = unansweredCards[Math.floor(Math.random() * Math.floor(unansweredCards.length))]
        }
    } else if (testType == 'CRAM') {
        if (!deck.hasOwnProperty('currentIndex')) {
            deck.startTime = new Date().getTime()
        }
        let unansweredCards = []
        for (var i in deck.flashCards) {
            let card = deck.flashCards[i]
            if (!card.correct) {
                unansweredCards.push(i)
                delete card.correct;
            }
        }
        if (unansweredCards.length == 0) {
            deck.mode = 'COMPLETE'
        } else {
            deck.currentIndex = unansweredCards[Math.floor(Math.random() * Math.floor(unansweredCards.length))]
        }
    }
    if (answerType == 'MULTIPLE') {
        let card = deck.flashCards[deck.currentIndex]
        card.multipleChoices = []
        if (card.correctAnswers && card.incorrectAnswers) {
            card.multipleChoices = [...card.correctAnswers, ...card.incorrectAnswers]
        } else if (card.correctAnswers) {
            card.multipleChoices = [...card.correctAnswers]
        } if (card.multipleChoices.length >= 5) {

        } else {
            let answers = []
            for (var i in deck.flashCards) {
                if (i != deck.currentIndex) {
                    let goodAnswers = deck.flashCards[i]
                    answers = [...answers, ...goodAnswers.correctAnswers]
                    if (goodAnswers.incorrectAnswers) {
                        answers = [...answers, ...goodAnswers.incorrectAnswers]
                    }
                }
            }
            while (card.multipleChoices.length < 5) {
                let answerIndex = Math.floor(Math.random() * Math.floor(answers.length))
                let anAnswer = answers[answerIndex]
                answers.splice(answerIndex, 1)
                card.multipleChoices.push(anAnswer)
                if (answers.length == 0) {
                    break
                }
            }
            card.multipleChoices = card.multipleChoices.sort((a, b) => {
                return Math.floor(Math.random() * Math.floor(3)) - 1
            })
        }
    }
    if (deck.mode == 'COMPLETE') {
        deck.time = new Date().getTime() - deck.startTime
        console.log({ deck })
        saveScore(deck);
        synchronise();
    }
}
export function flashGangMiddleware({ dispatch }) {
    return function (next) {
        return async function (action) {
            if (action.type === NEW_DECK) {
                console.log('Middleware NEW_DECK')
                let _user = JSON.parse(localStorage.getItem('currentUser'))
                action.data.flashDeck = { mode: 'EDIT', remainingCardsAllowed: _user.profile.maxCardsPerDeck, owner: _user.id }
            }
            else if (action.type === SAVE_DECK) {
                console.log('Middleware SAVE_DECK')
                if (!action.data.flashDeck.id) {
                    let _user = JSON.parse(localStorage.getItem('currentUser'))
                    action.data.flashDeck.id = uuidv4()
                    _user.remainingFlashDecksAllowed = _user.remainingFlashDecksAllowed - 1
                    action.data.user = _user
                    localStorage.setItem('currentUser', JSON.stringify(_user))
                    console.log('Decrementing', _user)
                }
                var mode = action.data.flashDeck.mode
                delete action.data.flashDeck.dirty
                delete action.data.flashDeck.mode
                delete action.data.flashDeck.lastModified
                localStorage.setItem('flashDeck-' + action.data.flashDeck.id, JSON.stringify(action.data.flashDeck))
                action.data.flashDeck.mode = mode
                synchronise(dispatch);
                //connectionHandler.sendUpdateMessage(['10']);
            } else if (action.type === LOAD_DECKS) {
                console.log('Middleware LOAD_DECKS')
                var decks = []
                var keys = Object.entries(localStorage)
                for (var i = 0; i < localStorage.length; i++) {
                    var key = keys[i];
                    if (key[0].indexOf('flashDeck-') == 0) {
                        decks.push(JSON.parse(localStorage.getItem(key[0])))
                    }
                }
                action.flashDecks = decks
            }/* else if (action.type === LOAD_FLASHDECK) {
                console.log('Middleware LOAD_FLASHDECK')
                var flashDeck = JSON.parse(localStorage.getItem('flashDeck-' + action.data.flashDeckId))
                flashDeck.source = action.data.source
                action.data.flashDeck = flashDeck
                flashDeck.dirty = false
                delete flashDeck.currentIndex
                action.data.flashDeck.mode = action.data.mode ? action.data.mode : 'TEST'
                if (action.data.answerType && action.data.testType) {
                    flashDeck.answerType = action.data.answerType
                    flashDeck.testType = action.data.testType
                    selectNextCard(flashDeck)
                }
                flashDeck.scores = []
                var keys = Object.entries(localStorage)
                for (var i = 0; i < localStorage.length; i++) {
                    var key = keys[i];
                    if (key[0].indexOf('user-') == 0) {
                        let _user = JSON.parse(localStorage.getItem(key[0]))
                        console.log('_user', _user)
                        for (var j in _user.scores) {
                            let score = _user.scores[j]
                            if (score && score.flashDeckId == flashDeck.id) {
                                score.firstName = _user.firstName
                                score.lastName = _user.lastName
                                score.userId = _user.id
                                flashDeck.scores.push(score)
                            }
                        }
                    }
                }
                console.log('flashDeck SCORES', flashDeck)
                
            } */else if (action.type === LOGIN) {
                console.log('Middleware LOGIN');
                dispatch({ type: LOADING, data: { loading: true } });
                let questObject = {};
                console.log('action.data', action)
                questObject.params = Object.assign({}, action.payload);
                questObject.resource = 'token';
                questObject.params.grant_type = 'password';
                let postResult = await postToServer(questObject);
                console.log('postResult', postResult);
                if (postResult.responseCode<202 && postResult.responseCode!==0){
                    let tokens = {accessToken:postResult.access_token};
                    localStorage.setItem('tokens', JSON.stringify(tokens));
                    action.tokens = tokens;
                    dispatch({ type: 'LOAD_BRANDS', payload: { tokens } })
                } else {
                    //state.error = postResult
                }
            } else if (action.type === LOAD_BRANDS) {
                console.log('Middleware LOAD_BRANDS');
                dispatch({ type: LOADING, data: { loading: true } });
                let questObject = {};
                console.log('action', action)
                questObject.resource = 'brand';
                console.log('questObject', questObject)
                let postResult = await getFromServer(questObject).then(
                    dispatch({ type: LOADING, data: { loading: false } })
                )
                console.log('postResult', postResult);
                if (postResult.responseCode<202 && postResult.responseCode!==0){
                    action.brands = postResult.brands;
                } else {
                    action.error = postResult
                }
            } else if (action.type === SET_CURRENT_BRAND) {
                console.log('Middleware SET_CURRENT_BRAND', action);
                localStorage.setItem('currentBrandId', JSON.stringify(action.data.brand.id));
            }
            return next(action);
        }
    };
};