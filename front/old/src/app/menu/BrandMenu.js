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
const collections=useSelector(state => {
  return state?.collection?.collections
})
const handleBrandOpenChange = brandId => {
  if (!collections || !collections[brandId]) {
    //dispatch(loadCollectionsAsync({brandId}));
  }
}
let location = useLocation();


const brandMenu=(brand)=>{
    return (
        <SubMenu key={brand.id} title={
          <Link to={'/collections/'+brand.id}>{brand.brandName}</Link>} 
          icon={<FaList />}
          onOpenChange={()=>handleBrandOpenChange(brand.id)}
          active={location.pathname.indexOf(brand.id)>-1}>

          {(!collections || !collections[brand.id]) &&
            <MenuItem><LinearProgress /></MenuItem>
          }
          {/*(collections && collections[brand.id]) &&
            collections[brand.id].map(collection=>{
                //COLLECTIONMENU
              return (
                <MenuItem>
                <Link to={'/products/'+collection.id}/>
                {collection.collectionName}
                </MenuItem>
              )

            })*/
          }
          <MenuItem onClick={()=>{
            setDisplayMode('detail');
            handleCreateCollection(brand.id)
            }}>
            {intl.formatMessage({ id: 'createCollection' })}<Link to={'/collections/'+brand.id} />
          </MenuItem>
        </SubMenu>
    )
}

export default brandMenu