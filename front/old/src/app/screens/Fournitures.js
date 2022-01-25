import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useIntl } from 'react-intl';
import FournitureView from '../components/FournitureView';
import { useDispatch, useSelector } from 'react-redux';
import { Grid } from '@material-ui/core';
import {
  useLocation
} from "react-router-dom";
import {
  createFourniture,
  createFournitureAsync,
  loadFournituresAsync
} from '../../features/fournitureSlice'
import GenericListView from '../components/GenericListView';
import CurrentBrandHeader from '../components/CurrentBrandHeader';
const placeHolderImage = "/default-avatar.png"


const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    overflowX: 'scroll',
    overlfowY: 'scroll',
    padding: '16px'
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

export default function Fournitures(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  let location = useLocation();
  const path = location.pathname;
  let brandId = path.substr(path.lastIndexOf('/') + 1, path.length);
  if (brandId === 'fournitures') {
    brandId = false;
  }
  const fournitures = useSelector(state => {
    if (state?.fourniture?.fournitures) {
      console.log('fournitureslog', state.fourniture.fournitures)
      return state.fourniture.fournitures[brandId]
      //return state.fourniture.fournitures
    }
  });
  if (!fournitures) {
    dispatch(loadFournituresAsync({ brandId }));
  }
  const brand = useSelector(state => {
    if (state?.brand?.brands) {
      return state.brand.brands.find(brand => brand.id === brandId);
    }
  })
  const mode = 'EDIT';//TODO user has the right to edit
  const intl = useIntl();
  return (
    <div className={classes.root}>
      <CurrentBrandHeader />
      <Grid container spacing={3} style={{ height: '95vh' }}>
        {fournitures && fournitures.map(fourniture => {
          return (
            <>
              <FournitureView key={fourniture.id} fourniture={fourniture} displayMode={props.displayMode} />
            </>
          )
        })}
        {/*(!fournitures || fournitures.length===0) &&
          <GenericListView
          image={placeHolderImage}
          title={intl.formatMessage({ id: 'createFourniture' })}
          onClick={() => {
            props.setDisplayMode('detail');
            dispatch(createFournitureAsync({brandId}));
          }} />
        */}
        <GenericListView
          image={placeHolderImage}
          title={intl.formatMessage({ id: 'createFourniture' })}
          onClick={() => {
            props.setDisplayMode('detail');
            dispatch(createFourniture({ brandId }));
          }} />
      </Grid>
    </div>
  );
}