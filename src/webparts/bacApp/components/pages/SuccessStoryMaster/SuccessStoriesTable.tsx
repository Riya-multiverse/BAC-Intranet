import * as React from "react";
//import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "material-symbols/index.css";
import {
  faArrowLeft,
  faEllipsisV,
  faFileExport,
  faPlusCircle,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChevronRight, Edit, Trash2, ArrowLeft, PlusCircle } from "react-feather";
import { SPFI } from "@pnp/sp";
import { getSP } from "../../../loc/pnpjsConfig";
import Swal from "sweetalert2";
import CustomBreadcrumb from "../../common/CustomBreadcrumb";
import { useNavigate } from "react-router-dom";
import * as moment from "moment";

interface ISuccessProps {
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
    MainComponent: "Success Stories",
    MainComponentURl: "SuccessStoriesMaster",
  },
];

const SuccessTable = ({ onAdd, onEdit, setLoading }: ISuccessProps) => {
  const navigate = useNavigate();
  const [SuccessList, setSuccessList] = React.useState<any[]>([]);
  const [filters, setFilters] = React.useState({
    SNo: "",
    SuccessStories: "",
    Department: "",
  });

  // Sorting
  const [sortConfig, setSortConfig] = React.useState({
    key: "",
    direction: "ascending",
  });

  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;
  const sp: SPFI = getSP();

  // Fetch data from SharePoint
  React.useEffect(() => {
    setLoading(true);
    const fetchSuccessStories = async () => {
      try {
        const items = await sp.web.lists
          .getByTitle("SuccessStories")
          .items.select(
            "Id",
            "SuccessStories",
            "Department/Id",
            "Department/DepartmentName"
          )
          .expand("Department")
          .orderBy("Created", false)();

        const formatted = items.map((item: any, index: number) => ({
          Id: item.Id,
          SNo: index + 1,
          SuccessStories: item.SuccessStories || "",
          Department: item.Department?.DepartmentName || "",
        }));

        setSuccessList(formatted);
      } catch (error) {
        console.error("Error fetching SuccessStories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuccessStories();
  }, [setLoading]);

  // Delete item
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
          await sp.web.lists.getByTitle("SuccessStories").items.getById(id).delete();
          setSuccessList((prev) => prev.filter((item) => item.Id !== id));

          Swal.fire({
            backdrop: false,
            title: "Deleted successfully.",
            icon: "success",
            confirmButtonText: "OK",
            allowOutsideClick: false,
          });
        } catch (error) {
          console.error("Error deleting SuccessStory:", error);
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

  // Apply filters and sorting

const applyFiltersAndSorting = (data: any[]) => {
  if (!data) return [];

  const filtered = data.filter((item, index) => {
    return (
      (filters.SNo === "" || String(index + 1).includes(filters.SNo)) &&
      (filters.SuccessStories === "" ||
        item.SuccessStories.toLowerCase().includes(filters.SuccessStories.toLowerCase())) &&
      (filters.Department === "" ||
        item.Department.toLowerCase().includes(filters.Department.toLowerCase()))
    );
  });

  // Proper sorting with cloned array
// Proper sorting with cloned array (fixed)
const sorted = [...filtered].sort((a, b) => {
  const dir = sortConfig.direction === "ascending" ? 1 : -1;
  const key = sortConfig.key;

  if (!key) return 0;

  if (key === "SNo") {
    const aNum = Number(a.SNo) || 0;
    const bNum = Number(b.SNo) || 0;
    return dir * (aNum - bNum);
  }

  if (key === "Department") {
    const aStr = (a.Department || "").toString().trim().toLowerCase();
    const bStr = (b.Department || "").toString().trim().toLowerCase();
    if (aStr === "" && bStr === "") return 0;
    if (aStr === "") return dir * 1;
    if (bStr === "") return dir * -1;
    return dir * aStr.localeCompare(bStr);
  }

  if (key === "SuccessStories") {
    const aStr = (a.SuccessStories || "").toString().trim().toLowerCase();
    const bStr = (b.SuccessStories || "").toString().trim().toLowerCase();
    if (aStr === "" && bStr === "") return 0;
    if (aStr === "") return dir * 1;
    if (bStr === "") return dir * -1;
    return dir * aStr.localeCompare(bStr);
  }

  return 0;
});


  return sorted;
};


  const filteredData = applyFiltersAndSorting(SuccessList);

  // Pagination calculation
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Handlers
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
          <CustomBreadcrumb Breadcrumb={Breadcrumb} />
        </div>
        <div className="col-lg-8">
          <div className="d-flex flex-wrap align-items-center justify-content-end mt-3">
            <form className="d-flex flex-wrap align-items-center justify-content-start ng-pristine ng-valid">
              <button
                type="button"
                className="btn btn-secondary me-1 waves-effect waves-light"
                onClick={() => navigate("/Settings")}
              >
                <ArrowLeft size={18} className="me-1" />
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary waves-effect waves-light"
                onClick={onEdit}
              >
                <PlusCircle className="me-1" size={18} />
                Add
              </button>
            </form>
          </div>
        </div>
      </div>
      {/* <!-- end page title --> */}

      <div className="tab-content mt-3">
        <div className="tab-pane show active" id="profile1" role="tabpanel">
          <div className="card">
            <table className="mtbalenew mt-0 table-centered table-nowrap table-borderless mb-0">
              <thead>
                <tr>
                  {/* S.No */}
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

                  {/* Success Stories */}
                  <th style={{ minWidth: "75px", maxWidth: "75px" }}>
                    <div className="d-flex flex-column bd-highlight">
                      <div
                        className="d-flex pb-2"
                        style={{ justifyContent: "space-evenly" }}
                      >
                        <span>Success Stories</span>
                        <span onClick={() => handleSortChange("SuccessStories")}>
                          <FontAwesomeIcon icon={faSort} />
                        </span>
                      </div>
                      <div className="bd-highlight">
                        <input
                          type="text"
                          placeholder="Filter by Success Stories"
                          value={filters.SuccessStories}
                          onChange={(e) => handleFilterChange(e, "SuccessStories")}
                          className="inputcss"
                          style={{ width: "100%" }}
                        />
                      </div>
                    </div>
                  </th>

                  {/* Department */}
                  <th style={{ minWidth: "75px", maxWidth: "75px" }}>
                    <div className="d-flex flex-column bd-highlight">
                      <div
                        className="d-flex pb-2"
                        style={{ justifyContent: "space-evenly" }}
                      >
                        <span>Department</span>
                        <span onClick={() => handleSortChange("Department")}>
                          <FontAwesomeIcon icon={faSort} />
                        </span>
                      </div>
                      <div className="bd-highlight">
                        <input
                          type="text"
                          placeholder="Filter by Department"
                          value={filters.Department}
                          onChange={(e) => handleFilterChange(e, "Department")}
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
                      <td style={{ minWidth: "20px", maxWidth: "20px" }}>
                        <div
                          style={{ marginLeft: "10px" }}
                          className="indexdesign"
                        >
                          {index + 1}
                        </div>
                      </td>
                      <td style={{ minWidth: "75px", maxWidth: "75px" }}>
                        {item.SuccessStories || "-"}
                      </td>
                      <td style={{ minWidth: "75px", maxWidth: "75px" }}>
                        {item.Department || "-"}
                      </td>
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

export default SuccessTable;
