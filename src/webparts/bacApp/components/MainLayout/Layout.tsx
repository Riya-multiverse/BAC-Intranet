import * as React from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import '../../../../styles/global.scss';
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
import QuickLink from '../pages/QuickLinksMaster/QuickLink';
import NewsMain from '../pages/News/NewsMain';
import TeamProfile from '../pages/TeamProfile';
import Announcement from '../pages/AnnouncementMaster/Announcement';
import UpcomingEvents from '../pages/UpcomingEvents';
import Suggestions from '../pages/Suggestions';
import ContactInformation from '../pages/ContactInformation';
import EmployeeRecognition from '../pages/EmployeeRecognition';
import Banner from '../pages/BannerMaster/Banner';
import Faq from '../pages/FaqMaster/Faq';
import Projects from '../pages/Project Master/Projects';
import TeamAchievements from '../pages/TeamAchievementsMaster/TeamAchievements';
import AboutTheDepartment from '../pages/AboutTheDepartment';
import Event from '../pages/EventMaster/Event';
import SuccessStories from '../pages/SuccessStoryMaster/SuccessStories';
import PhotoGallery from '../pages/PhotoGalleryMaster/PhotoGallery';

import NewsInternal from '../pages/News/NewsInternal';
import AnnouncementMain from '../pages/Announcement/AnnouncementMain';
import AnnouncementDetails from '../pages/Announcement/AnnouncementDetails';

// import Template from '../pages/TemplateAndFormsMaster/TemplateandForms';
import TrainingMaterial from '../pages/TrainingMaterialMaster/TrainingMaterial';
import PhotoGalleryMain from '../pages/PhotoGallery/PhotoGalleryMain';
import PhotoGalleryInternal from '../pages/PhotoGallery/PhotoGalleryInternal';
import Template from '../pages/TemplateAndFormsMaster/TemplateandForms';
import QuickLinks from '../pages/QuickLinks';
import ProjectsMain from '../pages/ProjectsMain';
import TemplateandForms from '../pages/TemplatesandForms';
import TrainingMaterials from '../pages/TrainingMaterials';
import PolicyandProcedures from '../pages/PolicyandProcedures';
import ResouceDashboard from '../pages/ResourceDashboard';
import PolicyandProcedure from '../pages/PolicyandProcedureMaster/PolicyandProcedure';
import EmployeeRecognitions from '../pages/EmployeeRecognitionMaster/EmployeeRecognition'

const Layout = () => {

  return (

    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/Home" element={<Dashboard />} />
      <Route path="/Settings" element={<Settings />} />
      <Route path="/NewsMaster" element={<News />} />
      <Route path="/News" element={<NewsMain />} />
      <Route path="/Announcements" element={<AnnouncementMain />} />
      <Route path="/AnnouncementsDetails" element={<AnnouncementDetails />} />
      <Route path="/NewsDetails" element={<NewsInternal />} />
      <Route path="/FAQs" element={<FAQ />} />
      <Route path="/SectionOverview" element={<SectionOverview />} />
      <Route path="/QuickLinksMaster" element={<QuickLink />} />
      <Route path="/TeamProfile" element={<TeamProfile />} />
      <Route path="/UpcomingEvents" element={<UpcomingEvents />} />
      <Route path="/AnnouncementMaster" element={<Announcement />} />
      <Route path="/BannerMaster" element={<Banner />} />
      <Route path="/ProjectMaster" element={<Projects />} />
      <Route path="/FAQMaster" element={<Faq />} />
      <Route path="/TeamAchievementMaster" element={<TeamAchievements />} />
      <Route path="/EventMaster" element={<Event />} />
      <Route path="/SuccessStoriesMaster" element={<SuccessStories />} />
      <Route path="/PhotoGalleryMaster" element={<PhotoGallery />} />
      <Route path="/Suggestions" element={<Suggestions />} />
      <Route path="/ContactInformation" element={<ContactInformation />} />
      <Route path="/AboutTheDepartment" element={<AboutTheDepartment />} />
      <Route path="/EmployeeRecognition" element={<EmployeeRecognition />} />
      <Route path="/EmployeeRecognitionMaster" element={<EmployeeRecognitions />} />
      <Route path="/TemplatesandFormsMaster" element={<Template />} />
      <Route path="/TemplatesandForms" element={<TemplateandForms />} />
      <Route path="/TrainingMaterialsMaster" element={<TrainingMaterial />} />
      <Route path="/TrainingMaterials" element={<TrainingMaterials />} />
      <Route path="/PhotoGallery" element={<PhotoGalleryMain />} />
      <Route path="/PhotoGalleryInternal" element={<PhotoGalleryInternal />} />
      <Route path="/QuickLinks" element={<QuickLinks />} />
      <Route path="/Projects" element={<ProjectsMain />} />
      <Route path="/PolicyandProcedures" element={<PolicyandProcedures />} />
      <Route path="/ResourceDashboard" element={<ResouceDashboard />} />
       <Route path="/PolicyandProceduresMaster" element={<PolicyandProcedure />} />

      <Route
        path="*"
        element={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100vh",
              backgroundColor: "#f4f6f8",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            }}
          >
            <div
              style={{
                textAlign: "center",
                background: "white",
                padding: "60px 40px",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                maxWidth: "400px",
                color: "#333",
              }}
            >
              <h1 style={{ fontSize: "80px", margin: 0, color: "#0078d4" }}>404</h1>
              <h2 style={{ margin: "10px 0 20px" }}>Page Not Found</h2>
              <p style={{ marginBottom: "30px", color: "#666" }}>
                The page you’re looking for doesn’t exist or has been moved.
              </p>
              <a
                href="#/Home"
                style={{
                  display: "inline-block",
                  padding: "10px 24px",
                  backgroundColor: "#0078d4",
                  color: "#fff",
                  textDecoration: "none",
                  borderRadius: "6px",
                  fontWeight: 500,
                }}
              >
                Go to Home
              </a>
            </div>
          </div>
        }
      />

    </Routes>

  );
}

export default Layout