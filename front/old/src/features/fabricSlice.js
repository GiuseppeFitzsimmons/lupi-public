import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { postToServer, getFromServer, testAsync, restfulResources } from './serverCalls';
import { v4 as uuidv4 } from 'uuid';
import { logout } from './globalSlice';
const env = require('./environment.js');

const initialState = {
  fabrics: undefined,
  status: 'idle',
  error: undefined
};

const addImageServer = fabric => {
  var environment = env.getEnvironment(window.location.origin);
  if (fabric.image && typeof (fabric.image) === 'string' && fabric.image.indexOf('http') !== 0) {
    fabric.image = environment.imageServer + fabric.image;
  }
}

export const createFabricAsync = createAsyncThunk(
  'fabric/create',
  async (create) => {
    return { id: uuidv4(), brandId: create.brandId, editing: true }
  }
);
export const saveAsync = createAsyncThunk(
  'fabric/save',
  async (fabric) => {
    if (fabric?.editing) {
      delete fabric.editing
    }
    const result = await postToServer({ resource: 'fabric', fabricId: fabric.id, params: fabric })
    return result;
  }
);
export const loadFabricsAsync = createAsyncThunk(
  'fabric/load',
  async (payload) => {
    const result = await getFromServer({ resource: 'fabric' })
    console.log('fabrics result', result)
    result.brandId=payload.brandId
    return result;
  }
);

export const fabricSlice = createSlice({
  name: 'fabric',
  initialState,
  reducers: {
    createFabric: (state, action) => {
      if (!state.fabrics){
        state.fabrics = {};
      };
      if (!state.fabrics[action.payload.brandId]){
        state.fabrics[action.payload.brandId]=[]
      }
      console.log("state.fabrics[action.payload.brandId]", state.fabrics[action.payload.brandId])
      //void state.fabrics[action.payload.brandId].push({id:uuidv4(), brandId:action.payload.brandId})
      let newArray = JSON.parse(JSON.stringify(state.fabrics[action.payload.brandId])).concat([{id:uuidv4(), brandId:action.payload.brandId}])
      console.log('newArray', newArray)
      state.fabrics[action.payload.brandId] = newArray
    },
    cancel: (state, toCancel) => {
      //TODO make sure this user can perform this action
      //I think some sort of global thing set server-side would be the right approach
      if (state.fabrics) {
        state.fabrics = state.fabrics.filter(function (fabric) {
          return fabric.id !== toCancel.payload.id;
        });
      }
      //fire off a delete but don't wait for it
      getFromServer({ resource: 'fabric', method: 'delete', params: { id: toCancel.payload.id } })
    }

  },
  extraReducers: (builder) => {
    builder
      .addCase(createFabricAsync.pending, (state, action)=>{
        console.log('createFabricAsync pending')
      })
      .addCase(createFabricAsync.fulfilled, (state, action) => {
        console.log('createFabricAsync 1', action.payload)
        if (!state.fabrics) {
          state.fabrics = {};
        }
        if (!state.fabrics[action.payload.brandId]) {
          state.fabrics[action.payload.brandId] = [];
        }
        state.fabrics[action.payload.brandId].push(action.payload)
        /*
        //state.fabrics[action.payload.brandId] = new Set ([...state.fabrics[action.payload.brandId], action.payload])
        //state.fabrics[action.payload.brandId] = [...state.fabrics[action.payload.brandId], {id : action.payload.id, brandId: action.payload.brandId}]
        let newAction = {payload:action.payload}
        console.log('createFabricAsync 2', newAction.payload)
        //state.fabrics[action.payload.brandId] = state.fabrics[action.payload.brandId].concat([newAction.payload])
        let newArray = state.fabrics[action.payload.brandId].concat([newAction.payload])
        return newArray
        console.log('createFabricAsync 3', state.fabrics[action.payload.brandId])
        /*
        if (!state.fabrics[action.payload.brandId]) {
          state.fabrics[action.payload.brandId] = [];
        }
        state.fabrics[action.payload.brandId].push(action.payload)
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
          addImageServer(action.payload.fabric)
          if (!state.fabrics) {
            state.fabrics = [action.payload.fabrics]
          } else {
            state.fabrics = state.fabrics.map(fabric => {
              if (fabric.id === action.payload.fabric.id) {
                return action.payload.fabric;
              }
              return fabric;
            })
          }
        } else {
          state.error = action.payload.error;
        }
      })
      .addCase(loadFabricsAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        if (action.payload.responseCode < 202 && action.payload.responseCode !== 0) {
          delete action.payload.responseCode;
          if (!state.fabrics) {
            state.fabrics = []
          }
          if (!state.fabrics[action.payload.brandId]) {
            state.fabrics[action.payload.brandId] = []
          }
          //TODO: add this logic to the other slices to prevent overwriting
          action.payload.fabrics.forEach(fabric => {
            if (!state.fabrics[action.payload.brandId].find(f => f.id === fabric.id)) {
              state.fabrics[action.payload.brandId].push(fabric)
            }
          });
        } else {
          state.error = action.payload;
        }
        //TODO: also add this elsewhere
        state?.fabrics?.forEach(fabric => {
          addImageServer(fabric);
        })
}).addCase(logout, (state, action) => {
  delete state.fabrics;
});
  },
});

export const { createFabric, cancel } = fabricSlice.actions;
export default fabricSlice.reducer;
