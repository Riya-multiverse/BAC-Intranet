import * as React from 'react';
// import styles from './BacApp.module.scss';
import type { IBacAppProps } from './IBacAppProps';
import LeftNav from './MainLayout/LeftNav';
// import { escape } from '@microsoft/sp-lodash-s
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../styles/global.scss';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'material-symbols/index.css';
import TopNav from './MainLayout/TopNav';
import Footer from './MainLayout/Footer';
import Settings from './pages/settings';
import SectionOverview from './pages/SectionOverview';
import Layout from './MainLayout/Layout';
import News from './pages/NewsMaster/News';
// import * as feather from 'feather-icons';
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from './pages/dashboard';
// import ReactDOM from "react-dom/client";
// import { BrowserRouter, useLocation } from "react-router-dom";
import { APP_URL } from '../../../Shared/Constant';

import {
  HashRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
  HashRouter,

} from "react-router-dom";
import Faq from './pages/faq';


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
            <a href="dashboard.html" className="logo-light">
              <img src={require("../assets/logo-light.png")} alt="logo" className="logo-lg" style={{ display: isCollapsed ? 'none' : 'block' }} />
              <img src={require("../assets/logo-sm.png")} alt="small logo" className="logo-sm" style={{ display: isCollapsed ? 'block' : 'none' }} />
              {/* {!isCollapsed&&<img src={require("../assets/logo-light.png")} alt="logo" className="logo-lg"/>}
                       {isCollapsed&&<img src={require("../assets/logo-sm.png")} alt="small logo" className="logo-sm"/>} */}
            </a>
            <a href="dashboard.html" className="logo-dark">
              {!isCollapsed && <img src={require("../assets/logo-dark.png")} alt="dark logo" className="logo-lg" />}
              {isCollapsed && <img src={require("../assets/logo-sm.png")} alt="small logo" className="logo-sm" />}

            </a>
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

              {/* <BrowserRouter > */}
              <Layout />
              {/* </BrowserRouter> */}
              {/* <Faq/> */}

              {/* <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/Home" element={<Dashboard />} />
                <Route path="/Settings" element={<Settings />} />
                <Route path="/News" element={<News />} />
               
                <Route path="*" element={<h4>404 - Page Not Found</h4>} />
              </Routes> */}




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