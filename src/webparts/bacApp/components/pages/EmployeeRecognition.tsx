import * as React from 'react'
import CustomBreadcrumb from "../common/CustomBreadcrumb";
import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";
import { getSP } from "../../loc/pnpjsConfig";
import { useEffect, useState } from "react";
import { SPFI } from "@pnp/sp";
//import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../../../../styles/global.scss";


const EmployeeRecognition = () => {
  const [recognitions, setRecognitions] = useState<any[]>([]);
  const [teamAchievements, setTeamAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const sp: SPFI = getSP();

  const pageSize = 10;

  //  Individual Achievements Pagination
  const [recogDisplay, setRecogDisplay] = useState<any[]>([]);
  const [recogHasMore, setRecogHasMore] = useState(false);
  const [recogPage, setRecogPage] = useState(1);

  //  Team Achievements Pagination
  const [teamDisplay, setTeamDisplay] = useState<any[]>([]);
  const [teamHasMore, setTeamHasMore] = useState(false);
  const [teamPage, setTeamPage] = useState(1);

  const Breadcrumb = [
    {
      MainComponent: "Home",

      MainComponentURl: "Home",
    },

    {
      MainComponent: "Employee Recognition",

      MainComponentURl: "EmployeeRecognition",
    },
  ];
  useEffect(() => {
    const fetchRecognitionData = async () => {
      try {
        const items = await sp.web.lists
          .getByTitle("EmployeeRecognition")
          .items.select(
            "Id",
            "Title",
            "AchievementTitle",
            "AchievementDetail",
            "TopStar",
            "EmployeeName/Title",
            "EmployeeName/EMail"
          )
          .expand("EmployeeName")();

        setRecognitions(items);
        setRecogDisplay(items.slice(0, pageSize));
        setRecogHasMore(items.length > pageSize);
        setRecogPage(1);

      } catch (error) {
        console.error("Error fetching EmployeeRecognition:", error);
      }
    };

    const fetchTeamAchievements = async () => {
      try {
        const items = await sp.web.lists
          .getByTitle("TeamAchievements")
          .items.select("Id", "Title", "AchievementDetail", "AchievementTag")();

        //  Filter for team entries (those without EmployeeName)
        const teamItems = items.filter((i) => !i.EmployeeName);
        setTeamAchievements(teamItems);
        setTeamDisplay(teamItems.slice(0, pageSize));
        setTeamHasMore(teamItems.length > pageSize);
        setTeamPage(1);

      } catch (error) {
        console.error("Error fetching team achievements:", error);
      }
      finally {
        setLoading(false);
      }
    };

    fetchRecognitionData();
    fetchTeamAchievements();
  }, []);


  const loadMoreRecog = () => {
    const next = recogPage + 1;
    const start = (next - 1) * pageSize;
    const end = next * pageSize;

    setRecogDisplay(prev => [...prev, ...recognitions.slice(start, end)]);
    setRecogPage(next);

    if (end >= recognitions.length) setRecogHasMore(false);
  };

  const loadMoreTeam = () => {
    const next = teamPage + 1;
    const start = (next - 1) * pageSize;
    const end = next * pageSize;

    setTeamDisplay(prev => [...prev, ...teamAchievements.slice(start, end)]);
    setTeamPage(next);

    if (end >= teamAchievements.length) setTeamHasMore(false);
  };


  return (
    <div className="row">
      <div className="col-xl-12 col-lg-12">
        <div className="row">
          <div className="col-lg-12">
            {/* <h4 className="page-title fw-bold mb-1 font-20">Employee Recognition</h4>
                                <ol className="breadcrumb m-0">
                        
                                    <li className="breadcrumb-item"><a href="javascript:void(0)">Home</a></li>
                                    <li className="breadcrumb-item"> <span className="fe-chevron-right"></span></li>
                                    <li className="breadcrumb-item active">Employee Recognition</li>
                                </ol> */}
            <CustomBreadcrumb Breadcrumb={Breadcrumb} />
          </div>



        </div>
      </div>
      <div className=" mt-0">



        {/* <!-- Individual Achievements --> */}
        <h2 className="page-title fw-bold mb-2 font-18 mt-2">
          Individual Achievements</h2>
        {loading ? (
          // Loader shown while fetching
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
          <>
            {/* Individual Achievements Section */}
            <div className="emp-achievements">
              <div className="cards">
                {/*  Dynamically bind data from EmployeeRecognition */}
                {recognitions.length === 0 ? (
                  <p>No achievements found.</p>
                ) : (
                  recogDisplay.map((item, index) => (
                    <div className="card" key={item.Id}>
                      {/*  Show ribbon if TopStar is Yes */}
                      {item.TopStar === "Yes" && <span className="ribbon">Top Star</span>}

                      {/* Employee profile picture with fallback */}
                      <img
                        src={`${window.location.origin}/_layouts/15/userphoto.aspx?size=L&username=${item.EmployeeName?.EMail}`}
                        alt={item.EmployeeName?.Title || "Employee"}
                        onError={(e: any) =>
                        (e.target.src =
                          "https://static.thenounproject.com/png/363640-200.png")
                        }
                      />

                      {/*  Bind EmployeeName, AchievementDetail, AchievementTitle */}
                      <h3 className='fw-bold font-16 two-line-one'>{item.EmployeeName?.Title || "N/A"}</h3>
                      <p className='three-line-trim'>{item.AchievementDetail || "No details available."}</p>
                      <span style={{ maxWidth: 'max-content' }} className="badge bg-danger mt-1">{item.AchievementTitle || "N/A"}</span>
                    </div>
                  ))
                )}
              </div>

              {recogHasMore && (
                <div style={{ textAlign: "center" }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{
                      padding: "7px 15px",
                      // backgroundColor: "#ff8200",
                      fontSize: "17px",
                      width: "120px",
                      marginTop: "10px",
                    }}
                    onClick={loadMoreRecog}
                  >
                    Load More
                  </button></div>)}
            </div>



            <h2 className="page-title fw-bold mb-2 font-18 mt-3"> Team Achievements</h2>
            {/* <!-- Team Achievements --> */}
            <div className="">
              {/* Bind data dynamically */}
              {teamAchievements.length === 0 ? (
                <p>No team achievements found.</p>
              ) : (
                teamDisplay.map((team) => (
                  <div className="card mb-2" key={team.Id}>
                    <div className="card-body p-2">
                      <h3 style={{ textAlign: "left" }} className="mt-0 font-16 fw-bold two-line-one">
                        {team.Title || "Untitled Team"}
                      </h3>
                      <p style={{ textAlign: "left" }} className="mb-0 font-14 two-line-one">
                        {team.AchievementDetail || "No details available."}
                      </p>
                      <span style={{ float: "left", maxWidth: 'max-content' }} className="badge bg-danger mt-1">
                        {team.AchievementTag || ""}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {teamHasMore && (
              <div style={{ textAlign: "center" }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{
                    padding: "7px 15px",
                    // backgroundColor: "#ff8200",
                    fontSize: "17px",
                    width: "120px",
                    marginTop: "10px",
                  }}
                  onClick={loadMoreTeam}
                >
                  Load More
                </button>
              </div>
            )}

          </>
        )}



      </div>









    </div>
  )
}

export default EmployeeRecognition