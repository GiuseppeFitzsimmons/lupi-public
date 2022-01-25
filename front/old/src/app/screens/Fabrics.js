import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useIntl } from 'react-intl';
import FabricView from '../components/FabricView';
import { useDispatch, useSelector } from 'react-redux';
import { Grid } from '@material-ui/core';
import {
  useLocation
} from "react-router-dom";
import {
  createFabric,
  createFabricAsync,
  loadFabricsAsync
} from '../../features/fabricSlice'
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

export default function Fabrics(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  let location = useLocation();
  const path = location.pathname;
  let brandId = path.substr(path.lastIndexOf('/') + 1, path.length);
  if (brandId === 'fabrics') {
    brandId = false;
  }
  const fabrics = useSelector(state => {
    if (state?.fabric?.fabrics) {
      console.log('fabricslog', state.fabric.fabrics)
      return state.fabric.fabrics[brandId]
      //return state.fabric.fabrics
    }
  });
  if (!fabrics) {
    dispatch(loadFabricsAsync({ brandId }));
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
        {fabrics && fabrics.map(fabric => {
          return (
            <>
              <FabricView key={fabric.id} fabric={fabric} displayMode={props.displayMode} />
            </>
          )
        })}
        {/*(!fabrics || fabrics.length===0) &&
          <GenericListView
          image={placeHolderImage}
          title={intl.formatMessage({ id: 'createFabric' })}
          onClick={() => {
            props.setDisplayMode('detail');
            dispatch(createFabricAsync({brandId}));
          }} />
        */}
        <GenericListView
          image={placeHolderImage}
          title={intl.formatMessage({ id: 'createFabric' })}
          onClick={() => {
            props.setDisplayMode('detail');
            dispatch(createFabric({ brandId }));
          }} />
      </Grid>
    </div>
  );
}