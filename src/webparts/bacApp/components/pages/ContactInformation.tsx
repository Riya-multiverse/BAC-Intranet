import * as React from "react";
import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";
import "@pnp/sp/profiles";
import { getSP } from "../../loc/pnpjsConfig";
import { useEffect, useState } from "react";
import { SPFI } from "@pnp/sp";
//import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../../../../styles/global.scss";
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
    MainComponent: "Contact Information",
    MainComponentURl: "ContactInformation",
  },
];

const ContactInformation = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const sp: SPFI = getSP();
  const [userInfoList, setuserInfoList] = useState<any[]>([]);
  const pageSize = 10;
  const [visibleUsers, setVisibleUsers] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);


  // Fetch all users from SharePoint + their phones from User Profile Service
  const fetchAllUsers = async () => {
    try {
      //Get all site users (includes groups)
      const allUsers = await sp.web.siteUsers();

      // Filter only real users (PrincipalType = 1)
      const realUsers = allUsers.filter(
        (user: any) =>
          user.PrincipalType === 1 &&
          !user.LoginName.startsWith("SHAREPOINT\\") &&
          !user.LoginName.includes("app@")
      );

      //  Get Department etc. from User Info List
      const siteUserInfo = await sp.web.siteUserInfoList.items
        .select("ID", "Title", "EMail", "Department")
        .top(1000)();

      //  Filter real users having Department
      const filteredUsers = siteUserInfo.filter((info: any) => {
        const email = (info.EMail || "").toLowerCase().trim();
        const hasDept = info.Department && info.Department.trim() !== "";
        const isRealUser = realUsers.some(
          (u: any) => (u.Email || "").toLowerCase().trim() === email
        );
        return isRealUser && hasDept;
      });

      //Get phone numbers using User Profiles
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
              ImageUrl: `/_layouts/15/userphoto.aspx?size=L&accountname=${user.EMail}`,
            };
          } catch (profileError) {
            return {
              Id: user.ID,
              Name: user.Title,
              Email: user.EMail,
              Department: user.Department,
              WorkPhone: "",
              Mobile: "",
              ImageUrl: `/_layouts/15/userphoto.aspx?size=L&accountname=${user.EMail}`,
            };
          }
        })
      );
      return usersWithPhones;
    } catch (error) {
      return [];
    }
  };

  const getUserInformationList = async () => {
    try {

      const items = await sp.web.lists
        .getByTitle("User Information List")
        .items.select("*,ID", "Title", "Name", "EMail", "Department", "JobTitle").filter("ContentType eq 'Person'")
        .top(5000)
        .getAll();

      console.log("User Information List items:", items);
      setuserInfoList(items);
      setVisibleUsers(items.slice(0, pageSize));
      setHasMore(items.length > pageSize);
      setPage(1);
      // return items;
    } catch (error) {
      console.error("Error fetching User Information List:", error);
    }
  };

  // Fetch once on mount and set state
  useEffect(() => {
    const getUsers = async () => {
      const users = await fetchAllUsers();
      setUsers(users);
      setLoading(false);
    };
    // getUsers();
    getUserInformationList();
    setLoading(false);
  }, []);

  const loadMore = () => {
    const next = page + 1;
    const start = (next - 1) * pageSize;
    const end = next * pageSize;

    setVisibleUsers(prev => [...prev, ...userInfoList.slice(start, end)]);
    setPage(next);

    if (end >= userInfoList.length) setHasMore(false);
  };

  return (
    <div className="row">
      <div className="col-xl-12 col-lg-12">
        <div className="row">
          <div className="col-lg-12 mb-1">
            <CustomBreadcrumb Breadcrumb={Breadcrumb} />
          </div>

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
              <div className="emp-achievements">
                <div className="cards">
                  {userInfoList.length === 0 ? (
                    <p>No users found.</p>
                  ) : (
                    visibleUsers.map((user) => {
                      const imageUrl = `/_layouts/15/userphoto.aspx?size=L&accountname=${user.EMail}`;
                      return (
                        <div className="card" key={user.Id}>
                          <img src={imageUrl} alt={user.Title} />
                          <h3 className="font-15 text-dark fw-bold two-line-one" title={user.Title}>{user.Title}</h3>
                          <p
                            className="inbox-item-text font-12 mb-0"
                            style={{
                              color: "#6b6b6b",
                              marginTop: "1px",
                              fontWeight: 500, // remove !important
                            }}
                          >
                            {user.JobTitle}
                          </p>
                          <p className="contact font-11">
                            <i className="fas fa-envelope"></i> {user.EMail}
                          </p>
                          <p className="contact font-11"><i className="fas fa-phone"></i> {user.WorkPhone}</p>
                        </div>
                      );
                    })
                  )}
                </div>
                {hasMore && (
                  <div style={{ textAlign: "center" }}>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{
                                padding: "7px 15px",
                                // backgroundColor: "#ff8200",
                                fontSize: "17px",
                                width: "120px",
                                marginTop: "10px",
                            }}
                      onClick={loadMore}
                    >
                      Load More
                    </button>
                  </div>
                )}

              </div>

              // </div>
            )}
      </main>
    </div>
      </div >
    </div >
  );
};

export default ContactInformation;
