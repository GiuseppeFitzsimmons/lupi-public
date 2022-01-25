import React, {useCallback, useState, useEffect} from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import {
  useHistory
} from "react-router-dom";
import * as Actions from "../action";
import BrandSelector from '../components/BrandSelector';
import StepWizard from "react-step-wizard";

export default function Login(props) {
  const [wizardInstance, setWizardInstance] = useState();
  const dispatch = useDispatch();
  const intl = useIntl();
  const [open, setOpen] = useState(props.shown);
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
    //console.log("Error state? ", state);
    return _errors;
  })
  const goToRegister = useCallback(() => history.push('/register'), [history]);
  const handleGoToRegister = () => {
    setOpen(false);
    goToRegister()
  };
  const handleLogin = () => {
      dispatch({ type: 'LOGIN', payload: {id, password} })
  };
  const handleClose = () => {
    setOpen(false);
  };
  const tokens = localStorage.getItem('tokens');
  const currentBrandId = localStorage.getItem('currentBrandId');
  const loading = useSelector((state)=>{return state.loading})
  //useEffect(console.log('tokens received'),[tokens])

  const handleShowBrandSelector = () => {
    if (!loading){
      wizardInstance?.nextStep()
    }
      /*
    console.log('tokenBrands', tokenBrands)
      if ((!tokenBrands)||(tokenBrands && tokenBrands.length<1)){
        console.log('nobrands')
        setOpen(false)
        history.push('/brands')
        //dispatch(createBrand());
      } else if (tokenBrands && tokenBrands.length>1){
        console.log('manybrands', wizardInstance)
        wizardInstance?.nextStep()
      }else if (tokenBrands && tokenBrands.length==1){
        console.log('onebrand', tokenBrands[0])
        //dispatch(setBrandCurrent({id:tokenBrands[0].brandId}))
        //setOpen(false)
      }
      */
  }
  const loginView = 
  <div>
    <Dialog open={(!tokens || currentBrandId===null)}
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
        <Button onClick={()=>{handleLogin();handleShowBrandSelector()}} color="primary">
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
        {<BrandSelector/>}
      </div>
    </StepWizard>
    </Dialog>
  </div>

  return (
    loginView
  );
}
