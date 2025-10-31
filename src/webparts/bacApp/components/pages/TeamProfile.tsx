import * as React from "react";
import { useEffect, useState } from "react";
import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";
import "@pnp/sp/profiles";
//import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../../../../styles/global.scss";
import { getSP } from "../../loc/pnpjsConfig";
import { SITE_URL } from "../../../../Shared/Constant";
import CustomBreadcrumb from "../common/CustomBreadcrumb";

interface IUser {
  Id: number;
  Name: string;
  Email: string;
  Department: string;
  WorkPhone: string;
  Mobile: string;
  ImageUrl: string;
}

const Breadcrumb = [
  {
    MainComponent: "Home",
    MainComponentURl: "Home",
  },
  {
    MainComponent: "Team Profile",
    MainComponentURl: "TeamProfile",
  },
];

const TeamProfile = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const sp: SPFI = getSP();

  //Fetch only real users and their profile info
  const fetchAllUsers = async () => {
    try {
      //Get all site users
      const allUsers = await sp.web.siteUsers();

      //Filter only real users (PrincipalType = 1)
      const realUsers = allUsers.filter(
        (user: any) =>
          user.PrincipalType === 1 &&
          !user.LoginName.startsWith("SHAREPOINT\\") &&
          !user.LoginName.includes("app@")
      );

      //Get Department etc. from User Info List
      const siteUserInfo = await sp.web.siteUserInfoList.items
        .select("ID", "Title", "EMail", "Department")
        .top(1000)();

      //Filter real users having Department
      const filteredUsers = siteUserInfo.filter((info: any) => {
        const email = (info.EMail || "").toLowerCase().trim();
        const hasDept = info.Department && info.Department.trim() !== "";
        const isRealUser = realUsers.some(
          (u: any) => (u.Email || "").toLowerCase().trim() === email
        );
        return isRealUser && hasDept;
      });

      //Get WorkPhone and Mobile using User Profiles
      const usersWithPhones = await Promise.all(
        filteredUsers.map(async (user: any) => {
          try {
            const profile = await sp.profiles.getPropertiesFor(user.EMail);

            const workPhone =
              profile?.UserProfileProperties?.find(
                (p: any) => p.Key === "WorkPhone"
              )?.Value || "";

            const mobilePhone =
              profile?.UserProfileProperties?.find(
                (p: any) => p.Key === "CellPhone"
              )?.Value || "";

            return {
              Id: user.ID,
              Name: user.Title,
              Email: user.EMail,
              Department: user.Department,
              WorkPhone: workPhone,
              Mobile: mobilePhone,
              ImageUrl: `${SITE_URL}/_layouts/15/userphoto.aspx?size=L&username=${encodeURIComponent(
                user.EMail
              )}`,
            };
          } catch (profileError) {
          
            return {
              Id: user.ID,
              Name: user.Title,
              Email: user.EMail,
              Department: user.Department,
              WorkPhone: "",
              Mobile: "",
              ImageUrl: `${SITE_URL}/_layouts/15/userphoto.aspx?size=L&username=${encodeURIComponent(
                user.EMail
              )}`,
            };
          }
        })
      );

  
      setUsers(usersWithPhones);
    } catch (error) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  return (
    <div className="content">
      <div className="container-fluid paddb">
        <div className="row">
          <div className="col-xl-12 col-lg-12">
            <div className="row">
              <div className="col-lg-12 mb-3">
                <CustomBreadcrumb Breadcrumb={Breadcrumb} />
              </div>

              {/* Main Content */}
              <main>
                {loading ? (
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
                  <div className="Team-profile">
                    <div className="grid">
                      {users.length === 0 ? (
                        <p>No users found.</p>
                      ) : (
                        users.map((user) => (
                          <div className="card" key={user.Id}>
                            <img
                              src={user.ImageUrl}
                              alt={user.Name}
                              className="profile-pic"
                            />
                            <h2>{user.Name}</h2>

                            <p
                              className="inbox-item-text font-12"
                              // style={{
                              //   color: "#6b6b6b",
                              //   marginTop: "1px",
                              //   fontWeight: "500 !important",
                              // }}
                            >
                              {user.Department}
                            </p>

                            <div className="contact mt-2">
                              <p>
                                <i className="fas fa-envelope"></i> {user.Email}
                              </p>
                              <p>
                                <i className="fe-phone"></i> {user.Mobile}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamProfile;
