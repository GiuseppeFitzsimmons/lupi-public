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

const useStyles = makeStyles({
    root: {
        maxWidth: 345,
    },
    media: {
        height: 180,
    },
});

export default function UserView(props) {
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
            <Card className={classes.root}>
                <CardActionArea>
                 {props.mode!=='register' && 
                    <CardMedia
                        className={classes.media}
                        image={file && file.source ? file.source : defaultSrc}
                    >
                        <FaFileUpload
                            onClick={() => {
                            // Single File Upload
                            selectFile({ accept: 'image/*' })
                            }}
                            style={{position:'absolute', right:'0px', top: '0', fontSize:'2em', color:'rgba(0,0,0,0.5)'}}/>
                    </CardMedia>
                    }   
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
                            onChange={(e)=>setId(e.target.value)}
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="password"
                            label={intl.formatMessage({ id: 'password' })}
                            type="password"
                            error={passwordError}
                            helperText={passwordError}
                            fullWidth
                            onChange={(e)=>setPassword(e.target.value)}
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="password2"
                            label={intl.formatMessage({ id: 'passwordAgain' })}
                            type="password"
                            error={passwordError}
                            helperText={passwordError}
                            fullWidth
                            onChange={(e)=>setPasswordVerify(e.target.value)}
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="firstName"
                            label={intl.formatMessage({ id: 'firstName' })}
                            type="text"
                            fullWidth
                            onChange={(e)=>setFirstName(e.target.value)}
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="lastName"
                            label={intl.formatMessage({ id: 'lastName' })}
                            type="text"
                            fullWidth
                            onChange={(e)=>setLastName(e.target.value)}
                        />
                    </CardContent>
                </CardActionArea>
                <CardActions>
                    <Button size="small" color="primary" onClick={handleCancel}>
                    {intl.formatMessage({ id: 'cancel' })}
                    </Button>
                {props.mode==='register' && 
                    <Button size="small" color="primary" onClick={handleRegister}>
                    {intl.formatMessage({ id: 'register' })}
                    </Button>
                }
                </CardActions>
            </Card>
    );
}