import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { fade, makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import Badge from '@material-ui/core/Badge';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import AccountCircle from '@material-ui/icons/AccountCircle';
import ViewColumn from '@material-ui/icons/ViewColumn';
import ViewComfy from '@material-ui/icons/ViewComfy';

import MailIcon from '@material-ui/icons/Mail';
import NotificationsIcon from '@material-ui/icons/Notifications';
import MoreIcon from '@material-ui/icons/MoreVert';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import {
  logout
} from '../../features/globalSlice'
import {
  useHistory
} from "react-router-dom";
import {
  setBrandCurrent, setCurrentBrand, switchBrand
} from '../../features/brandSlice';

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
    minHeight:'12px',
    maxHeight:'3vh',
    marginTop:'0'
  },
  searchIcon: {
    padding: theme.spacing(1, 1),
    height: '1vh',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize:'1px'
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
    marginTop:0,
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
}));



export default function LupiAppBar(props) {
  const history = useHistory();
  const [anchorProfileElement, setAnchorProfileElement] = React.useState(null);
  const handleOpenProfileMenu = (event) => {
    setAnchorProfileElement(event.currentTarget);
  };
  const handleCloseProfileMenu = () => {
    setAnchorProfileElement(null);
  };
  const classes = useStyles();
  const intl = useIntl();
  const dispatch = useDispatch();
  const handleLogout = () => {
      dispatch(logout());
      setAnchorProfileElement(null);
      history.push('')
  } 
  const handleSwitchBrand = () => {
    dispatch(switchBrand(true));
    handleCloseProfileMenu();
  };
    return (
        <AppBar position="static" style={{height:'5vh', width:'100%', backgroundColor:'black', margins:0, padding:0, maxHeight:'4vh'}}>
          <Toolbar style={{padding:0, minHeight:'1vh'}}>
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              placeholder="Search…"
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              style={{minHeight:'1vh', maxHeight:'1vh'}}
              inputProps={{ 'aria-label': 'search' }}
            />
          </div>
          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>
            {/*<IconButton aria-label="show 4 new mails" color="inherit">
              <Badge badgeContent={4} color="secondary">
                <MailIcon style={{fontSize:'.5em'}}/>
              </Badge>
            </IconButton>
            <IconButton aria-label="show 17 new notifications" color="inherit">
              <Badge badgeContent={17} color="secondary" size='.1em'>
                <NotificationsIcon style={{fontSize:'.5em'}}/>
              </Badge>
            </IconButton>*/}
            <IconButton color="inherit">
                <ViewComfy 
                  style={{fontSize:'.75em', color:props.displayMode!=='detail' ? 'pink' : 'white'}}
                  onClick={()=>{
                    if (props.setDisplayMode) {
                      props.setDisplayMode('list');
                    }
                  }}/>
            </IconButton>
            <IconButton color="inherit">
                <ViewColumn 
                  style={{fontSize:'.75em', color:props.displayMode==='detail' ? 'pink' : 'white'}}
                  onClick={()=>{
                    if (props.setDisplayMode) {
                      props.setDisplayMode('detail');
                    }
                  }}/>
            </IconButton>
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              color="inherit"
              onClick={handleOpenProfileMenu}
            >
              <AccountCircle style={{fontSize:'.75em'}}/>
            </IconButton>
          </div>
            <Menu
              id="simple-menu"
              anchorEl={anchorProfileElement}
              keepMounted
              open={Boolean(anchorProfileElement)}
              onClose={handleCloseProfileMenu}
            >
            <MenuItem onClick={handleCloseProfileMenu}>{intl.formatMessage({ id: 'profile' })}</MenuItem>
            <MenuItem onClick={handleLogout}>{intl.formatMessage({ id: 'logOut' })}</MenuItem>
            <MenuItem onClick={handleSwitchBrand}>{intl.formatMessage({ id: 'switchBrand' })}</MenuItem>
          </Menu>

          <div style={{width:'2vh'}} />
          </Toolbar>
        </AppBar>
    );
  }
  