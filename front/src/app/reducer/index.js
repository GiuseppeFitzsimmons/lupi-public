import {
    NEW_DECK, SAVE_DECK, LOAD_DECKS, LOADING, LOGIN, LOAD_BRANDS, SET_CURRENT_BRAND
} from '../action';

const initialState = { sessionExpired: false };

function rootReducer(state = initialState, action) {
    console.log('Reducer', action);
    let flashDeck;
    switch (action.type) {
        case NEW_DECK:
            state = Object.assign({}, state, { flashDeck });
            return state;
        case SAVE_DECK:
            state = Object.assign({}, state, { flashDeck });
            return state;
        case LOAD_DECKS:
            state = Object.assign({}, state, { flashDecks: action.flashDecks });
            return state;
        case LOADING:
            state = Object.assign({}, state, { loading: action.data.loading });
            return state;
        case LOGIN:
            state = Object.assign({}, state, { tokens: action.tokens });
            return state;
        case LOAD_BRANDS:
            state = Object.assign({}, state, { brands: action.brands });
            console.log('load_brands state', state)
            return state;
        case SET_CURRENT_BRAND:
            state = Object.assign({}, state, { currentBrandId: action.data.brand.id });
            return state;
        default:
            console.log('default state', state);
            return state;
    }
};
export default rootReducer;