import * as React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../../../../../styles/global.scss";
import "bootstrap-icons/font/bootstrap-icons.css";
import "material-symbols/index.css";
import { ChevronRight, CheckCircle, X, Trash2 } from "react-feather";
import Swal from "sweetalert2";
import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { getSP } from "../../../loc/pnpjsConfig";
import CustomBreadcrumb from "../../common/CustomBreadcrumb";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperclip,
  faEye,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { Modal } from "react-bootstrap";

interface IMaterialProps {
  item?: any;
  onCancel: () => void;
  onSave: (data: any) => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const Breadcrumb = [
  { MainComponent: "Settings", MainComponentURl: "Settings" },
  {
    MainComponent: "Training Materials ",
    MainComponentURl: "TrainingMaterialsMaster",
  },
];

const TrainingMaterialsForm = ({
  item,
  onCancel,
  onSave,
  setLoading,
}: IMaterialProps) => {
  const sp: SPFI = getSP();

  // state
  const [title, setTitle] = React.useState<string>("");
  const [departments, setDepartments] = React.useState<
    { value: number; label: string }[]
  >([]);
  const [department, setDepartment] = React.useState<{
    value: number;
    label: string;
  } | null>(null);
  const [thumbnails, setThumbnails] = React.useState<File[]>([]);
  const [existingThumbnails, setExistingThumbnails] = React.useState<
    { id: number; name: string; url: string }[]
  >([]);
  const [existingThumbnailIds, setExistingThumbnailIds] = React.useState<
    number[]
  >([]);
  const [deletedFileIds, setDeletedFileIds] = React.useState<number[]>([]);
  const [showModal, setShowModal] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<{
    Id: number;
    Title: string;
  } | null>(null);

  const openFile = (fileObj: any, action: "Open" | "Download") => {
    const fileUrl =
      fileObj.url || `${window.location.origin}${fileObj.FileRef}`;

    if (action === "Open") {
      window.open(fileUrl, "_blank");
    } else if (action === "Download") {
      const cleanFileName = getNewFileName(fileObj.name || "file");

      const link = document.createElement("a");
      link.href = fileUrl;
      link.setAttribute("download", cleanFileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

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
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, [setLoading]);

  // Fetch current logged-in user
  React.useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await sp.web.currentUser();
        setCurrentUser({ Id: user.Id, Title: user.Title });
      } catch (err) {}
    };
    fetchCurrentUser();
  }, []);

  // pre-fill data
  React.useEffect(() => {
    setLoading(true);
    const fetchExistingThumbnails = async () => {
      if (!item || !item.Id) return;
      try {
        const listItem = await sp.web.lists
          .getByTitle("TrainingMaterials")
          .items.getById(item.Id)
          .select(
            "Id",
            "TrainingMaterialsID/Id",
            "PublishedBy/Id",
            "PublishedBy/Title",
            "PublishedBy/EMail"
          )
          .expand("TrainingMaterialsID", "PublishedBy")();

        if (listItem.TrainingMaterialsID) {
          const fileIds = Array.isArray(listItem.TrainingMaterialsID)
            ? listItem.TrainingMaterialsID.map((f: any) => f.Id)
            : [listItem.TrainingMaterialsID.Id];

          setExistingThumbnailIds(fileIds);

          const filterString = fileIds
            .map((id: number) => `ID eq ${id}`)
            .join(" or ");
          const files = await sp.web.lists
            .getByTitle("TrainingMaterialsDocs")
            .items.filter(filterString)
            .select("Id", "FileRef", "FileLeafRef")();

          const thumbs = files.map((file: any) => ({
            id: file.Id,
            name: file.FileLeafRef,
            url: `${window.location.origin}${file.FileRef}`,
          }));

          setExistingThumbnails(thumbs);
        } else {
          setExistingThumbnails([]);
          setExistingThumbnailIds([]);
        }
      } catch (err) {}
    };

    if (item) {
      setTitle(item.Title || "");

      //  Department mapping logic (robust for all shapes)
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

      //  Match with dropdown after departments load
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
        } else {
        }
      }

      //  Fetch related thumbnails
      fetchExistingThumbnails();
    } else {
      setTitle("");
      setDepartment(null);
      setExistingThumbnails([]);
      setExistingThumbnailIds([]);
    }
    setLoading(false);
  }, [item, departments]);

  // helpers
  const generateUniqueFileName = (originalFileName: string): string => {
    const now = new Date();
    const twoDigits = (num: number) => (num < 10 ? "0" + num : "" + num);
    const formattedDateTime =
      now.getFullYear() +
      twoDigits(now.getMonth() + 1) +
      twoDigits(now.getDate()) +
      "_" +
      twoDigits(now.getHours()) +
      twoDigits(now.getMinutes()) +
      twoDigits(now.getSeconds());
    const fileParts = originalFileName.split(".");
    const fileExtension = fileParts.pop();
    const fileNameWithoutExt = fileParts.join(".");
    return `${formattedDateTime}_${fileNameWithoutExt}.${fileExtension}`;
  };

  const uploadFilesToLibrary = async (files: File[]): Promise<number[]> => {
    const folder = sp.web.getFolderByServerRelativePath(
      "/sites/BAC/TrainingMaterialsDocs"
    );
    const uploadedIds: number[] = [];
    for (const file of files) {
      const newFileName = generateUniqueFileName(file.name);
      const uploadResult = await folder.files.addChunked(newFileName, file);
      const uploadedFile = uploadResult.file;
      const item = await uploadedFile.getItem<{ Id: number }>();
      uploadedIds.push(item.Id);
    }
    return uploadedIds;
  };

  const getNewFileName = (fileName: string): string => {
    if (!fileName) return "";
    const parts = fileName.split("_");
    const dateRegex = /^\d{8}$/;
    const timeRegex = /^\d{6}$/;
    if (
      parts.length > 2 &&
      dateRegex.test(parts[0]) &&
      timeRegex.test(parts[1])
    ) {
      return parts.slice(2).join("_");
    }
    return fileName;
  };

  // validation
  const validateForm = (): boolean => {
    Array.from(document.getElementsByClassName("border-on-error")).forEach(
      (el: Element) => el.classList.remove("border-on-error")
    );

    let isValid = true;
    const TitleInput = document.getElementById("TitleInput");
    const deptControl = document.querySelector(
      "#NewsDeptID .react-select__control"
    ) as HTMLElement;
    const fileInput = document.getElementById("newsThumbnails");

    if (!title.trim()) {
      TitleInput?.classList.add("border-on-error");
      isValid = false;
    }
    if (!department && deptControl) {
      deptControl.classList.add("border-on-error");
      isValid = false;
    }
    if (thumbnails.length === 0 && existingThumbnails.length === 0) {
      fileInput?.classList.add("border-on-error");
      isValid = false;
    }

    if (!isValid) Swal.fire("Please fill all the mandatory fields.");
    return isValid;
  };

  // submit
  const handleSubmit = async () => {
    setLoading(true);
    try {
      let uploadedIds: number[] = [];

      //  Step 1: Delete the old file first (if any marked for deletion)
      if (deletedFileIds.length > 0) {
        for (const fileId of deletedFileIds) {
          await sp.web.lists
            .getByTitle("TrainingMaterialsDocs")
            .items.getById(fileId)
            .delete();
        }
      }

      //  Step 2: Upload the new file (only after deleting old one)
      if (thumbnails.length > 0) {
        uploadedIds = await uploadFilesToLibrary(thumbnails);
      }

      //  Step 3: Use new file ID if uploaded, otherwise existing one
      const finalFileId =
        uploadedIds.length > 0
          ? uploadedIds[0]
          : existingThumbnailIds.length > 0
          ? existingThumbnailIds[0]
          : null;

      //  Step 4: Build payload
      const payload: any = {
        Title: title,
        DepartmentId: department?.value || null,
        TrainingMaterialsIDId: finalFileId,
        PublishedById: currentUser?.Id || null,
      };

      //  Step 5: Save to SharePoint
      if (item && item.Id) {
        await sp.web.lists
          .getByTitle("TrainingMaterials")
          .items.getById(item.Id)
          .update(payload);
      } else {
        await sp.web.lists.getByTitle("TrainingMaterials").items.add(payload);
      }

      //  Step 6: Reset states
      setDeletedFileIds([]);
      setThumbnails([]);
      setExistingThumbnails([]);
      onSave(payload);
    } catch (error) {
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
      title: isEdit
        ? "Do you want to update this record?"
        : "Do you want to submit this record?",
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
            text: isEdit
              ? "Failed to update record"
              : "Failed to submit record",
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
      </div>

      <div className="tab-content mt-3">
        <div className="tab-pane show active" id="profile1" role="tabpanel">
          <div className="card">
            <div className="card-body">
              <div className="row mt-2">
                <div className="col-lg-6">
                  <div className="mb-3">
                    <label htmlFor="SuccessStoriesInput" className="form-label">
                      Title<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="TitleInput"
                      className="form-control"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                </div>

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

                <div className="col-lg-6">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label htmlFor="newsThumbnails" className="form-label">
                        Material Gallery <span className="text-danger">*</span>
                      </label>

                      {(existingThumbnails.length > 0 ||
                        thumbnails.length > 0) && (
                        <a
                          className="text-primary"
                          style={{
                            fontSize: "0.875rem",
                            cursor: "pointer",
                            textDecoration: "none",
                          }}
                          onClick={() => setShowModal(true)}
                        >
                          <FontAwesomeIcon icon={faPaperclip as any} />{" "}
                          {existingThumbnails.length + thumbnails.length}{" "}
                          {existingThumbnails.length + thumbnails.length > 1
                            ? "files"
                            : "file"}{" "}
                          attached
                        </a>
                      )}
                    </div>

                    <input
                      type="file"
                      id="newsThumbnails"
                      className="form-control"
                      accept="*"
                      multiple={false}
                      onChange={(e) => {
                        const inputEl = e.target as HTMLInputElement;
                        const selectedFiles = inputEl.files
                          ? Array.from(inputEl.files)
                          : [];

                        if (selectedFiles.length > 0) {
                          const singleFile = selectedFiles[0];

                          //  Replace any existing file both from existingThumbnails and thumbnails
                          setThumbnails([singleFile]);
                          setExistingThumbnails([]); // remove visual old file
                          setExistingThumbnailIds([]); // clear ID reference

                          //  Track the old file ID to delete later on update
                          if (existingThumbnailIds.length > 0) {
                            setDeletedFileIds(existingThumbnailIds);
                          }

                          inputEl.value = "";
                        }
                      }}
                    />
                  </div>
                </div>

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

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <h4 className="font-16 text-dark fw-bold mb-1">
              Attachment Details
            </h4>
            <p className="text-muted font-14 mb-0 fw-400">
              Below are the attached files for Training Materials
            </p>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <table className="table table-bordered">
            <thead style={{ background: "#eef6f7" }}>
              <tr>
                <th style={{ width: "50px" }}>S.No.</th>
                <th style={{ width: "120px" }}>Preview</th>
                <th>File Name</th>
                <th style={{ width: "150px" }} className="text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {[...existingThumbnails, ...thumbnails].map(
                (file: any, index: number) => {
                  const isNewFile = file instanceof File;
                  const previewUrl = isNewFile
                    ? URL.createObjectURL(file)
                    : file.url;
                  const handleFileDelete = (file: any, isNewFile: boolean) => {
                    if (isNewFile) {
                      // If user deletes a just-uploaded (unsaved) file
                      setThumbnails((prev) => prev.filter((f) => f !== file));
                    } else {
                      // If user deletes an already existing file from SharePoint
                      setExistingThumbnails((prev) =>
                        prev.filter((f) => f.id !== file.id)
                      );
                      setExistingThumbnailIds((prev) =>
                        prev.filter((id) => id !== file.id)
                      );
                      setDeletedFileIds((prev) => [...prev, file.id]);
                    }
                  };

                  return (
                    <tr key={index}>
                      <td className="text-center">{index + 1}</td>
                      <td className="text-center">
                        <img
                          src={previewUrl}
                          alt={file.name}
                          style={{
                            height: "60px",
                            width: "60px",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />
                      </td>
                      <td>{getNewFileName(file.name)}</td>
                      <td className="text-center">
                        <span
                          title="Preview file"
                          style={{
                            color: "blue",
                            cursor: "pointer",
                            marginRight: "10px",
                          }}
                          onClick={() => window.open(previewUrl, "_blank")}
                        >
                          <FontAwesomeIcon icon={faEye as any} />
                        </span>

                        {!isNewFile && (
                          <span
                            title="Download file"
                            style={{
                              color: "blue",
                              cursor: "pointer",
                              marginRight: "10px",
                            }}
                            onClick={() => openFile(file, "Download")}
                          >
                            <FontAwesomeIcon icon={faDownload as any} />
                          </span>
                        )}

                        <span
                          title="Delete file"
                          style={{
                            color: "red",
                            cursor: "pointer",
                            marginLeft: "10px",
                          }}
                          onClick={() => handleFileDelete(file, isNewFile)}
                        >
                          <Trash2 size={18} />
                        </span>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default TrainingMaterialsForm;
