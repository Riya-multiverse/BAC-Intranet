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
import CustomBreadcrumb from "../../common/CustomBreadcrumb";
import {
    faDownload,
    faEye,
    faPaperclip,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SITE_URL, Tenant_URL } from "../../../../../Shared/Constant";


interface IPolicyandProcedureProps {
    item?: any;
    onCancel: () => void;
    onSave: (data: any) => void;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const Breadcrumb = [
    { MainComponent: "Settings", MainComponentURl: "Settings" },
    { MainComponent: "Policy and Procedure", MainComponentURl: "PolicyandProceduresMaster" },
];

const PolicyandProcedureForm = ({
    item,
    onCancel,
    onSave,
    setLoading,
}: IPolicyandProcedureProps) => {
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [policy, setPolicy] = useState<any>(null);
    const [thumbnails, setThumbnails] = useState<File[]>([]);
    const [category, setCategory] = useState<any>(null);
    //   const [overview, setOverview] = useState<string>("");
    const [policies, setPolicies] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [existingThumbnails, setExistingThumbnails] = useState<
        { id: number; name: string; url: string }[]
    >([]);
    const [existingThumbnailIds, setExistingThumbnailIds] = useState<number[]>(
        []
    );
    const [showModal, setShowModal] = useState(false);
    const [showFile, setShowFile] = useState(false);
    const [deletedFileIds, setDeletedFileIds] = useState<number[]>([]);
    //   const [isFeatured, setIsFeatured] = useState<boolean>(false);
    const [redirectUrl, setRedirectUrl] = useState<string | null>(null);



    const openFile = (fileObj: any, action: "Open" | "Download") => {
        try {

            //  Derive FileRef safely (for both mapped and unmapped cases)
            const fileRef =
                fileObj.FileRef ||
                (fileObj.url
                    ? decodeURIComponent(
                        new URL(fileObj.url).pathname.replace(window.location.origin, "")
                    )
                    : null);

            // Construct absolute file URL
            const fileUrl = fileObj.url
                ? fileObj.url
                : fileRef
                    ? `${Tenant_URL}${fileRef}`
                    : "";

            if (!fileUrl) {
                return;
            }

            if (action === "Open") {

                //  Use SharePoint WOPI Viewer for Office files
                if (/\.(doc|docx|xls|xlsx|ppt|pptx|csv|docs)$/i.test(fileUrl)) {
                    const wopiUrl = `${SITE_URL}/_layouts/15/WopiFrame.aspx?sourcedoc=${encodeURIComponent(
                        fileRef
                    )}&action=default`;
                    window.open(wopiUrl, "_blank");
                } else {
                    window.open(fileUrl, "_blank");
                }
            } else if (action === "Download") {
                const link = document.createElement("a");
                link.href = fileUrl;
                link.setAttribute(
                    "download",
                    fileObj.FileLeafRef
                        ? fileObj.FileLeafRef.replace(/^\d+_/, "")
                        : fileObj.name || "file"
                );
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
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
    const uploadFilesToLibrary = async (sp: SPFI, files: File[]): Promise<number[]> => {
        const folder = sp.web.getFolderByServerRelativePath("/sites/BAC/PolicyDocs");
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



    useEffect(() => {
        const fetchPolicy = async () => {
            setLoading(true);
            try {
                //  Initialize PnP with real SPFx context (passed from web part)
                const sp: SPFI = getSP();
                const deptItems = await sp.web.lists
                    .getByTitle("PolicyTypeMaster")
                    .items();

                if (!deptItems || deptItems.length === 0) {
                }

                //  Map into dropdown options
                const policyOption = deptItems.map((d: any) => ({
                    value: d.Id,
                    label: d.Title,
                }));

                //  Set state for dropdown
                setPolicies(policyOption);
            } catch (err) {

            } finally {
                setLoading(false);
            }
        };

        fetchPolicy();
        const fetchCategories = async () => {

            setLoading(true);
            try {
                const sp: SPFI = getSP();
                const policytItems = await sp.web.lists
                    .getByTitle("CategoryMasterList")
                    .items.select("Id", "Category")();

                const policyOptions = policytItems.map((c: any) => ({
                    value: c.Id,
                    label: c.Category,
                }));
                setCategories(policyOptions);
            } catch (err) {
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [setLoading]);

    //  Validation function for AnnouncementForm
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
        const policyControl = document.querySelector(
            "#NewsDeptID .react-select__control"
        ) as HTMLElement;

        if (!policy && policyControl) {
            policyControl.classList.add("border-on-error");
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
        // if (!overview.trim()) {
        //   document.getElementById("newsOverview")?.classList.add("border-on-error");
        //   isValid = false;
        // }

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

        try {
            //  Step 1: Delete previously marked files (old attachments)
            if (deletedFileIds.length > 0) {
                for (const fileId of deletedFileIds) {
                    try {
                        await sp.web.lists.getByTitle("PolicyDocs").items.getById(fileId).delete();
                    } catch (error) {
                    }
                }
            }

            //  Step 2: Upload new files (if any)
            let uploadedFileIds: number[] = [];
            if (thumbnails && thumbnails.length > 0) {
                uploadedFileIds = await uploadFilesToLibrary(sp, thumbnails);
            } else {
            }

            //  Step 3: Determine which file ID to use for lookup
            const finalAttachmentId =
                uploadedFileIds.length > 0
                    ? uploadedFileIds[0] // new file uploaded
                    : existingThumbnailIds[0] || null;

            //  Step 4: Prepare payload for list update
            const payload: any = {
                Title: title,
                Description: description,
                CategoryId: category?.value ? Number(category.value) : null,
                PolicyTypeId: policy?.value ? Number(policy.value) : null,
                AttachmentId:
                    Array.isArray(finalAttachmentId)
                        ? Number(finalAttachmentId[0])
                        : finalAttachmentId
                            ? Number(finalAttachmentId)
                            : null,
            };

            // Debug console logs
            console.log(" Final payload before update/add:", payload);
            console.log(" Payload value types:", {
                CategoryId: typeof payload.CategoryId,
                PolicyTypeId: typeof payload.PolicyTypeId,
                AttachmentId: typeof payload.AttachmentId,
            });

            //  Step 5: Add or Update item in PolicyandProcedures
            if (item && (item.id || item.ID)) {
                const itemId = item.id || item.ID;
                await sp.web.lists
                    .getByTitle("PolicyandProcedures")
                    .items.getById(itemId)
                    .update(payload);

                //  Preserve dropdown selections after update
                setPolicy(policy);
                setCategory(category);
            } else {
                await sp.web.lists.getByTitle("PolicyandProcedures").items.add(payload);

                // Reset only for ADD mode
                setTitle("");
                setDescription("");
                setPolicy(null);
                setCategory(null);
                setThumbnails([]);
            }

            //  Step 6: Clear file states
            setDeletedFileIds([]);
            setExistingThumbnails([]);
            setExistingThumbnailIds([]);

            //  Notify parent
            onSave({
                title,
                description,
                category,
                policy,
                thumbnails,
            });
        } catch (error: any) {

            if (error?.data?.responseBody) {
            }

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
            //   setOverview(item.overview || "");



            // expanded lookup case
            if (item.PolicyType && item.PolicyType.Id) {
                const policyOption = {
                    value: item.PolicyType.Id,
                    label: item.PolicyType.Title,
                };
                setPolicy(policyOption);
            }
            // lowercase + flattened case
            else if (item.policytypeid && item.policytype) {
                const policyOption = {
                    value: item.policytypeid,
                    label: item.policytype,
                };
                setPolicy(policyOption);
            }
            // string-only case (no id)
            else if (item.policytype) {
                const policyOption = {
                    value: item.policytype,
                    label: item.policytype,
                };
                setPolicy(policyOption);
            } else {
                setPolicy(null);
            }




            if (item.Category && item.Category.Id) {
                const catOption = {
                    value: item.Category.Id,
                    label: item.Category.Category,
                };
                setCategory(catOption);
            } else if (item.categoryId && item.category) {
                const catOption = {
                    value: item.categoryId,
                    label: item.category,
                };
                setCategory(catOption);
            } else {
                setCategory(null);
            }

            const fetchExistingThumbnails = async () => {
                if (!item || (!item.Id && !item.id)) return;
                const sp = getSP();
                const itemId = item.Id || item.id;



                try {
                    // Step 1: Get lookup info
                    const listItem = await sp.web.lists
                        .getByTitle("PolicyandProcedures")
                        .items.getById(itemId)
                        .select("Id", "Attachment/Id", "Attachment/Title")
                        .expand("Attachment")();


                    let fileIds: number[] = [];

                    //  Handle both array and single object cases
                    if (Array.isArray(listItem.Attachment)) {
                        fileIds = listItem.Attachment.map((f: any) => f.Id);
                    } else if (listItem.Attachment && listItem.Attachment.Id) {
                        fileIds = [listItem.Attachment.Id];
                    }

                    if (fileIds.length > 0) {

                        setExistingThumbnailIds(fileIds);

                        const filterString = fileIds.map((id: number) => `ID eq ${id}`).join(" or ");


                        const files = await sp.web.lists
                            .getByTitle("PolicyDocs")
                            .items.filter(filterString)
                            .select("Id", "FileRef", "FileLeafRef")();


                        const mappedFiles = files.map((file: any) => ({
                            id: file.Id,
                            name: file.FileLeafRef,
                            FileRef: file.FileRef, //  Add this line
                            FileLeafRef: file.FileLeafRef, //  optional, helps downloads
                            url: `${window.location.origin}${file.FileRef}`,
                        }));


                        setExistingThumbnails(mappedFiles);
                    } else {

                        setExistingThumbnails([]);
                        setExistingThumbnailIds([]);
                    }
                } catch (err) {

                    setExistingThumbnails([]);
                    setExistingThumbnailIds([]);
                }
            };



            fetchExistingThumbnails();
        }

        // if (item.FeaturedAnnouncement === "Yes" || item.featured === "Yes" || item.featured === true) {
        //   setIsFeatured(true);
        // } else {
        //   setIsFeatured(false);
        // }

    }, [item]);
    //  Helper: Remove datetime prefix from file name for display
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
            const displayName = parts.slice(2).join("_");
            return displayName;
        }

        return fileName;
    };

    return (
        <>
            {/* // <!-- start page title --> */}
            <div className="row">
                <div className="col-lg-4">
                    {/* <h4 className="page-title fw-bold mb-1 font-20">
            Policy Master
          </h4>
          <ol className="breadcrumb m-0">
            <li className="breadcrumb-item">
              <a href="javascript:void(0)">Settings</a>
            </li>
            <li className="breadcrumb-item">
            
            </li>

            <li className="breadcrumb-item active">Announcement Master</li>
          </ol> */}
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
                  <ArrowLeft className="me-1" size={16} /> Back

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
                                            Policy<span className="text-danger">*</span>
                                        </label>
                                        <Select
                                            // inputId="simpleinput"
                                            id="NewsDeptID" //  ID used for highlighting
                                            className={`form-control p-0 border-0`}
                                            classNamePrefix="react-select"
                                            placeholder="Select Policy"
                                            options={policies}
                                            value={policy}
                                            onChange={(option: any) => setPolicy(option)}
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
                                            placeholder="Select Category"
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
                                                Attachment{" "}
                                                <span className="text-danger">*</span>
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
                                                const selectedFiles = inputEl.files ? Array.from(inputEl.files) : [];

                                                if (selectedFiles.length > 0) {
                                                    const singleFile = selectedFiles[0];

                                                    //  Allowed document MIME types
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

                                                    //  Replace any existing file (single file only)
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

                                {/* <div className="col-lg-12">
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
                </div> */}
                                {/* <div className="col-lg-6">
                  <div className="form-check mt-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="featuredCheckbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="featuredCheckbox"
                    >
                      Featured Announcement
                    </label>
                  </div>
                </div> */}
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
                            Below are the attachment details for Announcement Gallery
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
                                    {/* <th style={{ width: "120px" }}>File Preview</th> */}
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
                                                {/* <td className="text-center">
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
                        </td> */}

                                                {/* File Name */}
                                                <td title={getNewFileName(file.name)}>
                                                    {getNewFileName(file.name)}
                                                </td>

                                                {/* Actions */}
                                                <td className="text-center">
                                                    {/* 👁 Preview file */}
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

                                                    {/* ⬇ Download file */}
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

                                                    {/*  Delete file */}
                                                    <span
                                                        title="Delete file"
                                                        style={{
                                                            color: "red",
                                                            cursor: "pointer",
                                                            marginLeft: "10px",
                                                        }}
                                                        onClick={() => {
                                                            if (isNewFile) {
                                                                setThumbnails((prev) => prev.filter((f) => f !== file));
                                                            } else {
                                                                setExistingThumbnails((prev) => prev.filter((f) => f.id !== file.id));
                                                                setExistingThumbnailIds((prev) =>
                                                                    prev.filter((id) => id !== file.id)
                                                                );
                                                                setDeletedFileIds((prev) => [...prev, file.id]);
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

export default PolicyandProcedureForm;
