import * as React from "react";
import CustomBreadcrumb from "../../common/CustomBreadcrumb";
import { NavLink } from "react-router-dom";
import { ArrowLeft, PlusCircle, FileText } from "react-feather";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { SPFI } from "@pnp/sp";
import { getSP } from "../../../loc/pnpjsConfig";
// import '../../../../styles/global.scss';
import "bootstrap-icons/font/bootstrap-icons.css";
import { MoreHorizontal } from "react-feather";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const DepartmentInitiativeMain = () => {
  const sp: SPFI = getSP();
  const [projects, setProjects] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [showModal, setShowModal] = React.useState(false);


  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [filteredProjects, setFilteredProjects] = React.useState<any[]>([]);
  const [activeTab, setActiveTab] = React.useState<string>("All");
  const [openDropdownIndex, setOpenDropdownIndex] = React.useState<number | null>(null);
  const [showDetails, setShowDetails] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<any>(null);


  const navigate = useNavigate();

  const Breadcrumb = [
    {
      MainComponent: "Home",

      MainComponentURl: "Home",
    },

    {
      MainComponent: "Department Initiatives",

      MainComponentURl: "DepartmentInitiatives",
    },
  ];
  // Track which project index is expanded
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };


  //project of the month
  React.useEffect(() => {
    const fetchProjects = async () => {
      //  Get current logged-in user
      const user = await sp.web.currentUser();
      setCurrentUser(user);
      try {
        const items = await sp.web.lists
          .getByTitle("DepartmentInitiative")
          .items.select(
            "Id",
            "Title",
            "Description",
            "Department/Id",
            "Department/DepartmentName",
            "ApproverName/Id",
            "ApproverName/Title",
            "ApproverName/EMail",
            "Attachment/Id",
            "Thumbnail/Id"
          )
          .expand("Department", "ApproverName", "Attachment", "Thumbnail")
          .orderBy("Created", false)
          .top(6)();
        // .top(4999)(); // Top 6 projects for dashboard

        const today = new Date();

        const formatted = items.map((item: any, index: number) => {

          return {
            Id: item.Id,
            Sno: index + 1,
            Title: item.Title || "",
            Description: item.Description || "",
            Department: item.Department?.DepartmentName || "",
            Approver: item.ApproverName?.Title || "",
            ApproverEmail: item.ApproverName?.EMail || "",
            DocumentsCount: item.Attachment?.length || 0,
            ThumbnailId: item.Thumbnail?.Id || null,
            AttachmentIds: Array.isArray(item.Attachment)
              ? item.Attachment.map((a: any) => a.Id)
              : [],
          };

        });

        setProjects(formatted);
        setFilteredProjects(formatted); // default "All"
        //  await loadThumbnails();


      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();

  }, []);

  //  Load thumbnails only when projects are fetched
  React.useEffect(() => {
    if (projects.length > 0) {
      loadThumbnails(projects);
    }
  }, [projects]);



  const loadThumbnails = async (projectsList: any[]) => {

    if (!projectsList || projectsList.length === 0) {

      return;
    }

    const updated = await Promise.all(
      projectsList.map(async (proj: any, index: number) => {


        if (!proj.ThumbnailId) {
          return proj;
        }

        try {
          const file = await sp.web.lists
            .getByTitle("DepartmentInitiativeDocs")
            .items.getById(proj.ThumbnailId)
            .select("FileRef,FileLeafRef")();
          return {
            ...proj,
            ThumbnailUrl: `${window.location.origin}${file.FileRef}`,
          };
        } catch (error) {
          return proj;
        }
      })
    );
    setFilteredProjects(updated);
  };



  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);

    if (tabName === "All") {
      setFilteredProjects(projects);
    } else if (tabName === "Owner") {
      const owned = projects.filter(
        (p) =>
          p.Author?.EMail?.toLowerCase() === currentUser?.Email?.toLowerCase()
      );
      setFilteredProjects(owned);
    } else if (tabName === "Member") {
      const memberProjects = projects.filter((p) =>
        p.teamMembers.some(
          (m: any) =>
            m.EMail?.toLowerCase() === currentUser?.Email?.toLowerCase()
        )
      );
      setFilteredProjects(memberProjects);
    }
  };


  React.useEffect(() => {
    const saved = sessionStorage.getItem("selectedInitiativeItem");
    const show = sessionStorage.getItem("showInitiativeDetails") === "true";

    if (saved && show) {
      setSelectedItem(JSON.parse(saved));
      setShowDetails(true);
    }
  }, []);



  ///for view details
  const handleViewDetails = (proj: any) => {
    const storageItem = {
      id: proj.Id,
      title: proj.Title || "",
      description: proj.Description || "",
      department: proj.Department || "",
      thumbnailUrl: proj.ThumbnailUrl || "",
      attachmentIds: proj.AttachmentIds || [],
      created: proj.Created || "",
      approver: proj.Approver || "",
    };

    sessionStorage.setItem("selectedInitiativeItem", JSON.stringify(storageItem));
    sessionStorage.setItem("showInitiativeDetails", "true");
    navigate("/DepartmentInitiativeDetails");
    // setSelectedItem(storageItem);
    // setShowDetails(true);
  };



  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        openDropdownIndex !== null &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpenDropdownIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdownIndex]);



  return (
    <>
      {loading ? (
        <div className="loadernewadd mt-10">
          <div>
            <img
              src={require("../../../assets/BAC_loader.gif")}
              className="alignrightl"
              alt="Loading..."
            />
          </div>
          <span>Loading </span>{" "}
          <span>
            <img
              src={require("../../../assets/edcnew.gif")}
              className="alignrightl"
              alt="Loading..."
            />
          </span>
        </div>
      ) : (
        <>
          <div className="row">
            <div className="col-lg-4">
              <CustomBreadcrumb Breadcrumb={Breadcrumb} />
            </div>
            <div className="col-lg-8">
              <div className="d-flex flex-wrap align-items-center justify-content-end mt-3">

              </div>
            </div>
          </div>

          <div style={{ marginBottom: "13px;" }} className="row mt-3">

          </div>

          <div className="row">
            {filteredProjects && filteredProjects.length > 0 ? (
              filteredProjects.map((proj: any, index: number) => (
                <div className="col-12" key={proj.Id}>
                  <div className="card mb-2">
                    <div className="card-body">
                      <div className="row align-items-start">

                        {/* Left Side Document Icon/Thumbnail */}
                        <div className="col-sm-2" style={{ cursor: "pointer" }}>
                          <div className="imagehright">

                            <img
                              className="d-flex align-self-center me-3 w-100"
                              src={proj.ThumbnailUrl || "https://via.placeholder.com/150?text=Preview"}
                              data-themekey="#"
                            />

                          </div>
                        </div>

                        {/*  Center Content */}
                        <div className="col-sm-9" style={{ cursor: "pointer" }}
                          onClick={() => handleViewDetails(proj)}
                        >
                          <div className="row">
                            <div className="col-sm-4">

                              &nbsp; | &nbsp;
                              <span style={{ color: "#009157", fontWeight: 600 }}>
                                {proj.Department}
                              </span>
                            </div>
                          </div>

                          <h4 className="mt-0 mb-1 font-16 text-dark fw-bold">
                            {proj.Title}
                          </h4>

                          <p style={{ color: "#6b6b6b" }} className="mb-2 font-14">
                            {expandedIndex === index
                              ? proj.Description
                              : proj.Description?.length > 100
                                ? `${proj.Description.substring(0, 100)}...`
                                : proj.Description}

                            {proj.Description?.length > 100 && (
                              <a
                                href="javascript:void(0);"
                                onClick={(e) => {
                                  e.stopPropagation(); //  Stop navigation
                                  toggleExpand(index);
                                }}
                                className="fw-bold ms-1"
                              >
                                {expandedIndex === index ? "View Less" : "view more"}
                              </a>
                            )}
                          </p>

                          <p className="mb-1 font-12">
                            <span style={{ color: " #6e767e;" }} className="pe-2 text-nowrap mb-1 d-inline-block">

                              <FileText color="#6c757d" size={18} />
                              <b>{proj.DocumentsCount}</b> Document(s)
                            </span>

                          </p>
                        </div>



                        <div className="col-sm-1 text-end" style={{ position: "relative" }}>
                          <button
                            type="button"
                            className="btn border-0 ps-0 pt-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newState =
                                openDropdownIndex === index ? null : index;
                              setOpenDropdownIndex(newState);
                            }}
                          >
                            <MoreHorizontal size={20} className="cursor-pointer text-muted" />
                          </button>

                          {openDropdownIndex === index && (
                            <div
                              ref={dropdownRef}   //  Move ref here only!
                              className="dropdown-menu show shadow-sm rounded"
                              style={{
                                position: "absolute",
                                right: 0,
                                top: "100%",
                                minWidth: "160px",
                                background: "#fff",
                                zIndex: 2000,
                                display: "block",
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                className="dropdown-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownIndex(null);
                                  handleViewDetails(proj);
                                }}
                              >
                                View Details
                              </button>
                            </div>
                          )}
                        </div>




                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted mt-2">
                <p>No Initiatives Found</p>
              </div>
            )}



          </div>

        </>
      )}

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        className="filemodal"
      >
        <Modal.Header closeButton>
          <Modal.Title>

          </Modal.Title>
        </Modal.Header>


      </Modal>
    </>
  );
};

export default DepartmentInitiativeMain;
