
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { postToServer, getFromServer, testAsync, restfulResources } from './serverCalls';
import { v4 as uuidv4 } from 'uuid';
import { logout } from './globalSlice';
const env = require('./environment.js');

const initialState = {
  users: {},
  error: undefined
};

export const saveUserAsync = createAsyncThunk(
  'user/save',
  async user => {
    if (user.editing) {
      delete user.editing
    }
    const result = await postToServer({ resource: 'user', params: user })
    return result;
  }
);
export const createUserAsync = createAsyncThunk(
  'user/create',
  async create => {
    return { id: uuidv4(), brandId: create.brandId, editing: true }
  }
);
export const loadUsersAsync = createAsyncThunk(
  'user/load',
  async payload => {
    const result = await getFromServer({ resource: 'user', params: { brandId: payload.brandId/*, siblingId:payload.productId*/ } })
    console.log("USERS FROM SERVER", result)
    result.brandId = payload.brandId;
    if (result.users) {
      let tempUsers = []
      for (var i in result.users) {
        tempUsers.push(result.users[i].user)
      }
      result[payload.brandId] = tempUsers
    }
    console.log('LOADED USERS', result)
    return result;
  }
);

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    createUser: (state, create) => {
      console.log("CREATE USER", create.payload)
      if (!state.users) {
        state.users = {};
      }
      if (!state.users[create?.payload?.brandId]) {
        state.users[create?.payload?.brandId] = [];
      }
      state.users[create.payload.brandId].push({ id: uuidv4(), brandId: create.payload.brandId, editing: true })
    },
    cancelCreateUser: (state, toCancel) => {
      //TODO make sure this user can perform this action
      //I think some sort of global thing set server-side would be the right approach
      if (state.users && state.users[toCancel.payload.user.brandId]) {
        /*state.users[toCancel.payload.user.brandId]=state.users[toCancel.payload.user.brandId].filter(function(user){ 
          console.log('sliceUser', JSON.parse(JSON.stringify(user)))
          return user.id !== toCancel.payload.user.id;
        });*/
        state.users[toCancel.payload.user.brandId] = state.users[toCancel.payload.user.brandId].filter(user => {
          return user?.user?.id != toCancel.payload.user.id
        })
      }
      //fire off a delete but don't wait for it
      getFromServer({ resource: 'user', method: 'delete', params: { id: toCancel.payload.user.id } })
    },
    deleteUserRole: (state, toDelete) => {
      for (var i in state.users[toDelete.payload.currentBrandId]) {
        if (state.users[toDelete.payload.currentBrandId][i].user.id == toDelete.payload.id) {
          delete state.users[toDelete.payload.currentBrandId][i]
        }
      }
      getFromServer({ resource: 'role', method: 'delete', params: { userId: toDelete.payload.id, brandId: toDelete.payload.currentBrandId } })
    }

  },
  extraReducers: (builder) => {
    builder
      .addCase(saveUserAsync.pending, (state, action) => {
        console.log("saveUserAsync", state, action)
        state.status = { id: action.meta.arg.id, status: 'loading' };
      })
      .addCase(createUserAsync.fulfilled, (state, action) => {
        if (!state.users) {
          state.users = {};
        }
        if (!state.users[action.payload.brandId]) {
          state.users[action.payload.brandId] = [];
        }
        state.users[action.payload.brandId].push(action.payload)
      })
      .addCase(saveUserAsync.fulfilled, (state, action) => {
        if (state.error) delete state.error;
        state.status = 'idle';
        if (action.payload.responseCode < 202 && action.payload.responseCode !== 0) {
          console.log("action.payload", action.payload);
          delete action.payload.responseCode;
          if (!state.users[action.payload.user.brandId]) {
            state.users[action.payload.user.brandId] = [action.payload.user]
          } else {
            state.users[action.payload.user.brandId] = state.users[action.payload.user.brandId].map(user => {
              if (user.id === action.payload.user.id) {
                return action.payload.user;
              }
              return user;
            })
          }
          console.log("so now ", action.payload.user.brandId, "is ", state.users[action.payload.user.brandId])
        } else {
          state.error = action.payload;
        }
      })
      .addCase(loadUsersAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        console.log("loading users", action.payload)
        if (action.payload.responseCode < 202 && action.payload.responseCode !== 0) {
          delete action.payload.responseCode;
          if (!state.users /*|| typeof(state?.users)!=Array || state?.users?.length<=0*/) {
            state.users = [];
          }
          if (!action.payload[action.payload.brandId]) {
            console.log('action.payload.users', action.payload.users)
            state.users[action.payload.brandId] = action.payload.users;
          } else {
            if (!state?.users[action.payload.brandId]) {
              state.users[action.payload.brandId] = []
            }
            action.payload.users.forEach(u => {
              if (!(state.users[action.payload.brandId].find(p => p.id === u.id))) {
                state.users[action.payload.brandId].push(u)
              }
            })
          }
        } else {
          state.error = action.payload;
        }
      })
      .addCase(logout, (state, action) => {
        //delete state.users;
        state.users = {}
      });
  },
});

export const { createUser, cancelCreateUser, deleteUserRole } = userSlice.actions;
export default userSlice.reducer;
