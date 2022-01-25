import React, {useCallback} from 'react';
import Button from '@material-ui/core/Button';
import { useIntl } from 'react-intl';
import {useHistory} from "react-router-dom";


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
