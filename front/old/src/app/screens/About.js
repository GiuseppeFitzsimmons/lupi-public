import React, {useCallback} from 'react';
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
import { useSelector } from 'react-redux';
import {useHistory} from "react-router-dom";
import LupiAppBar from '../components/LupiAppBar';
import { CssBaseline } from '@material-ui/core';


export default function About(props) {
    const intl = useIntl();
    const history = useHistory();
    const handleGoToRegister = useCallback(() => history.push('/register'), [history]);

  return (
    <main style={{padding:0}}>
        This is the 'about' screen.<br/>
        {!props.loggedIn &&
          <Button onClick={handleGoToRegister} color="primary">
            {intl.formatMessage({ id: 'register' })}
          </Button>
        }
    </main>
  );
}
