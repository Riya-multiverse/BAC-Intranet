import * as React from "react";
//import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../../../../../styles/global.scss";
import "bootstrap-icons/font/bootstrap-icons.css";
import "material-symbols/index.css";
import { ChevronRight, CheckCircle, X } from "react-feather";
import Swal from "sweetalert2";
import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { getSP } from "../../../loc/pnpjsConfig";
import CustomBreadcrumb from "../../common/CustomBreadcrumb";
import Select from "react-select";

interface ISuccessProps {
  item?: any;
  onCancel: () => void;
  onSave: (data: any) => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const Breadcrumb = [
  { MainComponent: "Settings", MainComponentURl: "Settings" },
  { MainComponent: "Success Stories", MainComponentURl: "SuccessStoriesMaster" },
];

const SuccessForm = ({ item, onCancel, onSave, setLoading }: ISuccessProps) => {
  const sp: SPFI = getSP();

  // state
  const [successStories, setSuccessStories] = React.useState<string>("");
  const [departments, setDepartments] = React.useState<{ value: number; label: string }[]>([]);
  const [department, setDepartment] = React.useState<{ value: number; label: string } | null>(null);

  // fetch departments
  React.useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      try {
        const deptItems = await sp.web.lists
          .getByTitle("DepartmentMasterList")
          .items.select("Id", "DepartmentName")();

        const deptOptions = deptItems.map((d: any) => ({
          value: d.Id,
          label: d.DepartmentName,
        }));

        setDepartments(deptOptions);
      } catch (err) {
        console.error("Error fetching department data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, [setLoading]);

  // pre-fill fields on edit
  React.useEffect(() => {
    if (item) {
      console.log("Editing Success Story:", item);
      setSuccessStories(item.SuccessStories || "");

      // department mapping logic
      if (item.Department && item.DepartmentId) {
        const deptOption = {
          value: item.DepartmentId,
          label:
            typeof item.Department === "object"
              ? item.Department.DepartmentName
              : item.Department,
        };
        setDepartment(deptOption);
      } else if (item.department && item.departmentId) {
        const deptOption = {
          value: item.departmentId,
          label: item.department,
        };
        setDepartment(deptOption);
      } else if (item.Department?.Id && item.Department?.DepartmentName) {
        const deptOption = {
          value: item.Department.Id,
          label: item.Department.DepartmentName,
        };
        setDepartment(deptOption);
      } else {
        setDepartment(null);
      }

      // match with dropdown after departments load
      if (departments.length > 0) {
        const matchedDept =
          departments.find((d) => d.value === item.DepartmentId) ||
          departments.find(
            (d) =>
              d.label.toLowerCase() ===
              (item.DepartmentName || item.Department || "").toLowerCase()
          ) ||
          null;

        if (matchedDept) {
          setDepartment(matchedDept);
        }
      }
    } else {
      setSuccessStories("");
      setDepartment(null);
    }
  }, [item, departments]);

  // validation
  const validateForm = (): boolean => {
    Array.from(document.getElementsByClassName("border-on-error")).forEach((el: Element) =>
      el.classList.remove("border-on-error")
    );

    let isValid = true;
    const SuccessInput = document.getElementById("SuccessStoriesInput");
    const deptControl = document.querySelector(
      "#NewsDeptID .react-select__control"
    ) as HTMLElement;

    if (!successStories.trim()) {
      SuccessInput?.classList.add("border-on-error");
      isValid = false;
    }

    if (!department && deptControl) {
      deptControl.classList.add("border-on-error");
      isValid = false;
    }

    if (!isValid) Swal.fire("Please fill all the mandatory fields.");
    return isValid;
  };

  // submit form
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        SuccessStories: successStories,
        DepartmentId: department?.value || null,
      };

      if (item && item.Id) {
        await sp.web.lists.getByTitle("SuccessStories").items.getById(item.Id).update(payload);
        console.log("Success Story updated:", payload);
      } else {
        await sp.web.lists.getByTitle("SuccessStories").items.add(payload);
        console.log("Success Story added:", payload);
      }

      onSave(payload);
      setSuccessStories("");
      setDepartment(null);
    } catch (error) {
      console.error("Error saving Success Story:", error);
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

  // confirm submit
  const confirmAndSubmit = async () => {
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

    const isEdit = item && item.Id;
    Swal.fire({
      title: isEdit ? "Do you want to update this record?" : "Do you want to submit this record?",
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
            text: isEdit ? "Failed to update record" : "Failed to submit record",
            icon: "error",
            confirmButtonText: "OK",
            backdrop: false,
          });
        }
      }
    });
  };


  return (
    <>
      <div className="row">
        <div className="col-lg-4">
          <CustomBreadcrumb Breadcrumb={Breadcrumb} />
        </div>
        <div className="col-lg-8">
          <div className="d-flex flex-wrap align-items-center justify-content-end mt-3">
            
          </div>
        </div>
      </div>

      <div className="tab-content mt-3">
        <div className="tab-pane show active" id="profile1" role="tabpanel">
          <div className="card">
            <div className="card-body">
              <div className="row mt-2">
                {/* success stories */}
                <div className="col-lg-6">
                  <div className="mb-3">
                    <label htmlFor="SuccessStoriesInput" className="form-label">
                      Success Stories<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="SuccessStoriesInput"
                      className="form-control"
                      value={successStories}
                      onChange={(e) => setSuccessStories(e.target.value)}
                    />
                  </div>
                </div>

                {/* department dropdown */}
                <div className="col-lg-6">
                  <div className="mb-3">
                    <label htmlFor="NewsDeptID" className="form-label">
                      Department<span className="text-danger">*</span>
                    </label>
                    <Select
                      id="NewsDeptID"
                      className="form-control p-0 border-0"
                      classNamePrefix="react-select"
                      placeholder="Select Department"
                      options={departments}
                      value={department}
                      onChange={(option: any) => setDepartment(option)}
                    />
                  </div>
                </div>

                {/* buttons */}
                <div className="col-12 text-center mt-3">
                  <button
                    type="button"
                    className="btn btn-success waves-effect waves-light m-1"
                    onClick={confirmAndSubmit}
                  >
                    <CheckCircle className="me-1" size={16} />
                    {item && item.Id ? "Update" : "Submit"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-light waves-effect waves-light m-1"
                    onClick={onCancel}
                  >
                    <X className="me-1" size={16} /> Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SuccessForm;
