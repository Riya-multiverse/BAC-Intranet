import * as React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
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

      // console.log(" Current User Department:", userDepartment);

      // if (!userDepartment) {
      //   console.warn(" User department not found — showing no department-filtered banners.");
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
      //   console.warn(
      //     ` No active banners found for Department '${userDepartment}'.`
      //   );
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
      console.error(" Error fetching banners:", error);
    }finally {
      setLoading(false);
    }
  };

  fetchBanners();
}, []);



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
      .top(4)()
      .then((data) => {
        const sorted = data.sort(
          (a, b) =>
            new Date(a.UpcomingEventDate).getTime() - new Date(b.UpcomingEventDate).getTime()
        );
        setEvents(sorted);
      })
      .catch((err) => console.error("Error fetching events:", err));
  }, []);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await sp.web.siteUsers();
        const filteredUsers = allUsers.filter(
          (user: any) =>
            user.PrincipalType === 1 &&
            !user.LoginName.startsWith("SHAREPOINT\\") &&
            !user.LoginName.includes("app@") &&
            user.Email
        );
         const topUsers = filteredUsers.slice(0, 4);

      setUsers(topUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchRecognitions = async () => {
      try {
        const items = await sp.web.lists
          .getByTitle("EmployeeRecognition")
          .items.select(
            "Id",
            "EmployeeName/Title",
            "EmployeeName/EMail",
            "AchievementTitle",
            "AchievementDetail",

            "TopStar"
          )
          .expand("EmployeeName")

          .top(4)(); // only top 4 for dashboard

        setRecognitions(items);
      } catch (error) {
        console.error("Error fetching Employee Recognitions:", error);
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
          .top(2)(); // get 2 most recent
        setTeamAchievements(items);
      } catch (error) {
        console.error("Error fetching Team Achievements:", error);
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
                                                  
                                                <h4 className="header-title fw-bold mb-0">Latest Announcement  <a style="float: right;" className="font-12 fw-normal text-primary " href="announcements.html">View All </a></h4>   
                                                </li>
                                               
                                            </ul>
                                        </div>  --> */}
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
                {/* <!-- <div className="box-header a1">
                                        <ul className="paddsame">
                                              
                                            <h4 className="header-title fw-bold mb-0">Upcmong Events <a style="float: right;" className="font-12 fw-normal text-primary " href="apps-calendar.html">View All </a></h4>   
                                            
                                           
                                        </ul>
                                    </div> --> */}
                <div className="card-body pb-1">
                  <h4 className="header-title text-dark fw-bold mb-2">
                    Upcoming Events{" "}
                    <NavLink
                      to="/UpcomingEvents"
                      style={{ float: "right" }}
                      className="font-11 fw-normal btn btn-primary rounded-pill waves-effect waves-light view-all"
                    >
                      View All
                    </NavLink>
                  </h4>

                  <div className="mt-0">
                    {events.length === 0 ? (
                      <p className="text-muted text-center">
                        No upcoming events found.
                      </p>
                    ) : (
                      events.map((item, index) => {
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
                                  <i
                                    data-feather="calendar"
                                    className="me-1"
                                  ></i>
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
            </div>
            {/* <!-- end profile info --> */}

            {/* <!-- video --> */}
            {/* <!-- <div className="card">
                                        <div className="box-header a1">
                                            <ul className="paddsame">
                                                  
                                                <h4 className="header-title fw-bold mb-0">Team Space  <a style="float: right;" className="font-12 fw-normal text-primary " href="apps-social-feed.html">View All</a></h4>   
                                                </li>
                                               
                                            </ul>
                                        </div> 
                                        <div className="card-body pt-0 gheight">
                                       
                                            <div className="inbox-widget">
                                                <div className="inbox-item mt-1">
                                                    <div className="inbox-item-img"><img src="assets/images/users/user-2.jpg" className="rounded-circle" alt=""></div>
                                                    <p className="inbox-item-author buiness-g text-dark">Business Group</p>
                                                    <p className="inbox-item-text text-dark">January 29. 2024</p>
                                                    <p className="member">Mamber 33+</p>
                                                  
                                                </div>
                                                <div className="inbox-item">
                                                    <div className="inbox-item-img"><img src="assets/images/users/user-3.jpg" className="rounded-circle" alt=""></div>
                                                    <p className="inbox-item-author buiness-g text-dark">Sales Group</p>
                                                    <p className="inbox-item-text text-dark">January 29. 2024</p>
                                                    <p className="member">Mamber 33+</p>
                                                </div>
                                                <div className="inbox-item">
                                                    <div className="inbox-item-img"><img src="assets/images/users/user-4.jpg" className="rounded-circle" alt=""></div>
                                                    <p className="inbox-item-author buiness-g text-dark">IT Group</p>
                                                    <p className="inbox-item-text text-dark">January 29. 2024</p>
                                                    <p className="member">Mamber 33+</p>
                                                </div>
    
                                                <div className="inbox-item mb-0  border-0 pb-0">
                                                    <div className="inbox-item-img"><img src="assets/images/users/user-5.jpg" className="rounded-circle" alt=""></div>
                                                    <p className="inbox-item-author buiness-g text-dark">Marketing Group</p>
                                                    <p className="inbox-item-text text-dark">January 29. 2024</p>
                                                    <p className="member">Mamber 33+</p>
                                                </div>
                                            
                                              
                                            </div>
    
                                          
                                        </div>
                                    </div> -->
     */}

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
                 <NavLink
                 to ="/TeamProfile"
                    style={{ float: "right" }}
                    className="font-11 fw-normal btn btn-primary rounded-pill waves-effect waves-light view-all"
                  
                  >
                    View All
                 </NavLink>
                </h4>

                <div className="inbox-widget mt-2">
                  {users.length === 0 ? (
                    <p className="text-muted mt-2">No team members found.</p>
                  ) : (
                    users.slice(0, 4).map((user: any, index: number) => {
                      const profilePicUrl = `${SITE_URL}/_layouts/15/userphoto.aspx?size=M&username=${user.Email}`;
                      return (
                        <div
                          key={index}
                          className={`inbox-item ${
                            index === users.length - 1 ? "border-0 pb-0" : ""
                          }`}
                        >
                          <a href="contacts-profile.html">
                            <div className="inbox-item-img">
                              <img
                                style={{ marginTop: -5 }}
                                src={profilePicUrl}
                                className="rounded-circle"
                                alt={user.Title}
                                onError={(e: any) =>
                                  (e.target.src =
                                    "https://static.thenounproject.com/png/363640-200.png")
                                }
                              />
                            </div>
                          </a>

                          <a href="contacts-profile.html">
                            <p className="inbox-item-text fw-bold font-14 mb-0 text-dark mt-11 ng-binding">
                              {user.Title}
                            </p>
                          </a>

                          <p
                            style={{
                              color: "#6b6b6b",
                              marginTop: 1,
                              fontWeight: 500,
                            }}
                            className="inbox-item-text font-12"
                          >
                            {user.Department || "Department N/A"}
                          </p>
                        </div>
                      );
                    })
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
              {/* <!-- <div className="box-header a1">
                                        <ul className="paddsame">
                                              
                                            <h4 className="header-title fw-bold mb-0">Upcmong Events <a style="float: right;" className="font-12 fw-normal text-primary " href="apps-calendar.html">View All </a></h4>   
                                            
                                           
                                        </ul>
                                    </div> --> */}
              <div className="card-body pb-0 gheight">
                <h4 className="header-title font-16 text-dark fw-bold mb-0">
                  Employee Recognition
                 <NavLink
                 to="/EmployeeRecognition"
                    style={{ float: "right" }}
                    className="font-11 fw-normal btn btn-primary rounded-pill waves-effect waves-light view-all"
                   
                  >
                    View All
                 </NavLink>
                </h4>

                <div className="row mt-2">
                  {recognitions.length === 0 ? (
                    <p className="text-muted mt-2">No recognitions found.</p>
                  ) : (
                    recognitions.slice(0, 4).map((item: any, index: number) => {
                      const profilePicUrl = `${window.location.origin}/_layouts/15/userphoto.aspx?size=M&username=${item.EmployeeName?.EMail}`;

                      return (
                        <div
                          key={index}
                          className="d-flex border-bottom heit8 align-items-start w-100 justify-content-between pe-0 mb-1 border-radius"
                        >
                          <div className="col-sm-1">
                            <div
                              className="product-price-tag positiont text-primary rounded-circle newc"
                              title="Position"
                            >
                              {(index + 1).toString().padStart(2, "0")}
                            </div>
                          </div>

                          <div className="col-sm-1 ps-2">
                            <img
                              className="rounded-circle"
                              src={profilePicUrl}
                              width="50"
                              alt={item.EmployeeName?.Title || "Employee"}
                              onError={(e: any) =>
                                (e.target.src =
                                  "https://static.thenounproject.com/png/363640-200.png")
                              }
                            />
                          </div>

                          <div className="col-sm-3">
                            <div className="w-100 ps-3 pt-0">
                              <h5
                                style={{ marginTop: 10 }}
                                className="inbox-item-text fw-bold font-14 mb-0 text-dark"
                              >
                                {item.EmployeeName?.Title || "N/A"}
                              </h5>
                              <span
                                style={{ color: "#6b6b6b" }}
                                className="font-12"
                              >
                                {item.Department || "N/A"}
                              </span>
                            </div>
                          </div>

                          <div className="col-sm-4">
                            <a
                              style={{ marginTop: 3 }}
                              href="javascript:void(0);"
                              className="btn btn-sm btn-link text-muted ps-0 pe-0"
                            >
                              <img
                                src={require("../../assets/noun-achievement-6772537.png")}
                                title="Badges"
                                className="me-0"
                              />
                              <img
                                src={require("../../assets/noun-achievement-6772537.png")}
                                title="Badges"
                                className="me-0"
                              />
                              <img
                                src={require("../../assets/noun-achievement-6772537.png")}
                                title="Badges"
                                className="me-0"
                              />
                            </a>
                          </div>

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
                              Points Earned {item.Points || "0"}
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
          {/* <!-- <div className="box-header a1">
                                        <ul className="paddsame">
                                              
                                            <li  className="ntest-h"><span>News Feed</span>    
                                            </li>
                                            <div className="dropdown float-end mt-1">
                                                <a href="#" className="dropdown-toggle arrow-none card-drop" data-bs-toggle="dropdown" aria-expanded="false">
                                                    <i className="fe-more-horizontal-"></i>
                                                </a>
                                                <div className="dropdown-menu dropdown-menu-end">
                                                   
                                                    <a href="news-feed.html" className="dropdown-item">View All</a>
                                           
                                                  
                                                </div>
                                            </div>
                                        </ul>
                                    </div> --> */}
          {/* <!-- <div className="box-header a1">
                                        <ul className="paddsame">
                                              
                                            <h4 className="header-title fw-bold mb-0">Latest News <a style="float: right;" className="font-12 fw-normal text-primary " href="news-feed.html">View All </a></h4>   
                                            
                                           
                                        </ul>
                                    </div> --> */}
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
                  <strong style={{ fontWeight: "500" }} className="text-dark">
                    {" "}
                    <img src={require("../../assets/sec-5.png")} />
                    &nbsp; Strategic Planning
                  </strong>
                  <br />
                  <span>
                    Develop long-term strategies and translate them into annual
                    business plans.
                  </span>
                </div>

                <div className="function mb-2">
                  <strong style={{ fontWeight: "500" }} className="text-dark">
                    {" "}
                    <img src={require("../../assets/sec-6.png")} />
                    &nbsp; Performance Management
                  </strong>
                  <br />
                  <span>
                    Track progress against KPIs and ensure alignment with BAC’s
                    vision.
                  </span>
                </div>

                <div className="function mb-2">
                  <strong style={{ fontWeight: "500" }} className="text-dark">
                    {" "}
                    <img src={require("../../assets/sec-7.png")} />
                    &nbsp; Stakeholder Engagement
                  </strong>
                  <br />
                  <span>
                    Collaborate with airlines, regulators, and government
                    partners.
                  </span>
                </div>

                <div className="function">
                  <strong style={{ fontWeight: "500" }} className="text-dark">
                    {" "}
                    <img src={require("../../assets/sec-8.png")} />
                    &nbsp; Innovation &amp; Transformation
                  </strong>
                  <br />
                  <span>
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
             <NavLink
                 to="/EmployeeRecognition"
                style={{ float: "right" }}
                className="font-11 fw-normal btn btn-primary rounded-pill waves-effect waves-light view-all"
                
              >
                View All{" "}
              </NavLink>
            </h4>

            <div className="">
              {teamAchievements.length === 0 ? (
                <p className="text-muted mt-2">No team achievements found.</p>
              ) : (
                teamAchievements.slice(0, 2).map((team: any, index: number) => (
                  <div
                    key={team.Id}
                    style={{ clear: "both", float: "left" }}
                    className={`mt-2 newhd ${
                      index === 0 ? "" : "border-top pt-2"
                    }`}
                  >
                    <h3
                      style={{
                        textAlign: "left",
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                      className="mt-0 mb-1 text-16 text-dark"
                    >
                      {team.Title || "Untitled Team"}
                    </h3>
                    <p
                      style={{ textAlign: "left", fontSize: "13px" }}
                      className="mb-1"
                    >
                      {team.AchievementDetail || "No details available."}
                    </p>
                    <span
                      style={{ float: "left" }}
                      className={`badge ${
                        index % 2 === 0 ? "btn-danger" : "btn-success"
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
        {/* <!-- <div className="card">
                                 <div className="box-header a1">
                                        <ul className="paddsame">
                                              
                                            <h4 className="header-title fw-bold mb-0">Documents <a style="float: right;" className="font-12 fw-normal text-primary " href="project-list.html">View All </a></h4>   
                                            
                                           
                                        </ul>
                                    </div>
                                    <div className="card-body pt-0">
                                        
                                        <div className="he15 h8 mt-2">
                                            <div className="publication1">
                                             <div className="icon-1">
                                               <img src="assets/images/Group 16811.png">
                                             </div>
                                       
                                              <div className="pub-text">
                                                <h4>Create Project Plan
                                       
                                                 </h4>

                                                 <p className="font-12">2MB <span className="float-end">Document Version1</span></p>
                                                 
                                                
                                       
                                              </div>
                                       
                                            </div>
                                       
                                            <div className="publication1">
                                             <div className="icon-1">
                                                <img src="assets/images/Group 16812.png">
                                             </div>
                                       
                                              <div className="pub-text">
                                                <h4> Business Plan 
                                       
                                                </h4><p className="font-12">5MB <span className="float-end">Document Version2</span></p>
                                               
                                                
                                       
                                              </div>
                                       
                                            </div>
                                       
                                            <div className="publication1 mb-0">
                                             <div style="    margin-bottom: 0px !important;" className="icon-1 mb-0">
                                                <img src="assets/images/Group 16811.png">
                                             </div>
                                       
                                              <div className="pub-text border-0">
                                                <h4>Presentations
                                       
                                                </h4><p className="font-12 mb-0">2MB <span className="float-end">Document Version1</span></p>
                                                
                                       
                                              </div>
                                       
                                            </div>


                                          
                                           
                                        
                                        
                                       </div>
                                  
                                       
                                          

                                      
                                    </div>
                                </div> --> */}

        {/* <!-- <div  className="card">
                                   
                                    <div className="box-header a1">
                                        <ul className="paddsame">
                                              
                                            <h4 className="header-title fw-bold mb-0">Blog Posts And Articles <a style="float: right;" className="font-12 fw-normal text-primary " href="project-list.html">View All </a></h4>   
                                            
                                           
                                        </ul>
                                    </div>
                                    <div className="card-body pt-0 news-fedd news-fedd2">
                                      
                                       <div className="border-bottom mb-0 mt-2">
                                        <div className="imgh">
                                            <img src="blog1.png" width="100%">
                                        </div>
                                        <h4>Mubama Group sponsors Umrah Trip..</h4>
                                        <p className="mb-2 ">Dem ut perspiciatis unde omins iste natus error sit..</p>
                                        <p className="mb-1 font-12">Nov 2, 2023 18:00</p>
                                    
                                    </div>

                                        <div className="mt-2 mb-0 border-bottom">
                                            <div className="imgh">
                                                <img src="assets/images/news2.png" width="100%">
                                            </div>
                                            <h4>Mubama Group sponsors Umrah Trip..</h4>
                                            <p className="mb-2 ">Dem ut perspiciatis unde omins iste natus error sit..</p>
                                            <p className="mb-1 font-12">Nov 2, 2023 18:00</p>
</div>
                                            <div className="border-bottom pb-0 mt-2 mb-0 border-0">
                                                <div className="imgh">
                                                    <img src="blog2.png" width="100%">
                                                </div>
                                                <h4>Mubama Group sponsors Umrah Trip..</h4>
                                                <p className="mb-2 ">Dem ut perspiciatis unde omins iste natus error sit..</p>
                                                <p className="mb-0 font-12">Nov 2, 2023 18:00</p>
                                            
                                            </div>
        
                                            
                                </div>
                            </div>  --> */}
      </div>
      {/* <!-- end page title --> */}

      {/* <!-- end row --> */}

      {/* <!-- end row --> */}

      {/* <!-- end row --> */}
    </div>
    ) }
</>
       
  );
};

export default AboutTheDepartment;
