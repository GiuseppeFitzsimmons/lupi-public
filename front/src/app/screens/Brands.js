import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useIntl } from 'react-intl';
import BrandView from '../components/BrandView';
import { useDispatch, useSelector } from 'react-redux';
import { Grid } from '@material-ui/core';
import {
    useLocation
} from "react-router-dom";
import GenericListView from '../components/GenericListView';
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

export default function Brands(props) {
    const classes = useStyles();
    const dispatch = useDispatch();
    const brands = useSelector(state => {
        console.log('state', state);
        return state?.brands
    });
    //CHANGE OF PLAN - example: accessing /collections loads products no matter what, there are no more conditions for loading stuff
    // this should reduce octuple-call situations if they are indeed related to state updates

    //LOAD_BRANDS is dispatched from the LOGIN middleware
    
    const mode = 'EDIT';//TODO user has the right to edit
    let location = useLocation();
    const path = location.pathname;
    let brandId = path.substr(path.lastIndexOf('/') + 1, path.length);
    if (brandId === 'brands') {
        brandId = false;
    }
    const intl = useIntl();
    console.log('brands', brands)

    return (
        <div className={classes.root}>
            <Grid container spacing={3} style={{ height: '95vh' }}>
                {brands && brands.map(brand => {
                    console.log('mapping', brand)
                    return (
                        <BrandView key={brand.id} brand={brand} displayMode={props.displayMode}/>
                        //<BrandView key={brand.id} brand={brand} displayMode={'wizard'} editing={true}/>
                    )
                })}
                {(!brands || brands?.length === 0) &&
                    <GenericListView
                        image={placeHolderImage}
                        title={intl.formatMessage({ id: 'createBrand' })}
                        onClick={() => {
                            props.setDisplayMode('detail');
                            //dispatch(createBrand());
                        }} />
                }
            </Grid>
        </div>
    );
}