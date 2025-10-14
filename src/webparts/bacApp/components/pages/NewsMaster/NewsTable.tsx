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
import CustomBreadcrumb from "../../common/CustomBreadcrumb";
import { useNavigate } from 'react-router-dom';
interface INewsTableProps {
  onAdd: () => void;
  onEdit: (item: any) => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const NewsTable = ({ onAdd, onEdit,setLoading }: INewsTableProps) => {
  const navigate = useNavigate();
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination indexes
  const totalPages = Math.ceil(newsItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = newsItems.slice(startIndex, endIndex);
  useEffect(() => {
    setLoading(true);
    const fetchNews = async () => {
      try {
        const sp: SPFI = getSP();
        const items = await sp.web.lists
          .getByTitle("AnnouncementAndNews")
          .items.filter("SourceType eq 'News'")
          .select(
            "Id",
            "Title",
            "Description",
            "Category",
            "Department/DepartmentName",
            "Department/Id",
            "Overview",
            "Created"
          )
          .expand("Department")
          .orderBy("Created", false)();

        console.log(" Raw News items:", items);

        const formatted = items.map((item: any, index: number) => ({
          id: item.Id,
          sno: index + 1,
          title: item.Title,
          description: item.Description,
          department: item.Department?.DepartmentName || "",
          departmentId: item.Department?.Id || null,
          category: item.Category || "—",
          overview: item.Overview || "",
          created: new Date(item.Created).toLocaleDateString(),
        }));

        setNewsItems(formatted);
        console.log(" Formatted news data:", formatted);
      } catch (err) {
        console.error(" Error fetching news data:", err);
      }
      finally {
        setLoading(false); 
      }
    };

    fetchNews();
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

        const fileIds = item?.AnnouncementandNewsImageID?.map((f: any) => f.Id) || [];
        console.log(" Related file IDs to delete:", fileIds);

        // Delete related files from document library
        for (const fileId of fileIds) {
          try {
            await sp.web.lists
              .getByTitle("AnnouncementandNewsDocs")
              .items.getById(fileId)
              .delete();
            console.log(` File with ID ${fileId} deleted from document library`);
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
        }finally {
           setLoading(false);
        }
      }
    });
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
   const Breadcrumb = [

        {

            "MainComponent": "Settings",

            "MainComponentURl": "Settings",


        },

        {

            "MainComponent": "News Master",

            "MainComponentURl": "NewsMaster",


        }

    ];

  return (
    <>
      {/* <!-- start page title --> */}
      <div className="row">
        <div className="col-lg-4">
          {/* <h4 className="page-title fw-bold mb-1 font-20">News Master</h4>
          <ol className="breadcrumb m-0">
            <li className="breadcrumb-item">
              <a href="settings.html">Settings</a>
            </li>
            <li className="breadcrumb-item">
              <ChevronRight size={20} color="#000" />
            </li>
            <li className="breadcrumb-item active">News Master</li>
          </ol> */}
           <CustomBreadcrumb Breadcrumb={Breadcrumb} />
        </div>
        <div className="col-lg-8">
          <div className="d-flex flex-wrap align-items-center justify-content-end mt-3">
            <form className="d-flex flex-wrap align-items-center justify-content-start ng-pristine ng-valid">
              {/* <button
                type="button"
                className="btn btn-secondary me-1 waves-effect waves-light"
                onClick={onAdd}
              >
                <i className="fe-arrow-left me-1"></i>{" "}
                <ArrowLeft size={18} className="me-1" />
                Back
              </button> */}
              <button type="button" className="btn btn-secondary me-1 waves-effect waves-light" onClick={() => navigate("/Settings")}> <ArrowLeft size={18} className="me-1" />Back</button>
              
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
                  <table className="mtable table-centered table-nowrap table-borderless mb-0">
                    <thead>
                      <tr>
                        <th
                          style={{
                            borderBottomLeftRadius: "10px",
                            minWidth: "50px",
                            maxWidth: "50px",
                          }}
                        >
                          S.No.
                        </th>
                        <th>News Title</th>
                        <th>Description</th>
                        <th>Department</th>
                        <th>Category</th>
                        <th
                          style={{
                            minWidth: "80px",
                            maxWidth: "80px",
                          }}
                        >
                          Created
                        </th>
                        <th
                          style={{
                            borderBottomRightRadius: "10px",
                            minWidth: "50px",
                            maxWidth: "50px",
                          }}
                        >
                          Action
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
                            <td>{item.title}</td>
                            <td>{item.description}</td>
                            <td>{item.department}</td>
                            <td>{item.category}</td>
                            <td
                              style={{
                                minWidth: "80px",
                                maxWidth: "80px",
                              }}
                            >
                              {item.created}
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
                                onClick={() => onEdit(item)}
                              >
                                <Edit size={18} />
                              </a>
                              <a
                                href="javascript:void(0);"
                                className="action-icon text-danger"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 size={18} />
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
                        className={`page-item ${
                          currentPage === 1 ? "disabled" : ""
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
                              className={`page-item ${
                                currentPage === i ? "active" : ""
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
                        className={`page-item ${
                          currentPage === totalPages ? "disabled" : ""
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

export default NewsTable;
