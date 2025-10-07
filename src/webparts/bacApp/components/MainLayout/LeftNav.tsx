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
import { FaHome, FaCog, FaNewspaper ,FaWifi } from "react-icons/fa";
import { GrAnnounce } from "react-icons/gr";
import { CgProfile } from "react-icons/cg";
import { Link ,NavLink } from 'react-router-dom';


interface ILeftNavProps {
  isCollapsed: boolean;
}



const LeftNav: React.FC<ILeftNavProps> = ({ isCollapsed }) => {
  const sp: SPFI = getSP();
  const [navItems, setnavItems] = React.useState([]);

  React.useEffect(() => {
    fetchData();
  }, []);

  const getLeftNavitems = async () => {
    const currentUser = await sp.web.currentUser();

    // Get groups for the current user
    const userGroups = await sp.web.currentUser.groups();

    // console.log("userGroups", userGroups);
    let grptitle: String[] = [];
    for (var i = 0; i < userGroups.length; i++) {
      grptitle.push(userGroups[i].Title.toLowerCase());
    }

    let arr: any = []
    // let arrs: any[] = []
    // let bannerimg: any[] = []
    await sp.web.lists.getByTitle("BACSidebarNavigation").
      items.select("Title,Url,Icon,ParentID,ID,EnableAudienceTargeting,Audience/Title,Audience/ID , IsActive,Order0").expand("Audience").filter("IsActive eq 1").orderBy("Order0",true).getAll()
      .then((res: any) => {
        // console.log(res, ' let arrs=[]');


        //  arr.push(res)
        // arr = res;
        let securednavitems = res.filter((nav: any) => {
          return (!nav.EnableAudienceTargeting || (nav.EnableAudienceTargeting && nav.Audience && nav.Audience.some((nv1: any) => { return grptitle.includes(nv1.Title.toLowerCase()) || nv1.ID == currentUser.Id })))
        }
        );

        arr = securednavitems;

      })

      .catch((error: any) => {
        console.log("Error fetching data: ", error);
      });
    // console.log(arr, 'arr');
    return arr;
  }
  const fetchData = async () => {
    try {
      const sideNav = await getLeftNavitems();
      // console.table(sideNav);
      setnavItems(sideNav)


    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      home: FaHome,
      setting: FaCog,
      news: FaNewspaper,
      announcement: GrAnnounce,
      profile: CgProfile,
      wifi:FaWifi 
     
    };
    return iconMap[iconName] || null; // Return null if icon is not found
  };

  const renderNavItems = (items: any, parentId: number | null = null) => {
    return items
      .filter((item: any) => item.ParentID === parentId)
      .map((item: any, index: number) => {
        const IconComponent = getIcon(item.Icon); // Get the icon component dynamically
        const hasChildren = items.some((child: any) => child.ParentID === item.ID);
        const collapseId = `menu-${item.ID}`;
        return (

          // <li key={index} className="menu-item" >
          //   {/* <a href={item.Url} className="menu-link" > */}
          //   <a href="#menuTasks6" data-bs-toggle="collapse" className="menu-link">
          //     <span className="menu-icon">
          //       {IconComponent && <IconComponent size={18} />}
          //     </span>
          //     <span className="menu-text">{item.Title}</span>
          //     <i className="material-symbols-outlined font-16 ms-1">expand_more</i>
          //   </a>
          //   <div className="collapse" id="menuTasks6">
          //     <ul className="sub-menu">
          //       <li className="menu-item">
          //         <a href="about-the-department.html" className="menu-link">
          //           <span className="menu-text">About the Department</span>
          //         </a>
          //       </li>
          //       <li className="menu-item">
          //         <a href="Section-Overview.html" className="menu-link">
          //           <span className="menu-text">Section Overview</span>
          //         </a>
          //       </li>

          //       <li className="menu-item">
          //         <a href="team-profile.html" className="menu-link">
          //           <span className="menu-text">Team Profile</span>
          //         </a>
          //       </li>

          //       <li className="menu-item">
          //         <a href="upeventnew.html" className="menu-link">
          //           <span className="menu-text">Upcoming Events </span>
          //         </a>
          //       </li>
          //       <li className="menu-item">
          //         <a href="Suggestions.html" className="menu-link">
          //           <span className="menu-text">Suggestions </span>
          //         </a>
          //       </li>
          //       <li className="menu-item">
          //         <a href="Employee-Recognition.html" className="menu-link">
          //           <span className="menu-text">Employee Recognition </span>
          //         </a>
          //       </li>

          //     </ul>
          //   </div>
          // </li>
          <li key={item.ID || index} className="menu-item">
            {hasChildren ? (
              <>
                <a
                  href={`#${collapseId}`}
                  data-bs-toggle="collapse"
                  className="menu-link"
                >
                  <span className="menu-icon">
                    {IconComponent && <IconComponent size={18} />}
                  </span>
                  <span className="menu-text">{item.Title}</span>
                  <i className="material-symbols-outlined font-16 ms-1">
                    expand_more
                  </i>
                </a>

                <div className="collapse" id={collapseId}>
                  <ul className="sub-menu">
                    {renderNavItems(items, item.ID)}
                  </ul>
                </div>
              </>
            ) : (
              // <a href={item.Url} className="menu-link">
               <NavLink  to={item.Url} className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'}> 
                <span className="menu-icon">
                  {IconComponent && <IconComponent size={18} />}
                </span>
                <span className="menu-text">{item.Title}</span>
              
             </NavLink > 
              //  </a>
            )}
          </li>
        )
      })
  }

  return (
    // <!-- menu-left -->
    <nav>
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



        {/* {navItems.map((item: any, index: number) => {
          const IconComponent = getIcon(item.Icon);
          return (
            <li key={index} className="menu-item">
              <a href={item.Url} className="menu-link">
                <span className="menu-icon">
                  {IconComponent && <IconComponent size={18} />}
                </span>
                <span className="menu-text">{item.Title}</span>
              </a>
            </li>
          );
        })} */}
        {renderNavItems(navItems)}



      </ul>

      <div className="clearfix"></div>
    </div>
    </nav>
  )
}

export default LeftNav