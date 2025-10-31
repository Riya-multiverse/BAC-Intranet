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

                 <main>

                     
  {/* <!-- Individual Achievements --> */}
  <h2 className="page-title fw-bold mb-3 font-20 mt-3">
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
      recognitions.map((item, index) => (
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
          <h3>{item.EmployeeName?.Title || "N/A"}</h3>
          <p>{item.AchievementDetail || "No details available."}</p>
          <span className="badge gold">{item.AchievementTitle || "N/A"}</span>
        </div>
      ))
    )}
  </div>
  </div>



  <h2 className="page-title fw-bold mb-3 font-16 mt-1"> Team Achievements</h2> 
{/* <!-- Team Achievements --> */}
<div className="">
  {/* Bind data dynamically */}
  {teamAchievements.length === 0 ? (
    <p>No team achievements found.</p>
  ) : (
    teamAchievements.map((team) => (
      <div className="card" key={team.Id}>
        <div className="card-body p-2">
          <h3 style={{ textAlign: "left" }} className="mt-0">
            {team.Title || "Untitled Team"}
          </h3>
          <p style={{ textAlign: "left" }} className="mb-0">
            {team.AchievementDetail || "No details available."}
          </p>
          <span style={{ float: "left" }} className="badge gold">
            {team.AchievementTag || ""}
          </span>
        </div>
      </div>
    ))
  )}
</div>
</>
  )}
</main>
                         
                           
                        </div>
                          

                       

                               
                        
                        
                            
                            
                            </div>
  )
}

export default EmployeeRecognition