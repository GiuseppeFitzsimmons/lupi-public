import logo from './logo.svg';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation
} from "react-router-dom";
import About from './app/screens/About';
import Login from './app/screens/Login';
import Brands from './app/screens/Brands';
import { useSelector } from 'react-redux';

const tokens = localStorage.getItem('tokens');
const currentBrandId = localStorage.getItem('currentBrandId');

function App() {
  return (
    <>
      {(!tokens && currentBrandId===null) && <Login />}
      <Switch>
        <Route path="/about">
          <About />
        </Route>
        <Route path="/brands">
          <Brands />
        </Route>
        <Route path="/">
          <Brands />
        </Route>
      </Switch>
    </>
  );
}

export default App;
