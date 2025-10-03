import * as React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../../../styles/global.scss';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'material-symbols/index.css';
import { getSP } from '../../loc/pnpjsConfig';
import { SPFI } from '@pnp/sp';
import "@pnp/sp/items/get-all";
// import { getLeftNavitems } from '../../../../APIService/LeftNavService';


interface ILeftNavProps {
  isCollapsed: boolean;
}



const LeftNav: React.FC<ILeftNavProps> = ({ isCollapsed }) => {
  const sp: SPFI = getSP();

  React.useEffect(() => {
  fetchData();
}, []);

 const getLeftNavitems = async () => {

    let arr: any[] = []
    let arrs: any[] = []
    let bannerimg: any[] = []
    await sp.web.lists.getByTitle("BACSidebarNavigation").
    items.select("*").filter("IsActive eq 1").getAll()
      .then((res:any) => {
        console.log(res, ' let arrs=[]');
       
 
        //  arr.push(res)
        arr = res;
      })
      .catch((error: any) => {
        console.log("Error fetching data: ", error);
      });
    console.log(arr, 'arr');
    return arr;
  }
const fetchData = async () => {
  try {
    const sideNav = await getLeftNavitems();
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
  return (
    // <!-- menu-left -->
     <div className={` scrollbar mt-1 left-nav ${isCollapsed ? 'collapsed' : ''}`}>
    {/* // <div className="scrollbar mt-1"> */}

      {/* <!-- User box --> */}
      {/* <div className="user-box text-center">
                        <img src="assets/images/users/user-1.jpg" alt="user-img" title="Mat Helme" className="rounded-circle avatar-md"/>
                        <div className="dropdown">
                            <a href="javascript: void(0);" className="dropdown-toggle h5 mb-1 d-block" data-bs-toggle="dropdown">Geneva Kennedy</a>
                            <div className="dropdown-menu user-pro-dropdown">

                               
                                <a href="javascript:void(0);" className="dropdown-item notify-item">
                                    <i className="fe-user me-1"></i>
                                    <span>My Account</span>
                                </a>

                                
                                <a href="javascript:void(0);" className="dropdown-item notify-item">
                                    <i className="fe-settings me-1"></i>
                                    <span>Settings</span>
                                </a>

                                
                                <a href="javascript:void(0);" className="dropdown-item notify-item">
                                    <i className="fe-lock me-1"></i>
                                    <span>Lock Screen</span>
                                </a>

                                
                                <a href="javascript:void(0);" className="dropdown-item notify-item">
                                    <i className="fe-log-out me-1"></i>
                                    <span>Logout</span>
                                </a>

                            </div>
                        </div>
                        <p className="text-muted mb-0">Admin Head</p>
                    </div> */}

      {/* <!--- Menu --> */}
      <ul className="menu">


        <li className="menu-item">
          <a href="dashboard.html" className="menu-link" >
            <span className="menu-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-airplay"><path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"></path><polygon points="12 15 17 21 7 21 12 15"></polygon></svg></span>
            <span className="menu-text"> Home </span>

          </a>
          
        </li>


       
        <li className="menu-item">
          <a href="news-feed.html" className="menu-link">
            <span className="menu-icon"><i className="fe-file font-16"></i></span>
            <span className="menu-text"> News </span>

          </a>

        </li>
        <li className="menu-item">
          <a href="announcements.html" className="menu-link">
            <span className="menu-icon"><i className="fe-bell font-16"></i></span>
            <span className="menu-text"> Announcements </span>

          </a>

        </li>
        {/* <li className="menu-item">
          <a href="Strategy-dashboard.html" className="menu-link">
            <span className="menu-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-activity"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg></span>
            <span className="menu-text"> Strategy </span>

          </a>

        </li> */}
        <li className="menu-item">
          <a href="#menuTasks6" data-bs-toggle="collapse" className="menu-link">
            <span className="menu-icon"><i className="fe-user"></i></span>

            <span className="menu-text"> Department Profile</span>
            <i className="material-symbols-outlined font-16 ms-1">expand_more</i>
          </a>
          <div className="collapse" id="menuTasks6">
            <ul className="sub-menu">
              <li className="menu-item">
                <a href="about-the-department.html" className="menu-link">
                  <span className="menu-text">About the Department</span>
                </a>
              </li>
              <li className="menu-item">
                <a href="Section-Overview.html" className="menu-link">
                  <span className="menu-text">Section Overview</span>
                </a>
              </li>

              <li className="menu-item">
                <a href="team-profile.html" className="menu-link">
                  <span className="menu-text">Team Profile</span>
                </a>
              </li>

              <li className="menu-item">
                <a href="upeventnew.html" className="menu-link">
                  <span className="menu-text">Upcoming Events </span>
                </a>
              </li>
              <li className="menu-item">
                <a href="Suggestions.html" className="menu-link">
                  <span className="menu-text">Suggestions </span>
                </a>
              </li>
              <li className="menu-item">
                <a href="Employee-Recognition.html" className="menu-link">
                  <span className="menu-text">Employee Recognition </span>
                </a>
              </li>

            </ul>
          </div>
        </li>

        <li className="menu-item">
          <a href="#menuTasks16" data-bs-toggle="collapse" className="menu-link">
            <span className="menu-icon"><i data-feather="rss"></i></span>

            <span className="menu-text"> Resource Libraries</span>
            <i className="material-symbols-outlined font-16 ms-1">expand_more</i>
          </a>
          <div className="collapse" id="menuTasks16">
            <ul className="sub-menu">
              <li className="menu-item">
                <a href="resdash.html" className="menu-link">
                  <span className="menu-text">Dashboard</span>
                </a>
              </li>
              <li className="menu-item">
                <a href="policyproce.html" className="menu-link">
                  <span className="menu-text">Policy and Procedures</span>
                </a>
              </li>
              <li className="menu-item">
                <a href="bacannualpl.html" className="menu-link">
                  <span className="menu-text">BAC Annual Planning</span>
                </a>
              </li>

              <li className="menu-item">
                <a href="Trainingmate.html" className="menu-link">
                  <span className="menu-text">Training Materials </span>
                </a>
              </li>
              <li className="menu-item">
                <a href="Templates.html" className="menu-link">
                  <span className="menu-text">Templates and Forms </span>
                </a>
              </li>
              <li className="menu-item">
                <a href="faqn.html" className="menu-link">
                  <span className="menu-text">FAQ </span>
                </a>
              </li>

              <li className="menu-item">
                <a href="contact-info.html" className="menu-link">
                  <span className="menu-text">Contact Information </span>
                </a>
              </li>

            </ul>
          </div>
        </li>

        {/* <li className="menu-item">
          <a href="innovation.html" className="menu-link">
            <span className="menu-icon"><i className="fe-sunrise font-16"></i></span>
            <span className="menu-text"> Innovation </span>

          </a>

        </li> */}
        {/* <li className="menu-item">
          <a href="pmo.html" className="menu-link">
            <span className="menu-icon"><i className="fe-file-text font-16"></i></span>
            <span className="menu-text"> PMO  </span>

          </a>

        </li> */}
        {/* <li className="menu-item">
          <a href="ims.html" className="menu-link">
            <span className="menu-icon"><i className="fe-users font-16"></i></span>
            <span className="menu-text"> IMS
            </span>

          </a>

        </li> */}

        <li className="menu-item">
          <a href="pages-gallery-old.html" className="menu-link">
            <span className="menu-icon"><i className="fe-image font-16"></i></span>
            <span className="menu-text"> Photo Gallery </span>

          </a>

        </li>


        {/* <li className="menu-item">
          <a href="#menuTasks" data-bs-toggle="collapse" className="menu-link">
            <span className="menu-icon"><i data-feather="rss"></i></span>

            <span className="menu-text"> Support Initiative</span>
            <i className="material-symbols-outlined font-16 ms-1">expand_more</i>
          </a>
          <div className="collapse" id="menuTasks">
            <ul className="sub-menu">
              <li className="menu-item">
                <a href="digital-transformation.html" className="menu-link">
                  <span className="menu-text">Digital Transformation</span>
                </a>
              </li>
              <li className="menu-item">
                <a href="hse.html" className="menu-link">
                  <span className="menu-text">HSE</span>
                </a>
              </li>
              <li className="menu-item">
                <a href="csr.html" className="menu-link">
                  <span className="menu-text">CSR </span>
                </a>
              </li>
              <li className="menu-item">
                <a href="training.html" className="menu-link">
                  <span className="menu-text">Training </span>
                </a>
              </li>

            </ul>
          </div>
        </li> */}

        <li className="menu-item">
          <a href="projects.html" className="menu-link">
            <span className="menu-icon"><i data-feather="clipboard"></i></span>
            <span className="menu-text"> Projects </span>

          </a>
        </li>


        <li className="menu-item">
          <a href="settings.html" className="menu-link">
            <span className="menu-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-cpu"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg></span>
            <span className="menu-text"> Settings  </span>
          </a>
        </li>


      </ul>

      <div className="clearfix"></div>
    </div>
  )
}

export default LeftNav