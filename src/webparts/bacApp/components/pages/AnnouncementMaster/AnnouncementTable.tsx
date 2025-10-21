import * as React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
// import '../../../../styles/global.scss';
import "bootstrap-icons/font/bootstrap-icons.css";
import "material-symbols/index.css";
// import * as feather from 'feather-icons';
import { ChevronRight } from "react-feather";
import { Edit, Trash2 } from "react-feather";
import { ArrowLeft, PlusCircle } from "react-feather";
import { useEffect, useState } from "react";
import { SPFI } from "@pnp/sp";
import { getSP } from "../../../loc/pnpjsConfig";
import Swal from "sweetalert2";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import CustomBreadcrumb from "../../common/CustomBreadcrumb";
interface IAnnouncementTableProps {
  onAdd: () => void;
  onEdit: (item: any) => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const AnnouncementTable = ({
  onAdd,
  onEdit,
  setLoading,
}: IAnnouncementTableProps) => {
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  // Add these states
  const [filters, setFilters] = useState({
    sno: "",
    title: "",
    description: "",
    department: "",
    category: "",
    created: "",
  });

  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "ascending",
  });

    const Breadcrumb = [
    {
      MainComponent: "Settings",

      MainComponentURl: "Settings",
    },

    {
      MainComponent: "Announcement Master",

      MainComponentURl: "AnnouncementMaster",
    },
  ];

  // Apply filters and sorting
  const applyFiltersAndSorting = (data: any[]) => {
    if (!data) return [];

    // Filter rows
    const filtered = data.filter((item, index) => {
      return (
        (filters.sno === "" || String(index + 1).includes(filters.sno)) &&
        (filters.title === "" ||
          item.title?.toLowerCase().includes(filters.title.toLowerCase())) &&
        (filters.description === "" ||
          item.description
            ?.toLowerCase()
            .includes(filters.description.toLowerCase())) &&
        (filters.department === "" ||
          item.department
            ?.toLowerCase()
            .includes(filters.department.toLowerCase())) &&
        (filters.category === "" ||
          item.category
            ?.toLowerCase()
            .includes(filters.category.toLowerCase())) &&
        (filters.created === "" ||
          item.created?.toLowerCase().includes(filters.created.toLowerCase()))
      );
    });

    // Sorting
    const sorted = filtered.sort((a, b) => {
      const direction = sortConfig.direction === "ascending" ? 1 : -1;
      const key = sortConfig.key;

      if (!key) return 0;

      return direction * (a[key] || "").localeCompare(b[key] || "");
    });

    return sorted;
  };

  // Calculate pagination indexes
  const filteredData = applyFiltersAndSorting(newsItems);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  useEffect(() => {
    setLoading(true);
    const fetchAnnouncements = async () => {
      try {
        const sp: SPFI = getSP();

        const items = await sp.web.lists
          .getByTitle("AnnouncementAndNews")
          .items.filter("SourceType eq 'Announcements'")
          .select(
            "Id",
            "Title",
            "Description",
            "AnnouncementCategory/Category",
            "AnnouncementCategory/Id",
            "Department/DepartmentName",
            "Department/Id",
            "Overview",
            "FeaturedAnnouncement",
            "Created"
          )
          .expand("Department", "AnnouncementCategory")
          .orderBy("Created", false)();

        console.log(" Raw News items:", items);

        const formatted = items.map((item: any, index: number) => ({
          id: item.Id,
          sno: index + 1,
          title: item.Title,
          description: item.Description,
          department: item.Department?.DepartmentName || "",
          departmentId: item.Department?.Id || null,
          category: item.AnnouncementCategory?.Category || "",
          categoryId: item.AnnouncementCategory?.Id || null,
          overview: item.Overview || "",
          featured: item.FeaturedAnnouncement || false,
          created: new Date(item.Created).toLocaleDateString(),
        }));

        setNewsItems(formatted);
        console.log(" Formatted news data:", formatted);
      } catch (err) {
        console.error(" Error fetching news data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [setLoading]);
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
          const sp = getSP();
          const item = await sp.web.lists
            .getByTitle("AnnouncementAndNews")
            .items.getById(id)
            .select("Id", "AnnouncementandNewsImageID/Id")
            .expand("AnnouncementandNewsImageID")();

          const fileIds =
            item?.AnnouncementandNewsImageID?.map((f: any) => f.Id) || [];
          console.log(" Related file IDs to delete:", fileIds);

          // Delete related files from document library
          for (const fileId of fileIds) {
            try {
              await sp.web.lists
                .getByTitle("AnnouncementandNewsDocs")
                .items.getById(fileId)
                .delete();
              console.log(
                ` File with ID ${fileId} deleted from document library`
              );
            } catch (fileErr) {
              console.error(` Failed to delete file ID ${fileId}`, fileErr);
            }
          }
          await sp.web.lists
            .getByTitle("AnnouncementAndNews")
            .items.getById(id)
            .delete();

          //  Remove deleted item from local state
          setNewsItems((prev) => prev.filter((n) => n.id !== id));

          //  Success Alert
          Swal.fire({
            backdrop: false,
            title: "Deleted successfully.",
            icon: "success",
            confirmButtonText: "OK",
            showConfirmButton: true,
            allowOutsideClick: false,
          });
        } catch (err) {
          console.error("Error deleting item:", err);
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
  // Filter change handler
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // Sort change handler
  const handleSortChange = (key: string) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <>
      {/* <!-- start page title --> */}
      <div className="row">
        <div className="col-lg-4">
           <CustomBreadcrumb Breadcrumb={Breadcrumb} />
          {/* <h4 className="page-title fw-bold mb-1 font-20">
            Announcement Master
          </h4>
          <ol className="breadcrumb m-0">
            <li className="breadcrumb-item">
              <a href="javascript:void(0)">Settings</a>
            </li>
            <li className="breadcrumb-item">
              <ChevronRight size={20} color="#000" />
            </li>
            <li className="breadcrumb-item active">Announcement Master</li>
          </ol> */}
        </div>
        <div className="col-lg-8">
          <div className="d-flex flex-wrap align-items-center justify-content-end mt-3">
            <form className="d-flex flex-wrap align-items-center justify-content-start ng-pristine ng-valid">
              <button
                type="button"
                className="btn btn-secondary me-1 waves-effect waves-light"
                onClick={() => navigate("/Settings")}
              >
                {" "}
                <ArrowLeft size={18} className="me-1" />
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary waves-effect waves-light"
                onClick={onEdit}
              >
                <i className="fe-plus-circle me-1"></i>{" "}
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
            <div className="card-body">
              <div id="cardCollpase4" className="collapse show">
                <div className="table-responsive pt-0">
                  <table className="mtbalenew mt-0 table-centered table-nowrap table-borderless mb-0">
                    <thead>
                      <tr>
                        {/* S.No */}
                        <th
                          style={{
                            borderBottomLeftRadius: "10px",
                            minWidth: "50px",
                            maxWidth: "50px",
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
                              value={filters.sno}
                              onChange={(e) => handleFilterChange(e, "sno")}
                              className="inputcss"
                              style={{ width: "100%" }}
                            />
                          </div>
                        </th>

                        {/* News Title */}
                        <th style={{ minWidth: "75px", maxWidth: "75px" }}>
                          <div className="d-flex flex-column bd-highlight">
                            <div
                              className="d-flex pb-2"
                              style={{ justifyContent: "space-evenly" }}
                            >
                              <span>News Title</span>
                              <span onClick={() => handleSortChange("title")}>
                                <FontAwesomeIcon icon={faSort} />
                              </span>
                            </div>
                            <div className="bd-highlight">
                              <input
                                type="text"
                                placeholder="Filter by Title"
                                value={filters.title}
                                onChange={(e) => handleFilterChange(e, "title")}
                                className="inputcss"
                                style={{ width: "100%" }}
                              />
                            </div>
                          </div>
                        </th>

                        {/* Description */}
                        <th style={{ minWidth: "75px", maxWidth: "75px" }}>
                          <div className="d-flex flex-column bd-highlight">
                            <div
                              className="d-flex pb-2"
                              style={{ justifyContent: "space-evenly" }}
                            >
                              <span>Description</span>
                              <span
                                onClick={() => handleSortChange("description")}
                              >
                                <FontAwesomeIcon icon={faSort} />
                              </span>
                            </div>
                            <div className="bd-highlight">
                              <input
                                type="text"
                                placeholder="Filter by Description"
                                value={filters.description}
                                onChange={(e) =>
                                  handleFilterChange(e, "description")
                                }
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
                              <span
                                onClick={() => handleSortChange("department")}
                              >
                                <FontAwesomeIcon icon={faSort} />
                              </span>
                            </div>
                            <div className="bd-highlight">
                              <input
                                type="text"
                                placeholder="Filter by Department"
                                value={filters.department}
                                onChange={(e) =>
                                  handleFilterChange(e, "department")
                                }
                                className="inputcss"
                                style={{ width: "100%" }}
                              />
                            </div>
                          </div>
                        </th>

                        {/* Category */}
                        <th style={{ minWidth: "75px", maxWidth: "75px" }}>
                          <div className="d-flex flex-column bd-highlight">
                            <div
                              className="d-flex pb-2"
                              style={{ justifyContent: "space-evenly" }}
                            >
                              <span>Category</span>
                              <span
                                onClick={() => handleSortChange("category")}
                              >
                                <FontAwesomeIcon icon={faSort} />
                              </span>
                            </div>
                            <div className="bd-highlight">
                              <input
                                type="text"
                                placeholder="Filter by Category"
                                value={filters.category}
                                onChange={(e) =>
                                  handleFilterChange(e, "category")
                                }
                                className="inputcss"
                                style={{ width: "100%" }}
                              />
                            </div>
                          </div>
                        </th>

                        {/* Created */}
                        <th
                          style={{
                            minWidth: "80px",
                            maxWidth: "80px",
                          }}
                        >
                          <div className="d-flex flex-column bd-highlight">
                            <div
                              className="d-flex pb-2"
                              style={{ justifyContent: "space-evenly" }}
                            >
                              <span>Created</span>
                              <span onClick={() => handleSortChange("created")}>
                                <FontAwesomeIcon icon={faSort} />
                              </span>
                            </div>
                            <div className="bd-highlight">
                              <input
                                type="text"
                                placeholder="Filter by Date"
                                value={filters.created}
                                onChange={(e) =>
                                  handleFilterChange(e, "created")
                                }
                                className="inputcss"
                                style={{ width: "100%" }}
                              />
                            </div>
                          </div>
                        </th>

                        {/* Action */}
                        <th
                          style={{
                            borderBottomRightRadius: "10px",
                            minWidth: "50px",
                            maxWidth: "50px",
                          }}
                        >
                          <div className="d-flex flex-column bd-highlight pb-2">
                            <div
                              className="d-flex pb-2"
                              style={{ justifyContent: "space-evenly" }}
                            >
                              <span>Action</span>
                            </div>
                          </div>
                          <div style={{ height: "32px" }}></div>
                        </th>
                      </tr>
                    </thead>

                    <tbody style={{ maxHeight: "5000px" }}>
                      {newsItems.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-3">
                            No records found.
                          </td>
                        </tr>
                      ) : (
                        currentData.map((item, index) => (
                          <tr key={item.id}>
                            <td
                              style={{
                                minWidth: "50px",
                                maxWidth: "50px",
                              }}
                            >
                              {startIndex + index + 1}
                            </td>
                            <td style={{ minWidth: "75px", maxWidth: "75px" }}>
                              {item.title || "-"}
                            </td>
                            <td style={{ minWidth: "75px", maxWidth: "75px" }}>
                              {item.description || "-"}
                            </td>
                            <td style={{ minWidth: "75px", maxWidth: "75px" }}>
                              {item.department || "-"}
                            </td>
                            <td style={{ minWidth: "75px", maxWidth: "75px" }}>
                              {item.category || "-"}
                            </td>
                            <td
                              style={{
                                minWidth: "80px",
                                maxWidth: "80px",
                              }}
                            >
                              {item.created || "-"}
                            </td>
                            <td
                              style={{
                                minWidth: "50px",
                                maxWidth: "50px",
                              }}
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
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 size={16} />
                              </a>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  <nav className="justify-content-end mt-2">
                    <ul className="pagination pagination-rounded justify-content-end">
                      <li
                        className={`page-item ${currentPage === 1 ? "disabled" : ""
                          }`}
                      >
                        <a
                          className="page-link"
                          onClick={handlePrevPage}
                          aria-label="Previous"
                        >
                          <span aria-hidden="true">«</span>
                        </a>
                      </li>

                      {(() => {
                        const pages: JSX.Element[] = [];
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(
                            <li
                              key={i}
                              className={`page-item ${currentPage === i ? "active" : ""
                                }`}
                            >
                              <a
                                className="page-link"
                                onClick={() => handlePageChange(i)}
                              >
                                {i}
                              </a>
                            </li>
                          );
                        }
                        return pages;
                      })()}

                      <li
                        className={`page-item ${currentPage === totalPages ? "disabled" : ""
                          }`}
                      >
                        <a
                          className="page-link"
                          onClick={handleNextPage}
                          aria-label="Next"
                        >
                          <span aria-hidden="true">»</span>
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
                {/* <!-- .table-responsive --> */}
              </div>
              {/* <!-- end collapse--> */}
            </div>
            {/* <!-- end card-body--> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default AnnouncementTable;
