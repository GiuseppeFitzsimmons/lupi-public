
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { postToServer, getFromServer, testAsync, restfulResources } from './serverCalls';
import { v4 as uuidv4 } from 'uuid';
import { logout } from './globalSlice';
const env = require('./environment.js');

const initialState = {
  products: {},
  error:undefined
};

export const saveProductAsync = createAsyncThunk(
  'product/save',
  async product => {
    const result = await postToServer({resource: 'product', params:product})
    return result;
  }
);
export const createProductAsync = createAsyncThunk(
  'product/create',
  async create => {
    return {id:uuidv4(), collectionId:create.collectionId};
  }
);
export const loadProductsAsync = createAsyncThunk(
  'product/load',
  async payload => {
    const result = await getFromServer({resource: 'product', params:{collectionId:payload.collectionId, siblingId:payload.productId}})
    console.log("PRODUCTS FROM SERVER", result)
    result.collectionId=payload.collectionId;
    return result;
  }
);

export const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    createProduct: (state, create) => {
      console.log("CREATE PRODUCT", create.payload)
      if (!state.products) {
        state.products={};
      }
      if (!state.products[create.payload.collectionId]) {
        state.products[create.payload.collectionId]=[];
      }
      state.products[create.payload.collectionId].push({id:create.payload.id, collectionId:create.payload.collectionId})
      console.log("CREATE PRODUCT", create.payload.collectionId, state.products[create.payload.collectionId])
    },
    cancelCreateProduct: (state, toCancel) => {
      //TODO make sure this user can perform this action
      //I think some sort of global thing set server-side would be the right approach
      console.log("cancelCreateProduct", toCancel.payload);
      console.log("cancelCreateProduct", state.products[toCancel.payload.product.collectionId]);
      if (state.products && state.products[toCancel.payload.product.collectionId]) {
        state.products[toCancel.payload.product.collectionId]=state.products[toCancel.payload.product.collectionId].filter(function(product){ 
            return product.id !== toCancel.payload.product.id;
        });
      }
      //fire off a delete but don't wait for it
      getFromServer({resource: 'product', method:'delete', params:{id: toCancel.payload.id}})
    }
    
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveProductAsync.pending, (state, action) => {
        console.log("saveProductAsync", state, action)
        state.status = {id: action.meta.arg.id, status:'loading'};
      })
      .addCase(createProductAsync.fulfilled, (state, action) => {
        if (!state.products) {
          state.products={};
        }
        if (!state.products[action.payload.collectionId]) {
          state.products[action.payload.collectionId]=[];
        }
        void state.products[action.payload.collectionId].push(action.payload)
      })
      .addCase(saveProductAsync.fulfilled, (state, action) => {
        if (state.error) delete state.error;
        state.status = 'idle';
        if (action.payload.responseCode<202 && action.payload.responseCode!==0) {
          console.log("action.payload",action.payload);
            delete action.payload.responseCode;
            if (!state.products[action.payload.product.collectionId]) {
                state.products[action.payload.product.collectionId]=[action.payload.product]
            } else {
                state.products[action.payload.product.collectionId]=state.products[action.payload.product.collectionId].map(product=>{
                if (product.id===action.payload.product.id) {
                  return action.payload.product;
                }
                return product;
              })
            }
            console.log("so now ",action.payload.product.collectionId, "is ", state.products[action.payload.product.collectionId])
        } else {
          state.error = action.payload;
        }
      })
      .addCase(loadProductsAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        console.log("loading products", action.payload)
        if (action.payload.responseCode<202 && action.payload.responseCode!==0) {
            delete action.payload.responseCode;
            if (!state.products || typeof(state?.products)!=Array || state?.products?.length<=0){
              state.products=[];
            }
            if (!action.payload.products[action.payload.collectionId]){
              state.products[action.payload.collectionId]=action.payload.products;
            } else {
              action.payload.products.forEach(product=>{
                if(!state.products[action.payload.collectionId].find(p=>p.id===product.id)){
                  state.products[action.payload.collectionId].push(product)
                }
              })
            }
        } else {
          state.error = action.payload;
        }
      }).addCase(logout, (state, action) => {
        state.products = {}
        //delete state.products;
      });
  },
});

export const { createProduct, cancelCreateProduct } = productSlice.actions;
export default productSlice.reducer;
