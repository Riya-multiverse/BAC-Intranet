import * as React from 'react';
import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";
import { getSP } from "../../loc/pnpjsConfig";
import { useEffect, useState } from "react";
import { SPFI } from "@pnp/sp";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../../../../styles/global.scss";
import { SITE_URL } from "../../../../Shared/Constant";
import CustomBreadcrumb from '../common/CustomBreadcrumb';

interface IUser {
  id: number;
  title: string;
  email: string;
  loginName: string;
  mobile?: string;
  photoUrl: string;
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

  useEffect(() => {
    const fetchUsers = async () => {
      console.log(" Fetching site users with profile pictures...");

      try {
        const rawUsers = await sp.web.siteUsers();
        console.log(" Raw users:", rawUsers);

        const filteredUsers = rawUsers.filter(
          (user: any) =>
            user.PrincipalType === 1 &&
            !user.LoginName.startsWith("SHAREPOINT\\") && 
          !user.LoginName.includes("app@")
        );

       const formattedUsers: IUser[] = filteredUsers.map((user: any) => {
        const profilePicUrl = `${SITE_URL}/_layouts/15/userphoto.aspx?size=L&username=${encodeURIComponent(user.Email)}`;

          return {
            id: user.Id,
            title: user.Title,
            email: user.Email,
            loginName: user.LoginName,
            mobile: user.MobilePhone || "",
           photoUrl: profilePicUrl,
          };
        });

        // Sort users alphabetically
        formattedUsers.sort((a, b) => a.title.localeCompare(b.title));

        setUsers(formattedUsers);
      } catch (error) {
        console.error(" Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="row">
      <div className="col-xl-12 col-lg-12">
        <div className="row">
          <div className="col-lg-12 mb-3">
            <CustomBreadcrumb Breadcrumb={Breadcrumb} />
          </div>

          <main>
              {loading ?
 
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
                                            :(
           <div className="emp-achievements">
            <div className="cards">
              {loading ? (
                <p>Loading users...</p>
              ) : users.length === 0 ? (
                <p>No users found.</p>
              ) : (
                users.map((user) => (
                  <div className="card" key={user.id}>
                   <img
  src={user.photoUrl}
  alt={user.title}
  onError={(e) => {
    (e.target as HTMLImageElement).src =
      "https://static.thenounproject.com/png/4035889-200.png"; // fallback
  }}
/>

                    <h3>{user.title}</h3>
                    {/* <p className="role">Site User</p> */}
                    <p className="contact">
                      <i className="fas fa-envelope"></i> {user.email}
                    </p>
                  </div>
                ))
              )}
            </div></div> 
           ) }
          </main>
        </div>
      </div>
    </div>
  );
};

export default ContactInformation;
