import * as React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// import '../../../../styles/global.scss';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'material-symbols/index.css';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { SPFI } from "@pnp/sp";
import { getSP } from "../../../loc/pnpjsConfig";
import { ChevronRight, Edit, Trash2, ArrowLeft, PlusCircle } from "react-feather";
import Swal from "sweetalert2";
import {
  faArrowLeft,
  faEllipsisV,
  faFileExport,
  faPlusCircle,
  faQ,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomBreadcrumb from '../../common/CustomBreadcrumb';

// Interface defining props received from parent component
interface IFaqTableProps {
  onAdd: () => void;
  onEdit: (item: any) => void;
  data: any[];
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
const Breadcrumb = [

    {

        "MainComponent": "Settings",

        "MainComponentURl": "Settings",


    },

    {

        "MainComponent": "FAQ Master",

        "MainComponentURl": "FAQMaster",


    }

];


// Main FaqTable component
const FaqTable = ({ onAdd, onEdit, setLoading }: IFaqTableProps) => {

 
  //State Definitions
   
  const [faqList, setFaqList] = React.useState<any[]>([]);
  const [showForm, setShowForm] = React.useState(false);
  const [editItem, setEditItem] = React.useState<any>(null);
  const _sp: SPFI = getSP();

 
    //Fetch FAQ List Data from SharePoint
   
  React.useEffect(() => {
    setLoading(true);
    const fetchFAQData = async () => {
      try {
        const items = await _sp.web.lists
          .getByTitle("FAQ")
          .items.select("Id,Question,Answer,Author/Title,Created")
          .expand("Author")();

        // Format SharePoint data to match component requirements
        const formatted = items.map((item: any) => ({
          Id: item.Id,
          Question: item.Question || "",
          Answer: item.Answer || "",
        }));

        setFaqList(formatted);
      } catch (error) {
        console.error("Error fetching FAQ data:", error);
      }
      finally{
        setLoading(false);
      }
    };

    fetchFAQData();
  }, [setLoading]);

  /* Handle Edit - Called when edit icon is clicked */
  const handleEdit = (item: any) => {
    console.log("Editing FAQ item:", item);
    setEditItem(item); 
    setShowForm(true);
    onEdit(item); 
  };

  //  Deletes  record from SharePoint
  const handleDelete = async (id: number) => {
    Swal.fire({
      title: "Do you want to delete this FAQ?",
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

          // Delete item directly from FAQ list
          await sp.web.lists.getByTitle("FAQ").items.getById(id).delete();

          // Remove deleted item from local state
          setFaqList((prev) => prev.filter((faq) => faq.Id !== id));

          // Show success alert
          Swal.fire({
            backdrop: false,
            title: "Deleted successfully.",
            icon: "success",
            confirmButtonText: "OK",
            showConfirmButton: true,
            allowOutsideClick: false,
          });
        } catch (err) {
          console.error("Error deleting FAQ:", err);

          // Show error alert if deletion fails
          Swal.fire({
            title: "Error",
            text: "Failed to delete the FAQ.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }finally {
           setLoading(false);
        }
      }
    });
  };

  // Filtering, Sorting, and Pagination Logic 
  const [filters, setFilters] = React.useState({
    SNo: "",
    Question: "",
    Answer: "",
  });

  const [sortConfig, setSortConfig] = React.useState({
    key: "",
    direction: "ascending",
  });

  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  // Apply filters and sorting logic
  const applyFiltersAndSorting = (data: any[]) => {
    if (!data) return [];
    const filtered = data.filter((item, index) => {
      return (
        (filters.SNo === "" || String(index + 1).includes(filters.SNo)) &&
        (filters.Question === "" ||
          item.Question.toLowerCase().includes(filters.Question.toLowerCase())) &&
        (filters.Answer === "" ||
          item.Answer.toLowerCase().includes(filters.Answer.toLowerCase()))
      );
    });

    const sorted = filtered.sort((a, b) => {
      const direction = sortConfig.direction === "ascending" ? 1 : -1;
      switch (sortConfig.key) {
        case "SNo":
          return direction * (data.indexOf(a) - data.indexOf(b));
        case "Question":
          return direction * (a.Question || "").localeCompare(b.Question || "");
        case "Answer":
          return direction * (a.Answer || "").localeCompare(b.Answer || "");
        default:
          return 0;
      }
    });

    return sorted;
  };

  const filteredFaq = applyFiltersAndSorting(faqList);

  // Pagination calculations
  const totalPages = Math.ceil(filteredFaq.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredFaq.slice(startIndex, endIndex);

  // Sorting handler
  const handleSortChange = (key: string) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Filter input handler
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // Pagination change handler
  const handlePageChange = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };


  return (
    <>
      {/* Page Title and Header */}
      <div className="row">
        <div className="col-lg-4">
          {/* <h4 className="page-title fw-bold mb-1 font-20">FAQ Master</h4>
          <ol className="breadcrumb m-0">
            <li className="breadcrumb-item"><a href="settings.html">Settings</a></li>
            <li className="breadcrumb-item">
              
            </li>
            <li className="breadcrumb-item active">FAQ Master</li>
          </ol> */}
          <CustomBreadcrumb Breadcrumb={Breadcrumb} />
        </div>

        <div className="col-lg-8">
          <div className="d-flex flex-wrap align-items-center justify-content-end mt-3">
            <form className="d-flex flex-wrap align-items-center justify-content-start ng-pristine ng-valid">
              {/* Back Button */}
              <button
                type="button"
                className="btn btn-secondary me-1 waves-effect waves-light"
                onClick={onAdd}
              >
                <ArrowLeft size={18} className="me-1" />
                Back
              </button>

              {/* Add Button */}
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

      {/* Table Section */}
      <div className="tab-content mt-3">
        <div className="tab-pane show active" id="profile1" role="tabpanel">
          <div className="card">
            <table className="mtbalenew mt-0 table-centered table-nowrap table-borderless mb-0">
              <thead>
                <tr>
                  {/* Serial Number */}
                  <th
                    style={{
                      borderBottomLeftRadius: "0px",
                      minWidth: "10px",
                      maxWidth: "10px",
                      borderTopLeftRadius: "0px",
                    }}
                  >
                    <div className="d-flex pb-2" style={{ justifyContent: "space-between" }}>
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

                  {/* Question */}
                  <th style={{ minWidth: "100px", maxWidth: "100px" }}>
                    <div className="d-flex flex-column bd-highlight">
                      <div className="d-flex pb-2" style={{ justifyContent: "space-evenly" }}>
                        <span>Question</span>
                        <span onClick={() => handleSortChange("Question")}>
                          <FontAwesomeIcon icon={faSort} />
                        </span>
                      </div>
                      <div className="bd-highlight">
                        <input
                          type="text"
                          placeholder="Filter by Question"
                          value={filters.Question}
                          onChange={(e) => handleFilterChange(e, "Question")}
                          className="inputcss"
                          style={{ width: "100%" }}
                        />
                      </div>
                    </div>
                  </th>

                  {/* Answer */}
                  <th style={{ minWidth: "120px", maxWidth: "120px" }}>
                    <div className="d-flex flex-column bd-highlight">
                      <div className="d-flex pb-2" style={{ justifyContent: "space-evenly" }}>
                        <span>Answer</span>
                        <span onClick={() => handleSortChange("Answer")}>
                          <FontAwesomeIcon icon={faSort} />
                        </span>
                      </div>
                      <div className="bd-highlight">
                        <input
                          type="text"
                          placeholder="Filter by Answer"
                          value={filters.Answer}
                          onChange={(e) => handleFilterChange(e, "Answer")}
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
                      minWidth: "20px",
                      maxWidth: "20px",
                      borderBottomRightRadius: "0px",
                      borderTopRightRadius: "0px",
                    }}
                  >
                    <div className="d-flex flex-column bd-highlight pb-2">
                      <div className="d-flex pb-2" style={{ justifyContent: "space-evenly" }}>
                        <span>Action</span>
                      </div>
                    </div>
                    <div style={{ height: "32px" }}></div>
                  </th>
                </tr>
              </thead>

              <tbody style={{ maxHeight: "5000px" }}>
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "left" }}>
                      No FAQs found
                    </td>
                  </tr>
                ) : (
                  currentData.map((item, index) => (
                    <tr key={item.Id}>
                      {/* S.No. */}
                      <td style={{ minWidth: "10px", maxWidth: "10px" }}>
                        <div style={{ marginLeft: "10px" }} className="indexdesign">
                          {index + 1}
                        </div>
                      </td>

                      {/* Question */}
                      <td style={{ minWidth: "100px", maxWidth: "100px" }}>
                        {item.Question || "-"}
                      </td>

                      {/* Answer */}
                      <td style={{ minWidth: "120px", maxWidth: "120px" }}>
                        {item.Answer || "-"}
                      </td>

                      {/* Action Buttons */}
                      <td
                        style={{ minWidth: "20px", maxWidth: "20px" }}
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

            {/* Pagination */}
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
    </>
  );
};

export default FaqTable;
