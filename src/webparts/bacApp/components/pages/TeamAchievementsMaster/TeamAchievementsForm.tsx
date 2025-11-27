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
import { CheckCircle, X, Trash2 } from "react-feather";
import CustomBreadcrumb from "../../common/CustomBreadcrumb";

interface ITeamAchievementsProps {
  item?: any;
  onCancel: () => void;
  onSave: (data: any) => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
const Breadcrumb = [
  {
    MainComponent: "Settings",

    MainComponentURl: "Settings",
  },

  {
    MainComponent: "Team Achievements",

    MainComponentURl: "TeamAchievementMaster",
  },
];

const TeamAchievements = ({
  item,
  onCancel,
  onSave,
  setLoading,
}: ITeamAchievementsProps) => {
  ////State
  const [title, setTitle] = React.useState<string>("");
  const [achievementTag, setAchievementTag] = React.useState<string>("");
  const [achievementDetail, setAchievementDetail] = React.useState<string>("");
  const _sp: SPFI = getSP();

  ///handles

  const validateForm = async () => {
    Array.from(document.getElementsByClassName("border-on-error")).forEach(
      (el: Element) => el.classList.remove("border-on-error")
    );

    let isValid = true;

    //  Check Question field
    const TitleInput = document.getElementById("Title");
    if (!title.trim()) {
      TitleInput?.classList.add("border-on-error");
      isValid = false;
    }

    const AchievementTagInput = document.getElementById("AchievementTag");
    if (!achievementTag.trim()) {
      AchievementTagInput?.classList.add("border-on-error");
      isValid = false;
    }
    //  Check Answer field
    const AchievementDetailInput = document.getElementById("AchievementDetail");
    if (!achievementDetail.trim()) {
      AchievementDetailInput?.classList.add("border-on-error");
      isValid = false;
    }

    //  Show alert if any field invalid
    if (!isValid) {
      Swal.fire("Please fill all the mandatory fields.");

      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        Title: title, 
        AchievementDetail: achievementDetail, 
        AchievementTag: achievementTag, 
      };

      if (item && item.Id) {
        //  Update existing record (Edit Mode)
        await _sp.web.lists
          .getByTitle("TeamAchievements")
          .items.getById(item.Id)
          .update(payload);
        console.log(" TeamAchievement updated:", payload);
      } else {
        //  Add new record (Add Mode)
        await _sp.web.lists.getByTitle("TeamAchievements").items.add(payload);
        console.log(" TeamAchievement added:", payload);
      }

      //  Reset form and notify parent component
      onSave(payload);
      setTitle("");
      setAchievementDetail("");
      setAchievementTag("");
    } catch (error) {
      console.error(" Error saving TeamAchievement:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to save the record.",
        icon: "error",
        backdrop: "false",
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
      setTitle(item.Title || "");
      setAchievementTag(item.AchievementTag || "");
      setAchievementDetail(item.AchievementDetail || "");
    } else {
      // Clear fields if no item (Add Mode)
      setTitle("");
      setAchievementTag("");
      setAchievementDetail("");
    }
  }, [item]);

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
              {/* <a href="javascript:void(0)">
                {" "}
                <button
                  type="button"
                  className="btn btn-secondary me-1 waves-effect waves-light"
                >
                  <i className="fe-arrow-left me-1"></i>Back
                </button>
              </a>
              <a href="javascript:void(0)">
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
                    <label htmlFor="simpleinput" className="form-label">
                      Title<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="Title"
                      className="form-control"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="mb-3">
                    <label htmlFor="simpleinput" className="form-label">
                      Achievement Tag<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="AchievementTag"
                      className="form-control"
                      value={achievementTag}
                      onChange={(e) => setAchievementTag(e.target.value)}
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
                      className="form-control"
                      id="AchievementDetail"
                      style={{ height: "100px" }}
                      value={achievementDetail}
                      onChange={(e) => setAchievementDetail(e.target.value)}
                    ></textarea>
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

export default TeamAchievements;
