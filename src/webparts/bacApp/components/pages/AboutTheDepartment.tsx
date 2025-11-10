import * as React from "react";
//import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../../../../styles/global.scss";
import "bootstrap-icons/font/bootstrap-icons.css";
import "material-symbols/index.css";
import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { getSP } from "../../loc/pnpjsConfig";
import { useEffect, useState } from "react";
import * as feather from "feather-icons";
import { SITE_URL } from "../../../../Shared/Constant";
import { NavLink } from "react-router-dom";


const AboutTheDepartment = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [recognitions, setRecognitions] = useState<any[]>([]);
  const [teamAchievements, setTeamAchievements] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const sp = getSP();


  //  Define limits for each section
  const DISPLAY_LIMITS = {
    events: 3,
    users: 4,
    recognitions: 4,
    teamAchievements: 2,
  };

  //  Dynamic View All conditions
  const showViewAll = {
    events: events.length > DISPLAY_LIMITS.events,
    users: users.length > DISPLAY_LIMITS.users,
    recognitions: recognitions.length > DISPLAY_LIMITS.recognitions,
    teamAchievements: teamAchievements.length > DISPLAY_LIMITS.teamAchievements,
  };

  useEffect(() => {
    feather.replace();
  }, [events]);
  useEffect(() => {
    const fetchBanners = async () => {
      setLoading(true);
      try {
        const sp: SPFI = getSP();

        // Step 1: Get current user's department dynamically
        // const currentUser = await sp.web.currentUser();
        // const userLogin = currentUser.LoginName;

        // // Fetch the user profile to get Department property (if set in Delve/User Profile)
        // const profileProps = await sp.profiles.getUserProfilePropertyFor(userLogin, "Department");
        // const userDepartment = profileProps || "";

        // if (!userDepartment) {
        //   setBanners([]);
        //   return;
        // }

        // Step 2: Fetch banners filtered by department + IsActive
        const bannerItems = await sp.web.lists
          .getByTitle("Banner")
          .items.select(
            "Id",
            "Title",
            "IsActive",
            "BannerImageID/ID",
            // "Department/DepartmentName"
          )
          .expand("BannerImageID")
          // .filter(
          //   `IsActive eq 'Yes' and Department/DepartmentName eq '${userDepartment}'`
          // )
          .top(5)();

        // if (bannerItems.length === 0) {
        // }

        // Step 3: Fetch linked images from BannerDocs
        const bannersWithImages = await Promise.all(
          bannerItems.map(async (banner) => {
            const imageLookupId = banner.BannerImageID?.ID;

            if (imageLookupId) {
              try {
                const imageItem = await sp.web.lists
                  .getByTitle("BannerDocs")
                  .items.getById(imageLookupId)
                  .select("FileRef")();

                return { ...banner, ImageUrl: imageItem.FileRef };
              } catch {
                return { ...banner, ImageUrl: null };
              }
            } else {
              return { ...banner, ImageUrl: null };
            }
          })
        );

        setBanners(bannersWithImages);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);


  //upcoming events
  useEffect(() => {
    const sp: SPFI = getSP();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const startIso = start.toISOString();

    sp.web.lists
      .getByTitle("Events")
      .items.select("EventTitle", "UpcomingEventDate")
      .filter(`UpcomingEventDate ge datetime'${startIso}'`)
      .orderBy("UpcomingEventDate", true)
      .top(DISPLAY_LIMITS.recognitions + 1)()

      .then((data) => {
        const sorted = data.sort(
          (a, b) =>
            new Date(a.UpcomingEventDate).getTime() - new Date(b.UpcomingEventDate).getTime()
        );
        setEvents(sorted);
      })
      .catch((err) => console.error("Error fetching events:", err));
  }, []);

  //team profile
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const sp: SPFI = getSP();

        //Get all site users (includes groups)
        const allUsers = await sp.web.siteUsers();

        //Filter only real users (PrincipalType = 1)
        const realUsers = allUsers.filter(
          (user: any) =>
            user.PrincipalType === 1 &&
            !user.LoginName.startsWith("SHAREPOINT\\") &&
            !user.LoginName.includes("app@") &&
            user.Email
        );

        // Fetch Department info from Site User Info List
        const siteUserInfo = await sp.web.siteUserInfoList.items
          .select("ID", "Title", "EMail", "Department")
          .top(1000)();

        // Merge Department with user info
        const usersWithDept = realUsers.map((u: any) => {
          const info = siteUserInfo.find(
            (i: any) =>
              (i.EMail || "").toLowerCase().trim() ===
              (u.Email || "").toLowerCase().trim()
          );

          return {
            Id: u.Id,
            Title: u.Title,
            Email: u.Email,
            LoginName: u.LoginName,
            Department: info?.Department || "",
            ImageUrl: `/_layouts/15/userphoto.aspx?size=M&accountname=${u.Email}`,
          };
        });

        // Slice top 4 users
        const topUsers = usersWithDept.slice(0, 4);
        setUsers(usersWithDept);
      } catch (error) {
      }
    };

    fetchUsers();
  }, []);


  //fetch recognitions
  //  useEffect(() => {
  //   const fetchRecognitions = async () => {
  //     try {
  //       const sp: SPFI = getSP();

  //       //Fetch top 4 Employee Recognition items
  //       const items = await sp.web.lists
  //         .getByTitle("EmployeeRecognition")
  //         .items.select(
  //           "Id",
  //           "EmployeeName/Title",
  //           "EmployeeName/EMail",
  //           "AchievementTitle",
  //           "AchievementDetail",
  //           "TopStar"
  //         )
  //         .expand("EmployeeName")
  //          .orderBy("Created", true)
  //         .top(4)(); 

  //       //Fetch Department info from User Info List
  //       const siteUserInfo = await sp.web.siteUserInfoList.items
  //         .select("Title", "EMail", "Department")
  //         .top(1000)();

  //       //Merge Department info with Employee Recognition items
  //       const itemsWithDept = items.map((item: any) => {
  //         const email = (item.EmployeeName?.EMail || "").toLowerCase().trim();
  //         const match = siteUserInfo.find(
  //           (info: any) =>
  //             (info.EMail || "").toLowerCase().trim() === email
  //         );

  //         return {
  //           ...item,
  //           Department: match?.Department || "", 
  //         };
  //       });
  //       setRecognitions(itemsWithDept);
  //     } catch (error) {
  //     }
  //   };

  //   fetchRecognitions();
  // }, []);

  useEffect(() => {
    const fetchRecognitions = async () => {

      try {
        const sp: SPFI = getSP();

        // Fetch Employee Recognition list items
        const items = await sp.web.lists
          .getByTitle("EmployeeRecognition")
          .items.select(
            "Id",
            "Title",
            "EmployeeName/Id",
            "EmployeeName/Title",
            "EmployeeName/EMail",
            "AchievementTitle",
            "AchievementDetail",
            "TopStar"
          )
          .expand("EmployeeName")
          .orderBy("Created", false)
          .top(DISPLAY_LIMITS.recognitions + 1)();

        if (items.length === 0) {
          return;
        }

        //Fetch all real site users
        const allUsers = await sp.web.siteUsers();

        // Filter only real user accounts (exclude system & app)
        const realUsers = allUsers.filter(
          (u: any) =>
            u.PrincipalType === 1 &&
            !u.LoginName.startsWith("SHAREPOINT\\") &&
            !u.LoginName.toLowerCase().includes("app@") &&
            u.Email
        );

        // Fetch Department info from SiteUserInfoList
        const siteUserInfo = await sp.web.siteUserInfoList.items
          .select("ID", "Title", "EMail", "Department")
          .top(1000)();

        // Merge Department + Image + Recognition Info
        const mappedRecognitions = items.map((item: any, index: number) => {
          const empEmail = (item.EmployeeName?.EMail || "").toLowerCase().trim();
          const empName = item.EmployeeName?.Title || "Unknown";

          // Match user info for department
          const match = siteUserInfo.find(
            (info: any) => (info.EMail || "").toLowerCase().trim() === empEmail
          );
          const dept = match?.Department || "Department not available";

          // Find real user object (for login/account name)
          const userObj = realUsers.find(
            (u: any) => (u.Email || "").toLowerCase().trim() === empEmail
          );

          // Build the **correct working profile photo URL**
          const imageUrl =
            userObj?.Email && !userObj.LoginName.toLowerCase().includes("system")
              ? `/_layouts/15/userphoto.aspx?size=M&accountname=${encodeURIComponent(
                userObj.Email
              )}`
              : "/_layouts/15/images/PersonPlaceholder.ashx";
          return {
            Id: item.Id,
            Name: empName,
            Department: dept,
            AchievementTitle: item.AchievementTitle || "",
            AchievementDetail: item.AchievementDetail || "",
            TopStar: item.TopStar,
            ImageUrl: imageUrl,
          };
        });

        setRecognitions(mappedRecognitions);
      } catch (error: any) {
      } finally {
      }
    };

    fetchRecognitions();
  }, []);




  useEffect(() => {
    const fetchTeamAchievements = async () => {
      try {
        const items = await sp.web.lists
          .getByTitle("TeamAchievements")
          .items.select("Id", "Title", "AchievementDetail", "AchievementTag")
          .orderBy("Created", false)
          .top(DISPLAY_LIMITS.teamAchievements + 1)();
        // get 2 most recent
        setTeamAchievements(items);
      } catch (error) {
      }
    };

    fetchTeamAchievements();
  }, []);

  return (

    <>
      {loading ? (
        //  Loader shown while fetching
        <div className="loadernewadd mt-10">
          <div>
            <img
              src={require("../../assets/BAC_loader.gif")}
              className="alignrightl"
              alt="Loading..."
            />
          </div>
          <span>Loading </span>{" "}
          <span>
            <img
              src={require("../../assets/edcnew.gif")}
              className="alignrightl"
              alt="Loading..."
            />
          </span>
        </div>
      ) : (
        <div className="row">
          <div className="col-xl-9 col-lg-9 tabview1">
            <div className="row">
              <div className="col-xl-8 col-lg-8 order-lg-2 order-xl-1">
                <div className="carousel1">
                  <div
                    id="carouselExampleIndicators"
                    className="carousel slide pointer-event"
                    data-bs-ride="carousel"
                  >
                    {/*  Dynamic carousel indicators */}
                    <ol className="carousel-indicators">
                      {banners.map((_, index) => (
                        <li
                          key={index}
                          data-bs-target="#carouselExampleIndicators"
                          data-bs-slide-to={index}
                          className={index === 0 ? "active" : ""}
                          aria-current={index === 0 ? "true" : undefined}
                        ></li>
                      ))}
                    </ol>

                    {/*  Dynamic carousel items */}
                    <div className="carousel-inner" role="listbox">
                      {banners.length > 0 ? (
                        banners.map((banner, index) => (
                          <div
                            key={banner.Id}
                            className={`carousel-item ${index === 0 ? "active" : ""}`}
                          >
                            <img
                              style={{ width: "100%" }}
                              src={
                                banner.ImageUrl
                                  ? banner.ImageUrl
                                  : "/sites/BAC/BannerDocs/placeholder.png"
                              }

                              alt={banner.Title}
                              className="d-block img-fluid"
                            />
                            <div className="carousel-caption d-none d-md-block">
                              <p className="font-18 mb-1 mt-1 ps-4 pe-4 py-0">
                                {banner.Title || "Untitled Banner"}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-3">
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-4 col-lg-4 order-lg-1 order-xl-1">
                {/* <!-- start profile info --> */}
                <div className="card announcementner">
                  
                
                    {/* <!-- <div className="box-header a1">
                                        <ul className="paddsame">
                                              
                                            <li  className="ntest-h"><span>Event Calendar</span>    
                                            </li>
                                            <div className="dropdown float-end mt-1">
                                                <a href="#" className="dropdown-toggle arrow-none card-drop" data-bs-toggle="dropdown" aria-expanded="false">
                                                    <i className="fe-more-horizontal-"></i>
                                                </a>
                                                <div className="dropdown-menu dropdown-menu-end">
                                                 
                                                    <a href="javascript:void(0);" className="dropdown-item">View All</a>
                                                  
                                                  
                                                </div>
                                            </div>
                                        </ul>
                                    </div> --> */}
                   
                    <div className="card-body pb-1">
                      <h4 className="header-title text-dark fw-bold mb-2">
                        Upcoming Events{" "}
                        {showViewAll.events && (
                          <NavLink
                            to="/UpcomingEvents"
                            style={{ float: "right" }}
                            className="font-11 fw-normal btn btn-primary rounded-pill waves-effect waves-light view-all"
                          >
                            View All
                          </NavLink>
                        )}
                      </h4>

                      <div className="mt-0">
                        {events.length === 0 ? (
                          <p className="text-muted text-center">
                            No upcoming events found.
                          </p>
                        ) : (
                          events.slice(0, DISPLAY_LIMITS.events).map((item, index) => {
                            const date = new Date(item.UpcomingEventDate);
                            const day = date.getDate();
                            const month = date.toLocaleString("default", {
                              month: "short",
                            });
                            const year = date.getFullYear();

                            return (
                              <div
                                key={index}
                                style={{
                                  padding: "0px 0px 0px 0px",
                                  width: "100%",
                                  margin: "auto",
                                }}
                                className="row align-items-start border-bottom mb-0 ng-scope"
                              >
                                <div
                                  style={{ padding: "0px" }}
                                  className="col-sm-3 upcom1"
                                >
                                  <div className="icon-1 event me-0">
                                    <h4 className="ng-binding">{day}</h4>
                                    <p className="ng-binding">
                                      {`${month} ${year.toString().slice(2)}`}
                                    </p>
                                  </div>
                                </div>

                                <div className="col-sm-9 upcom2">
                                  <div className="w-100 ps-0">
                                    <h4 className="mt-2 mb-1 text-dark font-14 fw-bold ng-binding">
                                      {item.EventTitle}
                                    </h4>
                                    <p className="mb-1 mt-3 font-12 mt-sm-0 ng-binding">
                                      {/* <i
                                        data-feather="calendar"
                                        className="me-1"
                                      ></i> */}
                                      {`${day} ${month} ${year}`}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  
                </div>
                {/* <!-- end profile info --> */}

                {/* <!-- video --> */}
        

                {/* <!-- end video --> */}
              </div>
              {/* <!-- end col --> */}
            </div>
            <div className="row">
              <div className="col-xl-5 col-lg-5">
                <div className="card">
                  <div className="card-body pb-3 gheight">
                    <h4 className="header-title font-16 text-dark fw-bold mb-0">
                      Team Profile{" "}
                      {showViewAll.users && (
                        <NavLink
                          to="/TeamProfile"
                          style={{ float: "right" }}
                          className="font-11 fw-normal btn btn-primary rounded-pill waves-effect waves-light view-all"
                        >
                          View All
                        </NavLink>
                      )}
                    </h4>

                    <div className="inbox-widget mt-2">
                      {users.length === 0 ? (
                        <p className="text-muted mt-2">No team members found.</p>
                      ) : (
                        users.slice(0, DISPLAY_LIMITS.users).map((user: any, index: number) => (
                          <div
                            key={index}
                            className={`inbox-item ${index === users.length - 1 ? "border-0 pb-0" : ""
                              }`}
                          >
                            <a href="javascript:void(0)">
                              <div className="inbox-item-img">
                                <img
                                  style={{ marginTop: -5 }}
                                  src={user.ImageUrl}
                                  className="rounded-circle"
                                  alt={user.Title}
                                />
                              </div>
                            </a>

                            <a href="javascript:void(0)">
                              <p className="inbox-item-text fw-bold font-14 mb-0 text-dark mt-11 ng-binding">
                                {user.Title}
                              </p>
                            </a>

                            {user.Department && (
                              <p
                                style={{
                                  color: "#6b6b6b",
                                  marginTop: 1,
                                  fontWeight: 500,
                                }}
                                className="inbox-item-text font-12"
                              >
                                {user.Department}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-7 col-lg-7">
                <div className="card">
                  {/* <!-- <div className="box-header a1">
                                        <ul className="paddsame">
                                              
                                            <li  className="ntest-h"><span>Event Calendar</span>    
                                            </li>
                                            <div className="dropdown float-end mt-1">
                                                <a href="#" className="dropdown-toggle arrow-none card-drop" data-bs-toggle="dropdown" aria-expanded="false">
                                                    <i className="fe-more-horizontal-"></i>
                                                </a>
                                                <div className="dropdown-menu dropdown-menu-end">
                                                 
                                                    <a href="javascript:void(0);" className="dropdown-item">View All</a>
                                                  
                                                  
                                                </div>
                                            </div>
                                        </ul>
                                    </div> --> */}
                  
                  <div className="card-body pb-0 gheight">
                    <h4 className="header-title font-16 text-dark fw-bold mb-0">
                      Employee Recognition
                      {showViewAll.recognitions && (
                        <NavLink
                          to="/EmployeeRecognition"
                          style={{ float: "right" }}
                          className="font-11 fw-normal btn btn-primary rounded-pill waves-effect waves-light view-all"
                        >
                          View All
                        </NavLink>
                      )}
                    </h4>

                    <div className="row mt-2">
                      {recognitions.length === 0 ? (
                        <p className="text-muted mt-2">No recognitions found.</p>
                      ) : (
                        recognitions
                          .slice(0, DISPLAY_LIMITS.recognitions)
                          .map((item: any, index: number) => {
                            // Use working image URL (from logic using accountname)
                            const profilePicUrl = item.ImageUrl
                              ? `${window.location.origin}${item.ImageUrl.startsWith("/") ? "" : "/"}${item.ImageUrl}`
                              : "/_layouts/15/images/PersonPlaceholder.ashx";

                            return (
                              <div
                                key={index}
                                className="d-flex border-bottom heit8 align-items-start w-100 justify-content-between pe-0 mb-1 border-radius"
                              >
                                {/* Index Number */}
                                <div className="col-sm-1">
                                  <div style={{ marginLeft:'10px'}}
                                    className="product-price-tag positiont text-primary rounded-circle newc"
                                    title="Position"
                                  >
                                    {(index + 1).toString().padStart(2, "0")}
                                  </div>
                                </div>

                                {/* Profile Image */}
                                <div className="col-sm-1 ps-2">
                                  <img
                                    className="rounded-circle"
                                    src={profilePicUrl}
                                    width="40"
                                    height="40"
                                    alt={item.Name || "Employee"}
                                    style={{ objectFit: "cover" }}
                                    onError={(e: any) => {
                                      e.target.src = "/_layouts/15/images/PersonPlaceholder.ashx";
                                    }}
                                  />
                                </div>

                                {/* Name + Department */}
                                <div className="col-sm-4">
                                  <div className="w-100 ps-3 pt-0">
                                    <h5
                                      style={{ marginTop: 10 }}
                                      className="inbox-item-text fw-bold font-14 mb-0 text-dark"
                                    >
                                      {item.Name || "Employee Name Missing"}
                                    </h5>
                                    {item.Department && (
                                      <span style={{ color: "#6b6b6b" }} className="font-12">
                                        {item.Department}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Achievement Badges */}
                                <div className="col-sm-3">
                                  <a
                                    style={{ marginTop: 3 }}
                                    href="javascript:void(0);"
                                    className="d-flex align-items-center btn btn-sm btn-link text-muted ps-0 pe-0"
                                  >
                                    <img style={{width:'15px'}}
                                      src={require("../../assets/noun-achievement-6772537.png")}
                                      title="Badges"
                                      className="me-0"
                                    />
                                    <img style={{width:'15px'}}
                                      src={require("../../assets/noun-achievement-6772537.png")}
                                      title="Badges"
                                      className="me-0"
                                    />
                                    <img style={{width:'15px'}}
                                      src={require("../../assets/noun-achievement-6772537.png")}
                                      title="Badges"
                                      className="me-0"
                                    />
                                  </a>
                                </div>

                                {/* Points */}
                                <div className="col-sm-2">
                                  <span
                                    style={{
                                      padding: "5px",
                                      borderRadius: "4px",
                                      background: "#cce7dc",
                                      fontWeight: 600,
                                      color: "#008751",
                                    }}
                                    className="posnew font-12 float-end mt-2"
                                  >
                                    Points Earned {item.Points || 0}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-lg-6 tabview2">
            {/* <!-- start profile info --> */}
            <div className="card mb-3">
             
            
              <div className="card-body pb-3 news-fedd">
                <h4 className="header-title text-dark fw-bold mb-0">
                  Key Functions{" "}
                  <NavLink
                    to="/SectionOverview"
                    style={{ float: "right" }}
                    className="font-11 fw-normal btn btn-primary rounded-pill waves-effect waves-light view-all"

                  >
                    View All
                  </NavLink>
                </h4>
                {/* <!-- <h4 className="header-title mb-3">News Feed</h4> --> */}
                <div style={{ paddingTop: "12px" }}>
                  <div className="function-list">
                    <div className="function mb-2">
                      <h3  className="text-dark font-14 fw-bold mb-1">
                        {" "}
                        <img src={require("../../assets/sec-5.png")} />
                        &nbsp; Strategic Planning
                      </h3>
                     
                      <span className="text-muted font-12">
                        Develop long-term strategies and translate them into annual
                        business plans.
                      </span>
                    </div>

                    <div className="function mb-2">
                      <h3  className="text-dark font-14 fw-bold mb-1">
                        {" "}
                        <img src={require("../../assets/sec-6.png")} />
                        &nbsp; Performance Management
                      </h3>
                      
                      <span className="text-muted font-12">
                        Track progress against KPIs and ensure alignment with BAC’s
                        vision.
                      </span>
                    </div>

                    <div className="function mb-2">
                    <h3  className="text-dark font-14 fw-bold mb-1">
                        {" "}
                        <img src={require("../../assets/sec-7.png")} />
                        &nbsp; Stakeholder Engagement
                      </h3>
                   
                      <span className="text-muted font-12">
                        Collaborate with airlines, regulators, and government
                        partners.
                      </span>
                    </div>

                    <div className="function">
                    <h3  className="text-dark font-14 fw-bold mb-1">
                        {" "}
                        <img src={require("../../assets/sec-8.png")} />
                        &nbsp; Innovation &amp; Transformation
                      </h3>
                     
                      <span className="text-muted font-12">
                        Drive continuous improvement, digital transformation, and
                        new initiatives.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card h-1001 mt-0 mb-3">
              <div className="card-body">
                <h4 className="header-title text-dark fw-bold mb-0">
                  Team Achievements
                  {showViewAll.teamAchievements && (
                    <NavLink
                      to="/EmployeeRecognition"
                      style={{ float: "right" }}
                      className="font-11 fw-normal btn btn-primary rounded-pill waves-effect waves-light view-all"

                    >
                      View All{" "}

                    </NavLink>
                  )}
                </h4>

                <div className="">
                  {teamAchievements.length === 0 ? (
                    <p className="text-muted mt-2">No team achievements found.</p>
                  ) : (
                    teamAchievements.slice(0, DISPLAY_LIMITS.teamAchievements).map((team: any, index: number) => (
                      <div
                        key={team.Id}
                        style={{ clear: "both", float: "left" }}
                        className={`mt-2  ${index === 0 ? "" : "border-top pt-2"
                          }`}
                      >
                        <h3
                          style={{
                            textAlign: "left",
                            fontSize: "14px",
                            fontWeight: 600,
                          }}
                          className="mt-0 mb-1 text-16 text-dark  two-line-one"
                        >
                          {team.Title || "Untitled Team"}
                        </h3>
                        <p
                          style={{ textAlign: "left", fontSize: "13px" }}
                          className="mb-1 two-line-trim"
                        >
                          {team.AchievementDetail || "No details available."}
                        </p>
                        <span
                          style={{ float: "left" }}
                          className={`badge ${index % 2 === 0 ? "btn-danger" : "btn-success"
                            }`}
                        >
                          {team.AchievementTag || "Team Achievement"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* <!-- end profile info --> */}

            {/* <!-- video --> */}

            {/* <!-- end video --> */}
            

           
          </div>
          {/* <!-- end page title --> */}

          {/* <!-- end row --> */}

          {/* <!-- end row --> */}

          {/* <!-- end row --> */}
        </div>
      )}
    </>

  );
};

export default AboutTheDepartment;
