import React, {useCallback, useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import { useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import {useHistory} from "react-router-dom";
import {
    brandUserAsync,
    registerAsync
  } from '../../features/loginSlice'
import {
    cancelCreateUser
  } from '../../features/userSlice'
import { deleteUserRole } from '../../features/userSlice';
import placeHolderHimage from '../assets/default-avatar.png'
import { useFileUpload } from 'use-file-upload'
import { FaFileUpload } from 'react-icons/fa';
import { MenuItem } from '@material-ui/core';

const useStyles = makeStyles({
    root: {
        maxWidth: 345,
    },
    media: {
        height: 180,
    },
});

export default function BrandUserView(props) {
    const classes = useStyles();
    const intl = useIntl();
    let emailError, passwordError;
    const history = useHistory();
    const dispatch = useDispatch();
    useSelector(state => {
      if (state && state.login && state.login.fields) {
        emailError = state?.login.error.fields.email;
        passwordError = state?.login.error.fields.email;
      }
    })
    const handleCancel = useCallback(() => {
        //dispatch(cancelCreateUser({user:{brandId:currentBrand.id, id:props.user.id}}))
        dispatch(cancelCreateUser({user:{brandId:currentBrandId, id:user?.id}}))
        //TODO this dispatch is sending an undefined ID (and that might actually be fine)
        //Update: not sending an unidentified ID anymore, but it's broken again
    }, [history]);
    const [file, selectFile] = useFileUpload()
    const defaultSrc = process.env.PUBLIC_URL+"public/default-avatar.png";
    const defaultAvatar=require('../assets/default-avatar.png')
    const handleRegister = () => {
        props.setDisplayMode('register')
        dispatch(brandUserAsync({email, brand}))
    }
    const currentBrandId = localStorage.getItem('currentBrand');
    const handleDelete = (id) => {
        console.log('deleting user', id, 'with currentBrandId', currentBrandId)
        dispatch(deleteUserRole({id:id, currentBrandId:currentBrandId}))
    }
    const brands = useSelector(state=>{return state.brand.brands})
    const [brand, setBrand] = useState();
    const [email, setEmail] = useState();
    const newUser = useSelector(state=>{return state.login.newUser})
    const user = props.user
    console.log('props.user', props.user)
    //if (props?.displayMode=='register'){
    if (props?.user?.editing==true){
        return (
            <Card className={classes.root}>
                <CardActionArea>  
                    <CardContent>
                        {props.mode==='register' && 
                        <Typography variant="h5" component="h2">
                            {intl.formatMessage({ id: 'createAccount' })}
                        </Typography>
                        }
                        <TextField
                            autoFocus
                            margin="dense"
                            id="email"
                            label={intl.formatMessage({ id: 'emailAddress' })}
                            type="email"
                            error={emailError}
                            helperText={emailError}
                            fullWidth
                            onChange={(e)=>setEmail(e.target.value)}
                        />
                        <TextField id="brand"
                            //value={operatingCurrency}
                            margin="none"
                            label={intl.formatMessage({ id: 'brand' })}
                            onChange={(e) => setBrand(e.target.value)}
                            //error={error.brand}
                            //helperText={error.brand}
                            select>
                            {brands && brands.map(brand=>{
                                return(
                                    <MenuItem value={brand.id} key={brand.id}>{brand.brandName}</MenuItem>
                                )
                            })}
                        </TextField>
                    </CardContent>
                </CardActionArea>
                <CardActions>
                    <Button size="small" color="primary" onClick={handleCancel}>
                    {intl.formatMessage({ id: 'cancel' })}
                    </Button>
                    <Button size="small" color="primary" onClick={handleRegister}>
                    {intl.formatMessage({ id: 'register' })}
                    </Button>
                </CardActions>
                {newUser && 
                <>
                New user {newUser.id}'s temporary password is {newUser.password}
                </>}
            </Card>
    );
    } else {
        return ( /*user ? user :*/
            <Card className={classes.root}>
                <CardActionArea>  
                    <CardContent>
                        <div>
                            {user?.id ? user?.id : 'new user'}
                        </div>
                    </CardContent>
                </CardActionArea>
                <CardActions>
                    <Button size="small" color="primary" onClick={()=>{
                        console.log('handleDelete', user)
                        handleDelete(user?.id)
                        }}>
                    {intl.formatMessage({ id: 'delete' })}
                    </Button>
                </CardActions>
            </Card>
        )
    }

}