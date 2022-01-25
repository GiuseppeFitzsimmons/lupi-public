import React, { useEffect, useState } from 'react';
import './App.css';
import 'react-pro-sidebar/dist/css/styles.css';
//https://react-icons.github.io/react-icons/icons?name=fa
import LupiMenu from './app/LupiMenu';
//import Switch from 'react-switch';
import './App.scss';
import { useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux'
//https://material-ui.com/getting-started/usage/
import Login from './app/screens/Login'
import About from './app/screens/About';
import Register from './app/screens/Register';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation
} from "react-router-dom";
import Brands from './app/screens/Brands';
import Collections from './app/screens/Collections';
import Products from './app/screens/Products';
import Fabrics from './app/screens/Fabrics';
import Users from './app/screens/Users';
import Fournitures from './app/screens/Fournitures';
import LupiAppBar from './app/components/LupiAppBar';
import BrandSelector from './app/components/BrandSelector';
import { Container, Panel } from 'react-scrolling-panel';

function App() {
  const dispatch = useDispatch();
  var loggedIn = useSelector(state => {
    let result = localStorage.getItem('tokens');
    console.log("is logged in ", JSON.parse(result), (result != null));
    return result != null;
  });
  var currentBrandId = localStorage.getItem('currentBrand');
  console.log('currentBrand', currentBrandId)
  const [locale, setLocale] = useState('fr');
  const handleToggleSidebar = () => {

  }
  const [collapsed, setCollapsed] = useState(false);
  let location = useLocation();
  const path = location.pathname;
  const intl = useIntl();

  const [displayMode, setDisplayMode] = useState('list');
  useEffect(()=>{
    console.log('displayMode', displayMode)
  },[displayMode])
  console.log('showLogger',
  ((loggedIn!==true || !currentBrandId)&&path!=='/register'),
  'loggedIn', loggedIn,
  'currentBrandId', currentBrandId
  )
  /*
  useEffect(()=>{
    //console.log('showLogin', ((loggedIn!==true || !currentBrandId)&&path!='/register'))
    if (!currentBrandId){
      console.log('would show now')
    }
  },[currentBrandId])
  */
return (
    <div className={`app `} style={{width:'100%'}}>
      {((loggedIn!==true || !currentBrandId)&&path!=='/register')&&<Login shown={((loggedIn!==true || !currentBrandId)&&path!=='/register')} />}
      <LupiMenu setDisplayMode={setDisplayMode}/>
      <div style={{width:'100%'}}>
        <div>
          <LupiAppBar setDisplayMode={setDisplayMode} displayMode={displayMode}/>
        </div>
        <div>
          <Switch>
            <Route path="/about">
              <About />
            </Route>
            <Route path="/brands">
              <Brands  displayMode={displayMode} setDisplayMode={setDisplayMode}/>
            </Route>
            <Route path="/collections">
              <Collections  displayMode={displayMode} setDisplayMode={setDisplayMode}/>
            </Route>
            <Route path="/products">
              <Products  displayMode={displayMode} setDisplayMode={setDisplayMode}/>
            </Route>
            <Route path="/fabrics">
              <Fabrics  displayMode={displayMode} setDisplayMode={setDisplayMode}/>
            </Route>
            <Route path="/fournitures">
              <Fournitures  displayMode={displayMode} setDisplayMode={setDisplayMode}/>
            </Route>
            <Route path="/users">
              <Users  displayMode={displayMode} setDisplayMode={setDisplayMode}/>
            </Route>
            <Route path="/register">
              {!loggedIn &&
                <Register />
              }
              {loggedIn &&
                <About loggedIn={loggedIn} />
              }
            </Route>
            <Route path="/users">
              <About loggedIn={loggedIn}/>
            </Route>
            <Route path="/">
              <div>location {path}</div>
            </Route>
          </Switch>
        </div>
      </div>
    </div>
  );
}

export default App;
