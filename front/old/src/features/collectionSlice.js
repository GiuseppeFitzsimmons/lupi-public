
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { postToServer, getFromServer, testAsync, restfulResources } from './serverCalls';
import { v4 as uuidv4 } from 'uuid';
import { logout } from './globalSlice';
const env = require('./environment.js');

const initialState = {
  collections: {},
  error:undefined
};


export const saveCollectionAsync = createAsyncThunk(
  'collection/save',
  async collection => {
    console.log('saveCollectionAsync', collection)
    const result = await postToServer({resource: 'collection', params:collection})
    return result;
  }
);
export const createCollectionAsync = createAsyncThunk(
  'collection/create',
  async create => {
    return {id:uuidv4(), brandId:create.brandId}
  }
);
export const loadCollectionsAsync = createAsyncThunk(
  'collection/load',
  async payload => {
    //lambda-side, choose whether you're going for a brand Id or acolllectionId call, then if the latter then return
    //all the collections of the brand of that collection, and apply this everywhere in future
    //UPDATE: Done for collection and product
    const result = await getFromServer({resource: 'collection', params:{brandId:payload.brandId, siblingId:payload.collectionId}})
    console.log("COLLECITONS FROM SERVER", result)
    result.brandId=payload.brandId;
    return result;
  }
);

export const collectionSlice = createSlice({
  name: 'collection',
  initialState,
  reducers: {
    createCollection: (state, create) => {
      console.log("CREATE COLLECTION", create.payload)
      if (!state.collections) {
        state.collections={};
      }
      if (!state.collections[create.payload.brandId]) {
        state.collections[create.payload.brandId]=[];
      }
      state.collections[create.payload.brandId].push({id:uuidv4(), brandId:create.payload.brandId})
      console.log("CREATE COLLECTION", create.payload.brandId, state.collections[create.payload.brandId])
    },
    cancelCreateCollection: (state, toCancel) => {
      //TODO make sure this user can perform this action
      //I think some sort of global thing set server-side would be the right approach
      console.log("cancelCreateCollection", toCancel.payload);
      console.log("cancelCreateCollection", state.collections[toCancel.payload.collection.brandId]);
      if (state.collections && state.collections[toCancel.payload.collection.brandId]) {
        state.collections[toCancel.payload.collection.brandId]=state.collections[toCancel.payload.collection.brandId].filter(function(collection){ 
            return collection.id !== toCancel.payload.collection.id;
        });
      }
      //fire off a delete but don't wait for it
      getFromServer({resource: 'collection', method:'delete', params:{id: toCancel.payload.collection.id}})
    }
    
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveCollectionAsync.pending, (state, action) => {
        console.log("saveCollectionAsync", state, action);
        state.status = {id: action.meta.arg.id, status:'loading'};
      })
      .addCase(createCollectionAsync.pending, (state, action) => {
        if (!state.collections) {
          state.collections={};
        }
        if (!state.collections[action.payload.brandId]) {
          state.collections[action.payload.brandId]=[];
        }
      })
      .addCase(createCollectionAsync.fulfilled, (state, action) => {
        if (!state.collections) {
          state.collections={};
        }
        if (!state.collections[action.payload.brandId]) {
          state.collections[action.payload.brandId]=[];
        }
        state.collections[action.payload.brandId].push(action.payload)
      })
      .addCase(saveCollectionAsync.fulfilled, (state, action) => {
        if (state.error) delete state.error;
        state.status = 'idle';
        if (action.payload.responseCode<202 && action.payload.responseCode!==0) {
          console.log("action.payload",action.payload);
            delete action.payload.responseCode;
            if (!state.collections[action.payload.collection.brandId]) {
                state.collections[action.payload.collection.brandId]=[action.payload.collection]
            } else {
                state.collections[action.payload.collection.brandId]=state.collections[action.payload.collection.brandId].map(collection=>{
                if (collection.id===action.payload.collection.id) {
                  return action.payload.collection;
                }
                return collection;
              })
            }
            console.log("so now ",action.payload.collection.brandId, "is ", state.collections[action.payload.collection.brandId])
        } else {
          state.error = action.payload;
        }
      })
      .addCase(loadCollectionsAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        console.log("loading collections", action.payload)
        if (action.payload.responseCode<202 && action.payload.responseCode!==0) {
            delete action.payload.responseCode;
            if (!state.collections || typeof(state?.products)!=Array || state?.products?.length<=0){
              state.collections=[];
            }
            if (!state.collections[action.payload.brandId]){
              state.collections[action.payload.brandId] = action.payload.collections
            }
            else {
              action.payload.collections.forEach(collection=>{
                if (!state.collections[action.payload.brandId].find(c=>c.id===collection.id)){
                  state.collections[action.payload.brandId].push(collection)
                }
              })
            }
        } else {
          state.error = action.payload;
        }
      }).addCase(logout, (state, action) => {
        //delete state.collections;
        state.collections = {};
      });
  },
});

export const { createCollection, cancelCreateCollection } = collectionSlice.actions;
export default collectionSlice.reducer;
