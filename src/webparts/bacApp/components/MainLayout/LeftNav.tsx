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
import { FaHome, FaCog, FaNewspaper, FaWifi ,FaRegImage ,FaRegClipboard } from "react-icons/fa";
import { GrAnnounce } from "react-icons/gr";
import { CgProfile } from "react-icons/cg";
import { Link, NavLink } from 'react-router-dom';
import { Collapse } from 'react-bootstrap';

import { Tooltip } from "bootstrap";
import * as bootstrap from 'bootstrap';
import { useEffect, useState } from 'react';


interface ILeftNavProps {
  isCollapsed: boolean;
}
interface NavItem {
  ID: number;
  ParentID: number | null;
  Title: string;
  Url?: string;
  Icon?: any;
}

interface Props {
  items: NavItem[];
  isCollapsed?: boolean;
  getIcon: (iconName: string) => React.ComponentType<{ size: number }> | null;
}

const NavItemComponent: React.FC<{
  item: NavItem;
  items: NavItem[];
  isCollapsed?: boolean;
  getIcon: Props["getIcon"];
  activeItemId: number | null;
  setActiveItemId: React.Dispatch<React.SetStateAction<number | null>>;
}> = ({ item, items, isCollapsed, getIcon, activeItemId, setActiveItemId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const submenuRef = React.useRef<HTMLUListElement>(null);
  const [height, setHeight] = useState("0px");

  const IconComponent = getIcon(item.Icon);
  const hasChildren = items.some((child) => child.ParentID === item.ID);

  const toggleOpen = () => setIsOpen(!isOpen);
  const handleClick = () => setActiveItemId(item.ID);

  useEffect(() => {
    if (submenuRef.current) {
      setHeight(isOpen ? `${submenuRef.current.scrollHeight}px` : "0px");
    }
  }, [isOpen]);
  // Get all submenu titles recursively
 const getSubmenuTitles = (parentId: number): { Title: string; Url: string }[] => {
  const children = items.filter((child) => child.ParentID === parentId);
  let titles: { Title: string; Url: string }[] = [];

  children.forEach((c) => {
    titles.push({
      Title: c.Title || "",
      Url: c.Url || "#",
    });
    titles = titles.concat(getSubmenuTitles(c.ID));
  });

  return titles;
};




  const tooltipTitles = hasChildren ? getSubmenuTitles(item.ID) : [];
  return (
    <li className={`menu-item ${activeItemId === item.ID ? "menuitem-active" : ""}`}><div className="collapsed-tooltip-wrapper">
      {hasChildren ? (
        // <div className="collapsed-tooltip-wrapper">
        <>
          {/* <div className="collapsed-tooltip-wrapper"> */}
          <div
            className="menu-link"
            onClick={toggleOpen}
            style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <span className="menu-icon">{IconComponent && <IconComponent size={18} />}</span>
            {!isCollapsed && <span className="menu-text">{item.Title}</span>}
            {!isCollapsed && (
              <span style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
                <i className="material-symbols-outlined font-16 ms-1">
                  {isOpen ? "expand_less" : "expand_more"}
                </i>
              </span>
            )}

          </div>
          {/* <div className="custom-tooltip">
              <div className="tooltip-title">{item.Title}</div>
              {tooltipTitles.length > 0 && (
                <ul className="tooltip-submenu">
                  {tooltipTitles.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              )}
            </div> */}
          {/* Tooltip visible only when collapsed */}
          {isCollapsed && (
            <div className="custom-tooltip">
              <div className="tooltip-title">{item.Title}</div>
              {/* {hasChildren && ( */}
                <ul className="tooltip-submenu">
                  {tooltipTitles.map((child, idx) => (
                    <li key={idx} className="menu-item">
                      {/* <a href={child.Url || "#"} className="menu-link">
                        <span className="menu-text">{child.Title}</span>
                      </a> */}
                        <NavLink
                          to={child.Url || "#"}
                          // onClick={handleClick}
                          // className={`menu-link ${activeItemId === item.ID ? "active" : ""}`}
                          // style={{ display: "flex", alignItems: "center" }}
                        >

                       
                          <div className="tooltip-title">{child.Title}</div>
                        </NavLink>
                      </li>
                    ))}
                </ul>
              {/* // )} */}
            </div>
          )}

          {!isCollapsed && (<ul
            ref={submenuRef}
            className="sub-menu"
            style={{
              height: height,
              overflow: "hidden",
              transition: "height 0.3s ease",
              paddingLeft: 20,
            }}
          >
            {items
              .filter((child) => child.ParentID === item.ID)
              .map((child) => (
                <NavItemComponent
                  key={child.ID}
                  item={child}
                  items={items}
                  isCollapsed={isCollapsed}
                  getIcon={getIcon}
                  activeItemId={activeItemId}
                  setActiveItemId={setActiveItemId}
                />
              ))}
          </ul>
          )}
          {/* </div> */}
        </>
      ) : (<>
        <NavLink
          to={item.Url || "#"}
          onClick={handleClick}
          className={`menu-link ${activeItemId === item.ID ? "active" : ""}`}
          style={{ display: "flex", alignItems: "center" }}
        >
          <span className="menu-icon">{IconComponent && <IconComponent size={18} />}</span>
          {!isCollapsed && <span className="menu-text">{item.Title}</span>}
        </NavLink>
        {/* Tooltip visible only when collapsed */}
        {isCollapsed && (
          <div className="custom-tooltip">

            <NavLink
              to={item.Url || "#"}
              // onClick={handleClick}
              // className={`menu-link ${activeItemId === item.ID ? "active" : ""}`}
              // style={{ display: "flex", alignItems: "center" }}
            >

              <div className="tooltip-title">{item.Title}</div>
            </NavLink>
          </div>
        )}
      </>
        //  </div>
      )

      }</div>


    </li >


    // <li className={`menu-item ${activeItemId === item.ID ? "menuitem-active" : ""}`}>
    //   {isCollapsed ? (
    //     <div className="collapsed-tooltip-wrapper">
    //       <div
    //         className="menu-link"
    //         onClick={hasChildren ? toggleOpen : handleClick}
    //         style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
    //       >
    //         <span className="menu-icon">{IconComponent && <IconComponent size={18} />}</span>
    //       </div>
    //       {/* Custom tooltip */}
    //       <div className="custom-tooltip">
    //         <div className="tooltip-title">{item.Title}</div>
    //         {tooltipTitles.length > 0 && (
    //           <ul className="tooltip-submenu">
    //             {tooltipTitles.map((t, idx) => (
    //               <li key={idx}>{t}</li>
    //             ))}
    //           </ul>
    //         )}
    //       </div>
    //     </div>
    //   ) : (
    //     <div>
    //       <div
    //         className="menu-link"
    //         onClick={hasChildren ? toggleOpen : handleClick}
    //         style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
    //       >
    //         <span className="menu-icon">{IconComponent && <IconComponent size={18} />}</span>
    //         <span className="menu-text">{item.Title}</span>
    //       </div>
    //       {hasChildren && isOpen && (
    //         <ul className="sub-menu">
    //           {items
    //             .filter((child) => child.ParentID === item.ID)
    //             .map((child) => (
    //               <NavItemComponent
    //                 key={child.ID}
    //                 item={child}
    //                 items={items}
    //                 isCollapsed={isCollapsed}
    //                 getIcon={getIcon}
    //                 activeItemId={activeItemId}
    //                 setActiveItemId={setActiveItemId}
    //               />
    //             ))}
    //         </ul>
    //       )}
    //     </div>
    //   )}
    // </li>
  );
};



const LeftNav: React.FC<ILeftNavProps> = ({ isCollapsed }) => {
  const sp: SPFI = getSP();
  // const [navItems, setnavItems] = React.useState([]);
  const [navItems, setnavItems] = React.useState<NavItem[]>([]);

  const tooltipInstances = React.useRef<any[]>([]);
  React.useEffect(() => {
    fetchData();
  }, []);
  // const [activeItemId, setActiveItemId] = React.useState<number | string | null>(null);

  const [activeItemId, setActiveItemId] = useState<number | null>(null);
  const [openItems, setOpenItems] = useState<number[]>([]);

  const handleToggle = (id: number) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    setActiveItemId(id);
  };

  // const handleClick = (itemId: number | string) => {
  //   setActiveItemId(itemId);
  // };

  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const collapseElements = document.querySelectorAll('.collapse');
    collapseElements.forEach(el => {
      new bootstrap.Collapse(el, { toggle: false });
    });
  }, [navItems]);

  React.useEffect(() => {
    // Dispose previous tooltip instances
    if (tooltipInstances.current.length) {
      tooltipInstances.current.forEach((inst) => {
        try { inst.dispose && inst.dispose(); } catch { }
      });
      tooltipInstances.current = [];
    }

    // Remove leftover tooltip DOM
    document.querySelectorAll(".tooltip").forEach((el) => el.remove());

    // Initialize tooltips only in collapsed state
    if (isCollapsed) {
      const triggers = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      triggers.forEach((el) => {
        const inst = new Tooltip(el as Element, {
          placement: "right",
          trigger: "hover", // ✅ hover only
        });
        tooltipInstances.current.push(inst);
      });
    }

    return () => {
      tooltipInstances.current.forEach((inst) => {
        try { inst.dispose && inst.dispose(); } catch { }
      });
      tooltipInstances.current = [];
      document.querySelectorAll(".tooltip").forEach((el) => el.remove());
    };
  }, [isCollapsed]);


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
      items.select("Title,Url,Icon,ParentID,ID,EnableAudienceTargeting,Audience/Title,Audience/ID , IsActive,Order0").expand("Audience").filter("IsActive eq 1").orderBy("Order0", true).getAll()
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
      wifi: FaWifi,
      photo: FaRegImage,
      clipboard:FaRegClipboard 

    };
    return iconMap[iconName] || null; // Return null if icon is not found
  };





  return (
    // <!-- menu-left -->
    <nav>
      <div className={` scrollbar mt-1 left-nav ${isCollapsed ? 'collapsed' : ''}`}>


        {/* <!--- Menu --> */}
        <ul className="menu">

          {/* {renderNavItems(navItems)} */}

          {navItems.filter(item => item.ParentID === null).map(item => (
            <NavItemComponent
              key={item.ID}
              item={item}
              items={navItems}
              isCollapsed={isCollapsed}
              getIcon={getIcon}
              activeItemId={activeItemId}
              setActiveItemId={setActiveItemId}
            />
          ))}


        </ul>

        <div className="clearfix"></div>
      </div>
    </nav>
  )
}

export default LeftNav