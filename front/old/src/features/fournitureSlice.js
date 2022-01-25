import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { postToServer, getFromServer, testAsync, restfulResources } from './serverCalls';
import { v4 as uuidv4 } from 'uuid';
import { logout } from './globalSlice';
const env = require('./environment.js');

const initialState = {
  fournitures: undefined,
  status: 'idle',
  error: undefined
};

const addImageServer = fourniture => {
  var environment = env.getEnvironment(window.location.origin);
  if (fourniture.image && typeof (fourniture.image) === 'string' && fourniture.image.indexOf('http') !== 0) {
    fourniture.image = environment.imageServer + fourniture.image;
  }
}

export const createFournitureAsync = createAsyncThunk(
  'fourniture/create',
  async (create) => {
    return { id: uuidv4(), brandId: create.brandId, editing: true }
  }
);
export const saveAsync = createAsyncThunk(
  'fourniture/save',
  async (fourniture) => {
    if (fourniture?.editing) {
      delete fourniture.editing
    }
    const result = await postToServer({ resource: 'fourniture', fournitureId: fourniture.id, params: fourniture })
    return result;
  }
);
export const loadFournituresAsync = createAsyncThunk(
  'fourniture/load',
  async (payload) => {
    const result = await getFromServer({ resource: 'fourniture' })
    console.log('fournitures result', result)
    result.brandId=payload.brandId
    return result;
  }
);

export const fournitureSlice = createSlice({
  name: 'fourniture',
  initialState,
  reducers: {
    createFourniture: (state, action) => {
      if (!state.fournitures){
        state.fournitures = {};
      };
      if (!state.fournitures[action.payload.brandId]){
        state.fournitures[action.payload.brandId]=[]
      }
      console.log("state.fournitures[action.payload.brandId]", state.fournitures[action.payload.brandId])
      //void state.fournitures[action.payload.brandId].push({id:uuidv4(), brandId:action.payload.brandId})
      let newArray = JSON.parse(JSON.stringify(state.fournitures[action.payload.brandId])).concat([{id:uuidv4(), brandId:action.payload.brandId}])
      console.log('newArray', newArray)
      state.fournitures[action.payload.brandId] = newArray
    },
    cancel: (state, toCancel) => {
      //TODO make sure this user can perform this action
      //I think some sort of global thing set server-side would be the right approach
      if (state.fournitures) {
        state.fournitures = state.fournitures.filter(function (fourniture) {
          return fourniture.id !== toCancel.payload.id;
        });
      }
      //fire off a delete but don't wait for it
      getFromServer({ resource: 'fourniture', method: 'delete', params: { id: toCancel.payload.id } })
    }

  },
  extraReducers: (builder) => {
    builder
      .addCase(createFournitureAsync.pending, (state, action)=>{
        console.log('createFournitureAsync pending')
      })
      .addCase(createFournitureAsync.fulfilled, (state, action) => {
        console.log('createFournitureAsync 1', action.payload)
        if (!state.fournitures) {
          state.fournitures = {};
        }
        if (!state.fournitures[action.payload.brandId]) {
          state.fournitures[action.payload.brandId] = [];
        }
        state.fournitures[action.payload.brandId].push(action.payload)
        /*
        //state.fournitures[action.payload.brandId] = new Set ([...state.fournitures[action.payload.brandId], action.payload])
        //state.fournitures[action.payload.brandId] = [...state.fournitures[action.payload.brandId], {id : action.payload.id, brandId: action.payload.brandId}]
        let newAction = {payload:action.payload}
        console.log('createFournitureAsync 2', newAction.payload)
        //state.fournitures[action.payload.brandId] = state.fournitures[action.payload.brandId].concat([newAction.payload])
        let newArray = state.fournitures[action.payload.brandId].concat([newAction.payload])
        return newArray
        console.log('createFournitureAsync 3', state.fournitures[action.payload.brandId])
        /*
        if (!state.fournitures[action.payload.brandId]) {
          state.fournitures[action.payload.brandId] = [];
        }
        state.fournitures[action.payload.brandId].push(action.payload)
        */
      })
      .addCase(saveAsync.pending, (state, action) => {
        state.status = { id: action.meta.arg.id, status: 'loading' };
      })
      .addCase(saveAsync.fulfilled, (state, action) => {
        if (state.error) delete state.error;
        state.status = 'idle';
        if (action.payload.responseCode < 202 && action.payload.responseCode !== 0) {
          delete action.payload.responseCode;
          addImageServer(action.payload.fourniture)
          if (!state.fournitures) {
            state.fournitures = [action.payload.fournitures]
          } else {
            state.fournitures = state.fournitures.map(fourniture => {
              if (fourniture.id === action.payload.fourniture.id) {
                return action.payload.fourniture;
              }
              return fourniture;
            })
          }
        } else {
          state.error = action.payload.error;
        }
      })
      .addCase(loadFournituresAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        if (action.payload.responseCode < 202 && action.payload.responseCode !== 0) {
          delete action.payload.responseCode;
          if (!state.fournitures) {
            state.fournitures = []
          }
          if (!state.fournitures[action.payload.brandId]) {
            state.fournitures[action.payload.brandId] = []
          }
          //TODO: add this logic to the other slices to prevent overwriting
          action.payload.fournitures?.forEach(fourniture => {
            if (!state.fournitures[action.payload.brandId].find(f => f.id === fourniture.id)) {
              state.fournitures[action.payload.brandId].push(fourniture)
            }
          });
        } else {
          state.error = action.payload;
        }
        //TODO: also add this elsewhere
        state?.fournitures?.forEach(fourniture => {
          addImageServer(fourniture);
        })
}).addCase(logout, (state, action) => {
  delete state.fournitures;
});
  },
});

export const { createFourniture, cancel } = fournitureSlice.actions;
export default fournitureSlice.reducer;
