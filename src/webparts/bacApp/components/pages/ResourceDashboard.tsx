import * as React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../../../../styles/global.scss";
import { useEffect, useState } from "react";
import { SPFI } from "@pnp/sp";
import { getSP } from "../../loc/pnpjsConfig";
import FileViewer from "../common/FileViewerNew";
import { Modal } from "react-bootstrap";
import { NavLink } from "react-router-dom";

import CustomBreadcrumb from "../common/CustomBreadcrumb";
const Breadcrumb = [
  {
    MainComponent: "Home",

    MainComponentURl: "Home",
  },

  {
    MainComponent: "Dashboard",

    MainComponentURl: "Dashboard",
  },
];

type SectionData<T = any> = {
  data: T[];
  showViewAll: boolean;
};

type SectionsState = {
  training: SectionData;
  templates: SectionData;
  contacts: SectionData;
};

const ResouceDashboard = () => {
  const [trainingData, setTrainingData] = useState<any[]>([]);
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [showModalTemplateDoc, setShowModalTemplateDoc] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  // Define section-wise display limits
  const LIMITS = {
    training: 6,
    templates: 4,
    contacts: 4,
  };

  // Unified section data & View All state
  const [sections, setSections] = useState<SectionsState>({
    training: { data: [], showViewAll: false },
    templates: { data: [], showViewAll: false },
    contacts: { data: [], showViewAll: false },
  });

  // const fetchAllUsers = async () => {
  //   try {
  //     const sp: SPFI = getSP();

  //     // Step 1: Get all site users (includes groups)
  //     const allUsers = await sp.web.siteUsers();

  //     // Step 2: Filter only real users (PrincipalType = 1)
  //     const realUsers = allUsers.filter((user: any) => user.PrincipalType === 1);

  //     // Step 3: Get Department and other fields from User Info List
  //     const siteUserInfo = await sp.web.siteUserInfoList.items
  //       .select("ID", "Title", "EMail", "Department")
  //       .top(1000)();

  //     // Step 4: Merge both sources (case-insensitive email match) + filter out empty Department
  //     const formattedUsers = siteUserInfo
  //       .filter((info: any) => {
  //         const email = (info.EMail || "").toLowerCase().trim();
  //         const hasDept = info.Department && info.Department.trim() !== "";
  //         const isRealUser = realUsers.some(
  //           (u: any) => (u.Email || "").toLowerCase().trim() === email
  //         );
  //         return isRealUser && hasDept;
  //       })
  //       .map((user: any) => ({
  //         Id: user.ID || "",
  //         Name: user.Title || "",
  //         Email: user.EMail || "",
  //         Department: user.Department || "",
  //         ImageUrl: user.EMail
  //           ? `/_layouts/15/userphoto.aspx?size=M&accountname=${user.EMail}`
  //           : "",
  //       }));

  //     console.log(" Only real users (with department):", formattedUsers);
  //     return formattedUsers;
  //   } catch (error) {
  //     console.error(" Error fetching user information list:", error);
  //     return [];
  //   }
  // };

  const fetchAllUsers = async () => {
    try {
      const sp: SPFI = getSP();

      //  Get all site users (includes groups)
      const allUsers = await sp.web.siteUsers();

      //  Filter only real users (PrincipalType = 1)
      const realUsers = allUsers.filter(
        (user: any) => user.PrincipalType === 1
      );

      //  Get Department etc. from User Info List
      const siteUserInfo = await sp.web.siteUserInfoList.items
        .select("ID", "Title", "EMail", "Department")
        .top(1000)();

      // Filter real users having Department
      const filteredUsers = siteUserInfo.filter((info: any) => {
        const email = (info.EMail || "").toLowerCase().trim();
        const hasDept = info.Department && info.Department.trim() !== "";
        const isRealUser = realUsers.some(
          (u: any) => (u.Email || "").toLowerCase().trim() === email
        );
        return isRealUser && hasDept;
      });

      // Get phone numbers using SharePoint User Profiles
      const usersWithPhones = await Promise.all(
        filteredUsers.map(async (user: any) => {
          try {
            // fetch user profile properties by login name
            const profile = await sp.profiles.getPropertiesFor(user.EMail);

            return {
              Id: user.ID,
              Name: user.Title,
              Email: user.EMail,
              Department: user.Department,
              WorkPhone:
                profile?.UserProfileProperties?.find(
                  (p: any) => p.Key === "WorkPhone"
                )?.Value || "",
              Mobile:
                profile?.UserProfileProperties?.find(
                  (p: any) => p.Key === "CellPhone"
                )?.Value || "",
              ImageUrl: user.EMail
                ? `/_layouts/15/userphoto.aspx?size=M&accountname=${user.EMail}`
                : "",
            };
          } catch (profileError) {
            return {
              Id: user.ID,
              Name: user.Title,
              Email: user.EMail,
              Department: user.Department,
              WorkPhone: "",
              Mobile: "",
              ImageUrl: user.EMail
                ? `/_layouts/15/userphoto.aspx?size=M&accountname=${user.EMail}`
                : "",
            };
          }
        })
      );

      return usersWithPhones;
    } catch (error) {
      setLoading(true);

      return [];
    }
  };

  //  Fetch once on component mount
  useEffect(() => {
    const getUsers = async () => {
      const users = await fetchAllUsers();
      setSections((prev) => ({
        ...prev,
        contacts: {
          data: users.slice(0, LIMITS.contacts),
          showViewAll: users.length > LIMITS.contacts,
        },
      }));
    };
    getUsers();
  }, []);

  useEffect(() => {
    const fetchTrainingData = async () => {
      setLoading(true);
      try {
        const sp: SPFI = getSP();

        //  Get items from TrainingMaterials list
        const items = await sp.web.lists
          .getByTitle("TrainingMaterials")
          .items.select(
            "Title",
            "Department/DepartmentName",
            "TrainingMaterialsID/ID",
            "TrainingMaterialsID/Title",
            "PublishedBy/ID",
            "PublishedBy/Title",
            "PublishedBy/EMail"
          )
          .expand("Department", "TrainingMaterialsID", "PublishedBy")
          .getAll();

        //  For each item, fetch the document details from TrainingMaterialsDocs library
        const enrichedItems = await Promise.all(
          items.map(async (item: any) => {
            let fileInfo = null;

            const relatedDocId =
              item.TrainingMaterialsID?.ID ||
              item.TrainingMaterialsIDId ||
              item.TrainingMaterialsID?.Id ||
              item.TrainingMaterialsID;

            if (relatedDocId && typeof relatedDocId === "number") {
              try {
                fileInfo = await sp.web.lists
                  .getByTitle("TrainingMaterialsDocs")
                  .items.getById(relatedDocId)
                  .select("FileLeafRef", "FileRef")
                  .expand("File")();
              } catch (err) {}
            } else {
            }

            return {
              ...item,
              FileLeafRef: fileInfo?.FileLeafRef || "",
              FileRef: fileInfo?.FileRef || "",
            };
          })
        );

        setSections((prev) => ({
          ...prev,
          training: {
            data: enrichedItems.slice(0, LIMITS.training),
            showViewAll: enrichedItems.length > LIMITS.training,
          },
        }));
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingData();
  }, []);

  // Helper function: Get custom icon based on file type
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";

    switch (ext) {
      case "pdf":
        return require("../../assets/pdf2.png");
      case "doc":
      case "docx":
        return require("../../assets/Group_16811.png");
      case "ppt":
      case "pptx":
        return require("../../assets/Group_16812.png");
      case "xls":
      case "xlsx":
        return require("../../assets/xlsx.png");
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
        return require("../../assets/img.png");
      default:
      // return require("../../assets/file-icon.png");
    }
  };

  // File click logic (integrated with Office Viewer and modal)
  const handleFileClick = (fileUrl: string) => {
    if (!fileUrl) return;

    // Ensure absolute SharePoint URL
    let fullFileUrl = fileUrl;
    if (fileUrl.startsWith("/")) {
      fullFileUrl = `${window.location.origin}${fileUrl}`;
    }

    let viewUrl = fullFileUrl;
    const lowerUrl = fullFileUrl.toLowerCase();

    // Office files → open via Office viewer
    if (
      lowerUrl.endsWith(".xlsx") ||
      lowerUrl.endsWith(".xls") ||
      lowerUrl.endsWith(".docx") ||
      lowerUrl.endsWith(".doc") ||
      lowerUrl.endsWith(".pptx") ||
      lowerUrl.endsWith(".ppt")
    ) {
      // Use internal SharePoint viewer instead of external Office viewer
      viewUrl = `${fullFileUrl}?web=1`;
    }

    // PDFs render directly
    else if (lowerUrl.endsWith(".pdf")) {
      viewUrl = fullFileUrl;
    }

    // Images render directly
    else if (
      lowerUrl.endsWith(".png") ||
      lowerUrl.endsWith(".jpg") ||
      lowerUrl.endsWith(".jpeg") ||
      lowerUrl.endsWith(".gif")
    ) {
      viewUrl = fullFileUrl;
    }

    setSelectedFileUrl(viewUrl);
    setShowFileViewer(true);
    setShowModalTemplateDoc(true);
  };

  const cancelModalAction = () => {
    setShowFileViewer(false);
    setShowModalTemplateDoc(false);
  };

  //template and forms

  const formatSize = (bytes: number | null | undefined): string => {
    if (bytes == null) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(1) + " KB";
    return (kb / 1024).toFixed(1) + " MB";
  };

  useEffect(() => {
    const fetchTemplatesAndForms = async () => {
      const sp = getSP();

      try {
        setLoading(true);

        // Fetch TemplateAndForms list items
        const items = await sp.web.lists
          .getByTitle("TemplateAndForms")
          .items.select(
            "ID",
            "Title",
            "Description",
            "Department/DepartmentName",
            "IconID/ID",
            "AttachmentID/ID"
          )
          .expand("Department", "IconID", "AttachmentID")();

        if (items.length === 0) {
          setSections((prev) => ({
            ...prev,
            templates: { data: [], showViewAll: false },
          }));
          return;
        }

        // Build Attachment ID list
        const allAttachmentIds: number[] = [];
        items.forEach((item: any) => {
          if (item.AttachmentID?.ID) {
            allAttachmentIds.push(Number(item.AttachmentID.ID));
          }
        });

        // Fetch TemplateDocs info (File Size + Version)
        let fileMap: Record<number, any> = {};
        if (allAttachmentIds.length > 0) {
          const filterString = allAttachmentIds
            .map((id) => `Id eq ${id}`)
            .join(" or ");

          try {
            const files = await sp.web.lists
              .getByTitle("TemplateDocs")
              .items.filter(filterString)
              .select(
                "Id",
                "OData__UIVersionString",
                "File/Name",
                "File/ServerRelativeUrl",
                "File/Length"
              )
              .expand("File")();

            fileMap = (files || []).reduce((acc: any, f: any) => {
              const fileData = {
                FileName: f.File?.Name || "",
                FileUrl: f.File?.ServerRelativeUrl
                  ? `${window.location.origin}${f.File.ServerRelativeUrl}`
                  : "",
                FileSize: f.File?.Length || 0,
                FileVersion: f.OData__UIVersionString || "",
              };
              acc[f.Id] = fileData;
              return acc;
            }, {});
          } catch (fileError: any) {}
        } else {
        }

        //  Map data for UI

        const mappedItems = await Promise.all(
          items.map(async (item: any, index: number) => {
            let iconUrl = "";
            let fileUrl = "";
            let fileSize = "";
            let fileVersion = "";

            // Icon (optional)
            if (item.IconID?.ID) {
              try {
                const iconDoc = await sp.web.lists
                  .getByTitle("TemplateDocs")
                  .items.getById(item.IconID.ID)
                  .select("File/ServerRelativeUrl")
                  .expand("File")
                  .configure({
                    headers: {
                      "Cache-Control": "no-cache, no-store, must-revalidate",
                      Pragma: "no-cache",
                      Expires: "0",
                    },
                  })();

                iconUrl = iconDoc?.File?.ServerRelativeUrl
                  ? `${window.location.origin}${iconDoc.File.ServerRelativeUrl}`
                  : "";
              } catch (iconErr: any) {}
            }

            // Attachment (main file)
            if (item.AttachmentID?.ID) {
              const fileInfo = fileMap[item.AttachmentID.ID];
              if (fileInfo) {
                fileUrl = fileInfo.FileUrl;
                fileSize = formatSize(fileInfo.FileSize);
                fileVersion = fileInfo.FileVersion;
              }
            } else {
            }

            const mapped = {
              ID: item.ID,
              Title: item.Title || "",
              Description: item.Description || "",
              Department: item.Department?.DepartmentName || "",
              IconUrl: iconUrl,
              FileUrl: fileUrl,
              FileSize: fileSize,
              FileVersion: fileVersion,
            };

            return mapped;
          })
        );

        //  Update section state for dashboard

        setSections((prev) => ({
          ...prev,
          templates: {
            data: mappedItems.slice(0, LIMITS.templates),
            showViewAll: mappedItems.length > LIMITS.templates,
          },
        }));
      } catch (error: any) {
      } finally {
        setLoading(false);
      }
    };

    fetchTemplatesAndForms();
  }, []);

  return (
    <>
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
        <div className="container-fluid  paddb">
          {/* <!-- start page title --> */}
          <div className="row">
            <div className="col-xl-12 col-lg-12">
              <div className="row">
                <div className="col-lg-12">
                  {/* <h4 className="page-title fw-bold mb-1 font-20">Dashboard</h4>
                            <ol className="breadcrumb m-0">
                                <li className="breadcrumb-item">
                                    <a href="javascript:void(0)">Home</a>
                                </li>
                                <li className="breadcrumb-item">
                                    {" "}
                                    <span className="fe-chevron-right"></span>
                                </li>
                                <li className="breadcrumb-item active">Dashboard</li>
                            </ol> */}
                  <CustomBreadcrumb Breadcrumb={Breadcrumb} />
                </div>

                <div className="row mt-3">
                  {/* <div className="col-md-3"><div className="kpi-card bg-kpi1">Requests Sent<br/><span style={{fontSize:"28px"}}>12</span></div></div>
        <div className="col-md-3"><div className="kpi-card bg-kpi2">Submissions<br/><span style={{fontSize:"28px"}}>2</span></div></div>
        <div className="col-md-3"><div className="kpi-card bg-kpi3">Pending Review<br/><span style={{fontSize:"28px"}}>0</span></div></div>
        <div className="col-md-3"><div className="kpi-card bg-kpi4">Approved<br/><span style={{fontSize:"28px"}}>0</span></div></div> */}

                  <div className="col-md-9">
                    <div
                      style={{
                        float: "left",
                        width: "100%",
                        textAlign: "left",
                      }}
                      className="card desknewview mt-3"
                    >
                      {/* <!-- <div className="box-header a1">
                                        <ul className="paddsame">
                                              
                                            <h4 className="header-title fw-bold mb-0">Gallery     <div className="dropdown float-end mt-0">
                                                <ul className="nav nav-pills navtab-bg nav-justified">
                                                    <li className="nav-item">
                                                        <a href="#home1" data-bs-toggle="tab" aria-expanded="false" className="nav-link">
                                                            Gallery
                                                        </a>
                                                    </li>
                                                    <li className="nav-item">
                                                        <a href="#profile1" data-bs-toggle="tab" aria-expanded="true" className="nav-link active">
                                                            Video
                                                        </a>
                                                    </li>
                                               
                                                </ul>
                                            </div></h4>   
                                            
                                           
                                        </ul>
                                    </div> --> */}

                      <div className="card-body   pb-0">
                        <h4 className="header-title text-dark font-16 fw-bold mb-0">
                          Training Materials{" "}
                          {sections.training.showViewAll && (
                            <NavLink
                              to="/TrainingMaterials"
                              style={{ float: "right" }}
                              className="font-11 fw-normal btn btn-primary rounded-pill waves-effect waves-light view-all"
                            >
                              View All
                            </NavLink>
                          )}
                        </h4>

                        <div className="row internalmedia1 filterable-content mt-2">
                          {sections.training.data.map(
                            (item: any, index: number) => (
                              <div
                                className="col-sm-6 col-xl-4 filter-item all web illustrator"
                                key={index}
                              >
                                <div className="gal-box">
                                  <a
                                    href="#"
                                    className="image-popup"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleFileClick(item.FileRef);
                                    }}
                                    title={item.Title || ""}
                                  >
                                    <div className="newbg2">
                                      {item.FileRef.toLowerCase().endsWith(
                                        ".mp4"
                                      ) ||
                                      item.FileRef.toLowerCase().endsWith(
                                        ".mov"
                                      ) ? (
                                        // 🔹 Show video icon instead of auto-playing the video
                                        <img
                                          src={require("../../assets/Leader-Speak-video-icon.png")}
                                          alt=""
                                          style={{
                                            width: "100%",
                                            cursor: "pointer",
                                          }}
                                        />
                                      ) : (
                                        <img
                                          src={getFileIcon(item.FileLeafRef)}
                                          alt=""
                                          style={{
                                            width: "100%",
                                            cursor: "pointer",
                                          }}
                                        />
                                      )}
                                    </div>
                                  </a>

                                  <div className="gall-info">
                                    {/* Title */}
                                    <h4 className="font-16 mb-0 text-dark fw-bold mt-0">
                                      {item.Title || ""}
                                    </h4>

                                    {/* Department */}
                                    <p
                                      style={{
                                        borderRadius: "4px",
                                        fontWeight: "600",
                                        color: "#da291c",
                                        top: "3px",
                                        position: "relative",
                                      }}
                                      className="font-14 float-start mt-0 mb-1"
                                    >
                                      {item.Department?.DepartmentName || ""}
                                    </p>

                                    {/* Published By */}
                                    <div
                                      style={{ clear: "both" }}
                                      className="mb-1 row"
                                    >
                                      <span
                                        style={{
                                          borderRadius: "4px",
                                          fontWeight: "600",
                                          color: "#da291c",
                                          top: "3px",
                                          position: "relative",
                                        }}
                                        className="font-14 text-muted float-start mt-0"
                                      >
                                        {item.PublishedBy?.Title
                                          ? `Published by: ${item.PublishedBy.Title}`
                                          : ""}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="card mt-3">
                      <div className="card-body pb-0">
                        <h4
                          style={{ textAlign: "left" }}
                          className="header-title text-dark font-16 fw-bold mb-0"
                        >
                          Template and Forms
                          {sections.templates.showViewAll && (
                            <NavLink
                              to="/TemplatesandForms"
                              style={{ float: "right" }}
                              className="font-11 fw-normal btn btn-primary rounded-pill waves-effect waves-light view-all"
                            >
                              View All
                            </NavLink>
                          )}
                        </h4>

                        {sections.templates.data.map(
                          (item: any, index: number) => (
                            <div
                              key={index}
                              style={{
                                borderBottom:
                                  index === templates.length - 1
                                    ? "0px solid #ededed"
                                    : "1px solid #ededed",
                              }}
                              className="upcom2"
                            >
                              <div className="w-100 ps-0">
                                <h4 className="mt-2 mb-1 text-dark font-14 fw-bold ng-binding">
                                  {item.Title}
                                </h4>

                                <p className="mb-1 mt-3 font-12 mt-sm-0 ng-binding">
                                  <div className="meta">
                                    <i className="fas fa-folder"></i>{" "}
                                    {item.Department}{" "}
                                    {item.FileVersion && (
                                      <>• v{item.FileVersion}</>
                                    )}{" "}
                                    {item.FileSize && <>• {item.FileSize}</>}
                                  </div>
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-body pb-3 gheight">
                        <h4 className="header-title font-16 text-dark fw-bold mb-0">
                          Contact Information
                          {sections.contacts.showViewAll && (
                            <NavLink
                              to="/ContactInformation"
                              style={{ float: "right" }}
                              className="font-11 fw-normal btn btn-primary rounded-pill waves-effect waves-light view-all"
                            >
                              View All
                            </NavLink>
                          )}
                        </h4>

                        <div className="inbox-widget">
                          {sections.contacts.data.length > 0 ? (
                            sections.contacts.data.map((person, index) => (
                              <div
                                key={person.Id || index}
                                className={`inbox-item ${
                                  index === 0 ? "mt-1" : ""
                                } ${
                                  index === contacts.length - 1
                                    ? "border-0 pb-0"
                                    : ""
                                }`}
                              >
                                <a href="#">
                                  <div className="inbox-item-img">
                                    <img
                                      style={{ marginTop: 5 }}
                                      src={person.ImageUrl}
                                      className="rounded-circle"
                                      alt={person.Name}
                                    />
                                  </div>
                                </a>

                                <a href="#">
                                  <p className="inbox-item-text fw-bold font-14 mb-0 text-dark mt-11 ng-binding">
                                    {person.Name}
                                  </p>
                                </a>

                                <p
                                  style={{
                                    color: "#6b6b6b",
                                    marginTop: "1px",
                                    fontWeight: "500 !important",
                                  }}
                                  className="inbox-item-text font-12"
                                >
                                  {person.Department}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted font-13 mt-2">
                              No users found.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <main>{/* <!-- Individual Achievements --> */}</main>
            </div>
          </div>

          {/* <!-- end page title -->
                  

                       
                        <!-- end row -->

                        <!-- end row -->

                     
                        <!-- end row --> */}
          <Modal
            show={showModalTemplateDoc}
            onHide={() => setShowModalTemplateDoc(false)}
            size={showFileViewer ? "xl" : "lg"}
            className="newmobmodal"
          >
            <Modal.Body id="style-5">
              <>
                {showFileViewer && (
                  <FileViewer
                    showfile={showFileViewer}
                    docurl={selectedFileUrl || undefined}
                    cancelAction={cancelModalAction}
                  />
                )}
              </>
            </Modal.Body>
          </Modal>
        </div>
      )}
    </>
  );
};

export default ResouceDashboard;
