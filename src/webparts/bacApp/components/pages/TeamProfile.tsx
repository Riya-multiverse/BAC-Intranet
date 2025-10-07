import * as React from "react";
import { useEffect, useState } from "react";
import { SPFI, spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../../../../styles/global.scss";
import { getSP } from "../../loc/pnpjsConfig";
import { SITE_URL } from "../../../../Shared/Constant";
import CustomBreadcrumb from "../common/CustomBreadcrumb";

interface IUser {
  id: number;
  title: string;
  email: string;
  loginName: string;
  mobile?: string;
}


const TeamProfile= () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
const sp: SPFI = getSP();
 useEffect(() => {
  const fetchUsers = async () => {
    console.log(" useEffect started");

    try {
      // if (!context) {
      //   console.error(" No SPFx context received");
      //   return;
      // }

      // console.log(" SPFx Context received:", context);

      //  Setup PnP with current SPFx context
      
      console.log(" PnP SP instance created");

      console.log(" Fetching site users...");
      const rawUsers = await sp.web.siteUsers();
      console.log(" Raw users response:", rawUsers);

      //  Filter: Only actual user accounts (PrincipalType === 1)
      const filteredUsers = rawUsers.filter(
        (user: any) => user.PrincipalType === 1
      );

      console.log(" Filtered only users (no groups):", filteredUsers);

      const formattedUsers: IUser[] = filteredUsers.map((user: any) => ({
        id: user.Id,
        title: user.Title,
        email: user.Email,
        loginName: user.LoginName,
        mobile: user.MobilePhone || ""
      }));

      console.log(" Formatted user objects:", formattedUsers);
      setUsers(formattedUsers);
    } catch (error) {
      console.error(" Error while fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchUsers();
}, []);

 const Breadcrumb = [

        {

            "MainComponent": "Home",

            "MainComponentURl": "Home",


        },

        {

            "MainComponent": "Team Profile",

            "MainComponentURl": "TeamProfile",


        }

    ];
  
  return (
    <div className="content">
      <div className="container-fluid paddb">
        <div className="row">
          <div className="col-xl-12 col-lg-12">
            <div className="row">
              <div className="col-lg-12 mb-3">
                {/* <h4 className="page-title fw-bold font-20">Team Profile</h4>
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <a href="dashboard.html">Home</a>
                  </li>
                  <li className="breadcrumb-item">
                    <span className="fe-chevron-right"></span>
                  </li>
                  <li className="breadcrumb-item active">Team Profile</li>
                </ol> */}
                <CustomBreadcrumb Breadcrumb={Breadcrumb} />
              </div>

              {/* Main Content */}
              <main>
                <div className="grid">
                  {users.map((user) => {
                    const profilePicUrl = `${SITE_URL}/_layouts/15/userphoto.aspx?size=L&username=${user.email}`;

                    return (
                      <div className="card" key={user.id}>
                        <img
                          src={profilePicUrl}
                          alt={user.title}
                          className="profile-pic"
                          onError={(e: any) =>
                            (e.target.src =
                              "https://static.thenounproject.com/png/363640-200.png")
                          }
                        />
                        <h2>{user.title}</h2>
                        <div className="contact mt-2">
                          <p>
                            <i className="fe-mail"></i> {user.email || "N/A"}
                          </p>
                          <p>
                            <i className="fe-phone"></i> {user.mobile || "N/A"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamProfile;
