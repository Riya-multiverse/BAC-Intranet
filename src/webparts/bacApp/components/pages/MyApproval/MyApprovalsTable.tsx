import * as React from "react";
import {
  ArrowLeft,
  ChevronRight,
  Edit,
  PlusCircle,
  Trash2,
} from "react-feather";
import {
  faArrowLeft,
  faEllipsisV,
  faFileExport,
  faPlusCircle,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomBreadcrumb from "../../common/CustomBreadcrumb";
import { SPFI } from "@pnp/sp/presets/all";
import { getSP } from "../../../loc/pnpjsConfig";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
interface ITemplateTableProps {
  onAdd: () => void;
  onEdit: (item: any) => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const MyApprovalsTable = ({ onAdd, onEdit, setLoading }: ITemplateTableProps) => {
  const sp: SPFI = getSP();
  const [masterlistdata, setmasterlistdata] = React.useState<any[]>([]);
  const [sortConfig, setSortConfig] = React.useState({
    key: "",
    direction: "ascending",
  });
  const [isOpen, setIsOpen] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState("Pending");

  const navigate = useNavigate();
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const Breadcrumb = [
    {
      MainComponent: "Home",

      MainComponentURl: "Home",
    },

    {
      MainComponent: "My Approvals",

      MainComponentURl: "MyApprovals",
    },
  ];

  React.useEffect(() => {
    ApiCall();
  }, []);

  const ApiCall = async () => {
    setLoading(true);
    try {
      const QuickLinkArr = await getMasterListData();
      setmasterlistdata(QuickLinkArr);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const getMasterListData = async () => {
    let arr: any[] = [];
    const currentUser = await sp.web.currentUser();

    //   if (isSuperAdmin == "Yes") {
    await sp.web.lists
      .getByTitle("ApprovalHistory")
      .items
      .filter(`AssignedToId eq ${currentUser.Id}`)
      .select(
        "Id",
        "Title",
        "Status",
        "RequestedOn",
        "RequestedBy/Id",
        "RequestedBy/Title",
        "DepartmentInitiativeID/Id"
      )
      .expand("RequestedBy", "DepartmentInitiativeID")
      .orderBy("Created", false)
      .getAll()
      .then((res) => {
        arr = res;
      })
      .catch((error) => { });

    return arr;
  };
  const [filters, setFilters] = React.useState({
    SNo: "",
    Title: "",
    Department: { ID: "", DepartmentName: "" },
    RequestedBy: "",
    RequestedOn: "",
    Status: "Pending",
    // IsActive: ''
  });
  // REPLACE your applyFiltersAndSorting with this
  const applyFiltersAndSorting = (data: any[]) => {
    const filteredData = data.filter((item, index) => {
      const title = (item?.Title || "").toLowerCase();
      const deptName = (
        item?.DepartmentInitiativeID?.Department?.DepartmentName || ""
      ).toLowerCase();
      const requestedBy = (item?.RequestedBy?.Title || "").toLowerCase();
      const status = (item?.Status || "").toLowerCase();

      const requestedOnDate = item?.RequestedOn ? new Date(item.RequestedOn) : null;
      const requestedOnStr = requestedOnDate
        ? requestedOnDate.toLocaleDateString()
        : "";

      return (
        (filters.SNo === "" || String(index + 1).includes(filters.SNo)) &&
        (filters.Title === "" || title.includes(filters.Title.toLowerCase())) &&
        (Object.keys(filters.Department).length === 0 ||
          deptName.includes((filters.Department.DepartmentName || "").toLowerCase())) &&
        (filters.RequestedBy === "" ||
          requestedBy.includes(filters.RequestedBy.toLowerCase())) &&
        (filters.RequestedOn === "" || requestedOnStr.includes(filters.RequestedOn)) &&
        (filters.Status === "" || status.includes(filters.Status.toLowerCase()))
      );
    });

    const dir = sortConfig.direction === "ascending" ? 1 : -1;
    const sortedData = filteredData.sort((a, b) => {
      if (!sortConfig.key) return 0;

      const getVal = (row: any) => {
        switch (sortConfig.key) {
          case "SNo":
            return data.indexOf(row);
          case "Title":
            return (row?.Title || "").toLowerCase();
          case "Department":
            return (
              row?.DepartmentInitiativeID?.Department?.DepartmentName || ""
            ).toLowerCase();
          case "RequestedBy":
            return (row?.RequestedBy?.Title || "").toLowerCase();
          case "RequestedOn":
            return row?.RequestedOn ? new Date(row.RequestedOn).getTime() : 0;
          case "Status":
            return (row?.Status || "").toLowerCase();
          default:
            return "";
        }
      };

      const av = getVal(a);
      const bv = getVal(b);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });

    return sortedData;
  };


  const filteredQuickLinkData = applyFiltersAndSorting(masterlistdata);

  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredQuickLinkData.length / itemsPerPage);

  const handlePageChange = (pageNumber: any) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredQuickLinkData.slice(startIndex, endIndex);
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
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...(field === "Department"
        ? {
          Department: {
            ...prevFilters.Department,
            DepartmentName: e.target.value,
          },
        } // Corrected bracket placement
        : { [field]: e.target.value }), // Update other fields normally
    }));
  };

  //#region Download exl file
  //   const handleExportClick = () => {
  //     const exportData = currentData.map((item, index) => ({
  //       // 'S.No.': startIndex + index + 1,
  //       // 'Title': item.Title,
  //       // 'Url': item.Url,

  //       // 'Status': item.Status,
  //       // 'Submitted Date': item.Created,
  //       "S.No.": startIndex + index + 1,

  //       Title: item.Title,

  //       // URL: item.URL,
  //     //   Department: item.Department.DepartmentName,

  //       // "Redirect to new tab": item.RedirectToNewTab,

  //       Active: item.IsActive,

  //       "Submitted Date": item.Created,
  //     }));

  //     exportToExcel(exportData, "Quick Links");
  //   };
  //   const exportToExcel = (data: any[], fileName: string) => {
  //     const workbook = XLSX.utils.book_new();
  //     const worksheet = XLSX.utils.json_to_sheet(data);
  //     XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  //     XLSX.writeFile(workbook, `${fileName}.xlsx`);
  //   };
  const handleDelete = async (id: number) => {
    if (!id) return;

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
          //Get the related file IDs from TemplateAndForms
          const item = await sp.web.lists
            .getByTitle("DepartmentInitiative")
            .items.getById(id)
            .select("Id", "Thumbnail/Id", "Attachment/Id")
            .expand("Thumbnail", "Attachment")();

          //Collect all related file IDs
          const attachmentIds = item.Attachment
            ? Array.isArray(item.Attachment)
              ? item.Attachment.map((f: any) => f.Id)
              : [item.Attachment.Id]
            : [];
          const iconIds = item.Thumbnail
            ? Array.isArray(item.Thumbnail)
              ? item.Thumbnail.map((f: any) => f.Id)
              : [item.Thumbnail.Id]
            : [];


          //Delete attachments from TemplateDocs
          for (const fileId of [...attachmentIds, ...iconIds]) {
            try {
              await sp.web.lists
                .getByTitle("DepartmentInitiativeDocs")
                .items.getById(fileId)
                .delete();
            } catch (error) { }
          }

          //Delete the main TemplateAndForms item
          await sp.web.lists
            .getByTitle("DepartmentInitiative")
            .items.getById(id)
            .delete();

          //Update UI
          setmasterlistdata((prev) => prev.filter((n) => n.Id !== id));

          Swal.fire({
            backdrop: false,
            title: "Deleted successfully.",
            icon: "success",
            confirmButtonText: "OK",
            showConfirmButton: true,
            allowOutsideClick: false,
          });
        } catch (error) {
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

  return (
    <>
      {/* // <!-- start page title --> */}
      <div className="row">
        <div className="col-lg-4">
          <CustomBreadcrumb Breadcrumb={Breadcrumb} />
        </div>
        <div className="col-lg-8">
          <div className="d-flex flex-wrap align-items-center justify-content-end mt-3">
            <form className="d-flex flex-wrap align-items-center justify-content-start ng-pristine ng-valid">
              {/* <button
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
                <PlusCircle className="me-1" size={18} />
                Add
              </button> */}

              {/* STATUS DROPDOWN */}
              <select
                className="form-select"
                style={{ width: "220px" }}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setFilters(prev => ({ ...prev, Status: e.target.value })); // filter integration
                }}
              >
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Rework">Rework</option>
              </select>
            </form>
          </div>
        </div>
      </div>
      {/* // <!-- end page title --></> */}
      <div className="card cardCss mt-4 mb-0">
        <div className="card-body">
          <div id="cardCollpase4" className="collapse show">
            <div className="table-responsive pt-0">
              <table className="mtbalenew mt-0 table-centered table-nowrap table-borderless mb-0">
                <thead>
                  <tr>
                    {/* S.No */}
                    <th
                      style={{
                        borderBottomLeftRadius: "0px",
                        minWidth: "40px",
                        maxWidth: "40px",
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
                    <th style={{ minWidth: "120px", maxWidth: "120px" }}>
                      <div className="d-flex flex-column bd-highlight">
                        <div
                          className="d-flex pb-2"
                          style={{ justifyContent: "space-evenly" }}
                        >
                          <span>Title</span>
                          <span onClick={() => handleSortChange("Title")}>
                            <FontAwesomeIcon icon={faSort} />
                          </span>
                        </div>
                        <div className="bd-highlight">
                          <input
                            type="text"
                            placeholder="Filter by Title"
                            onChange={(e) => handleFilterChange(e, "Title")}
                            className="inputcss"
                            style={{ width: "100%" }}
                          />
                        </div>
                      </div>
                    </th>


                    {/* Department */}
                    {/* <th style={{ minWidth: "120px", maxWidth: "120px" }}>
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
                            onChange={(e) =>
                              handleFilterChange(e, "Department")
                            }
                            className="inputcss"
                            style={{ width: "100%" }}
                          />
                        </div>
                      </div>
                    </th> */}



                    {/* Requested By */}
                    <th style={{ minWidth: "160px", maxWidth: "200px" }}>
                      <div className="d-flex flex-column bd-highlight">
                        <div className="d-flex pb-2" style={{ justifyContent: "space-evenly" }}>
                          <span>Requested By</span>
                          <span onClick={() => handleSortChange("RequestedBy")}>
                            <FontAwesomeIcon icon={faSort} />
                          </span>
                        </div>
                        <input
                          type="text"
                          placeholder="Filter by Requester"
                          onChange={(e) => handleFilterChange(e, "RequestedBy")}
                          className="inputcss"
                          style={{ width: "100%" }}
                        />
                      </div>
                    </th>

                    {/* Requested On */}
                    <th style={{ minWidth: "140px", maxWidth: "180px" }}>
                      <div className="d-flex flex-column bd-highlight">
                        <div className="d-flex pb-2" style={{ justifyContent: "space-evenly" }}>
                          <span>Requested Date</span>
                          <span onClick={() => handleSortChange("RequestedOn")}>
                            <FontAwesomeIcon icon={faSort} />
                          </span>
                        </div>
                        <input
                          type="text"
                          placeholder="Filter by Date"
                          onChange={(e) => handleFilterChange(e, "RequestedOn")}
                          className="inputcss"
                          style={{ width: "100%" }}
                        />
                      </div>
                    </th>


                    {/* Status */}
                    <th style={{ minWidth: "120px", maxWidth: "120px" }}>
                      <div className="d-flex flex-column bd-highlight">
                        <div
                          className="d-flex pb-2"
                          style={{ justifyContent: "space-evenly" }}
                        >
                          <span>Status</span>
                          <span onClick={() => handleSortChange("Status")}>
                            <FontAwesomeIcon icon={faSort} />
                          </span>
                        </div>
                        <div className="bd-highlight">
                          <input
                            type="text"
                            placeholder="Filter by Status"
                            onChange={(e) =>
                              handleFilterChange(e, "Status")
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
                    <div className="no-results" style={{ display: "flex", justifyContent: "center" }}>
                      No results found
                    </div>
                  ) : (
                    currentData.map((item, index) => {
                      const requestedOnStr = item.RequestedOn
                        ? new Date(item.RequestedOn).toLocaleDateString()
                        : "";

                      return (
                        <tr key={index}>
                          {/* S.No */}
                          <td style={{ minWidth: "40px", maxWidth: "40px" }}>
                            <div style={{ marginLeft: "10px" }} className="indexdesign">
                              {index + 1}
                            </div>
                          </td>

                          {/* Title */}
                          <td style={{ minWidth: "120px", maxWidth: "120px" }}>
                            {item.Title}
                          </td>

                          {/* Requested By */}
                          <td style={{ minWidth: "160px", maxWidth: "200px" }}>
                            {item?.RequestedBy?.Title || ""}
                          </td>

                          {/* Requested On */}
                          <td style={{ minWidth: "140px", maxWidth: "180px" }}>
                            {requestedOnStr}
                          </td>

                          {/* Status */}
                          <td style={{ minWidth: "120px", maxWidth: "120px" }}>
                            {item.Status}
                          </td>

                          {/* Action */}
                          <td style={{ minWidth: "40px", maxWidth: "40px" }} className="ng-binding">
                            <a
                              href="javascript:void(0);"
                              className="action-icon text-primary"
                              onClick={() => {
                                const diId = item?.DepartmentInitiativeID?.Id;
                                if (!diId) {
                                  Swal.fire("Not linked", "DepartmentInitiative record not found for this row.", "warning");
                                  return;
                                }
                                // onEdit({ Id: diId }); 
                                onEdit({
                                  mode: "approval",               //  tell the form it's approval flow
                                  departmentInitiativeId: diId,   //  DI Id to prefill
                                  approvalId: item.Id,            //  ApprovalHistory row Id to update status/remarks
                                });
                              }}
                            >
                              <Edit size={18} />
                            </a>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>

              </table>

              <nav className="pagination-container">
                <ul className="pagination">
                  <li
                    className={`page-item ${currentPage === 1 ? "disabled" : ""
                      }`}
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
                      className={`page-item ${currentPage === num + 1 ? "active" : ""
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
                    className={`page-item ${currentPage === totalPages ? "disabled" : ""
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
      </div>
    </>
  );
};

export default MyApprovalsTable;
