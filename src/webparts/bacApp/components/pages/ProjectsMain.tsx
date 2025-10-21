import * as React from 'react'
import CustomBreadcrumb from "../common/CustomBreadcrumb";
import { NavLink } from "react-router-dom";
import { ArrowLeft, PlusCircle, FileText } from "react-feather";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { SPFI } from "@pnp/sp";
import { getSP } from "../../loc/pnpjsConfig";
// import '../../../../styles/global.scss';
import "bootstrap-icons/font/bootstrap-icons.css";
import { MoreHorizontal } from "react-feather";
import { Modal } from 'react-bootstrap';
const ProjectsMain = () => {
    const sp: SPFI = getSP();
    const [projects, setProjects] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [showModal, setShowModal] = React.useState(false);
    const [modalItem, setModalItem] = React.useState<any[]>([]);
    const [currentUser, setCurrentUser] = React.useState<any>(null);
    const [filteredProjects, setFilteredProjects] = React.useState<any[]>([]);
    const [activeTab, setActiveTab] = React.useState<string>("All");
    const Breadcrumb = [
        {
            MainComponent: "Home",

            MainComponentURl: "Home",
        },

        {
            MainComponent: "Projects",

            MainComponentURl: "Projects",
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
            // ✅ Get current logged-in user
            const user = await sp.web.currentUser();
            setCurrentUser(user);
            try {


                const items = await sp.web.lists
                    .getByTitle("Projects")
                    .items.select(
                        "Id",
                        "Title",
                        "ProjectName",
                        "ProjectOverview",
                        "StartDate",
                        "DueDate",
                        "Department/DepartmentName",
                        "Department/Id",
                        "TeamMembers/Title",
                        "TeamMembers/EMail",
                        "TeamMembers/Id",
                        "Attachment/ID,Author/EMail"
                    )
                    .expand("Department,TeamMembers,Attachment,Author")
                    .orderBy("Created", false)
                    .top(4999)(); // Top 6 projects for dashboard

                const today = new Date();

                const formatted = items.map((item: any, index: number) => {
                    const startDate = item.StartDate ? new Date(item.StartDate) : null;
                    const dueDate = item.DueDate ? new Date(item.DueDate) : null;

                    //  Status Logic
                    let computedStatus = "Not Started";
                    if (startDate && dueDate) {
                        if (today < startDate) {
                            computedStatus = "Not Started";
                        } else if (today >= startDate && today <= dueDate) {
                            computedStatus = "Ongoing";
                        } else if (today > dueDate) {
                            computedStatus = "Finished";
                        }
                    }

                    return {
                        // id: item.Id,
                        // Sno: index + 1,
                        ProjectName: item.ProjectName || "",
                        Overview: item.ProjectOverview || "",
                        Department: item.Department?.DepartmentName || "",
                        teamMembers: item.TeamMembers || [],
                        StartDate: startDate,
                        DueDate: dueDate,
                        Status: computedStatus, // ← dynamic
                        Documents: item.Attachment ? item.Attachment.length : 0, // lookup count
                        Author:item.Author
                    };
                });

                setProjects(formatted);
                setFilteredProjects(formatted); // default "All"
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

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
                    (m: any) => m.EMail?.toLowerCase() === currentUser?.Email?.toLowerCase()
                )
            );
            setFilteredProjects(memberProjects);
        }
    };


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

                <>
                    <div className="row">
                        <div className="col-lg-4">
                            <CustomBreadcrumb Breadcrumb={Breadcrumb} />
                        </div>
                        <div className="col-lg-8">
                            <div className="d-flex flex-wrap align-items-center justify-content-end mt-3">
                                {/* <a href="https://officeindia.sharepoint.com/sites/AlRostmania/SitePages/App.aspx#/ProjectRequest" className="btn btn-secondary   waves-effect waves-light"> <i className="fe-plus-circle"></i> New Request</a> */}

                                <NavLink className="btn btn-secondary   waves-effect waves-light"
                                    to="/ProjectMaster">
                                    <PlusCircle className="me-1" size={18} />New Request
                                </NavLink>

                            </div>
                        </div>

                    </div>


                    <div style={{ marginBottom: "13px;" }} className="row mt-3">
                        <div className="col-12">
                            <div className="card mb-0">
                                <div className="card-body">
                                    <div className="row justify-content-between">
                                        <div className="col-md-12">
                                            <div className="d-flex flex-wrap align-items-center justify-content-center">
                                                <ul className="nav nav-pills navtab-bg float-end" role="tablist">
                                                    {/* <li className="nav-item" role="presentation">
                                                        <a href="#home1" data-bs-toggle="tab" aria-expanded="true" className="nav-link active" aria-selected="true" role="tab">
                                                            All
                                                        </a>
                                                    </li>
                                                    <li className="nav-item" role="presentation">
                                                        <a href="#profile1" data-bs-toggle="tab" aria-expanded="false" className="nav-link" aria-selected="false" role="tab" >
                                                            Owner
                                                        </a>
                                                    </li>
                                                    <li className="nav-item" role="presentation">
                                                        <a href="#profile11" data-bs-toggle="tab" aria-expanded="false" className="nav-link" aria-selected="false" role="tab" >
                                                            Member
                                                        </a>
                                                    </li> */}
                                                    {["All", "Owner", "Member"].map((tab) => (
                                                        <li key={tab} className="nav-item" role="presentation">
                                                            <a
                                                                href="javascript:void(0);"
                                                                className={`nav-link ${activeTab === tab ? "active" : ""}`}
                                                                onClick={() => handleTabClick(tab)}
                                                                role="tab"
                                                            >
                                                                {tab}
                                                            </a>
                                                        </li>
                                                    ))}

                                                </ul>
                                            </div></div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>



                    <div className="row">
                        {filteredProjects && filteredProjects.length > 0 ? (
                            filteredProjects.map((proj: any, index: number) => (<div className="col-lg-4">
                                <div className="card project-box">
                                    <div className="card-body">
                                        <div className="dropdown float-end">
                                            {/* <a href="#" className="dropdown-toggle card-drop arrow-none" data-bs-toggle="dropdown" aria-expanded="false"> */}
                                            {/* <i className="fe-more-horizontal- m-0 text-muted h3"></i> */}
                                            <MoreHorizontal size={18} className="cursor-pointer  m-0 text-muted h3" />
                                            {/* </a> */}
                                            <div className="dropdown-menu dropdown-menu-end">

                                                <a className="dropdown-item" href="#">Delete</a>
                                                <a className="dropdown-item" href="#">View Detail</a>

                                            </div>
                                        </div>

                                        <h4 className="mt-0 mb-1"><a href="#" className="text-dark fw-bold font-16">{proj.ProjectName}</a></h4>
                                        <p className="text-muted text-uppercase mb-1"> <small>{proj.Department}</small></p>
                                        {/* <div className="finish mb-2">Finished</div> */}
                                        <div
                                            className="finish mb-2"
                                            style={{
                                                background:
                                                    proj.status === "Ongoing"
                                                        ? "#6b6f6f"
                                                        : proj.status === "Finished"
                                                            ? "#28a745"
                                                            : "#999",
                                                color: "#fff",
                                            }}
                                        >
                                            {proj.Status}
                                        </div>
                                        <div>


                                        </div>
                                        {/* <p
                                            style={{ color: "#98a6ad" }}
                                            className="date-color font-12 mb-3 sp-line-2"
                                        >
                                            {proj.Overview?.length > 100
                                                ? `${proj.Overview.substring(0, 100)}...`
                                                : proj.Overview}

                                            {proj.Overview?.length > 100 && (
                                                <a
                                                    href="javascript:void(0);"
                                                    className="fw-bold text-muted ms-1"
                                                >
                                                    view more
                                                </a>
                                            )}
                                        </p> */}
                                        <p style={{ color: "#98a6ad" }} className="date-color font-12 mb-3 sp-line-2">
                                            {expandedIndex === index
                                                ? proj.Overview
                                                : proj.Overview?.length > 100
                                                    ? `${proj.Overview.substring(0, 100)}...`
                                                    : proj.Overview}

                                            {proj.Overview?.length > 100 && (
                                                <a
                                                    href="javascript:void(0);"
                                                    onClick={() => toggleExpand(index)}
                                                    className="fw-bold text-muted ms-1"
                                                >
                                                    {expandedIndex === index ? "view less" : "view more"}
                                                </a>
                                            )}
                                        </p>

                                        {/* <p style={{ color: " #98a6ad;" }} className="date-color font-12  mb-3 sp-line-2">
                                            {proj.overview?.substring(0, 100)}...
                                            <a href="javascript:void(0);" className="fw-bold text-muted">view more</a>
                                        </p> */}

                                        <p className="mb-1 font-12">
                                            <span style={{ color: " #6e767e;" }} className="pe-2 text-nowrap mb-1 d-inline-block">
                                                {/* <i className="fe-file-text text-muted"></i> */}
                                                <FileText color="#6c757d" size={18} />
                                                <b>{proj.Documents}</b> Document(s)
                                            </span>
                                            {/* <span style={{ color: " #6e767e;" }} className="text-nowrap mb-1 d-inline-block">
                                                <i className="fe-message-square text-muted"></i>
                                                <b>0</b> Comments
                                            </span> */}
                                        </p>

                                        <div className="avatar-group mb-2" id="tooltips-container">

                                            {proj.teamMembers &&
                                                proj.teamMembers.length > 0 ? (
                                                proj.teamMembers
                                                    .slice(0, 4)
                                                    .map((member: any, idx: number) => (
                                                        <a
                                                            key={idx}
                                                            href="javascript: void(0);"
                                                            className="avatar-group-item"
                                                        >
                                                            <img
                                                                src={`/_layouts/15/userphoto.aspx?size=S&username=${member.EMail}`}
                                                                className="rounded-circle avatar-sm"
                                                                alt={member.Title}
                                                                data-bs-container="#tooltips-container"
                                                                data-bs-toggle="tooltip"
                                                                data-bs-placement="bottom"
                                                                aria-label={member.Title}
                                                                data-bs-original-title={member.Title}
                                                                data-themekey="#"
                                                                title={member.Title}
                                                            />
                                                        </a>
                                                    ))
                                            ) : (
                                                <a
                                                    href="javascript: void(0);"
                                                    className="text-muted font-12"
                                                >
                                                    No Team
                                                </a>
                                            )}

                                            {proj.teamMembers &&
                                                proj.teamMembers.length > 4 && (
                                                    <a onClick={() => { setModalItem(proj?.teamMembers || []); setShowModal(true) }}
                                                        href="javascript: void(0);"
                                                        className="text-dark font-12 fw-bold"
                                                    >
                                                        +{proj.teamMembers.length - 4} more
                                                    </a>
                                                )}
                                        </div>


                                    </div>
                                </div>
                            </div>
                            ))
                        ) : (
                            <div className="text-center text-muted mt-2">
                                <p>No Projects Found</p>
                            </div>
                        )}
                        {/* <div className="col-lg-4">
                            <div className="card project-box">
                                <div className="card-body">
                                    <div className="dropdown float-end">
                                        <a href="#" className="dropdown-toggle card-drop arrow-none" data-bs-toggle="dropdown" aria-expanded="false">
                                            <i className="fe-more-horizontal- m-0 text-muted h3"></i>
                                        </a>
                                        <div className="dropdown-menu dropdown-menu-end">

                                            <a className="dropdown-item" href="#">Delete</a>
                                            <a className="dropdown-item" href="#">View Detail</a>

                                        </div>
                                    </div>

                                    <h4 className="mt-0 mb-1"><a href="#" className="text-dark fw-bold font-16">Green Office Certification Initiative</a></h4>
                                    <p className="text-muted text-uppercase mb-1"> <small>Facilities Department</small></p>
                                    <div style={{ background: " #6b6f6f !important", color: " #fff;" }} className="finish mb-2">Ongoing</div>

                                    <p style={{ color: "#98a6ad;" }} className="date-color font-12  mb-3 sp-line-2">With supporting text below as a natural lead-in to additional contenposuere erat a
                                        ante...<a href="javascript:void(0);" className="fw-bold text-muted">view more</a>
                                    </p>

                                    <p className="mb-1 font-12">
                                        <span style={{ color: "#6e767e;" }} className="pe-2 text-nowrap mb-1 d-inline-block">
                                            <i className="fe-file-text text-muted"></i>
                                            <b>1</b> Documents
                                        </span>
                                        <span style={{ color: "#6e767e;" }} className="text-nowrap mb-1 d-inline-block">
                                            <i className="fe-message-square text-muted"></i>
                                            <b>0</b> Comments
                                        </span>
                                    </p>

                                    <div className="avatar-group mb-2" id="tooltips-container">
                                        <a href="javascript: void(0);" className="avatar-group-item">
                                            <img src="assets/images/users/user-1.jpg" className="rounded-circle avatar-sm" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="bottom" aria-label="Mat Helme" data-bs-original-title="Mat Helme" data-themekey="#" />
                                        </a>

                                        <a href="javascript: void(0);" className="avatar-group-item">
                                            <img src="assets/images/users/user-2.jpg" className="rounded-circle avatar-sm" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="bottom" aria-label="Michael Zenaty" data-bs-original-title="Michael Zenaty" data-themekey="#" />
                                        </a>

                                        <a href="javascript: void(0);" className="avatar-group-item">
                                            <img src="assets/images/users/user-3.jpg" className="rounded-circle avatar-sm" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="bottom" aria-label="James Anderson" data-bs-original-title="James Anderson" data-themekey="#" />
                                        </a>


                                    </div>


                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="card project-box">
                                <div className="card-body">
                                    <div className="dropdown float-end">
                                        <a href="#" className="dropdown-toggle card-drop arrow-none" data-bs-toggle="dropdown" aria-expanded="false">
                                            <i className="fe-more-horizontal- m-0 text-muted h3"></i>
                                        </a>
                                        <div className="dropdown-menu dropdown-menu-end">

                                            <a className="dropdown-item" href="#">Delete</a>
                                            <a className="dropdown-item" href="#">View Detail</a>

                                        </div>
                                    </div>

                                    <h4 className="mt-0 mb-1"><a href="#" className="text-dark fw-bold font-16">Employee Feedback Portal</a></h4>
                                    <p className="text-muted text-uppercase mb-1"> <small>HR Department</small></p>
                                    <div style={{ background: "#6b6f6f !important", color: "#fff;" }} className="finish mb-2">Ongoing</div>

                                    <p style={{ color: "#98a6ad;" }} className="date-color font-12  mb-3 sp-line-2">With supporting text below as a natural lead-in to additional contenposuere erat a
                                        ante...<a href="javascript:void(0);" className="fw-bold text-muted">view more</a>
                                    </p>

                                    <p className="mb-1 font-12">
                                        <span style={{ color: "#6e767e;" }} className="pe-2 text-nowrap mb-1 d-inline-block">
                                            <i className="fe-file-text text-muted"></i>
                                            <b>1</b> Documents
                                        </span>
                                        <span style={{ color: "#6e767e;" }} className="text-nowrap mb-1 d-inline-block">
                                            <i className="fe-message-square text-muted"></i>
                                            <b>0</b> Comments
                                        </span>
                                    </p>

                                    <div className="avatar-group mb-2" id="tooltips-container">
                                        <a href="javascript: void(0);" className="avatar-group-item">
                                            <img src="assets/images/users/user-1.jpg" className="rounded-circle avatar-sm" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="bottom" aria-label="Mat Helme" data-bs-original-title="Mat Helme" data-themekey="#" />
                                        </a>

                                        <a href="javascript: void(0);" className="avatar-group-item">
                                            <img src="assets/images/users/user-2.jpg" className="rounded-circle avatar-sm" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="bottom" aria-label="Michael Zenaty" data-bs-original-title="Michael Zenaty" data-themekey="#" />
                                        </a>

                                        <a href="javascript: void(0);" className="avatar-group-item">
                                            <img src="assets/images/users/user-3.jpg" className="rounded-circle avatar-sm" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="bottom" aria-label="James Anderson" data-bs-original-title="James Anderson" data-themekey="#" />
                                        </a>


                                    </div>


                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="card project-box">
                                <div className="card-body">
                                    <div className="dropdown float-end">
                                        <a href="#" className="dropdown-toggle card-drop arrow-none" data-bs-toggle="dropdown" aria-expanded="false">
                                            <i className="fe-more-horizontal- m-0 text-muted h3"></i>
                                        </a>
                                        <div className="dropdown-menu dropdown-menu-end">

                                            <a className="dropdown-item" href="#">Delete</a>
                                            <a className="dropdown-item" href="#">View Detail</a>

                                        </div>
                                    </div>

                                    <h4 className="mt-0 mb-1"><a href="#" className="text-dark fw-bold font-16">Project Horizon </a></h4>
                                    <p className="text-muted text-uppercase mb-1"> <small>Strategy & Planning</small></p>
                                    <div className="finish mb-2">Finished</div>
                                    <div>

                                    </div>

                                    <p style={{ color: "#98a6ad;" }} className="date-color font-12  mb-3 sp-line-2">With supporting text below as a natural lead-in to additional contenposuere erat a
                                        ante...<a href="javascript:void(0);" className="fw-bold text-muted">view more</a>
                                    </p>

                                    <p className="mb-1 font-12">
                                        <span style={{ color: "#6e767e;" }} className="pe-2 text-nowrap mb-1 d-inline-block">
                                            <i className="fe-file-text text-muted"></i>
                                            <b>1</b> Documents
                                        </span>
                                        <span style={{ color: "#6e767e;" }} className="text-nowrap mb-1 d-inline-block">
                                            <i className="fe-message-square text-muted"></i>
                                            <b>0</b> Comments
                                        </span>
                                    </p>

                                    <div className="avatar-group mb-2" id="tooltips-container">
                                        <a href="javascript: void(0);" className="avatar-group-item">
                                            <img src="assets/images/users/user-1.jpg" className="rounded-circle avatar-sm" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="bottom" aria-label="Mat Helme" data-bs-original-title="Mat Helme" data-themekey="#" />
                                        </a>

                                        <a href="javascript: void(0);" className="avatar-group-item">
                                            <img src="assets/images/users/user-2.jpg" className="rounded-circle avatar-sm" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="bottom" aria-label="Michael Zenaty" data-bs-original-title="Michael Zenaty" data-themekey="#" />
                                        </a>

                                        <a href="javascript: void(0);" className="avatar-group-item">
                                            <img src="assets/images/users/user-3.jpg" className="rounded-circle avatar-sm" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="bottom" aria-label="James Anderson" data-bs-original-title="James Anderson" data-themekey="#" />
                                        </a>

                                        <a href="javascript: void(0);" className="avatar-group-item">
                                            <img src="assets/images/users/user-4.jpg" className="rounded-circle avatar-sm" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="bottom" aria-label="Mat Helme" data-bs-original-title="Mat Helme" data-themekey="#" />
                                        </a>

                                        <a href="javascript: void(0);" className="text-dark font-12 fw-bold">
                                            +5 more
                                        </a>
                                    </div>


                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className="card project-box">
                                <div className="card-body">
                                    <div className="dropdown float-end">
                                        <a href="#" className="dropdown-toggle card-drop arrow-none" data-bs-toggle="dropdown" aria-expanded="false">
                                            <i className="fe-more-horizontal- m-0 text-muted h3"></i>
                                        </a>
                                        <div className="dropdown-menu dropdown-menu-end">

                                            <a className="dropdown-item" href="#">Delete</a>
                                            <a className="dropdown-item" href="#">View Detail</a>

                                        </div>
                                    </div>

                                    <h4 className="mt-0 mb-1"><a href="#" className="text-dark fw-bold font-16">Project Pulse </a></h4>
                                    <p className="text-muted text-uppercase mb-1"> <small>Facilities Management</small></p>
                                    <div style={{ background: "#6b6f6f !important", color: "#fff" }} className="finish mb-2">Ongoing</div>

                                    <p style={{ color: "#98a6ad;" }} className="date-color font-12  mb-3 sp-line-2">With supporting text below as a natural lead-in to additional contenposuere erat a
                                        ante...<a href="javascript:void(0);" className="fw-bold text-muted">view more</a>
                                    </p>

                                    <p className="mb-1 font-12">
                                        <span style={{ color: "#6e767e;" }} className="pe-2 text-nowrap mb-1 d-inline-block">
                                            <i className="fe-file-text text-muted"></i>
                                            <b>1</b> Documents
                                        </span>
                                        <span style={{ color: "#6e767e;" }} className="text-nowrap mb-1 d-inline-block">
                                            <i className="fe-message-square text-muted"></i>
                                            <b>0</b> Comments
                                        </span>
                                    </p>

                                    <div className="avatar-group mb-2" id="tooltips-container">
                                        <a href="javascript: void(0);" className="avatar-group-item">
                                            <img src="assets/images/users/user-1.jpg" className="rounded-circle avatar-sm" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="bottom" aria-label="Mat Helme" data-bs-original-title="Mat Helme" data-themekey="#" />
                                        </a>

                                        <a href="javascript: void(0);" className="avatar-group-item">
                                            <img src="assets/images/users/user-2.jpg" className="rounded-circle avatar-sm" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="bottom" aria-label="Michael Zenaty" data-bs-original-title="Michael Zenaty" data-themekey="#" />
                                        </a>

                                        <a href="javascript: void(0);" className="avatar-group-item">
                                            <img src="assets/images/users/user-3.jpg" className="rounded-circle avatar-sm" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="bottom" aria-label="James Anderson" data-bs-original-title="James Anderson" data-themekey="#" />
                                        </a>


                                    </div>


                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="card project-box">
                                <div className="card-body">
                                    <div className="dropdown float-end">
                                        <a href="#" className="dropdown-toggle card-drop arrow-none" data-bs-toggle="dropdown" aria-expanded="false">
                                            <i className="fe-more-horizontal- m-0 text-muted h3"></i>
                                        </a>
                                        <div className="dropdown-menu dropdown-menu-end">

                                            <a className="dropdown-item" href="#">Delete</a>
                                            <a className="dropdown-item" href="#">View Detail</a>

                                        </div>
                                    </div>

                                    <h4 className="mt-0 mb-1"><a href="#" className="text-dark fw-bold font-16">Project Nexus</a></h4>
                                    <p className="text-muted text-uppercase mb-1"> <small>Information Technology</small></p>
                                    <div style={{ background: "#6b6f6f !important", color: "#fff;" }} className="finish mb-2">Ongoing</div>

                                    <p style={{ color: "#98a6ad;" }} className="date-color font-12  mb-3 sp-line-2">With supporting text below as a natural lead-in to additional contenposuere erat a
                                        ante...<a href="javascript:void(0);" className="fw-bold text-muted">view more</a>
                                    </p>

                                    <p className="mb-1 font-12">
                                        <span style={{ color: "#6e767e;" }} className="pe-2 text-nowrap mb-1 d-inline-block">
                                            <i className="fe-file-text text-muted"></i>
                                            <b>1</b> Documents
                                        </span>
                                        <span style={{ color: "#6e767e;" }} className="text-nowrap mb-1 d-inline-block">
                                            <i className="fe-message-square text-muted"></i>
                                            <b>0</b> Comments
                                        </span>
                                    </p>

                                    <div className="avatar-group mb-2" id="tooltips-container">
                                        <a href="javascript: void(0);" className="avatar-group-item">
                                            <img src="assets/images/users/user-1.jpg" className="rounded-circle avatar-sm" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="bottom" aria-label="Mat Helme" data-bs-original-title="Mat Helme" data-themekey="#" />
                                        </a>

                                        <a href="javascript: void(0);" className="avatar-group-item">
                                            <img src="assets/images/users/user-2.jpg" className="rounded-circle avatar-sm" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="bottom" aria-label="Michael Zenaty" data-bs-original-title="Michael Zenaty" data-themekey="#" />
                                        </a>

                                        <a href="javascript: void(0);" className="avatar-group-item">
                                            <img src="assets/images/users/user-3.jpg" className="rounded-circle avatar-sm" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="bottom" aria-label="James Anderson" data-bs-original-title="James Anderson" data-themekey="#" />
                                        </a>


                                    </div>


                                </div>
                            </div>
                        </div> */}







                    </div>


                </>
            )}



            <Modal show={showModal} onHide={() => setShowModal(false)} size='lg' className="filemodal" >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {/* <h4 className="font-16 text-dark fw-bold mb-1">
                                Attachment Details
                            </h4>
                            <p className="text-muted font-14 mb-0 fw-400">
                                Below are the attachment details for Project Gallery
                            </p> */}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="" id="style-5">
                    <div className="modal-body attending-user">
                        <p style={{ display: "block;" }}>{modalItem.length} Members</p>
                        <ul>
                            {modalItem.map((item: any, index: number) => (
                                <li key={index}>
                                    {/* <a
                                        href={`https://multiversedemo.sharepoint.com/sites/CentralBankUAE/SitePages/NewApp.aspx#/UserProfile?UserProfileID=${item.Id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    > */}
                                    {/* {item.IsPicture ? ( */}
                                    <img
                                        src={`/_layouts/15/userphoto.aspx?size=S&username=${item.EMail}`}
                                        className="rounded-circle avatar-sm"
                                        alt={item.Title}
                                        title={item.Title}

                                    />
                                    {/* <img title={item.Title} src={`/_layouts/15/userphoto.aspx?size=S&username=${item.EMail}`} alt={item.Title} /> */}
                                    {/* ) : (
                                            <div
                                                title={item.Name}
                                                className="profile-dot imgbgnew1"
                                                style={{ backgroundColor: item.backgroundcolor }}
                                            >
                                                <figure></figure>
                                                <figcaption style={{ color: item.color }} className="paddt1">
                                                    {item.Initials}
                                                </figcaption>
                                            </div>
                                        )} */}
                                    <span>{item.Title}</span>
                                    {/* </a> */}
                                </li>
                            ))}
                        </ul>

                    </div>


                </Modal.Body>

            </Modal>
        </>

    )
}

export default ProjectsMain
