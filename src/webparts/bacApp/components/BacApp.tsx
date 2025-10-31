import * as React from 'react';
// import styles from './BacApp.module.scss';
// import type { IBacAppProps } from './IBacAppProps';
import LeftNav from './MainLayout/LeftNav';
// import { escape } from '@microsoft/sp-lodash-s
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../../styles/global.scss';
import '../../../styles/bootstrap.min.scss';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'material-symbols/index.css';
import TopNav from './MainLayout/TopNav';
import Footer from './MainLayout/Footer';

import Layout from './MainLayout/Layout';



import {
  HashRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
  HashRouter,

} from "react-router-dom";



const BacApp = () => {
  const elementRef = React.useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  // const location = useLocation();

  // React.useEffect(()=>{

  // },[location])

  const toggleMenu = () => {
    setIsCollapsed(!isCollapsed);
  };
  return (
    //  <Router>
    <HashRouter>


      <div id="wrapper" ref={elementRef}>
        <div
          className={`app-menu ${isCollapsed ? 'collapsed' : ''}`}
          id="myHeader">
          <div className="logo-box">
            
            <NavLink to="/Home" className="logo-light">
              <img
                src={require("../assets/logo-light.png")}
                alt="logo"
                className="logo-lg"
                style={{ display: isCollapsed ? "none" : "block" }}
              />
              <img
                src={require("../assets/logo-sm.png")}
                alt="small logo"
                className="logo-sm"
                style={{ display: isCollapsed ? "block" : "none" }}
              />
            </NavLink>

            <NavLink to="/Home" className="logo-dark">
              {!isCollapsed && (
                <img
                  src={require("../assets/logo-dark.png")}
                  alt="dark logo"
                  className="logo-lg"
                />
              )}
              {isCollapsed && (
                <img
                  src={require("../assets/logo-sm.png")}
                  alt="small logo"
                  className="logo-sm"
                />
              )}
            </NavLink>
          </div>


          <LeftNav isCollapsed={isCollapsed} />
        </div>
        {/* <div className="content-page"> */}
        <div className={`content-page ${isCollapsed ? 'collapsed' : ''}`}>
          {/*  */}
          {/* topnav bar */}
          <TopNav toggleMenu={toggleMenu} isCollapsed={isCollapsed} />
          {/*  */}
          <div className='content'>

            <div className="container-fluid">

              {/* main content goes here */}

             
              <Layout />
             
              




            </div>
            <Footer />

          </div>
        </div>
      </div>
      {/* </Router> */}
    </HashRouter>

  )
}

export default BacApp