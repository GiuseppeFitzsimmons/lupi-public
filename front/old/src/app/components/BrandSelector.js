import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useIntl } from 'react-intl';
import BrandView from './BrandView';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, LinearProgress } from '@material-ui/core';
import {
  useLocation
} from "react-router-dom";
import {
  setBrandCurrent,
  loadBrandsAsync,
  switchBrand
  } from '../../features/brandSlice'
import GenericListView from './GenericListView';
import { useHistory } from 'react-router-dom';
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
//Sort of a workaround - if it's already been dispatched, don't dispatch it again.
var dispatched=false;

export default function BrandSelector(props) {
  const history = useHistory();
  const classes = useStyles();
  const dispatch = useDispatch();
  const brands = useSelector(state => {console.log('brandselector',state);return state?.brand?.brands});
  console.log('brandLogger', dispatched, brands)
  //const newBrands = useEffect(()=>dispatch(loadBrandsAsync()),[brands])
  if (!brands && !dispatched) {
    dispatched=true;
    console.log('brandselector dispatch loadBrandsAsync')
    dispatch(loadBrandsAsync());
  }
  const mode = 'EDIT';//TODO user has the right to edit
  let location = useLocation();
  const path = location.pathname;
  let brandId = path.substr(path.lastIndexOf('/') + 1, path.length);
  if (brandId === 'brands') {
    brandId = false;
  }
  const intl = useIntl();

  return (
    <div className={classes.root}>
      <Grid container spacing={3} style={{height:'95vh'}}>
        {!brands &&
        <LinearProgress/>
        }
        {brands && brands.map(brand => {
            return (
                <button
                key={brand.id}
                onClick={()=>{
                    history.push('/collections/'+brand.id);
                    dispatch(setBrandCurrent(brand));
                }}
                >
                {brand.brandName}
              </button>
            )
        })}
        {(!brands && brands?.length===0) && 
          <>NO BRANDS</>
        }
      </Grid>
    </div>
  );
}