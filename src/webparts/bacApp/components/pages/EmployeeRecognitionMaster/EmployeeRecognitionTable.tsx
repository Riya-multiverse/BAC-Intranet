import * as React from "react";
//import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
// import '../../../../styles/global.scss';
import "bootstrap-icons/font/bootstrap-icons.css";
import "material-symbols/index.css";
// import * as feather from 'feather-icons';
import { ChevronRight } from "react-feather";
import {
  faArrowLeft,
  faEllipsisV,
  faFileExport,
  faPlusCircle,
  faQ,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { SPFI } from "@pnp/sp";
import { getSP } from "../../../loc/pnpjsConfig";
import Swal from "sweetalert2";
import { Edit, Trash2, ArrowLeft, PlusCircle } from "react-feather";
import CustomBreadcrumb from "../../common/CustomBreadcrumb";
interface IEmployeeRecognitionTableProps {
  onAdd: () => void;
  onEdit: (item: any) => void;

  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const Breadcrumb = [
  {
    MainComponent: "Settings",

    MainComponentURl: "Settings",
  },

  {
    MainComponent: "Employee Recognition Master",

    MainComponentURl: "EmployeeRecognitionMaster",
  },
];
const EmployeeRecognitionTable = ({
  onAdd,
  onEdit,
  setLoading,
}: IEmployeeRecognitionTableProps) => {
  const [achievementList, setAchievementList] = React.useState<any[]>([]);
  const [filters, setFilters] = React.useState({
    SNo: "",
    AchievementTitle: "",
    EmployeeName: "",
    AchievementDetail: "",
    TopStar: "",
  });

  //  For Sorting
  const [sortConfig, setSortConfig] = React.useState({
    key: "",
    direction: "ascending",
  });

  //  For Pagination
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;
  const sp: SPFI = getSP();

  //  Fetch data from SharePoint
  React.useEffect(() => {
    setLoading(true);
    const fetchTeamAchievements = async () => {
      try {
        const items = await sp.web.lists
          .getByTitle("EmployeeRecognition")

          .items.select(
            "Id",
            "AchievementTitle",
            "EmployeeName/Id",
            "EmployeeName/Title",
            "EmployeeName/EMail",
            "TopStar",
            "AchievementDetail"
          )
          .expand("EmployeeName")
          .orderBy("Created", false)();

        const formatted = items.map((item: any) => ({
          Id: item.Id,
          AchievementTitle: item.AchievementTitle || "",
          EmployeeName: item.EmployeeName
            ? {
                Id: item.EmployeeName.Id,
                Title: item.EmployeeName.Title,
                EMail: item.EmployeeName.EMail,
              }
            : null,
          AchievementDetail: item.AchievementDetail || "",
          TopStar: item.TopStar || "-",
        }));

        setAchievementList(formatted);
      } catch (error) {
        console.error(" Error fetching TeamAchievements data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamAchievements();
  }, [setLoading]);

  //  Edit item
  const handleEdit = (item: any) => {
    console.log("Editing Team Achievement:", item);
    onEdit(item);
  };

  //  Delete item
  const handleDelete = async (id: number) => {
    Swal.fire({
      title: "Do you want to delete this record?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      reverseButtons: false,
      backdrop: false,
      allowOutsideClick: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          await sp.web.lists
            .getByTitle("EmployeeRecognition")
            .items.getById(id)
            .delete();
          setAchievementList((prev) => prev.filter((item) => item.Id !== id));

          Swal.fire({
            backdrop: false,
            title: "Deleted successfully.",
            icon: "success",
            confirmButtonText: "OK",
            allowOutsideClick: false,
          });
        } catch (error) {
          console.error(" Error deleting record:", error);
          Swal.fire({
            title: "Error",
            text: "Failed to delete the record.",
            icon: "error",
            confirmButtonText: "OK",
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  //  Apply filters and sorting (like QuickLinks)
  const applyFiltersAndSorting = (data: any[]) => {
    if (!data) return [];

    //  Filtering logic
    const filtered = data.filter((item, index) => {
      return (
        (filters.SNo === "" || String(index + 1).includes(filters.SNo)) &&
        (filters.AchievementTitle === "" ||
          (item.AchievementTitle || "")
            .toLowerCase()
            .includes(filters.AchievementTitle.toLowerCase())) &&
        (filters.EmployeeName === "" ||
          (item.EmployeeName?.Title || "")
            .toLowerCase()
            .includes(filters.EmployeeName.toLowerCase())) &&
        (filters.AchievementDetail === "" ||
          (item.AchievementDetail || "")
            .toLowerCase()
            .includes(filters.AchievementDetail.toLowerCase())) &&
        (filters.TopStar === "" ||
          (item.TopStar || "")
            .toLowerCase()
            .includes(filters.TopStar.toLowerCase()))
      );
    });

    //  Sorting logic
    const sorted = filtered.sort((a, b) => {
      const direction = sortConfig.direction === "ascending" ? 1 : -1;
      const key = sortConfig.key;

      if (!key) return 0;

      let aValue = a[key];
      let bValue = b[key];

      //  Handle special case for EmployeeName (nested object)
      if (key === "EmployeeName") {
        aValue = a.EmployeeName?.Title || "";
        bValue = b.EmployeeName?.Title || "";
      }

      //  Convert any non-string values to string safely
      if (typeof aValue !== "string") aValue = String(aValue ?? "");
      if (typeof bValue !== "string") bValue = String(bValue ?? "");

      console.log(" Sorting by:", key, "| A:", aValue, "| B:", bValue);

      return direction * aValue.localeCompare(bValue);
    });

    return sorted;
  };

  const filteredData = applyFiltersAndSorting(achievementList);

  // Pagination calculation
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

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
        <div className="col-lg-4">
          {/* <h4 className="page-title fw-bold mb-1 font-20">Recognition Master</h4>
                                <ol className="breadcrumb m-0">
                        
                                    <li className="breadcrumb-item"><a href="settings.html">Settings</a></li>
                                    <li className="breadcrumb-item"> 
                                      
                                        </li>
                                
                                    <li className="breadcrumb-item active">Recognition Master</li>
                                </ol> */}
          <CustomBreadcrumb Breadcrumb={Breadcrumb} />
        </div>
        <div className="col-lg-8">
          <div className="d-flex flex-wrap align-items-center justify-content-end mt-3">
            <form className="d-flex flex-wrap align-items-center justify-content-start ng-pristine ng-valid">
              {/* <!-- <label for="status-select" className="me-2">Sort By</label>
                                    
                                    </div> --> */}

              {/* <a href="settings.html">  */}
              <button
                type="button"
                className="btn btn-secondary me-1 waves-effect waves-light"
                onClick={onAdd}
              >
                {" "}
                <ArrowLeft size={18} className="me-1" />
                Back
              </button>
              {/* </a>  */}
              {/* <a href="add-news.html">  */}
              <button
                type="button"
                className="btn btn-primary waves-effect waves-light"
                onClick={onEdit}
              >
                {" "}
                <PlusCircle className="me-1" size={18} />
                Add
              </button>
              {/* </a>  */}
            </form>

            {/* <!-- <button type="button" className="btn btn-secondary waves-effect waves-light" data-bs-toggle="modal" data-bs-target="#custom-modal"><i className="fe-filter me-1"></i>Filter</button> --> */}

            {/* <!-- <button type="button" className="btn btn-secondary waves-effect waves-light" data-bs-toggle="modal" data-bs-target="#custom-modal"><i className="fe-filter me-1"></i>Filter</button> --> */}
          </div>
        </div>
      </div>
      {/* <!-- end page title --> */}
      <div className="tab-content mt-3">
        <div className="tab-pane show active" id="profile1" role="tabpanel">
          <div className="card">
            {/* <h2 className="page-title fw-bold mb-2 font-16 mt-2">
                                  Suggestions Repository
                                </h2> */}
            <table className="mtbalenew mt-0 table-centered table-nowrap table-borderless mb-0">
              <thead>
                <tr>
                  {/* # */}
                  <th
                    style={{
                      borderBottomLeftRadius: "0px",
                      minWidth: "20px",
                      maxWidth: "20px",
                      borderTopLeftRadius: "0px",
                    }}
                  >
                    <div
                      className="d-flex pb-2"
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

                  {/* Employee Name */}
                  <th style={{ minWidth: "75px", maxWidth: "75px" }}>
                    <div className="d-flex flex-column bd-highlight">
                      <div
                        className="d-flex pb-2"
                        style={{ justifyContent: "space-evenly" }}
                      >
                        <span>Employee Name</span>
                        <span onClick={() => handleSortChange("EmployeeName")}>
                          <FontAwesomeIcon icon={faSort} />
                        </span>
                      </div>
                      <div className="bd-highlight">
                        <input
                          type="text"
                          placeholder="Filter by Employee Name"
                          value={filters.EmployeeName}
                          onChange={(e) =>
                            handleFilterChange(e, "EmployeeName")
                          }
                          className="inputcss"
                          style={{ width: "100%" }}
                        />
                      </div>
                    </div>
                  </th>

                  {/* Title */}
                  <th style={{ minWidth: "75px", maxWidth: "75px" }}>
                    <div className="d-flex flex-column bd-highlight">
                      <div
                        className="d-flex pb-2"
                        style={{ justifyContent: "space-evenly" }}
                      >
                        <span>Title</span>
                        <span
                          onClick={() => handleSortChange("AchievementTitle")}
                        >
                          <FontAwesomeIcon icon={faSort} />
                        </span>
                      </div>
                      <div className="bd-highlight">
                        <input
                          type="text"
                          placeholder="Filter by Title"
                          value={filters.AchievementTitle}
                          onChange={(e) =>
                            handleFilterChange(e, "AchievementTitle")
                          }
                          className="inputcss"
                          style={{ width: "100%" }}
                        />
                      </div>
                    </div>
                  </th>

                  {/* Achievement Detail */}
                  <th style={{ minWidth: "120px", maxWidth: "120px" }}>
                    <div className="d-flex flex-column bd-highlight">
                      <div
                        className="d-flex pb-2"
                        style={{ justifyContent: "space-evenly" }}
                      >
                        <span>Achievement Detail</span>
                        <span
                          onClick={() => handleSortChange("AchievementDetail")}
                        >
                          <FontAwesomeIcon icon={faSort} />
                        </span>
                      </div>
                      <div className="bd-highlight">
                        <input
                          type="text"
                          placeholder="Filter by Achievement Detail"
                          value={filters.AchievementDetail}
                          onChange={(e) =>
                            handleFilterChange(e, "AchievementDetail")
                          }
                          className="inputcss"
                          style={{ width: "100%" }}
                        />
                      </div>
                    </div>
                  </th>

                  {/* Top Star */}
                  <th style={{ minWidth: "40px", maxWidth: "40px" }}>
                    <div className="d-flex flex-column bd-highlight">
                      <div
                        className="d-flex pb-2"
                        style={{ justifyContent: "space-evenly" }}
                      >
                        <span>Top Star</span>
                        <span onClick={() => handleSortChange("TopStar")}>
                          <FontAwesomeIcon icon={faSort} />
                        </span>
                      </div>
                      <div className="bd-highlight">
                        <input
                          type="text"
                          placeholder="Filter by Top Star"
                          value={filters.TopStar}
                          onChange={(e) => handleFilterChange(e, "TopStar")}
                          className="inputcss"
                          style={{ width: "100%" }}
                        />
                      </div>
                    </div>
                  </th>

                  {/* Action */}
                  <th
                    style={{
                      textAlign: "center",
                      minWidth: "40px",
                      maxWidth: "40px",
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
                  </th>
                </tr>
              </thead>

              <tbody style={{ maxHeight: "5000px" }}>
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }}>
                      No record found
                    </td>
                  </tr>
                ) : (
                  currentData.map((item, index) => (
                    <tr key={item.Id}>
                      {/* S.No. */}
                      <td style={{ minWidth: "20px", maxWidth: "20px" }}>
                        <div
                          style={{ marginLeft: "10px" }}
                          className="indexdesign"
                        >
                          {index + 1}
                        </div>
                      </td>

                      {/*  AchievementTag */}
                      <td style={{ minWidth: "75px", maxWidth: "75px" }}>
                        {item.EmployeeName?.Title || "-"}
                      </td>

                      {/*  Title */}
                      <td style={{ minWidth: "75px", maxWidth: "75px" }}>
                        {item.AchievementTitle || "-"}
                      </td>

                      {/* AchievementDetail */}
                      <td style={{ minWidth: "120px", maxWidth: "120px" }}>
                        {item.AchievementDetail || "-"}
                      </td>

                      {/*  Details → SuggestionDetails */}
                      <td style={{ minWidth: "40px", maxWidth: "40px" }}>
                        {item.TopStar || "-"}
                      </td>

                      {/* <td style={{ minWidth: "120px", maxWidth: "120px" }}>
                                            {new Date(item.Created).toLocaleDateString()}
                                          </td> */}

                      {/* Action Buttons */}
                      <td
                        style={{ minWidth: "40px", maxWidth: "40px" }}
                        className="ng-binding"
                      >
                        <a
                          href="javascript:void(0);"
                          className="action-icon text-primary"
                          title="Edit"
                          onClick={() => onEdit(item)}
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <nav className="pagination-container">
              <ul className="pagination">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
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
                    className={`page-item ${
                      currentPage === num + 1 ? "active" : ""
                    }`}
                  >
                    <a
                      className="page-link"
                      onClick={() => handlePageChange(num + 1)}
                    >
                      {num + 1}
                    </a>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
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
    </>
  );
};

export default EmployeeRecognitionTable;
