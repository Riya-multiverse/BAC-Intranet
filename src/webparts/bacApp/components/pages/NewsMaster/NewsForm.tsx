import * as React from "react";
//import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
// import '../../../../styles/global.scss';
import "bootstrap-icons/font/bootstrap-icons.css";
import "material-symbols/index.css";
// import * as feather from 'feather-icons';
import { ChevronRight } from "react-feather";
import Select from "react-select";
import { useEffect, useState } from "react";
import { spfi, SPFx } from "@pnp/sp";
import { WebPartContext } from "@microsoft/sp-webpart-base";
// import { getSP } from '../loc/pnpjsConfig';
import { SPFI } from "@pnp/sp";
import { getSP } from "../../../loc/pnpjsConfig";
import Swal from "sweetalert2";
import { CheckCircle, X, Trash2 } from "react-feather";
import { Modal } from "react-bootstrap";
import {
  faDownload,
  faEye,
  faPaperclip,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomBreadcrumb from "../../common/CustomBreadcrumb";

interface INewsFormProps {
  item?: any;
  onCancel: () => void;
  onSave: (data: any) => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const NewsForm = ({ item, onCancel, onSave, setLoading }: INewsFormProps) => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [department, setDepartment] = useState<any>(null);
  const [thumbnails, setThumbnails] = useState<File[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [overview, setOverview] = useState<string>("");
  const [departments, setDepartments] = useState<any[]>([]);
  const [categories] = useState<any[]>([
    { value: "Internal", label: "Internal" },
    { value: "External", label: "External" },
  ]);
  const [existingThumbnails, setExistingThumbnails] = useState<
    { id: number; name: string; url: string }[]
  >([]);
  const [existingThumbnailIds, setExistingThumbnailIds] = useState<number[]>(
    []
  );
  const [showModal, setShowModal] = useState(false);
  const [showFile, setShowFile] = useState(false);
  const [deletedFileIds, setDeletedFileIds] = useState<number[]>([]);

  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const openFile = (fileObj: any, action: "Open" | "Download") => {
    const fileUrl =
      fileObj.url || `${window.location.origin}${fileObj.FileRef}`;
    console.log(" Opening file:", fileUrl);

    if (action === "Open") {
      window.open(fileUrl, "_blank");
    } else if (action === "Download") {
      const cleanFileName = getNewFileName(fileObj.name || "file");
      console.log("⬇ Downloading file as:", cleanFileName);
      const link = document.createElement("a");
      link.href = fileUrl;
      link.setAttribute("download", cleanFileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  //  Close file preview
  const cancelModalAction = () => {
    setRedirectUrl(null);
    setShowFile(false);
  };

  //  Helper: Generate unique filename with datetime prefix (no padStart)
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

  //  Helper: Upload files to Document Library and return their item IDs
  const uploadFilesToLibrary = async (
    sp: SPFI,
    files: File[]
  ): Promise<number[]> => {
    const folder = sp.web.getFolderByServerRelativePath(
      "/sites/BAC/AnnouncementandNewsDocs"
    );
    const uploadedIds: number[] = [];

    for (const file of files) {
      const newFileName = generateUniqueFileName(file.name);
      console.log(" Uploading:", newFileName);

      // PnP addChunked is better for larger files
      const uploadResult = await folder.files.addChunked(newFileName, file);
      const uploadedFile = uploadResult.file;
      const item = await uploadedFile.getItem<{ Id: number }>();
      console.log(" Uploaded file ID:", item.Id);
      uploadedIds.push(item.Id);
    }

    return uploadedIds;
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      console.log(" Department fetch started...");
      setLoading(true);
      try {
        //  Initialize PnP with real SPFx context (passed from web part)
        const sp: SPFI = getSP();

        //  Fetch items from DepartmentMasterList
        console.log(" Fetching DepartmentMasterList items...");
        const deptItems = await sp.web.lists
          .getByTitle("DepartmentMasterList")
          .items();
        console.log(" Raw Department items:", deptItems);

        if (!deptItems || deptItems.length === 0) {
          console.warn(" No items found in DepartmentMasterList");
        }

        //  Map into dropdown options
        const deptOptions = deptItems.map((d: any) => ({
          value: d.Id,
          label: d.DepartmentName,
        }));
        console.log(" Transformed Department dropdown data:", deptOptions);

        //  Set state for dropdown
        setDepartments(deptOptions);
        console.log(
          " Department state updated with",
          deptOptions.length,
          "items"
        );
      } catch (err) {
        console.error(" Error fetching department data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [setLoading]);

  //  Validation function for NewsForm
  const validateForm = async () => {
    // Remove previous error highlights
    Array.prototype.slice
      .call(document.getElementsByClassName("border-on-error"))
      .forEach((el: Element) => el.classList.remove("border-on-error"));

    let isValid = true;

    // Title
    if (!title.trim()) {
      document.getElementById("newsTitle")?.classList.add("border-on-error");
      isValid = false;
    }

    // Department
    const deptControl = document.querySelector(
      "#NewsDeptID .react-select__control"
    ) as HTMLElement;

    if (!department && deptControl) {
      deptControl.classList.add("border-on-error");
      isValid = false;
    }

    // Category
    const catControl = document.querySelector(
      "#NewsCategoryID .react-select__control"
    ) as HTMLElement;

    if (!category && catControl) {
      catControl.classList.add("border-on-error");
      isValid = false;
    }

    // Description
    if (!description.trim()) {
      document
        .getElementById("newsDescription")
        ?.classList.add("border-on-error");
      isValid = false;
    }

    // Overview
    if (!overview.trim()) {
      document.getElementById("newsOverview")?.classList.add("border-on-error");
      isValid = false;
    }

    // At least one thumbnail (existing or new)
    if (thumbnails.length === 0 && existingThumbnails.length === 0) {
      document
        .getElementById("newsThumbnails")
        ?.classList.add("border-on-error");
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
    const sp: SPFI = getSP();
    const folderUrl = "/sites/BAC/AnnouncementandNewsDocs";
    const uploadedIds: number[] = [];

    try {
      //  Step 1: Upload Thumbnails if any
      //  Step 1: Upload thumbnails (new files) with datetime filename
      let uploadedIds: number[] = [];
      if (thumbnails && thumbnails.length > 0) {
        uploadedIds = await uploadFilesToLibrary(sp, thumbnails);
      } else {
        console.log("No thumbnails selected, skipping upload.");
      }
      const finalFileIds = [...existingThumbnailIds, ...uploadedIds];

      // Announcement Step X: Delete files marked for removal from the document library
      if (deletedFileIds.length > 0) {
        console.log("Announcement Deleting files from library:", deletedFileIds);
        for (const fileId of deletedFileIds) {
          try {
            await sp.web.lists
              .getByTitle("AnnouncementandNewsDocs")
              .items.getById(fileId)
              .delete();
            console.log(` File with ID ${fileId} deleted from library`);
          } catch (error) {
            console.error(` Failed to delete file with ID ${fileId}`, error);
          }
        }
      }

      //  Step 2: Build the payload for the main list
      const payload: any = {
        Title: title,
        Description: description,
        Category: category?.value || "",
        DepartmentId: department?.value || null,
        AnnouncementandNewsImageIDId: finalFileIds,
        Overview: overview,
        SourceType: "News",
      };

      console.log(
        " Final payload to submit:",
        JSON.stringify(payload, null, 2)
      );

      //  Step 3: Add or Update
      if (item && (item.id || item.ID)) {
        const itemId = item.id || item.ID;
        console.log(" Updating existing item:", itemId);
        const updateResult = await sp.web.lists
          .getByTitle("AnnouncementAndNews")
          .items.getById(itemId)
          .update(payload);
        console.log(" Update successful:", updateResult);
      } else {
        console.log("Adding new item...");
        const addResult = await sp.web.lists
          .getByTitle("AnnouncementAndNews")
          .items.add(payload);
        console.log(" Add successful:", addResult);
      }
      setDeletedFileIds([]);

      //  Step 4: Reset form after success
      if (!item || !item.id) {
        // Reset only for ADD mode
        setTitle("");
        setDescription("");
        setDepartment(null);
        setCategory(null);
        setThumbnails([]);
        setOverview("");
      }

      onSave({
        title,
        description,
        category,
        department,
        thumbnails,
        overview,
      });
    } catch (error: any) {
      console.error(" handleSubmit failed:", error);

      // Try to extract more details from SharePoint response if available
      if (error?.data?.responseBody) {
        console.error(" SharePoint error response:", error.data.responseBody);
      }

      Swal.fire({
        title: "Error",
        text: "Failed to save the record.",
        icon: "error",
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

    const isEdit = item && (item.id || item.ID);

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
            showConfirmButton: true,
            backdrop: false,
            allowOutsideClick: false,
          });
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: isEdit
              ? "Failed to update the record"
              : "Failed to submit the record",
            icon: "error",
            confirmButtonText: "OK",
            backdrop: false,
          });
        }
      }
    });
  };

  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setDescription(item.description || "");
      setOverview(item.overview || "");

      if (item.Department && item.DepartmentId) {
        const deptOption = {
          value: item.DepartmentId,
          label: item.Department,
        };
        setDepartment(deptOption);
      } else if (item.department && item.departmentId) {
        // fallback if your API uses lowercase keys
        const deptOption = {
          value: item.departmentId,
          label: item.department,
        };
        setDepartment(deptOption);
      } else {
        console.warn(" Department data missing on item, setting to null");
        setDepartment(null);
      }

      if (item.category) {
        const matchedCat =
          categories.filter((c: any) => c.value === item.category)[0] || null;

        setCategory(matchedCat || null);
      }

      const fetchExistingThumbnails = async () => {
        if (!item || !item.id) return;
        const sp = getSP();

        console.log(" Fetching existing images for News ID:", item.id);

        try {
          // Step 1: Get lookup IDs from main list
          const listItem = await sp.web.lists
            .getByTitle("AnnouncementAndNews")
            .items.getById(item.id)
            .select("Id", "AnnouncementandNewsImageID/Id")
            .expand("AnnouncementandNewsImageID")();

          console.log(" Lookup file IDs:", listItem.AnnouncementandNewsImageID);

          if (listItem.AnnouncementandNewsImageID?.length > 0) {
            const fileIds = listItem.AnnouncementandNewsImageID.map(
              (f: any) => f.Id
            );

            //  STEP 2: Store these IDs in state to merge later in handleSubmit
            setExistingThumbnailIds(fileIds);

            //  Build filter using OR conditions
            const filterString = fileIds
              .map((id: number) => `ID eq ${id}`)
              .join(" or ");
            console.log(" Final filter string for doc lib:", filterString);

            // Step 3: Get files from doc library
            const files = await sp.web.lists
              .getByTitle("AnnouncementandNewsDocs")
              .items.filter(filterString)
              .select("Id", "FileRef", "FileLeafRef")();

            console.log("Document Library files:", files);

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
        } catch (err) {
          console.error(" Error fetching existing thumbnails:", err);
          setExistingThumbnails([]);
          setExistingThumbnailIds([]);
        }
      };

      fetchExistingThumbnails();
    }
  }, [item]);
  //  Helper: Remove datetime prefix from file name for display
  const getNewFileName = (fileName: string): string => {
    console.log(" Original filename received in getNewFileName:", fileName);

    if (!fileName) return "";

    const parts = fileName.split("_");
    console.log(" Split parts:", parts);

    const dateRegex = /^\d{8}$/;
    const timeRegex = /^\d{6}$/;

    if (
      parts.length > 2 &&
      dateRegex.test(parts[0]) &&
      timeRegex.test(parts[1])
    ) {
      const displayName = parts.slice(2).join("_");
      console.log(" Detected date+time prefix, displayName:", displayName);
      return displayName;
    }

    return fileName;
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
      {/* // <!-- start page title --> */}
      <div className="row">
        <div className="col-lg-4">
          <CustomBreadcrumb Breadcrumb={Breadcrumb} />
         
        </div>
        <div className="col-lg-8">
          <div className="d-flex flex-wrap align-items-center justify-content-end mt-1">
            <form className="d-flex flex-wrap align-items-center justify-content-start ng-pristine ng-valid">
             
            </form>
          </div>
        </div>
      </div>
      {/* // <!-- end page title --></> */}

      <div className="tab-content mt-0">
        <div className="tab-pane show active" id="profile1" role="tabpanel">
          <div className="card">
            <div className="card-body">
              <div className="row mt-2">
                <div className="col-lg-6">
                  <div className="mb-3">
                    <label htmlFor="simpleinput" className="form-label">
                      News Title<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      // id="simpleinput"
                      id="newsTitle"
                      className="form-control"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="mb-3">
                    <label htmlFor="simpleinput" className="form-label">
                      Department<span className="text-danger">*</span>
                    </label>
                    <Select
                      // inputId="simpleinput"
                      id="NewsDeptID" //  ID used for highlighting
                      className={`form-control p-0 border-0`}
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
                    <label htmlFor="simpleinput" className="form-label">
                      Category<span className="text-danger">*</span>
                    </label>
                    <Select
                      // inputId="simpleinput"
                      id="NewsCategoryID"
                      className="form-control p-0 border-0"
                      classNamePrefix="react-select"
                      placeholder="Select Department"
                      options={categories}
                      value={category}
                      onChange={(option: any) => setCategory(option)}
                    />
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label htmlFor="newsThumbnails" className="form-label">
                        News Gallery <span className="text-danger">*</span>
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
  accept="image/jpeg,image/png,image/jpg"
  multiple
  onChange={(e) => {
    const inputEl = e.target as HTMLInputElement;
    const files: File[] = e.target.files ? [...(e.target.files as any)] : [];
    console.log(" Files selected:", files);

    if (files.length > 0) {
      const allowedImageTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];
      const allowedExtensions = [".jpg", ".jpeg", ".png"];

      //  Regex for allowed filename pattern
      const fileNameRegex = /^[A-Za-z0-9]+[A-Za-z0-9 _.-]*[A-Za-z0-9]+(\.[A-Za-z0-9]+)?$/;

      const invalidFiles = files.filter((file) => {
        const fileExtension = file.name
          .substring(file.name.lastIndexOf("."))
          .toLowerCase();

        const fileTypeValid = allowedImageTypes.indexOf(file.type) !== -1;
        const fileExtValid = allowedExtensions.indexOf(fileExtension) !== -1;
        const nameValid = fileNameRegex.test(file.name);

        const startsWithSpaceOrDot = /^[ .]/.test(file.name);
        const endsWithSpaceOrDot = /[ .]$/.test(file.name);
        const hasConsecutiveDots = /\.\./.test(file.name);

        const isInvalid = !(
          fileTypeValid &&
          fileExtValid &&
          nameValid &&
          !startsWithSpaceOrDot &&
          !endsWithSpaceOrDot &&
          !hasConsecutiveDots
        );

        console.log(" isInvalid:", isInvalid);
        return isInvalid;
      });

      console.log(" Invalid files found:", invalidFiles);

      if (invalidFiles.length > 0) {
        const invalidNames = invalidFiles.map(f => f.name).join(", ");
         Swal.fire({
                              icon: "error",
                              title: "Invalid File Type",
                              backdrop: false,
                              text: "Only image files are allowed (jpeg, jpg, png).",
                            });



        (e.target as HTMLInputElement).value = "";
        return;
      }

      console.log(" All selected files passed validation.");
      setThumbnails(files);
      inputEl.value = "";
    }
  }}
/>

                  </div>
                </div>

                <div className="col-lg-12">
                  <div className="mb-3">
                    <label htmlFor="simpleinput" className="form-label">
                      Description
                      <span className="text-danger">*</span>
                    </label>
                    <textarea
                      id="newsDescription"
                      className="form-control"
                      // id="floatingTextarea2"
                      style={{ height: "100px" }}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="col-lg-12">
                  <div className="mb-3">
                    <label htmlFor="simpleinput" className="form-label">
                      Overview <span className="text-danger">*</span>
                    </label>

                    <textarea
                      className="form-control"
                      // id="floatingTextarea2"
                      id="newsOverview"
                      style={{ height: "100px" }}
                      value={overview}
                      onChange={(e) => setOverview(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="row mt-3">
                  <div className="col-12 text-center">
                    <button
                      type="button"
                      className="btn btn-success waves-effect waves-light m-1"
                      onClick={confirmAndSubmit}
                    >
                      <CheckCircle className="me-1" size={16} />
                      {item && (item.id || item.ID) ? "Update" : "Submit"}
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
            {/* <!-- end card-body--> */}
          </div>
        </div>
      </div>
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size={showFile ? "xl" : "lg"}
        className="filemodal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <h4 className="font-16 text-dark fw-bold mb-1">
              Attachment Details
            </h4>
            <p className="text-muted font-14 mb-0 fw-400">
              Below are the attachment details for News Gallery
            </p>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body id="style-5">
          {showFile ? (
            <iframe
              src={redirectUrl || ""}
              style={{ width: "100%", height: "80vh", border: "none" }}
              title="File Viewer"
            />
          ) : (
            <table className="table table-bordered">
              <thead style={{ background: "#eef6f7" }}>
                <tr>
                  <th style={{ width: "50px" }}>S.No.</th>
                  <th style={{ width: "120px" }}>File Preview</th>
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
                    const isEditMode = !!(item && (item.id || item.ID));
                    const previewUrl = isNewFile
                      ? URL.createObjectURL(file)
                      : file.url;

                    return (
                      <tr key={index}>
                        <td className="text-center">{index + 1}</td>

                        {/* File Preview */}
                        <td className="text-center">
                          {previewUrl ? (
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
                          ) : (
                            <span className="text-muted">No preview</span>
                          )}
                        </td>

                        {/* File Name */}
                        <td title={getNewFileName(file.name)}>
                          {getNewFileName(file.name)}
                        </td>

                        {/* Actions */}
                        <td className="text-center">
                          {/*  Preview (always available) */}
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

                          {/*  Download - only for existing files in edit mode */}
                          {!isNewFile && isEditMode && (
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

                          {/*  Delete  */}
                          <span
                            title="Delete file"
                            style={{
                              color: "red",
                              cursor: "pointer",
                              marginLeft: "10px",
                            }}
                            onClick={() => {
                              if (isNewFile) {
                                setThumbnails((prev) =>
                                  prev.filter((f) => f !== file)
                                );
                              } else {
                                setExistingThumbnails((prev) =>
                                  prev.filter((f) => f.id !== file.id)
                                );
                                setExistingThumbnailIds((prev) =>
                                  prev.filter((id) => id !== file.id)
                                );
                                setDeletedFileIds((prev) => [...prev, file.id]);
                                console.log("🗑 Marked for deletion:", file.id);
                              }
                            }}
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
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default NewsForm;
