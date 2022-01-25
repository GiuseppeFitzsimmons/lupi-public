import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { postToServer, getFromServer, testAsync, restfulResources } from './serverCalls';
import { v4 as uuidv4 } from 'uuid';
import { logout } from './globalSlice';
const env = require('./environment.js');

const initialState = {
  brands: undefined,
  status: 'idle',
  error: undefined,
  lastRetrieved: -1
};

const addImageServer = brand => {
  var environment = env.getEnvironment(window.location.origin);
  if (brand.image && typeof (brand.image) === 'string' && brand.image.indexOf('http') !== 0) {
    brand.image = environment.imageServer + brand.image;
  }
}

export const saveAsync = createAsyncThunk(
  'brand/save',
  async () => {
    const environment = env.getEnvironment(window.location.origin);
    let newBrand = { id: uuidv4(), operatingCurrency: environment.currency, roundingRules: environment.roundingRules, clientPaymentConditions: environment.clientPaymentConditions, editing: true };
    return newBrand;
  }
);
export const createAsync = createAsyncThunk(
  'brand/create',
  async (brand) => {
    console.log('saving brand', brand)
    if (brand?.editing) {
      delete brand.editing
    }
    const result = await postToServer({ resource: 'brand', brandId: brand.id, params: brand })
    return result;
  }
);
export const loadBrandsAsync = createAsyncThunk(
  'brand/load',
  async (state) => {
    console.log('loadBrandsAsync called', state)
    if (state && state.brands && (state.lastRetrieved < 0 || state.lastRetrieved < (Date.now() - 30000))) {
      console.log('returning cached brands')
      return {cached:true}
    } else {
      const result = await getFromServer({ resource: 'brand' })
      console.log('brands result', result)
      return result;
    }
  }
);

export const brandSlice = createSlice({
  name: 'brand',
  initialState,
  reducers: {
    createBrand: (state, action) => {
      if (!state.brands) {
        state.brands = [];
      }
      const environment = env.getEnvironment(window.location.origin);
      let newBrand = { id: uuidv4(), operatingCurrency: environment.currency, roundingRules: environment.roundingRules, clientPaymentConditions: environment.clientPaymentConditions, editing: true };
      state.brands.push(newBrand);
      //state.displayMode='wizard'
      action.brand = newBrand;
      state.currentBrand = newBrand
    },
    setBrandCurrent: (state, action) => {
      console.log('testBrand', action.payload)
      state.currentBrand = action.payload
      localStorage.setItem('currentBrand', action.payload.id)
    },
    cancel: (state, toCancel) => {
      //TODO make sure this user can perform this action
      //I think some sort of global thing set server-side would be the right approach
      if (state.brands) {
        state.brands = state.brands.filter(function (brand) {
          return brand.id !== toCancel.payload.id;
        });
      }
      //fire off a delete but don't wait for it
      getFromServer({ resource: 'brand', method: 'delete', params: { id: toCancel.payload.id } })
    },
    setCurrentBrand: (state, currentBrand) => {
      console.log('setting ', currentBrand.payload.brand, ' as current brand')
      if (!state.currentBrand) {
        state.currentBrand = {};
      }
      localStorage.setItem('currentBrand', currentBrand.payload.brand)
      state.currentBrand = currentBrand.payload.brand;
      state.switchingBrands = false;
    },
    switchBrand: (state, action) => {
      console.log('switching brands', action.payload);
      localStorage.removeItem('currentBrand');
      state.switchingBrands = true
      //delete state.currentBrand
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveAsync.pending, (state, action) => {
        console.log("saveAsync", state, action)
        state.status = { id: action.meta.arg.id, status: 'loading' };
      })
      .addCase(createAsync.fulfilled, (state, action) => {
        if (!state.brands) {
          state.brands = [];
        }
        state.brands.push(action.payload)
        localStorage.setItem('currentBrand', action.payload.id)
      })
      .addCase(saveAsync.fulfilled, (state, action) => {
        if (state.error) delete state.error;
        state.status = 'idle';
        if (action.payload.responseCode < 202 && action.payload.responseCode !== 0) {
          console.log("action.payload", action.payload);
          delete action.payload.responseCode;
          addImageServer(action.payload.brand)
          if (!state.brands) {
            state.brands = [action.payload.brand]
          } else {
            state.brands = state.brands.map(brand => {
              if (brand.id === action.payload.brand.id) {//or === action.payload.brand.uuid
                return action.payload.brand;
              }
              return brand;
            })
          }
        } else {
          state.error = action.payload.error;
        }
      })
      .addCase(loadBrandsAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        if (action.payload.responseCode < 202 && action.payload.responseCode !== 0) {
          console.log("loading brands", action.payload)
          delete action.payload.responseCode;
          if (!action.payload.cached) {
            if (!state.brands) {
              state.brands = action.payload.brands
              state.lastRetrieved = Date.now()
              console.log('state.brands', state.brands)
            } else {
              //TODO: add this logic to the other slices to prevent overwriting
              action.payload.brands.forEach(brand => {
                if (!state.brands.find(b => b.id === brand.id)) {
                  state.brands.push(brand)
                }
              });
              state.lastRetrieved = Date.now()
            }
            //TODO: also add this elsewhere
            state.brands.forEach(brand => {
              addImageServer(brand);
            })
          }
        } else {
          state.error = action.payload;
        }
      }).addCase(logout, (state, action) => {
        console.log('logout deleting currentBrand', state.currentBrand)
        delete state.currentBrand;
      })
  },
});

export const { createBrand, cancel, setCurrentBrand, setBrandCurrent, switchBrand } = brandSlice.actions;
export default brandSlice.reducer;
