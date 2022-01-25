import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import {
  Menu,
  MenuItem,
  SubMenu,
} from 'react-pro-sidebar';
import { FaList} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import LinearProgress from '@material-ui/core/LinearProgress';



const intl = useIntl();
const dispatch = useDispatch();
const handleCollectionOpenChange = collectionId => {
    if (!products || !products[collectionId]) {
      dispatch(loadProductsAsync({collectionId}));
    }
  }
let location = useLocation();



const collectionMenu = (collection)=>{
    return(
        <SubMenu key={collection.id} title={
          <Link to={'/products/'+collection.id}>{collection.collectionName}</Link>}
          icon={<FaList/>}
          onOpenChange={()=>{handleCollectionOpenChange(collection.id)}}
          active={location.pathname.indexOf(collection.id)>-1}
        >
          {(!products || !products[collection.id]) &&
          <MenuItem><LinearProgress/></MenuItem>
          }
          {(products && products[collection.id])&&
            products[collection.id].map(product=>{
              return(
                <MenuItem key={product.id}>
                  <Link to={'/products/'+collection.id}/>
                    {product.productName}
                </MenuItem>
              )
            })
          }
          <MenuItem
          onClick={()=>{
            setDisplayMode('detail')
            handleCreateProduct(collection.id)
          }}
          >
            {intl.formatMessage({id:'createProduct'})}<Link to={'/products/'+collection.id} />
          </MenuItem>
        </SubMenu>
      )
}
export default collectionMenu