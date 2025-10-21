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

interface ITemplateProps {
  item?: any;
  onCancel: () => void;
  onSave: (data: any) => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const Breadcrumb = [
  { MainComponent: "Settings", MainComponentURl: "Settings" },
  {
    MainComponent: "Template and Forms ",
    MainComponentURl: "TemplateandFormsMaster",
  },
];

const TemplateForm = ({
  item,
  onCancel,
  onSave,
  setLoading,
}: ITemplateProps) => {
  const sp: SPFI = getSP();

  // state
  const [title, setTitle] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
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
  const [showIconModal, setShowIconModal] = React.useState(false);

  // For Icon
  const [Icons, setIcons] = React.useState<File[]>([]);
  const [existingIcons, setExistingIcons] = React.useState<
    { id: number; name: string; url: string }[]
  >([]);
  const [existingIconIds, setExistingIconIds] = React.useState<number[]>([]);
  const [deletedIconIds, setDeletedIconIds] = React.useState<number[]>([]);

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

  //   // Fetch current logged-in user
  // React.useEffect(() => {
  //   const fetchCurrentUser = async () => {
  //     try {
  //       const user = await sp.web.currentUser();
  //       setCurrentUser({ Id: user.Id, Title: user.Title });

  //     } catch (err) {

  //     }
  //   };
  //   fetchCurrentUser();
  // }, []);

  // pre-fill data
  React.useEffect(() => {
    setLoading(true);
    const fetchExistingAttachments = async () => {
      if (!item || !item.Id) return;
      try {
        const listItem = await sp.web.lists
          .getByTitle("TemplateAndForms")
          .items.getById(item.Id)
          .select(
            "Id",
            "Title",
            "Description",
            "Department/Id",
            "Department/DepartmentName",
            "AttachmentID/Id",
            "IconID/Id"
          )
          .expand("Department", "AttachmentID", "IconID")();

        // ----- Attachments -----
        if (listItem.AttachmentID) {
          const fileIds = Array.isArray(listItem.AttachmentID)
            ? listItem.AttachmentID.map((f: any) => f.Id)
            : [listItem.AttachmentID.Id];
          setExistingThumbnailIds(fileIds);

          const filterString = fileIds
            .map((id: number) => `ID eq ${id}`)
            .join(" or ");
          const files = await sp.web.lists
            .getByTitle("TemplateDocs")
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

        // ----- Icon -----
        if (listItem.IconID) {
          const iconIds = Array.isArray(listItem.IconID)
            ? listItem.IconID.map((f: any) => f.Id)
            : [listItem.IconID.Id];
          setExistingIconIds(iconIds);

          const filterString = iconIds
            .map((id: number) => `ID eq ${id}`)
            .join(" or ");
          const icons = await sp.web.lists
            .getByTitle("TemplateDocs")
            .items.filter(filterString)
            .select("Id", "FileRef", "FileLeafRef")();

          const Icon = icons.map((file: any) => ({
            id: file.Id,
            name: file.FileLeafRef,
            url: `${window.location.origin}${file.FileRef}`,
          }));

          setExistingIcons(Icon);
        } else {
          setExistingIcons([]);
          setExistingIconIds([]);
        }
      } catch (err) {
        // silent fail
      }
    };

    if (item) {
      setTitle(item.Title || "");
      setDescription(item.Description || "");

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
      fetchExistingAttachments();
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
      "/sites/BAC/TemplateDocs"
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
    const DescriptionInput = document.getElementById("Description");
    const deptControl = document.querySelector(
      "#NewsDeptID .react-select__control"
    ) as HTMLElement;
    const fileInput = document.getElementById("newsThumbnails");
    const iconInput = document.getElementById("iconUpload");

    if (!title.trim()) {
      TitleInput?.classList.add("border-on-error");
      isValid = false;
    }

    if (!description.trim()) {
      DescriptionInput?.classList.add("border-on-error");
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

    if (Icons.length === 0 && existingIcons.length === 0) {
      iconInput?.classList.add("border-on-error");
      isValid = false;
    }

    if (!isValid) Swal.fire("Please fill all the mandatory fields.");
    return isValid;
  };

  // submit
  // const handleSubmit = async () => {
  //   setLoading(true);
  //   try {
  //     let uploadedAttachmentIds: number[] = [];
  //     let uploadedIconIds: number[] = [];

  //     // Delete old attachments
  //     if (deletedFileIds.length > 0) {
  //       for (const fileId of deletedFileIds) {
  //         await sp.web.lists
  //           .getByTitle("TemplateDocs")
  //           .items.getById(fileId)
  //           .delete();
  //       }
  //     }

  //     // Delete old icons
  //     if (deletedIconIds.length > 0) {
  //       for (const iconId of deletedIconIds) {
  //         await sp.web.lists
  //           .getByTitle("TemplateDocs")
  //           .items.getById(iconId)
  //           .delete();
  //       }
  //     }

  //     // Upload new files
  //     if (thumbnails.length > 0) {
  //       uploadedAttachmentIds = await uploadFilesToLibrary(thumbnails);
  //     }
  //     if (Icons.length > 0) {
  //       uploadedIconIds = await uploadFilesToLibrary(Icons);
  //     }

  //     const finalAttachmentId =
  //       uploadedAttachmentIds.length > 0
  //         ? uploadedAttachmentIds[0]
  //         : existingThumbnailIds[0] || null;

  //     const finalIconId =
  //       uploadedIconIds.length > 0
  //         ? uploadedIconIds[0]
  //         : existingIconIds[0] || null;

  //     // Build payload
  //     const payload: any = {
  //       Title: title,
  //       Description: description,
  //       DepartmentId: department?.value || null,
  //       AttachmentIDId: finalAttachmentId,
  //       IconIDId: finalIconId,
  //     };

  //     // Save to list
  //     if (item && item.Id) {
  //       await sp.web.lists
  //         .getByTitle("TemplateAndForms")
  //         .items.getById(item.Id)
  //         .update(payload);
  //     } else {
  //       await sp.web.lists.getByTitle("TemplateAndForms").items.add(payload);
  //     }

  //     setDeletedFileIds([]);
  //     setDeletedIconIds([]);
  //     setThumbnails([]);
  //     setIcons([]);
  //     setExistingThumbnails([]);
  //     setExistingIcons([]);
  //     onSave(payload);
  //   } catch (error) {
  //     Swal.fire({
  //       title: "Error",
  //       text: "Failed to save the record.",
  //       icon: "error",
  //       backdrop: false,
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const confirmAndSubmit = async () => {
  //   const isValid = await validateForm();
  //   if (!isValid) {
  //     Swal.fire({
  //       title: "Please fill all the mandatory fields.",
  //       icon: "warning",
  //       confirmButtonText: "OK",
  //       backdrop: false,
  //       allowOutsideClick: false,
  //     });
  //     return;
  //   }

  //   const isEdit = item && item.Id;
  //   Swal.fire({
  //     title: isEdit
  //       ? "Do you want to update this record?"
  //       : "Do you want to submit this record?",
  //     icon: "question",
  //     showCancelButton: true,
  //     confirmButtonText: "Yes",
  //     cancelButtonText: "No",
  //     reverseButtons: false,
  //     backdrop: false,
  //     allowOutsideClick: false,
  //   }).then(async (result) => {
  //     if (result.isConfirmed) {
  //       try {
  //         await handleSubmit();
  //         Swal.fire({
  //           title: isEdit ? "Updated successfully." : "Submitted successfully.",
  //           icon: "success",
  //           confirmButtonText: "OK",
  //           backdrop: false,
  //         });
  //       } catch (error) {
  //         Swal.fire({
  //           title: "Error",
  //           text: isEdit
  //             ? "Failed to update record"
  //             : "Failed to submit record",
  //           icon: "error",
  //           confirmButtonText: "OK",
  //           backdrop: false,
  //         });
  //       }
  //     }
  //   });
  // };


  //  Enhanced handleSubmit with deep debugging
  const handleSubmit = async () => {
    setLoading(true);

    try {
      let uploadedAttachmentIds: number[] = [];
      let uploadedIconIds: number[] = [];

      // DELETE old attachments
      if (deletedFileIds.length > 0) {
        for (const fileId of deletedFileIds) {
          try {
            await sp.web.lists.getByTitle("TemplateDocs").items.getById(fileId).delete();
          } catch (err: any) {
          }
        }
      }

      //  DELETE old icons
      if (deletedIconIds.length > 0) {
        for (const iconId of deletedIconIds) {
          try {
            await sp.web.lists.getByTitle("TemplateDocs").items.getById(iconId).delete();

          } catch (err: any) {
          }
        }
      }

      // UPLOAD new attachments
      if (thumbnails.length > 0) {
        try {
          uploadedAttachmentIds = await uploadFilesToLibrary(thumbnails);
        } catch (err: any) {
        }
      }

      // UPLOAD new icons
      if (Icons.length > 0) {
        try {
          uploadedIconIds = await uploadFilesToLibrary(Icons);
        } catch (err: any) {
        }
      }

      // Determine final IDs
      const finalAttachmentId =
        uploadedAttachmentIds.length > 0
          ? uploadedAttachmentIds[0]
          : existingThumbnailIds[0] || null;

      const finalIconId =
        uploadedIconIds.length > 0
          ? uploadedIconIds[0]
          : existingIconIds[0] || null;

      //  Build payload
      const payload: any = {
        Title: title?.trim() || "",
        Description: description?.trim() || "",
        DepartmentId: department?.value || null,
        AttachmentIDId: finalAttachmentId,
        IconIDId: finalIconId,
      };
      //Execute Update or Add
      if (item && item.Id) {
        try {
          const result = await sp.web.lists
            .getByTitle("TemplateAndForms")
            .items.getById(item.Id)
            .update(payload);
        } catch (err: any) {

        }
      } else {

        try {
          const result = await sp.web.lists
            .getByTitle("TemplateAndForms")
            .items.add(payload);


        } catch (err: any) {

        }
      }

      setDeletedFileIds([]);
      setDeletedIconIds([]);
      setThumbnails([]);
      setIcons([]);
      setExistingThumbnails([]);
      setExistingIcons([]);

      onSave(payload);
    } catch (error: any) {

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

  //  Enhanced confirmAndSubmit with logging
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
        } catch (error: any) {
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
      } else {
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
                    <label htmlFor="simpleinput" className="form-label">
                      Description<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="Description"
                      className="form-control"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
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
                        Attachment <span className="text-danger">*</span>
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
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv"
                      multiple={false}
                      onChange={(e) => {
                        const inputEl = e.target as HTMLInputElement;
                        const selectedFiles = inputEl.files
                          ? Array.from(inputEl.files)
                          : [];

                        if (selectedFiles.length > 0) {
                          const singleFile = selectedFiles[0];

                          //  Allowed document types
                          const allowedTypes = [
                            "application/pdf",
                            "application/msword",
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                            "application/vnd.ms-excel",
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                            "application/vnd.ms-powerpoint",
                            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                            "text/csv",
                          ];

                          if (!allowedTypes.includes(singleFile.type)) {
                            Swal.fire({
                              icon: "error",
                              title: "Invalid File Type",
                              text: "Only document files are allowed (.pdf, .docx, .xlsx, .pptx, .csv).",
                              backdrop: false,
                            });
                            inputEl.value = "";
                            return;
                          }

                          //  Replace any existing file
                          setThumbnails([singleFile]);
                          if (existingThumbnailIds.length > 0)
                            setDeletedFileIds(existingThumbnailIds);
                          setExistingThumbnails([]);
                          setExistingThumbnailIds([]);
                          inputEl.value = "";
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label htmlFor="iconUpload" className="form-label">
                        Icon <span className="text-danger">*</span>
                      </label>

                      {(existingIcons.length > 0 || Icons.length > 0) && (
                        <a
                          className="text-primary"
                          style={{
                            fontSize: "0.875rem",
                            cursor: "pointer",
                            textDecoration: "none",
                          }}
                          onClick={() => setShowIconModal(true)}
                        >
                          <FontAwesomeIcon icon={faPaperclip as any} />{" "}
                          {existingIcons.length + Icons.length}{" "}
                          {existingIcons.length + Icons.length > 1
                            ? "files"
                            : "file"}{" "}
                          attached
                        </a>
                      )}
                    </div>

                    <input
                      type="file"
                      id="iconUpload"
                      className="form-control"
                      accept=".jpg,.jpeg,.png,.svg,.webp"
                      multiple={false}
                      onChange={(e) => {
                        const inputEl = e.target as HTMLInputElement;
                        const selectedFiles = inputEl.files
                          ? Array.from(inputEl.files)
                          : [];

                        if (selectedFiles.length > 0) {
                          const singleFile = selectedFiles[0];

                          //  Allowed image types
                          const allowedImageTypes = [
                            "image/jpeg",
                            "image/png",
                            "image/jpg",
                            "image/svg+xml",
                            "image/webp",
                          ];

                          if (!allowedImageTypes.includes(singleFile.type)) {
                            Swal.fire({
                              icon: "error",
                              title: "Invalid File Type",
                              text: "Only image files are allowed (jpeg, jpg, png, svg, webp).",
                              backdrop: false,
                            });
                            inputEl.value = "";
                            return;
                          }

                          //  Replace any existing file
                          setIcons([singleFile]);
                          if (existingIconIds.length > 0)
                            setDeletedIconIds(existingIconIds);
                          setExistingIcons([]);
                          setExistingIconIds([]);
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

      {/* Attachment Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <h4 className="font-16 text-dark fw-bold mb-1">
              Attachment Details
            </h4>
            <p className="text-muted font-14 mb-0 fw-400">
              Below are the attached document files
            </p>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <table className="table table-bordered">
            <thead style={{ background: "#eef6f7" }}>
              <tr>
                <th style={{ width: "50px" }}>S.No.</th>
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
                  const handleFileDelete = (file: any, isNewFile: boolean) => {
                    if (isNewFile) {
                      // Delete only from new icon state
                      setIcons([]);
                    } else {
                      // Delete only from existing icon state
                      setExistingIcons((prev) =>
                        prev.filter((f) => f.id !== file.id)
                      );
                      setExistingIconIds((prev) =>
                        prev.filter((id) => id !== file.id)
                      );
                      setDeletedIconIds((prev) => [...prev, file.id]);
                    }
                  };

                  return (
                    <tr key={index}>
                      <td className="text-center">{index + 1}</td>
                      <td>{getNewFileName(file.name)}</td>
                      <td className="text-center">
                        {!isNewFile && (
                          <span
                            title="Preview file"
                            style={{
                              color: "blue",
                              cursor: "pointer",
                              marginRight: "10px",
                            }}
                            onClick={() => openFile(file, "Open")}
                          >
                            <FontAwesomeIcon icon={faEye as any} />
                          </span>
                        )}

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

      {/* icon modal */}
      <Modal
        show={showIconModal}
        onHide={() => setShowIconModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <h4 className="font-16 text-dark fw-bold mb-1">Icon Details</h4>
            <p className="text-muted font-14 mb-0 fw-400">
              Below are the attached icon files
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
              {[...existingIcons, ...Icons].map((file: any, index: number) => {
                const isNewFile = file instanceof File;
                const previewUrl = isNewFile
                  ? URL.createObjectURL(file)
                  : file.url;
                const handleFileDelete = (file: any, isNewFile: boolean) => {
                  if (isNewFile) setIcons([]);
                  else {
                    setExistingIcons([]);
                    setExistingIconIds([]);
                    setDeletedIconIds([...deletedIconIds, file.id]);
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
                        title="Preview image"
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
              })}
            </tbody>
          </table>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default TemplateForm;
