import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import {
  ProSidebar,
  Menu,
  MenuItem,
  SubMenu,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from 'react-pro-sidebar';
import { FaTachometerAlt, FaGem, FaList, FaGithub, 
  FaRegLaughWink, FaHeart, FaAngleDoubleLeft, 
  FaAngleDoubleRight,
  FaBootstrap } from 'react-icons/fa';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  createBrand,
  loadBrandsAsync
  } from '../features/brandSlice';
import {
  createCollection,
  createCollectionAsync,
  loadCollectionsAsync
} from '../features/collectionSlice';
import {
  createProduct,
  createProductAsync,
  loadProductsAsync
} from '../features/productSlice';
import {
  createFabric,
  createFabricAsync,
  loadFabricsAsync
} from '../features/fabricSlice';
import {
  createFourniture,
  createFournitureAsync,
  loadFournituresAsync
} from '../features/fournitureSlice';
import LinearProgress from '@material-ui/core/LinearProgress';
import { createUser, createUserAsync, loadUsersAsync } from '../features/userSlice';
import Button from '@material-ui/core/Button';


//Many cool customisation features here: //https://reactjsexample.com/customizable-and-responsive-react-sidebar-library-with-dropdown-menus/
const LupiMenu = ({ image, rtl, toggled, handleToggleSidebar, setDisplayMode }) => {
  console.log('menurender')
  const intl = useIntl();
  const dispatch = useDispatch();
  const history = useHistory();
  const handleCollapsedChange=()=>{
    setCollapsed(!collapsed)
  }
  const handleCreateFabric = ()=> {
    if (fabrics) {
      //Wait until fabrics, if any, have loaded.
      dispatch(createFabricAsync());
    }
  }
  const handleCreateUser = (brandId)=> {
    if (users) {
      console.log('handleCreateUser', brandId)
      //Wait until users, if any, have loaded.
      dispatch(createUserAsync(brandId));
    }
  }
  const handleCreateCollection = (brandId) => {
    dispatch(createCollection({brandId}))
  }
  const handleCreateProduct = (collectionId) => {
    dispatch(createProductAsync({collectionId}))
  }
  const handleCreateFourniture = (brandId) => {
    dispatch(createFournitureAsync({brandId}))
  }
  const [collapsed, setCollapsed]=useState(false);
  const tokens = useSelector(state=>{
    return state?.login?.tokens
  })
  const fabrics=useSelector(state => {
    return state?.fabric?.fabrics
  })
  const currentBrandId = localStorage.getItem('currentBrand');
  const theBrand = useSelector(state=>{
    if (currentBrandId) {
        return state?.brand?.brands?.find(b=>b?.id===currentBrandId)
    }
  });
  if (!theBrand && tokens) {
      //dispatch(loadBrandsAsync());
  }
  const users=useSelector(state => {
    if (currentBrandId && state?.user?.users[currentBrandId]){
      return state?.user?.users[currentBrandId]
    } else return null
  })
  const collections=useSelector(state => {
    return state?.collection?.collections
  })
  const products=useSelector(state=>{
    return state?.product?.products
  })
  const fournitures=useSelector(state=>{
    return state?.fourniture?.fournitures
  })
  if (!fabrics && tokens){
    //dispatch(loadFabricsAsync());
  }
  const handleFabricOpenChange = open => {
    if (open && !fabrics) {
      //dispatch(loadBrandsAsync());
    }
  }
  const handleBrandOpenChange = brandId => {
    if ((!collections || !collections[brandId])&&tokens) {
      //dispatch(loadCollectionsAsync({brandId}));
    }
  }
  const handleCollectionOpenChange = collectionId => {
    if ((!products || !products[collectionId])&&tokens) {
      //dispatch(loadProductsAsync({collectionId}));
    }
  }
  const handleUserOpenChange = brandId => {
    if ((!users || !users[brandId])&&tokens) {
      //dispatch(loadUsersAsync({brandId}));
    }
  }
  const handleFournitureOpenChange = brandId => {
    if ((!fournitures || !fournitures[brandId])&&tokens) {
      //dispatch(loadUsersAsync({brandId}));
    }
  }
  let location = useLocation();

  const collectionsMenu = () => {
    if (currentBrandId) {
      return (
      <SubMenu key={currentBrandId} title={
        <Link to={'/collections/'+currentBrandId}>{intl.formatMessage({ id: 'collections' })}</Link>} 
        icon={<FaList />}
        onOpenChange={()=>handleBrandOpenChange(currentBrandId)}
        active={location.pathname.indexOf(currentBrandId)>-1}>

        {(!collections || !collections[currentBrandId]) &&
          <MenuItem><LinearProgress /></MenuItem>
        }
        {(collections && collections[currentBrandId]) &&
          collections[currentBrandId].map(collection=>{
            //console.log('mapped collection', collection)
            return(
              <SubMenu key={collection.id} title={
                <Link to={'/products/'+currentBrandId+'/products/'+collection.id}>{collection.collectionName}</Link>}
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
                        <Link to={'/products/'+currentBrandId+'/products/'+collection.id} replace/>
                          {product.productName}
                      </MenuItem>
                    )
                  })
                }
                {/*<MenuItem
                onClick={()=>{
                  setDisplayMode('detail')
                  handleCreateProduct(collection.id)
                }}
                >
                  {intl.formatMessage({id:'createProduct'})}<Link to={'/products/'+collection.id} />
              </MenuItem>*/}
              </SubMenu>
            )
          })
        }
        {/*<MenuItem onClick={()=>{
          setDisplayMode('detail');
          handleCreateCollection(currentBrandId)
          }}>
          {intl.formatMessage({ id: 'createCollection' })}<Link to={'/collections/'+currentBrandId} />
        </MenuItem>*/}
      </SubMenu>
      )
    } else {
      return <></>
    }
  }
  const fabricsMenu = () => {
    if (currentBrandId) {
      return (
        <SubMenu title={
          <Link to={'/fabrics/'+currentBrandId}>{intl.formatMessage({ id: 'fabrics' })}</Link>} icon={<FaList />}
          onOpenChange={handleFabricOpenChange}>
          {fabrics && fabrics.map( fabric => {
              return (
                  <SubMenu key={fabric.id} title={
                    <Link to={'/fabrics/'+fabric.id}>{fabric.fabricName}</Link>} 
                    icon={<FaList />}
                    onOpenChange={()=>handleFabricOpenChange(fabric.id)}
                    active={location.pathname.indexOf(fabric.id)>-1}>
                  </SubMenu>
              )
          })}
          {!fabrics &&
            <MenuItem><LinearProgress /></MenuItem>
          }
          <MenuItem onClick={()=>{
            setDisplayMode('list');
            handleCreateFabric();
            }}>
            {intl.formatMessage({ id: 'createFabric' })}<Link to="/fabrics" />
          </MenuItem>
        </SubMenu>
      )
    } else {
      return <></>
    }
  }
  const fournituresMenu = () => {
    if (currentBrandId) {
      return (
        <SubMenu title={
          <Link to={'/fournitures/'+currentBrandId}>{intl.formatMessage({ id: 'fournitures' })}</Link>} icon={<FaList />}
          onOpenChange={handleFournitureOpenChange}>
          {fournitures && Array.isArray(fournitures) && fournitures.map( fourniture => {
              return (
                  <SubMenu key={fourniture.id} title={
                    <Link to={'/fournitures/'+fourniture.id}>{fourniture.fournitureName}</Link>} 
                    icon={<FaList />}
                    onOpenChange={()=>handleFournitureOpenChange(fourniture.id)}
                    active={location.pathname.indexOf(fourniture.id)>-1}>
                  </SubMenu>
              )
          })}
          {!fournitures &&
            <MenuItem><LinearProgress /></MenuItem>
          }
          <MenuItem onClick={()=>{
            setDisplayMode('list');
            handleCreateFourniture();
            }}>
            {intl.formatMessage({ id: 'createFourniture' })}<Link to="/fournitures" />
          </MenuItem>
        </SubMenu>
      )
    } else {
      return <></>
    }
  }
  const usersMenu = () => {
    if (currentBrandId) {
      return (
//<Link to={'/collections/'+currentBrandId+'/products/'+collection.id}>{collection.collectionName}</Link>
        <SubMenu title={
          <Link to={'/users/'+currentBrandId}>{intl.formatMessage({ id: 'users' })}</Link>} icon={<FaList />}
        >
          {users && users.map( user => {
            console.log('lupimenu user', user)
              return (
                  <SubMenu key={user?.user?.id} title={
                    <Link to={'/users/'+currentBrandId}>{user?.user?.id}</Link>} 
                    icon={<FaList />}
                    onOpenChange={()=>handleUserOpenChange(currentBrandId)}
                    active={location.pathname.indexOf(currentBrandId)>-1}>
                  </SubMenu>
              )
          })}
          {!users &&
            <MenuItem><LinearProgress /></MenuItem>
          }
        </SubMenu>
      )
    } else {
      return <></>
    }
  }

  /* 
          <MenuItem onClick={()=>{
            setDisplayMode('list');
            handleCreateUser({brandId:currentBrandId});
            }}>
            {intl.formatMessage({ id: 'addUser' })}<Link to={'/users/'+currentBrandId} />
          </MenuItem>
   */

  return (
    <ProSidebar
      collapsed={collapsed}
      toggled={toggled}
      breakPoint="md"
      onToggle={handleToggleSidebar}
      style={{marginRight:'0x'}}
    >
      
      <SidebarHeader  style={{textAlign:'right'}}>
        {collapsed ? 
          <FaAngleDoubleRight onClick={handleCollapsedChange}/>
          :
          <FaAngleDoubleLeft onClick={handleCollapsedChange}/>
        }
      </SidebarHeader>

      <SidebarContent>
        <Menu iconShape="circle">
          {collectionsMenu()}
          {fabricsMenu()}
          {usersMenu()}
          {fournituresMenu()}
        </Menu>
      </SidebarContent>

      <SidebarFooter style={{ textAlign: 'center' }}>
      <div
          className="sidebar-btn-wrapper"
          style={{
            padding: '20px 24px',
            cursor: 'pointer'
          }}
          onClick={()=>{
            history.push('/brands/'+theBrand.id);
            //TODO: This is where we need to be setting the current brand from the menu
            //localStorage.setItem('currentBrand', theBrand)
          }}
        >
        {theBrand && theBrand.image &&
          <img src={theBrand.image} style={{height:'14px', background:'white', marginRight:'2px'}}/>
        }
        {theBrand ? theBrand.brandName : ''}
        </div>
      </SidebarFooter>
    </ProSidebar>
  );
};

export default LupiMenu;