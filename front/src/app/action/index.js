export const NEW_DECK = 'NEW_DECK';
export const SAVE_DECK = 'SAVE_DECK';
export const LOAD_DECKS = 'LOAD_DECKS';
export const LOADING = 'LOADING';
export const LOGIN = 'LOGIN';
export const LOAD_BRANDS = 'LOAD_BRANDS';
export const SET_CURRENT_BRAND = 'SET_CURRENT_BRAND';

export function newDeck() {
    console.log("Action NEW_DECK");
    return { type: NEW_DECK, data: { flashDeck: {} } };
};
export function saveDeck(flashDeck) {
    console.log("Action SAVE_DECK");
    return { type: SAVE_DECK, data: { flashDeck } };
};
export function loadDecks() {
    console.log("Action LOAD_DECKS");
    return { type: LOAD_DECKS };
};
export function logIn(user) {
    console.log("Action LOGIN", user);
    return { type: LOGIN, data: { user } };
};
export function loadBrands(user) {
    console.log("Action LOAD_BRANDS", user);
    return { type: LOAD_BRANDS, data: { user } };
};
export function setCurrentBrand(brand) {
    console.log("Action SET_CURRENT_BRAND", brand);
    return { type: SET_CURRENT_BRAND, data: { brand } };
};