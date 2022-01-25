import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useIntl } from 'react-intl';
import CollectionView from '../components/CollectionView';
import { useSelector, useDispatch } from 'react-redux';
import { Grid } from '@material-ui/core';
import {
  useLocation
} from "react-router-dom";
import { createCollection, createCollectionAsync, loadCollectionsAsync } from '../../features/collectionSlice';
import GenericListView from '../components/GenericListView';
import { loadBrandsAsync } from '../../features/brandSlice';
import CurrentBrandHeader from '../components/CurrentBrandHeader';


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

export default function Collections(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  let location = useLocation();
  const path = location.pathname;
  let collectionId = path.substr(path.lastIndexOf('/') + 1, path.length);
  let brandId
  if (path.lastIndexOf('products')>-1){
    brandId = path.substr(path.indexOf('collections/') + 12, path.lastIndexOf('/products') - 13);
  } else {
    brandId = path.substr(path.indexOf('collections/') + 12, path.length)
  }
  console.log('aaa brandId', brandId)
  const collections = useSelector(state => {
      if (state?.collection?.collections) {
        //console.log('aaa collections', JSON.stringify(state.collection.collections[brandId]))
          return state.collection.collections[brandId];
      }
    })
  if (!collections) {
    console.log('aaa loading collections, brandId:', brandId)
    dispatch(loadCollectionsAsync({brandId}));
  }
  const brand=useSelector(state => {
    if (state?.brand?.brands) {
        return state.brand.brands.find(brand=>brand.id===brandId);
    }
  })
  if (!brand) {
    dispatch(loadBrandsAsync());
  }
  const products = useSelector(state=>{
    if (state?.product?.products){
      return state?.product?.products[collectionId]
    }
  })
  const mode = 'EDIT';//TODO user has the right to edit
  const intl = useIntl();

  return (
    <div className={classes.root}>
      <CurrentBrandHeader />
    <Grid container spacing={3} style={{height:'95vh', padding:'12px'}} key='collectionGrid'>
        {collections && collections.map(collection => {
            return (
              <CollectionView key={collection.id} collection={collection} displayMode={props.displayMode}/>
            )
          })}
          {(!collections || (collections && collections.length===0)) && 
            <>noCollections</>
          }
          <GenericListView
            image={placeHolderImage}
            colour='purple'
            title={intl.formatMessage({ id: 'createCollection' })}
            onClick={() => {
              props.setDisplayMode('detail');
              dispatch(createCollection({brandId}));
            }} />
      </Grid>
    </div>
  );
}
/*
            <GenericListView
            image={placeHolderImage}
            colour='purple'
            title={intl.formatMessage({ id: 'createCollection' })}
            onClick={() => {
              props.setDisplayMode('detail');
              dispatch(createCollection({brandId}));
            }} />
*/