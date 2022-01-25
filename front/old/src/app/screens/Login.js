import React, {useCallback, useState, getState, useEffect} from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import {
  useHistory
} from "react-router-dom";
import {
  loginAsync
  } from '../../features/loginSlice'
import BrandSelector from '../components/BrandSelector';
import StepWizard from "react-step-wizard";
import {
  setBrandCurrent,
  createBrand
} from '../../features/brandSlice';

export default function Login(props) {
  const [wizardInstance, setWizardInstance] = useState();
  const dispatch = useDispatch();
  const intl = useIntl();
  const [open, setOpen] = useState(props.shown);
  useEffect(() => {
    //setOpen(props.shown)
    console.log('open', open)
    })
  let emailError, passwordError, isEmailError, isPasswordError;
  const history = useHistory();
  const [password, setPassword] = useState();
  const [id, setId] = useState();
  const errors=useSelector(state => {
    let _errors={};
    if (state && state.login && state.login.error 
      && state.login.error.fields) {
        _errors.emailError = state.login.error.fields.id;
        _errors.passwordError = state.login.error.fields.password;
    } else if (state && state.login && state.login.error) {
      _errors.emailError = state?.login.error.message;
    }
    console.log("Error state? ", state);
    return _errors;
  })
  const currentBrandId = localStorage.getItem('currentBrand');
  const brands = useSelector(state=>{
    return state?.brand?.brands
  })
  const switchingBrands = useSelector(state=>{
    return state?.brand?.switchingBrands
  })
  const goToRegister = useCallback(() => history.push('/register'), [history]);
  const handleGoToRegister = () => {
    setOpen(false);
    goToRegister()
  };
  const handleLogin = () => {
      dispatch(loginAsync({id, password}, getState))
  }

  const handleClose = () => {
    setOpen(false);
  };

  const tokenBrands = useSelector(state=>{return state?.login?.tokens?.payload?.roles})
  const tokens = useSelector(state=>{return state?.login?.tokens})
  useEffect(() => {
    console.log('tokens', tokens)
    console.log('tokenBrands', tokenBrands)
    if (tokens!==null && tokens!==undefined){
      handleShowBrandSelector()
    }
    }, [tokens])

  const handleShowBrandSelector = () => {
    console.log('tokenBrands', tokenBrands)
      if ((!tokenBrands)||(tokenBrands && tokenBrands.length<1)){
        console.log('nobrands')
        setOpen(false)
        history.push('/brands')
        dispatch(createBrand());
      } else if (tokenBrands && tokenBrands.length>1){
        console.log('manybrands', wizardInstance)
        wizardInstance?.nextStep()
      }else if (tokenBrands && tokenBrands.length==1){
        console.log('onebrand', tokenBrands[0])
        dispatch(setBrandCurrent({id:tokenBrands[0].brandId}))
        //setOpen(false)
      }
  }
  const loginView = 
  <div>
    <Dialog open={open===true && !currentBrandId}
      onClose={handleClose} aria-labelledby="form-dialog-title"
      disableBackdropClick={true}
      disableEscapeKeyDown={true}>
    <StepWizard initialStep={!tokens ? 1 : 2} instance={setWizardInstance}>
      {/*<DialogTitle id="form-dialog-title">{intl.formatMessage({ id: 'login' })}</DialogTitle>*/}
      <div>
      <DialogContent style={{ minWidth: '20em' }}>

        {/*  <DialogContentText>
          To subscribe to this website, please enter your email address here. We will send updates
          occasionally.
        </DialogContentText>*/}
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label={intl.formatMessage({ id: 'emailAddress' })}
          type="email"
          error={errors.emailError}
          helperText={errors.emailError}
          fullWidth
          onChange={(e)=>setId(e.target.value)}
        />
        <TextField
          margin="dense"
          id="name"
          label={intl.formatMessage({ id: 'password' })}
          type="password"
          error={errors.passwordError}
          helperText={errors.passwordError}
          fullWidth
          onChange={(e)=>setPassword(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <div />
        <Button onClick={()=>{handleLogin();/*handleShowBrandSelector()*/}} color="primary">
          {intl.formatMessage({ id: 'login' })}
        </Button>
      </DialogActions>
      <DialogActions>
        <Button onClick={handleGoToRegister} color="primary">
          {intl.formatMessage({ id: 'register' })}
        </Button>
        <Button onClick={handleLogin} color="primary">
          {intl.formatMessage({ id: 'forgottenPassword' })}
        </Button>
      </DialogActions>
      </div>
      <div>
        {((tokens && !currentBrandId) || switchingBrands===true) && <BrandSelector/>}
      </div>
    </StepWizard>
    </Dialog>
  </div>

  return (
    loginView
  );
}
