import * as React from "react";
//import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../../../../styles/global.scss";
import CustomBreadcrumb from "../common/CustomBreadcrumb";
import {
  faArrowLeft,
  faEllipsisV,
  faFileExport,
  faPlusCircle,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChevronRight, Edit, Trash2 } from "react-feather";
import { useEffect, useState } from "react";
import { SPFI } from "@pnp/sp";
import { getSP } from "../../loc/pnpjsConfig";
import Select from "react-select";
import Swal from "sweetalert2";
const Breadcrumb = [
  {
    MainComponent: "Home",

    MainComponentURl: "Home",
  },

  {
    MainComponent: "Suggestions",

    MainComponentURl: "Suggestions",
  },
];
const Suggestions = () => {
  const [department, setDepartment] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [userId, setUserId] = React.useState<number | null>(null);
  const [fullName, setFullName] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");
  const [suggestionTitle, setSuggestionTitle] = React.useState<string>("");
  const [suggestionDetails, setSuggestionDetails] = React.useState<string>("");
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  //  For Filtering
  const [filters, setFilters] = React.useState({
    SNo: "",
    SubmittedBy: "",
    Department: "",
    SuggestionTitle: "",
    SuggestionDetails: "",
    Created: "",
  });

  //  For Sorting
  const [sortConfig, setSortConfig] = React.useState({
    key: "",
    direction: "ascending",
  });

  //  For Pagination
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const fetchSuggestions = async () => {
    try {
      console.log(" Fetching Suggestions list data...");
      const sp: SPFI = getSP();

      // Select and expand fields for proper binding of Person and Lookup fields
      const items = await sp.web.lists
        .getByTitle("Suggestions")
        .items.select(
          "Id",
          "EmployeeName/Id",
          "EmployeeName/Title",
          "EmployeeName/EMail",
          "Department/Id",
          "Department/DepartmentName",
          "SuggestionTitle",
          "SuggestionDetails",
          "Created"
        )
        .expand("EmployeeName", "Department")
        .orderBy("Id", false)(); // false = descending (latest first)

      console.log("Suggestions fetched:", items);
      setSuggestions(items); //  Store fetched data in state
    } catch (error) {
      console.error(" Error fetching suggestions:", error);
    }
  };

  React.useEffect(() => {
    //  Load current user
    const loadCurrentUser = async () => {
      try {
        const sp: SPFI = getSP();
        const user = await sp.web.currentUser();
        setUserId(user.Id || null);
        setFullName(user.Title || "");
        setEmail(user.Email || "");
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    loadCurrentUser();

    //  Fetch departments from master list
    const fetchDepartments = async () => {
      console.log("Department fetch started...");

      try {
        const sp: SPFI = getSP();

        console.log("Fetching DepartmentMasterList items...");
        const deptItems = await sp.web.lists
          .getByTitle("DepartmentMasterList")
          .items();
        console.log("Raw Department items:", deptItems);

        if (!deptItems || deptItems.length === 0) {
          console.warn("No items found in DepartmentMasterList");
        }

        const deptOptions = deptItems.map((d: any) => ({
          value: d.Id,
          label: d.DepartmentName,
        }));
        console.log("Transformed Department dropdown data:", deptOptions);

        setDepartments(deptOptions);
        console.log(
          "Department state updated with",
          deptOptions.length,
          "items"
        );
      } catch (err) {
        console.error("Error fetching department data:", err);
      }
    };

    fetchDepartments();
    fetchSuggestions();
  }, []);
const validateForm = async () => {
  //  Remove previous error highlights
  Array.from(document.getElementsByClassName("border-on-error")).forEach(
    (el: Element) => el.classList.remove("border-on-error")
  );

  let isValid = true;

  //  Suggestion Title
  const titleInput = document.getElementById("suggestionTitle");
  if (!suggestionTitle.trim()) {
    titleInput?.classList.add("border-on-error");
    isValid = false;
  }

  //  Department (React Select)
  const deptControl = document.querySelector(
    "#DepartmentID .react-select__control"
  ) as HTMLElement;
  if (!department && deptControl) {
    deptControl.classList.add("border-on-error");
    isValid = false;
  }

  //  Suggestion Details
  const detailsInput = document.getElementById("suggestionDetails");
  if (!suggestionDetails.trim()) {
    detailsInput?.classList.add("border-on-error");
    isValid = false;
  }

  if (!isValid) {
   
       Swal.fire("Please fill all the mandatory fields.");
       return false;
     }
     return true;
   };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validateForm();
  if (!isValid) return; 

    try {
      const sp: SPFI = getSP();

      //  Payload for SharePoint
      const itemPayload = {
        EmployeeNameId: userId,
        DepartmentId: department.value,
        SuggestionTitle: suggestionTitle.trim(),
        SuggestionDetails: suggestionDetails.trim(),
      };

      console.log(" Payload being sent to 'Suggestions' list:", itemPayload);

      //  Add item to SharePoint list
      const response = await sp.web.lists
        .getByTitle("Suggestions")
        .items.add(itemPayload);

      console.log(" Item successfully added to 'Suggestions':", response);

       await fetchSuggestions(); 
      setDepartment(null);
      setSuggestionTitle("");
      setSuggestionDetails("");
    } catch (error) {
      console.error(" Error submitting suggestion:", error);
      alert(" Failed to submit suggestion.");
    }
  };

  const confirmAndSubmit = async (e: React.FormEvent) => {
  e.preventDefault(); // prevent page reload

  const isValid = await validateForm();
  if (!isValid) {
    Swal.fire({
      title: "Please fill all the mandatory fields.",
      icon: "warning",
      confirmButtonText: "OK",
      backdrop: false,
      allowOutsideClick: false,
    });
    return;
  }

  Swal.fire({
    title: "Do you want to submit this suggestion?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No",
    reverseButtons: false,
    backdrop: false,
    allowOutsideClick: false,
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await handleSubmit(e); 
        Swal.fire({
          title: "Submitted successfully.",
          icon: "success",
          confirmButtonText: "OK",
          backdrop: false,
          allowOutsideClick: false,
        });
      } catch (error) {
        console.error("Error during submission:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to submit the suggestion.",
          icon: "error",
          confirmButtonText: "OK",
          backdrop: false,
        });
      }
    }
  });
};

