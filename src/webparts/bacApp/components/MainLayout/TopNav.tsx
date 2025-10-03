import * as React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../../../styles/global.scss';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'material-symbols/index.css';
// import feather from 'feather-icons';
interface ITopNavProps {
  toggleMenu: () => void;
  isCollapsed: boolean;
}
const TopNav: React.FC<ITopNavProps> = ({ toggleMenu, isCollapsed }) => {
  return (
    <div className="navbar-custom">
      <div className="topbar">
        <div className="topbar-menu d-flex align-items-center gap-1">

          {/* <!-- Topbar Brand Logo --> */}
          <div className="logo-box">
            {/* <!-- Brand Logo Light --> */}
            <a href="index.html" className="logo-light">
              <img src={require("../../assets/logo-light.png")} alt="logo" className="logo-lg"/>
                <img src={require("../../assets/logo-sm.png")} alt="small logo" className="logo-sm"/>
                </a>

                {/* <!-- Brand Logo Dark --> */}
                <a href="index.html" className="logo-dark">
                  <img src={require("../../assets/logo-dark.png")} alt="dark logo" className="logo-lg"/>
                    <img src={require("../../assets/logo-sm.png")} alt="small logo" className="logo-sm"/>
                    </a>
                  </div>

                  {/* <!-- Sidebar Menu Toggle Button --> */}


                  {/* <!-- Dropdown Menu --> */}
                  
                  <button type='button' className="button-toggle-menu " onClick={toggleMenu}>
                    <i className="material-symbols-outlined mt-2">menu</i>
                  </button>
                  {/* <!-- Mega Menu Dropdown --> */}

                </div>

                <ul className="topbar-menu d-flex align-items-center">
                  {/* <!-- Topbar Search Form --> */}
                  <li className="app-search dropdown me-3 d-none d-lg-block">
                    <form>
                      <a href="advance-search.html"> <input type="search" className="form-control rounded-pill" placeholder="Search..." id="top-search"/>
                        <span className="fe-search search-icon font-16"></span> </a>
                    </form>
                    <div className="dropdown-menu dropdown-menu-animated dropdown-lg" id="search-dropdown">
                      {/* */}
                      <div className="dropdown-header noti-title">
                        <h5 className="text-overflow mb-2">Found 22 results</h5>
                      </div>

                      {/* */}
                      <a href="javascript:void(0);" className="dropdown-item notify-item">
                        <i className="fe-home me-1"></i>
                        <span>Analytics Report</span>
                      </a>

                      {/* */}
                      <a href="javascript:void(0);" className="dropdown-item notify-item">
                        <i className="fe-aperture me-1"></i>
                        <span>How can I help you?</span>
                      </a>

                      {/* */}
                      <a href="javascript:void(0);" className="dropdown-item notify-item">
                        <i className="fe-settings me-1"></i>
                        <span>User profile settings</span>
                      </a>

                      {/* */}
                      <div className="dropdown-header noti-title">
                        <h6 className="text-overflow mb-2 text-uppercase">Users</h6>
                      </div>

                      <div className="notification-list">
                        {/* */}
                        <a href="javascript:void(0);" className="dropdown-item notify-item">
                          <div className="d-flex align-items-start">
                            <img className="d-flex me-2 rounded-circle" src={require("../../assets/user-2.jpg")} alt="Generic placeholder image" height="32"/>
                              <div className="w-100">
                                <h5 className="m-0 font-14">Erwin E. Brown</h5>
                                <span className="font-12 mb-0">UI Designer</span>
                              </div>
                          </div>
                        </a>

                        {/* */}
                        <a href="javascript:void(0);" className="dropdown-item notify-item">
                          <div className="d-flex align-items-start">
                            <img className="d-flex me-2 rounded-circle" src={require("../../assets/user-5.jpg")} alt="Generic placeholder image" height="32"/>
                              <div className="w-100">
                                <h5 className="m-0 font-14">Jacob Deo</h5>
                                <span className="font-12 mb-0">Developer</span>
                              </div>
                          </div>
                        </a>
                      </div>
                    </div>
                  </li>

                  {/* <!-- Fullscreen Button --> */}
                  <li className="d-none d-md-inline-block">
                    <a className="nav-link waves-effect waves-light" href="#" data-toggle="fullscreen">
                      <i className="fe-maximize font-22"></i>
                    </a>
                  </li>

                  {/* <!-- Search Dropdown (for Mobile/Tablet) --> */}
                  <li className="dropdown d-lg-none">
                    <a className="nav-link dropdown-toggle waves-effect waves-light arrow-none" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                      <i className="ri-search-line font-22"></i>
                    </a>
                    <div className="dropdown-menu dropdown-menu-animated dropdown-lg p-0">
                      <form className="p-3">
                        <input type="search" className="form-control" placeholder="Search ..." aria-label="Recipient's username"/>
                      </form>
                    </div>
                  </li>

                  {/* <!-- App Dropdown --> */}
                  

              


                  {/* <!-- Notofication dropdown --> */}
                  <li className="dropdown notification-list">
                    <a className="nav-link dropdown-toggle waves-effect waves-light arrow-none" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                      {/* <i className="fe-bell font-22"></i> */}
                       <i data-feather="bell"></i>
                      <span className="badge bg-danger rounded-circle noti-icon-badge">9</span>
                    </a>
                    <div className="dropdown-menu dropdown-menu-end dropdown-menu-animated dropdown-lg py-0">
                      <div className="p-2 border-top-0 border-start-0 border-end-0 border-dashed border">
                        <div className="row align-items-center">
                          <div className="col">
                            <h6 className="m-0 font-16 fw-semibold"> Notification</h6>
                          </div>
                          <div className="col-auto">
                            <a href="javascript: void(0);" className="text-dark text-decoration-underline">
                              <small>Clear All</small>
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="px-1" style={{ maxHeight: '300px' }} data-simplebar>

                        <h5 className="text-muted font-13 fw-normal mt-2">Today</h5>
                        {/* */}

                        <a href="javascript:void(0);" className="dropdown-item p-0 notify-item card unread-noti shadow-none mb-1">
                          <div className="card-body">
                            <span className="float-end noti-close-btn text-muted"><i className="mdi mdi-close"></i></span>
                            <div className="d-flex align-items-center">
                              <div className="flex-shrink-0">
                                <div className="notify-icon bg-primary">
                                  <i className="mdi mdi-comment-account-outline"></i>
                                </div>
                              </div>
                              <div className="flex-grow-1 text-truncate ms-2">
                                <h5 className="noti-item-title fw-semibold font-14">Datacorp <small className="fw-normal text-muted ms-1">1 min ago</small></h5>
                                <small className="noti-item-subtitle text-muted">Caleb Flakelar commented on Admin</small>
                              </div>
                            </div>
                          </div>
                        </a>

                        {/* */}
                        <a href="javascript:void(0);" className="dropdown-item p-0 notify-item card read-noti shadow-none mb-1">
                          <div className="card-body">
                            <span className="float-end noti-close-btn text-muted"><i className="mdi mdi-close"></i></span>
                            <div className="d-flex align-items-center">
                              <div className="flex-shrink-0">
                                <div className="notify-icon bg-info">
                                  <i className="mdi mdi-account-plus"></i>
                                </div>
                              </div>
                              <div className="flex-grow-1 text-truncate ms-2">
                                <h5 className="noti-item-title fw-semibold font-14">Admin <small className="fw-normal text-muted ms-1">1 hours ago</small></h5>
                                <small className="noti-item-subtitle text-muted">New user registered</small>
                              </div>
                            </div>
                          </div>
                        </a>

                        <h5 className="text-muted font-13 fw-normal mt-0">Yesterday</h5>

                        {/* */}
                        <a href="javascript:void(0);" className="dropdown-item p-0 notify-item card read-noti shadow-none mb-1">
                          <div className="card-body">
                            <span className="float-end noti-close-btn text-muted"><i className="mdi mdi-close"></i></span>
                            <div className="d-flex align-items-center">
                              <div className="flex-shrink-0">
                                <div className="notify-icon">
                                  <img src={require("../../assets/avatar-2.jpg")} className="img-fluid rounded-circle" alt="" />
                                </div>
                              </div>
                              <div className="flex-grow-1 text-truncate ms-2">
                                <h5 className="noti-item-title fw-semibold font-14">Cristina Pride <small className="fw-normal text-muted ms-1">1 day ago</small></h5>
                                <small className="noti-item-subtitle text-muted">Hi, How are you? What about our next meeting</small>
                              </div>
                            </div>
                          </div>
                        </a>

                        <h5 className="text-muted font-13 fw-normal mt-0">30 Dec 2021</h5>

                        {/* */}
                        <a href="javascript:void(0);" className="dropdown-item p-0 notify-item card read-noti shadow-none mb-1">
                          <div className="card-body">
                            <span className="float-end noti-close-btn text-muted"><i className="mdi mdi-close"></i></span>
                            <div className="d-flex align-items-center">
                              <div className="flex-shrink-0">
                                <div className="notify-icon bg-primary">
                                  <i className="mdi mdi-comment-account-outline"></i>
                                </div>
                              </div>
                              <div className="flex-grow-1 text-truncate ms-2">
                                <h5 className="noti-item-title fw-semibold font-14">Datacorp</h5>
                                <small className="noti-item-subtitle text-muted">Caleb Flakelar commented on Admin</small>
                              </div>
                            </div>
                          </div>
                        </a>

                        {/* */}
                        <a href="javascript:void(0);" className="dropdown-item p-0 notify-item card read-noti shadow-none mb-1">
                          <div className="card-body">
                            <span className="float-end noti-close-btn text-muted"><i className="mdi mdi-close"></i></span>
                            <div className="d-flex align-items-center">
                              <div className="flex-shrink-0">
                                <div className="notify-icon">
                                  <img src={require("../../assets/avatar-4.jpg")} className="img-fluid rounded-circle" alt="" />
                                </div>
                              </div>
                              <div className="flex-grow-1 text-truncate ms-2">
                                <h5 className="noti-item-title fw-semibold font-14">Karen Robinson</h5>
                                <small className="noti-item-subtitle text-muted">Wow ! this admin looks good and awesome design</small>
                              </div>
                            </div>
                          </div>
                        </a>

                        <div className="text-center">
                          <i className="mdi mdi-dots-circle mdi-spin text-muted h3 mt-0"></i>
                        </div>
                      </div>

                      {/* <!-- All--> */}
                      <a href="javascript:void(0);" className="dropdown-item text-center text-primary notify-item border-top border-light py-2">
                        View All
                      </a>

                    </div>
                  </li>

                  {/* <!-- Light/Dark Mode Toggle Button --> */}
                  <li className="d-none d-sm-inline-block">
                    <div className="nav-link waves-effect waves-light" id="light-dark-mode">

                      <i className="fe-moon font-22"></i>
                    </div>
                  </li>

                  {/* <!-- User Dropdown --> */}
                  <li className="dropdown">
                    <a className="nav-link dropdown-toggle nav-user me-0 waves-effect waves-light" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="false" aria-expanded="false">
                      <img src={require("../../assets/user-1.jpg")} alt="user-image" className="rounded-circle"/>
                        <span className="ms-1 d-none d-md-inline-block">
                          Hi Ali Rashid <i style={{ fontSize: '12px' }} className="material-symbols-outlined ms-1">expand_more</i>
                        </span>
                    </a>
                    <div className="dropdown-menu dropdown-menu-end profile-dropdown ">
                     
                      <div className="dropdown-header noti-title">
                        <h6 className="text-overflow m-0">Welcome !</h6>
                      </div>

                     
                      <a href="javascript:void(0);" className="dropdown-item notify-item">
                        <i className="fe-user"></i>
                        <span>My Account</span>
                      </a>

                     
                      <a href="javascript:void(0);" className="dropdown-item notify-item">
                        <i className="fe-settings"></i>
                        <span>Settings</span>
                      </a>

                     
                      <a href="javascript:void(0);" className="dropdown-item notify-item">
                        <i className="fe-lock"></i>
                        <span>Lock Screen</span>
                      </a>

                      <div className="dropdown-divider"></div>

                     
                      <a href="javascript:void(0);" className="dropdown-item notify-item">
                        <i className="fe-log-out"></i>
                        <span>Logout</span>
                      </a>

                    </div>
                  </li>

                  {/* <!-- Right Bar offcanvas button (Theme Customization Panel) --> */}
                  <li>
                    <a className="nav-link waves-effect waves-light" data-bs-toggle="offcanvas" href="#theme-settings-offcanvas">
                      <i className="fe-settings font-22"></i>
                    </a>
                  </li>
                </ul>
              </div>
          </div>
          )
}

          export default TopNav