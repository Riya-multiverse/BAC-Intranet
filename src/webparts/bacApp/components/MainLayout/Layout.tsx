import * as React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../styles/global.scss';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'material-symbols/index.css';
import { useRoutes } from "react-router-dom";
import Dashboard from '../pages/dashboard';
import FAQ from '../pages/faq';

import News from '../pages/NewsMaster/News';
// import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Settings from '../pages/settings';
import { useLocation } from "react-router-dom";
import {
  HashRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
} from "react-router-dom";
import SectionOverview from '../pages/SectionOverview';
import QuickLink from '../pages/QuickLinks/QuickLink';
import NewsMain from '../pages/News/NewsMain';
import TeamProfile from '../pages/TeamProfile';
import Announcement from '../pages/AnnouncementMaster/Announcement';
import UpcomingEvents from '../pages/UpcomingEvents';

const Layout = () => {

  return (

    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/Home" element={<Dashboard />} />
      <Route path="/Settings" element={<Settings />} />
      <Route path="/NewsMaster" element={<News />} />
      <Route path="/News" element={<NewsMain />} />
      <Route path="/FAQs" element={<FAQ />} />
      <Route path="/SectionOverview" element={<SectionOverview />} />
      <Route path="/QuickLinksMaster" element={<QuickLink />} />
      <Route path="/TeamProfile" element={<TeamProfile />} />
      <Route path="/UpcomingEvents" element={<UpcomingEvents />} />
      <Route path="/AnnouncementMaster" element={<Announcement />} />
      <Route path="*" element={<h4>404 - Page Not Found</h4>} />
    </Routes>

  );
}

export default Layout