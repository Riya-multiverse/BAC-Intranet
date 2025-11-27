import * as React from "react";
//import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../../../../../styles/global.scss";
import "bootstrap-icons/font/bootstrap-icons.css";
import "material-symbols/index.css";
// import * as feather from 'feather-icons';
import { ChevronRight } from "react-feather";
import Swal from "sweetalert2";
import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { getSP } from "../../../loc/pnpjsConfig";
import { CheckCircle, X } from "react-feather";
import CustomBreadcrumb from "../../common/CustomBreadcrumb";

interface IEmployeeRecognitionProps {
  item?: any;
  onCancel: () => void;
  onSave: (data: any) => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
const Breadcrumb = [
  {
    MainComponent: "Home",

    MainComponentURl: "Home",
  },

  {
    MainComponent: "Recognition Master",

    MainComponentURl: "RecognitionMaster",
  },
];

const EmployeeRecognitionForm = ({
  item,
  onCancel,
  onSave,
  setLoading,
}: IEmployeeRecognitionProps) => {
  ////State
  const [achievementTitle, setAchievementTitle] = React.useState<string>("");
  const [achievementDetail, setAchievementDetail] = React.useState<string>("");
  const [topStar, setTopStar] = React.useState<string>("No"); 

  const [users, setUsers] = React.useState<any[]>([]);
  const [selectedUser, setSelectedUser] = React.useState<string>("");
  const sp: SPFI = getSP();

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const sp = getSP();
        const allUsers = await sp.web.siteUsers();
       
        const filtered = allUsers.filter(
          (u: any) => !u.IsHiddenInUI && u.Email
        );
        setUsers(filtered);
      } catch (err) {
        console.error(" Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  ///handles

  const validateForm = async () => {
    Array.from(document.getElementsByClassName("border-on-error")).forEach(
      (el: Element) => el.classList.remove("border-on-error")
    );

    let isValid = true;

    const employeeSelect = document.getElementById("EmployeeName");
    if (!selectedUser) {
      employeeSelect?.classList.add("border-on-error");
      isValid = false;
    }

    const titleInput = document.getElementById("AchievementTitle");
    if (!achievementTitle.trim()) {
      titleInput?.classList.add("border-on-error");
      isValid = false;
    }

    const detailInput = document.getElementById("AchievementDetail");
    if (!achievementDetail.trim()) {
      detailInput?.classList.add("border-on-error");
      isValid = false;
    }

    if (!isValid) {
      Swal.fire("Please fill all the mandatory fields.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const sp = getSP();

      // Resolve selected employee into a SharePoint user
      const user = await sp.web.ensureUser(selectedUser);
      const userId = user.data.Id;

      // Prepare payload
      const payload = {
        AchievementTitle: achievementTitle,
        AchievementDetail: achievementDetail,
        EmployeeNameId: userId, // Person field mapping
        TopStar: topStar, // Yes/No choice
      };

      if (item && item.Id) {
        // Update record
        await sp.web.lists
          .getByTitle("EmployeeRecognition")
          .items.getById(item.Id)
          .update(payload);
        console.log(" EmployeeRecognition updated:", payload);
      } else {
        // Add new record
        await sp.web.lists.getByTitle("EmployeeRecognition").items.add(payload);
        console.log(" EmployeeRecognition added:", payload);
      }

      // Reset form and notify parent
      onSave(payload);
      setAchievementTitle("");
      setAchievementDetail("");
      setSelectedUser("");
      setTopStar("No");
    } catch (error) {
      console.error(" Error saving EmployeeRecognition:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to save the record.",
        icon: "error",
        backdrop: false,
      });
    } finally {
      setLoading(false);
    }
  };

  //Confirmation dialog
  const confirmAndSubmit = async () => {
    const isValid = await validateForm(); //  Validate before submit
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

    const isEdit = item && item.Id; //  Detect mode (Add/Edit)

    //  Confirmation popup
    Swal.fire({
      title: isEdit
        ? "Do you want to update this Record?"
        : "Do you want to Submit this Record?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      reverseButtons: false,
      backdrop: false,
      allowOutsideClick: false,
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        try {
          await handleSubmit();
          Swal.fire({
            title: isEdit ? "Updated successfully." : "Submitted successfully.",
            icon: "success",
            confirmButtonText: "OK",
            backdrop: false,
          });
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: isEdit
              ? "Failed to update the FAQ"
              : "Failed to submit the FAQ",
            icon: "error",
            confirmButtonText: "OK",
            backdrop: false,
          });
        }
      }
    });
  };

  React.useEffect(() => {
    if (item) {
      setAchievementTitle(item.AchievementTitle || "");
      setAchievementDetail(item.AchievementDetail || "");
      if (item.EmployeeName && item.EmployeeName.EMail) {
        setSelectedUser(item.EmployeeName.EMail);
      } else {
        setSelectedUser("");
      }

      setTopStar(item.TopStar || "No");
    } else {
      setAchievementTitle("");
      setAchievementDetail("");
      setSelectedUser("");
      setTopStar("No");
    }
  }, [item]);

  return (
    <>
      {/* // <!-- start page title --> */}
      <div className="row">
        <div className="col-lg-4">
          {/* <h4 className="page-title fw-bold mb-1 font-20">TeamAchievements Master</h4>
                                <ol className="breadcrumb m-0">
                        
                                    <li className="breadcrumb-item"><a href="settings.html">Settings</a></li>
                                    <li className="breadcrumb-item"> 
                                        
                                        </li>
                                
                                    <li className="breadcrumb-item active">TeamAchievements Master</li>
                                </ol> */}
          <CustomBreadcrumb Breadcrumb={Breadcrumb} />
        </div>
        <div className="col-lg-8">
          <div className="d-flex flex-wrap align-items-center justify-content-end mt-3">
            <form className="d-flex flex-wrap align-items-center justify-content-start ng-pristine ng-valid">
              {/* <a href="settings.html">
                {" "}
                <button
                  type="button"
                  className="btn btn-secondary me-1 waves-effect waves-light"
                >
                  <i className="fe-arrow-left me-1"></i>Back
                </button>
              </a>
              <a href="add-news.html">
                {" "}
                <button
                  type="button"
                  className="btn btn-primary waves-effect waves-light"
                >
                  <i className="fe-plus-circle me-1"></i>Add
                </button>
              </a> */}
            </form>
          </div>
        </div>
      </div>
      {/* // <!-- end page title --></> */}

      <div className="tab-content mt-3">
        <div className="tab-pane show active" id="profile1" role="tabpanel">
          <div className="card">
            <div className="card-body">
              <div className="row mt-2">
                <div className="col-lg-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Employee Name <span className="text-danger">*</span>
                    </label>

                    <select
                      id="EmployeeName"
                      className="form-control"
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                    >
                      <option value="">-- Select Employee --</option>
                      {users.map((user) => (
                        <option key={user.Id} value={user.Email}>
                          {user.Title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="mb-3">
                    <label htmlFor="simpleinput" className="form-label">
                      Achievement Title<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="AchievementTitle"
                      className="form-control"
                      value={achievementTitle}
                      onChange={(e) => setAchievementTitle(e.target.value)}
                    />
                  </div>
                </div>

                {/* <div className="col-lg-6">
                                            <div className="mb-3">
                                                <label htmlFor="simpleinput" className="form-label">Thumbnail
                                                    <span className="text-danger">*</span></label>
                                                <input type="file" id="simpleinput" className="form-control"/>
                                            </div>
                                        </div> */}

                <div className="col-lg-12">
                  <div className="mb-3">
                    <label htmlFor="simpleinput" className="form-label">
                      Achievement Detail
                      <span className="text-danger">*</span>
                    </label>
                    <textarea
                      id="AchievementDetail"
                      className="form-control"
                      style={{ height: "100px" }}
                      value={achievementDetail}
                      onChange={(e) => setAchievementDetail(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="col-lg-6 d-flex align-items-center">
                  <div className="form-check mb-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="TopStar"
                      checked={topStar === "Yes"}
                      onChange={(e) =>
                        setTopStar(e.target.checked ? "Yes" : "No")
                      }
                    />
                    <label className="form-check-label ms-1" htmlFor="TopStar">
                      Top Star
                    </label>
                  </div>
                </div>

                <div className="row mt-3">
                  <div className="row mt-3">
                    <div className="col-12 text-center">
                      <button
                        type="button"
                        className="btn btn-success waves-effect waves-light m-1"
                        onClick={confirmAndSubmit}
                      >
                        {" "}
                        <CheckCircle className="me-1" size={16} />
                        {item && item.Id ? "Update" : "Submit"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-light waves-effect waves-light m-1"
                        onClick={onCancel}
                      >
                        {" "}
                        <X className="me-1" size={16} /> Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-12"></div>
            </div>
            {/* <!-- end card-body--> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeRecognitionForm;
