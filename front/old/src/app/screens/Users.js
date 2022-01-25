import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useIntl } from 'react-intl';
import UserView from '../components/UserView';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { Grid } from '@material-ui/core';
import {
  useLocation
} from "react-router-dom";
import { loadCollectionsAsync } from '../../features/collectionSlice';
import { createUser, createUserAsync, loadUsersAsync } from '../../features/userSlice';
import GenericListView from '../components/GenericListView';
import { loadBrandsAsync } from '../../features/brandSlice';
import BrandUserView from '../components/BrandUserView';
import CurrentBrandHeader from '../components/CurrentBrandHeader'


const placeHolderImage = "/default-avatar.png"
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    overflowX: 'scroll',
    overlfowY: 'scroll',
    padding:'16px'
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

export default function Users(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  let location = useLocation();
  const path = location.pathname;
  const brands = useSelector(state => state?.brand?.brands);
  if (!brands) {
    dispatch(loadBrandsAsync());
  }
  let brandId = path.substr(path.lastIndexOf('/') + 1, path.length);
  console.log('brandId', brandId)
  const users = useSelector(state => {
    console.log("USERS", state.user.users[brandId]);
      if (state?.user) {
          return state.user.users[brandId];
      }
    })
  if (!users) {
    dispatch(loadUsersAsync({brandId}));
  }
  const theBrand=useSelector(state => {
    if (state?.brand?.brands) {
        let brandObject = {}
        for (var i in state?.brand?.brands){
            brandObject = state?.brand?.brands.find(brand=>brand.id===brandId);
        }
        return brandObject
    }
  })
  if (!theBrand) {
    dispatch(loadBrandsAsync({brandId}));
  }

  const mode = 'EDIT';//TODO user has the right to edit
  const intl = useIntl();
return (
    <div className={classes.root}>
      <CurrentBrandHeader />
    <Grid container spacing={3} style={{height:'95vh', padding:'12px'}}>
      <GenericListView
        image={placeHolderImage}
        colour='purple'
        title={intl.formatMessage({ id: 'createUser' })}
        onClick={() => {
          props.setDisplayMode('register');
          dispatch(createUserAsync({brandId}));
        }}
      />
        {users && users.map(user => {
          console.log('usermap', user, 'from users', users)
            return (
              //<BrandUserView key={user.id} user={user} displayMode={/*props.displayMode*/'display'}/>
              //<BrandUserView key={user.id} user={user} displayMode={'register'}/>
              <BrandUserView key={user.id} user={user} displayMode={props.displayMode} setDisplayMode={props.setDisplayMode}/>
            )
          })}
      </Grid>
    </div>
  );
}