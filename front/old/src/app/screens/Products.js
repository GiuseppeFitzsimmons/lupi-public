import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useIntl } from 'react-intl';
import ProductView from '../components/ProductView';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { Grid } from '@material-ui/core';
import {
  useLocation
} from "react-router-dom";
import { loadCollectionsAsync } from '../../features/collectionSlice';
import { createProduct, createProductAsync, loadProductsAsync } from '../../features/productSlice';
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

export default function Products(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  let location = useLocation();
  const path = location.pathname;
  const brands = useSelector(state => state?.brand?.brands);
  if (!brands) {
    dispatch(loadBrandsAsync());
  }
  let collectionId = path.substr(path.lastIndexOf('/') + 1, path.length);
  let brandId = path.substr(path.indexOf('products/') + 9, path.lastIndexOf('/products') - 10);
  const products = useSelector(state => {
    console.log("PRODUCTS", state.product);
      if (state?.product?.products) {
        console.log('state.product.products[collectionId]', state.product.products[collectionId])
          return state.product.products[collectionId];
      }
    })
  if (!products) {
    dispatch(loadProductsAsync({collectionId}));
  }
  const theCollection=useSelector(state => {
    let collectionObject = {}
    if (state?.collection?.collections[brandId] && state?.collection?.collections[brandId].length>0) {
      for (var i in state?.collection?.collections[brandId]){
        if (state?.collection?.collections[brandId][i].id == collectionId){
          collectionObject = state?.collection?.collections[brandId][i]
        }
      }
    }
    return collectionObject
    })
  if (!theCollection) {
    //dispatch(loadCollectionsAsync({collectionId}));
  }

  const mode = 'EDIT';//TODO user has the right to edit
  const intl = useIntl();
  return (
    <div className={classes.root}>
      <CurrentBrandHeader />
    <Grid container spacing={3} style={{height:'95vh', padding:'12px'}}>
        {products && products.map(product => {
            return (
              <ProductView key={product.id} product={product} displayMode={props.displayMode}/>
            )
          })}
          {(!products || (products && products.length===0)) && 
            <GenericListView
            image={placeHolderImage}
            colour='purple'
            title={intl.formatMessage({ id: 'createProduct' })}
            onClick={() => {
              //props.setDisplayMode('detail')
              dispatch(createProductAsync({collectionId}));
            }} />
          }
      </Grid>
    </div>
  );
}