const handleDelete = async (id: number) => {
  Swal.fire({
    title: "Do you want to delete this suggestion?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No",
    reverseButtons: false,
    backdrop: false,
    allowOutsideClick: false,
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const sp = getSP();

        //  Delete the suggestion item from SharePoint list
        await sp.web.lists.getByTitle("Suggestions").items.getById(id).delete();

        // Refresh the list in UI
        setSuggestions((prev) => prev.filter((s) => s.Id !== id));

        // Success alert
        Swal.fire({
          title: "Deleted successfully.",
          icon: "success",
          confirmButtonText: "OK",
          backdrop: false,
          allowOutsideClick: false,
        });
      } catch (error) {
        console.error("Error deleting suggestion:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to delete the suggestion.",
          icon: "error",
          confirmButtonText: "OK",
          backdrop: false,
        });
      }
    }
  });
};

  //  Apply filters and sorting (like QuickLinks)
  const applyFiltersAndSorting = (data: any[]) => {
    const filtered = data.filter((item, index) => {
      return (
        (filters.SNo === "" || String(index + 1).includes(filters.SNo)) &&
        (filters.SubmittedBy === "" ||
          item.EmployeeName?.Title?.toLowerCase().includes(
            filters.SubmittedBy.toLowerCase()
          )) &&
        (filters.Department === "" ||
          item.Department?.DepartmentName?.toLowerCase().includes(
            filters.Department.toLowerCase()
          )) &&
        (filters.SuggestionTitle === "" ||
          item.SuggestionTitle?.toLowerCase().includes(
            filters.SuggestionTitle.toLowerCase()
          )) &&
        (filters.SuggestionDetails === "" ||
          item.SuggestionDetails?.toLowerCase().includes(
            filters.SuggestionDetails.toLowerCase()
          )) &&
        (filters.Created === "" ||
          new Date(item.Created)
            .toLocaleDateString()
            .toLowerCase()
            .includes(filters.Created.toLowerCase()))
      );
    });

    const sorted = filtered.sort((a, b) => {
      const direction = sortConfig.direction === "ascending" ? 1 : -1;
      switch (sortConfig.key) {
        case "SNo":
          return direction * (data.indexOf(a) - data.indexOf(b));
        case "SubmittedBy":
          return (
            direction *
            (a.EmployeeName?.Title || "").localeCompare(
              b.EmployeeName?.Title || ""
            )
          );
        case "Department":
          return (
            direction *
            (a.Department?.DepartmentName || "").localeCompare(
              b.Department?.DepartmentName || ""
            )
          );
        case "SuggestionTitle":
          return (
            direction *
            (a.SuggestionTitle || "").localeCompare(b.SuggestionTitle || "")
          );
        case "SuggestionDetails":
          return (
            direction *
            (a.SuggestionDetails || "").localeCompare(b.SuggestionDetails || "")
          );
        case "Created":
          return (
            direction *
            (new Date(a.Created).getTime() - new Date(b.Created).getTime())
          );
        default:
          return 0;
      }
    });

    return sorted;
  };

  const filteredSuggestions = applyFiltersAndSorting(suggestions);

  // Pagination calculation
  const totalPages = Math.ceil(filteredSuggestions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredSuggestions.slice(startIndex, endIndex);

  // Sorting & Filtering handlers
  const handleSortChange = (key: string) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <>
     
        {/* <!-- start page title --> */}
        <div className="row">
          <div className="col-xl-12 col-lg-12">
            <div className="row">
              <div className="col-lg-12">
                {/* <h4 className="page-title fw-bold mb-1 font-20">Suggestions</h4>
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item"><a href="javascript:void(0)">Home</a></li>
                  <li className="breadcrumb-item"><span className="fe-chevron-right"></span></li>
                  <li className="breadcrumb-item active">Suggestions</li>
                </ol> */}
                <CustomBreadcrumb Breadcrumb={Breadcrumb} />
              </div>
            </div>
            </div>
            </div>
            <div className="row">
            <div className="col-xl-12 col-lg-12">
              {/* <!-- Suggestion Form --> */}
              <div className="card mt-3">
                <div className="card-body">
                  <h2 className="page-title fw-bold mb-2 font-16 mt-0">
                    {" "}
                    Submit a Suggestion
                  </h2>
                  <form
                    onKeyDown={(e: any) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault(); //  Prevents accidental form submission when pressing Enter
                      }
                    }}
                  >
                    <div className="row">
                      {/* <div className="col-sm-3">
                        <div className="form-group mb-3">
                          <label "name" className="mb-1">Full Name</label>
                          <input
                            type="text"
                            id="name"
                            className="form-control"
                            placeholder="Enter your full name"
                            required
                          />
                        </div>
                      </div> */}

                      {/* <div className="col-sm-3">
                        <div className="form-group">
                          <label "name" className="mb-1">Email Email</label>
                          <input
                            type="text"
                            id="name"
                            className="form-control"
                            placeholder="Enter your email"
                            required
                          />
                        </div>
                      </div> */}

                      <div className="col-sm-3">
                        <div className="form-group mb-3">
                          <label htmlFor="name" className="form-label mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            className="form-control"
                            placeholder="Enter your full name"
                            value={fullName}
                            disabled
                            required
                          />
                        </div>
                      </div>

                      <div className="col-sm-3">
                        <div className="form-group mb-3">
                          <label htmlFor="email" className="form-label mb-1">Email Address</label>
                          <input
                            type="email"
                            id="email"
                            className="form-control"
                            placeholder="Enter your email"
                            value={email}
                            disabled
                            required
                          />
                        </div>
                      </div>

                      <div className="col-lg-3">
                        <div className="mb-3">
                          <label htmlFor="DepartmentID" className="form-label mb-1">
                            Department<span className="text-danger">*</span>
                          </label>
                          <Select
                            id="DepartmentID"
                            className="form-select p-0 border-0"
                            classNamePrefix="react-select"
                            placeholder="Select Department"
                            options={departments} // [{value: 1, label: "Finance"}, ...]
                            value={department}
                            onChange={(option: any) => setDepartment(option)}
                          />
                        </div>
                      </div>

                      {/* <div className="col-sm-3">
                        <div className="form-group mb-3">
                          <label htmlFor="email" className="mb-1">Select Department</label>
                          <select className="form-select" id="example-select">
                            <option>Strategy Department</option>
                            <option>Operations</option>
                            <option>Customer Service</option>
                            <option>Engineering</option>
                            <option>IT & Innovation</option>
                            <option>HR & Training</option>
                          </select>
                        </div>
                      </div> */}

                      <div className="col-sm-3">
                        <div className="form-group mb-3">
                          <label htmlFor="suggestionTitle" className="form-label mb-1">
                            Suggestion Title<span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            id="suggestionTitle"
                            className="form-control"
                            placeholder="Enter suggestion title"
                            value={suggestionTitle}
                            onChange={(e) => setSuggestionTitle(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-sm-12">
                        <div className="form-group mb-3">
                          <label htmlFor="suggestionDetails" className="form-label mb-1">
                            Suggestion Details<span className="text-danger">*</span>
                          </label>
                          <textarea
                            id="suggestionDetails"
                            className="form-control"
                            placeholder="Enter suggestion details"
                            value={suggestionDetails}
                            onChange={(e) =>
                              setSuggestionDetails(e.target.value)
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>
        <div className="d-flex justify-content-center align-items-center">
          
        
                    <button
                      style={{ width: "180px", margin: "auto" }}
                      type="submit"
                      className="btn btn-primary mb-1 mb-2"
                      onClick={confirmAndSubmit}
                    >
                      Submit Suggestion
                    </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* <!-- Repository (Admin View) --> */}
              <div className="card card-body">
                <h2 className="page-title fw-bold mb-2 font-16 mt-0">
                  Suggestions Repository
                </h2>
                <table className="mtbalenew mt-0 table-centered table-nowrap table-borderless mb-0">
                  <thead>
                    <tr>
                      {/* # */}
                      <th
                        style={{
                          borderBottomLeftRadius: "0px",
                          minWidth: "40px",
                          maxWidth: "40px",
                          borderTopLeftRadius: "0px",
                        }}
                      >
                        <div
                          className="d-flex pb-1"
                          style={{ justifyContent: "space-between" }}
                        >
                          <span>S.No.</span>
                          <span onClick={() => handleSortChange("SNo")}>
                            <FontAwesomeIcon icon={faSort} />
                          </span>
                        </div>
                        <div className="bd-highlight">
                          <input
                            type="text"
                            placeholder="SNo"
                            value={filters.SNo}
                            onChange={(e) => handleFilterChange(e, "SNo")}
                            className="inputcss"
                            style={{ width: "100%" }}
                          />
                        </div>
                      </th>

                      {/* Submitted By */}
                      <th style={{ minWidth: "120px", maxWidth: "120px" }}>
                        <div className="d-flex flex-column bd-highlight">
                          <div
                            className="d-flex pb-1"
                            style={{ justifyContent: "space-evenly" }}
                          >
                            <span>Submitted By</span>
                            <span
                              onClick={() => handleSortChange("SubmittedBy")}
                            >
                              <FontAwesomeIcon icon={faSort} />
                            </span>
                          </div>
                          <div className="bd-highlight">
                            <input
                              type="text"
                              placeholder="Filter by Submitted By"
                              value={filters.SubmittedBy}
                              onChange={(e) =>
                                handleFilterChange(e, "SubmittedBy")
                              }
                              className="inputcss"
                              style={{ width: "100%" }}
                            />
                          </div>
                        </div>
                      </th>

                      {/* Department */}
                      <th style={{ minWidth: "120px", maxWidth: "120px" }}>
                        <div className="d-flex flex-column bd-highlight">
                          <div
                            className="d-flex pb-1"
                            style={{ justifyContent: "space-evenly" }}
                          >
                            <span>Department</span>
                            <span
                              onClick={() => handleSortChange("Department")}
                            >
                              <FontAwesomeIcon icon={faSort} />
                            </span>
                          </div>
                          <div className="bd-highlight">
                            <input
                              type="text"
                              placeholder="Filter by Department"
                              value={filters.Department}
                              onChange={(e) =>
                                handleFilterChange(e, "Department")
                              }
                              className="inputcss"
                              style={{ width: "100%" }}
                            />
                          </div>
                        </div>
                      </th>

                      {/* Title */}
                      <th style={{ minWidth: "120px", maxWidth: "120px" }}>
                        <div className="d-flex flex-column bd-highlight">
                          <div
                            className="d-flex pb-1"
                            style={{ justifyContent: "space-evenly" }}
                          >
                            <span>Title</span>
                            <span
                              onClick={() =>
                                handleSortChange("SuggestionTitle")
                              }
                            >
                              <FontAwesomeIcon icon={faSort} />
                            </span>
                          </div>
                          <div className="bd-highlight">
                            <input
                              type="text"
                              placeholder="Filter by Title"
                              value={filters.SuggestionTitle}
                              onChange={(e) =>
                                handleFilterChange(e, "SuggestionTitle")
                              }
                              className="inputcss"
                              style={{ width: "100%" }}
                            />
                          </div>
                        </div>
                      </th>

                      {/* Details */}
                      <th style={{ minWidth: "200px", maxWidth: "200px" }}>
                        <div className="d-flex flex-column bd-highlight">
                          <div
                            className="d-flex pb-1"
                            style={{ justifyContent: "space-evenly" }}
                          >
                            <span>Details</span>
                            <span
                              onClick={() =>
                                handleSortChange("SuggestionDetails")
                              }
                            >
                              <FontAwesomeIcon icon={faSort} />
                            </span>
                          </div>
                          <div className="bd-highlight">
                            <input
                              type="text"
                              placeholder="Filter by Details"
                              value={filters.SuggestionDetails}
                              onChange={(e) =>
                                handleFilterChange(e, "SuggestionDetails")
                              }
                              className="inputcss"
                              style={{ width: "100%" }}
                            />
                          </div>
                        </div>
                      </th>

                      {/* Date */}
                      <th style={{ minWidth: "120px", maxWidth: "120px" }}>
                        <div className="d-flex flex-column bd-highlight">
                          <div
                            className="d-flex pb-1"
                            style={{ justifyContent: "space-evenly" }}
                          >
                            <span>Date</span>
                            <span onClick={() => handleSortChange("Created")}>
                              <FontAwesomeIcon icon={faSort} />
                            </span>
                          </div>
                          <div className="bd-highlight">
                            <input
                              type="text"
                              placeholder="Filter by Date"
                              value={filters.Created}
                              onChange={(e) => handleFilterChange(e, "Created")}
                              className="inputcss"
                              style={{ width: "100%" }}
                            />
                          </div>
                        </div>
                      </th>

                      {/* Action */}
                      {/* <th
                        style={{
                          textAlign: "center",
                          minWidth: "80px",
                          maxWidth: "80px",
                          borderBottomRightRadius: "0px",
                          borderTopRightRadius: "0px",
                        }}
                      >
                        <div className="d-flex flex-column bd-highlight pb-2">
                          <div
                            className="d-flex pb-2"
                            style={{ justifyContent: "space-evenly" }}
                          >
                            <span>Action</span>
                            <div className="dropdown">
                              <FontAwesomeIcon icon={faEllipsisV} size="xl" />
                            </div>
                          </div>
                          <div className="bd-highlight">
                            <div id="myDropdown" className="dropdown-content">
                              <div>
                                <FontAwesomeIcon icon={faFileExport} /> Export
                              </div>
                            </div>
                          </div>
                        </div>
                        <div style={{ height: "32px" }}></div>
                      </th> */}
                    </tr>
                  </thead>

                  <tbody style={{ maxHeight: "5000px" }}>
                    {currentData.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center" }}>
                          No suggestions found
                        </td>
                      </tr>
                    ) : (
                      currentData.map((item, index) => (
                        <tr key={item.Id}>
                          {/* S.No. */}
                          <td style={{ minWidth: "40px", maxWidth: "40px" }}>
                            <div
                              style={{ marginLeft: "10px" }}
                              className="indexdesign"
                            >
                              {index + 1}
                            </div>
                          </td>

                          {/*  Submitted By → EmployeeName (Person) */}
                          <td style={{ minWidth: "120px", maxWidth: "120px" }}>
                            {item.EmployeeName?.Title || "-"}
                          </td>

                          {/*  Department → Department (Lookup) */}
                          <td style={{ minWidth: "120px", maxWidth: "120px" }}>
                            {item.Department?.DepartmentName || "-"}
                          </td>

                          {/*  Title → SuggestionTitle */}
                          <td style={{ minWidth: "120px", maxWidth: "120px" }}>
                            {item.SuggestionTitle || "-"}
                          </td>

                          {/*  Details → SuggestionDetails */}
                          <td style={{ minWidth: "200px", maxWidth: "200px" }}>
                            {item.SuggestionDetails || "-"}
                          </td>

                          <td style={{ minWidth: "120px", maxWidth: "120px" }}>
                            {new Date(item.Created).toLocaleDateString()}
                          </td>

                          {/* Action Buttons */}
                          {/* <td
                            style={{ minWidth: "50px", maxWidth: "50px" }}
                            className="ng-binding"
                          >
                            <a
                              href="#"
                              className="action-icon text-primary"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </a>
                            <a
                              href="javascript:void(0);"
                              className="action-icon text-danger"
                              title="Delete"
                              onClick={() => handleDelete(item.Id)} 
                            >
                              <Trash2 size={16} />
                            </a>
                          </td> */}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                 <nav className="pagination-container">
                                <ul className="pagination">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <a
                                            className="page-link"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            aria-label="Previous"
                                        >
                                            «
                                        </a>
                                    </li>
                                    {Array.from({ length: totalPages }, (_, num) => (
                                        <li
                                            key={num}
                                            className={`page-item ${currentPage === num + 1 ? 'active' : ''}`}
                                        >
                                            <a
                                                className="page-link"
                                                onClick={() => handlePageChange(num + 1)}
                                            >
                                                {num + 1}
                                            </a>
                                        </li>
                                    ))}
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <a
                                            className="page-link"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            aria-label="Next"
                                        >
                                            »
                                        </a>
                                    </li>
                                </ul>
                            </nav>
              </div>
            </div>
            </div>
            {/* <!-- end page title --> */}
            {/* <!-- end row --> */}
            {/* <!-- end row --> */}
            {/* <!-- end row --> */}
        
      
    </> 
  );
};

export default Suggestions;
