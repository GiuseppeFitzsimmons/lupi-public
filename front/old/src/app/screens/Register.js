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
    registerAsync
  } from '../../features/loginSlice'
import placeHolderHimage from '../assets/default-avatar.png'
import { useFileUpload } from 'use-file-upload'
import { FaFileUpload } from 'react-icons/fa';
import UserView from '../components/UserView';

const useStyles = makeStyles({
    root: {
        maxWidth: 345,
    },
    media: {
        height: 180,
    },
});

export default function Register() {
    const classes = useStyles();
    const intl = useIntl();
    let emailError, passwordError;
    const history = useHistory();
    const dispatch = useDispatch();
    useSelector(state => {
        console.log("state", state);
      if (state && state.login && state.login.fields) {
        emailError = state?.login.error.fields.email;
        passwordError = state?.login.error.fields.email;
      }
    })
    const handleCancel = useCallback(() => history.push('/about'), [history]);
    const [file, selectFile] = useFileUpload()
    const defaultSrc = process.env.PUBLIC_URL+"public/default-avatar.png";
    const defaultAvatar=require('../assets/default-avatar.png')
    const [id, setId] = useState();
    const [password, setPassword] = useState();
    const [passwordVerify, setPasswordVerify] = useState();
    const [firstName, setFirstName] = useState();
    const [lastName, setLastName] = useState();
    const handleRegister = () => {
        dispatch(registerAsync({firstName, lastName, id, password}))
    }

    return (
        <main>
            <UserView mode='register'/>
        </main>
    );
}