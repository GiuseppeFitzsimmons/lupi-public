import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { postToServer } from './serverCalls';
import { saveAsync as saveBrand, loadBrandsAsync, createBrand } from './brandSlice'
import { logout } from './globalSlice'

const initialState = {
  tokens: undefined,
  status: 'idle',
  error:undefined,
  actionQueue:[]
};

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
export const registerAsync = createAsyncThunk(
  'login/register',
  async (user) => {
    console.log("login registerAsync user ", user);
    const response = await postToServer({
      resource:'user',
      params:{password: user.password, id: user.id}
    });
    console.log("login registerAsync response", response);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);
export const loginAsync = createAsyncThunk(
  'login/token',
  async (credentials) => {
    console.log("login loginSync user ", credentials);
    credentials.grant_type='password';
    const response = await postToServer({
      resource:'token',
      params:credentials
    });
    console.log("login loginAsync response", response);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

export const loginSlice = createSlice({
  name: 'login',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    increment: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value += 1;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerAsync.pending, (state) => {
        console.log("loading register")
        state.status = 'loading';
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        console.log("done register", action.payload)
        if (state.error) delete state.error;
        state.status = 'idle';
        if (action.payload.responseCode<202) {
          let tokens= {accessToken:action.payload.access_token, refreshToken: action.payload.refresh_token}
          tokens.payload=JSON.parse(atob(tokens.accessToken.split('.')[1]));
          localStorage.setItem('tokens', JSON.stringify(tokens));
          state.tokens = tokens;
        } else {
          state.error = action.payload;
        }
      })
      .addCase(loginAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        if (state.error) delete state.error;
        state.status = 'idle';
        if (action.payload.responseCode<202 && action.payload.responseCode!==0) {
          let tokens={accessToken:action.payload.access_token, refreshToken: action.payload.refresh_token};
          tokens.payload=JSON.parse(atob(tokens.accessToken.split('.')[1]));
          localStorage.setItem('tokens', JSON.stringify(tokens));
          state.tokens = tokens;
        } else {
          state.error = action.payload;
        }
      }).addCase(saveBrand.fulfilled, (state, action) => {
        if (action.payload.responseCode===401) {
          delete state.tokens;
          localStorage.removeItem('tokens');
        }
      }).addCase(loadBrandsAsync.fulfilled, (state, action) => {
        if (action.payload.responseCode===401) {
          delete state.tokens;
          localStorage.removeItem('tokens');
        }
      }).addCase(logout, (state, action) => {
        console.log("LOGINSLICE LOGOUT CALLED")
        localStorage.clear();
        delete state.tokens;
      }).addCase(createBrand, (state, action) => {
        if (action.brand) {
          let tokens=localStorage.getItem('tokens')
          if (tokens) {
            tokens=JSON.parse(tokens);
            let role={
              brandId:action.brand.id,
              name:'ADMIN',
              allowedScopes:['*:*']
            }
            if (!tokens.payload.roles) {
              tokens.payload.roles=[];
            }
            tokens.payload.roles.push(role);
            localStorage.setItem('tokens', JSON.stringify(tokens));
            state.tokens = tokens;
          }
          
        }
      });
  },
});

//export const { increment, decrement, incrementByAmount } = loginSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
//So far I can't get this working. If I hard-code the value it works but it otherwise doesn't even log.
//No real problem, though, because useSelector works nicely.
/*export const selectTokens = (state) => {
  console.log("selectTokens", state)
  if (state && state.login) {
    return state.login.tokens
  }
  return 'nope'
};*/

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
/*export const incrementIfOdd = (amount) => (dispatch, getState) => {
  const currentValue = selectCount(getState());
  if (currentValue % 2 === 1) {
    dispatch(incrementByAmount(amount));
  }
};*/

export default loginSlice.reducer;
