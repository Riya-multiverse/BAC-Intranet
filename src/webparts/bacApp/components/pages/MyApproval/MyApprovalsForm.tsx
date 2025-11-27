import * as React from "react";
//import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../../../../../styles/global.scss";
import "bootstrap-icons/font/bootstrap-icons.css";
import "material-symbols/index.css";
import { ChevronRight, CheckCircle, X, Trash2, PlusCircle } from "react-feather";
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
    approvalMode?: boolean;
    onCancel: () => void;
    onSave: (data: any) => void;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

///////////////////////////////
interface Section {
    id: string;
    spId?: number;
    title: string;
    description: string;
    children: Section[]; // nested sub-sections
    isCollapsed?: boolean; // for expand/collapse UI
}
const Breadcrumb = [
    { MainComponent: "Home", MainComponentURl: "Home" },
    {
        MainComponent: "My Approvals",
        MainComponentURl: "MyApprovals",
    },
];

const MyApprovalsForm = ({
    item, approvalMode = false,
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
    const [selectedUser, setSelectedUser] = React.useState<string>("");
    const [users, setUsers] = React.useState<any[]>([]);
    // For Icon
    const [Icons, setIcons] = React.useState<File[]>([]);
    const [existingIcons, setExistingIcons] = React.useState<
        { id: number; name: string; url: string }[]
    >([]);
    const [existingIconIds, setExistingIconIds] = React.useState<number[]>([]);
    const [deletedIconIds, setDeletedIconIds] = React.useState<number[]>([]);
    const [sectionHierarchy, setSectionHierarchy] = React.useState<Section[]>([]);
    const [deletedSectionIds, setDeletedSectionIds] = React.useState<number[]>([]);
    const [status, setStatus] = React.useState<string>("");
    const [remarks, setRemarks] = React.useState<string>("");
    const [actionType, setActionType] = React.useState<string>("");
    const [showRemarks, setShowRemarks] = React.useState(false);
    const [approvalHistory, setApprovalHistory] = React.useState<any[]>([]);


    const isReadOnly = approvalMode === true;
    const editId = item?.departmentInitiativeId ?? item?.Id;
    const approvalId = item?.approvalId as number | undefined;

    const validateApproval = (newStatus: string) => {
        // remove previous red border
        document.getElementById("Remarks")?.classList.remove("border-on-error");

        // Rework / Reject = require remarks
        if ((newStatus === "Rework" || newStatus === "Rejected") && (!remarks.trim())) {
            document.getElementById("Remarks")?.classList.add("border-on-error");

            Swal.fire({
                icon: "warning",
                title: "Please fill all the mandatory fields.",
                text: ``,
                backdrop: false,
            });

            return false;
        }

        return true;
    };


    //handleApproval
    const handleApproval = async (newStatus: "Approved" | "Rejected" | "Rework") => {
        //  Validate remarks (Rework / Reject only)
        if ((newStatus === "Rejected" || newStatus === "Rework") && !remarks.trim()) {
            document.getElementById("Remarks")?.classList.add("border-on-error");
            Swal.fire("Please fill all the mandatory fields.", "", "warning");
            return;
        }


        if (!approvalMode || !approvalId) {
            Swal.fire("Error", "Approval record not found.", "error");
            return;
        }

        //  Confirmation popup before update
        Swal.fire({
            title: `Do you want to ${newStatus} this request?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            reverseButtons: false,
            backdrop: false,
            allowOutsideClick: false,
        }).then(async (result) => {
            if (!result.isConfirmed) return;

            setLoading(true);
            try {
                const user = await sp.web.currentUser();

                //  Update ApprovalHistory entry
                await sp.web.lists
                    .getByTitle("ApprovalHistory")
                    .items.getById(approvalId)
                    .update({
                        Status: newStatus,
                        Remarks: remarks || "",
                        ApprovedById: user?.Id ?? null,
                        ApprovedOn: new Date().toISOString(),
                    });
                if (editId) {
                    await loadApprovalHistory(editId);   // refresh table with latest status/date/user
                }

                //  Sync DepartmentInitiative main list status
                if (editId) {
                    await sp.web.lists
                        .getByTitle("DepartmentInitiative")
                        .items.getById(editId)
                        .update({ Status: newStatus });
                }

                //  Show proper success message dynamically
                let message = "";

                if (newStatus === "Rework") {
                    message = "Sent for rework.";
                } else {
                    message = `${newStatus} successfully.`;
                }

                Swal.fire("Success", message, "success");

                onSave({ status: newStatus, remarks });
            } catch (e) {
                Swal.fire("Error", "Failed to update approval.", "error");
            } finally {
                setLoading(false);
            }
        });
    };



    //fetch users
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
            }
        };
        fetchUsers();
    }, []);


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

//   const openFile = (fileObj: any, action: "Open" | "Download") => {
//   if (!fileObj) return;

//   //  Prefer server-relative FileRef always
//   let fileRef = fileObj.FileRef || fileObj.url;
//   if (!fileRef) return;

//   const origin = window.location.origin;

//   //  Convert full absolute URL → server relative
//   if (fileRef.startsWith(origin)) {
//     fileRef = fileRef.replace(origin, "");
//   }

//   console.log(" Normalized FileRef:", fileRef);

//   const fullUrl = `${origin}${fileRef}`;

//   //  Allowed Office extensions
//   const officeExt = /\.(doc|docx|xls|xlsx|ppt|pptx|csv)$/i;

//   if (action === "Open") {
//     if (officeExt.test(fileRef)) {
//       //  SharePoint Online Viewer for Office files
//       const viewerUrl =
//         `${origin}/_layouts/15/WopiFrame.aspx?sourcedoc=` +
//         encodeURIComponent(fileRef) +
//         `&action=view`;

//       console.log(" Opening Viewer URL:", viewerUrl);
//       window.open(viewerUrl, "_blank");
//     } else {
//       //  Open PDF & images directly
//       console.log(" Opening direct:", fullUrl);
//       window.open(fullUrl, "_blank");
//     }
//     return;
//   }

//   if (action === "Download") {
//     //  Clean filename (remove timestamp prefix)
//     const cleanFileName = getNewFileName(fileObj.name || fileObj.FileLeafRef);

//     console.log("⬇ Downloading:", cleanFileName);

//     const link = document.createElement("a");
//     link.href = fullUrl;
//     link.setAttribute("download", cleanFileName);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   }
// };






    React.useEffect(() => {
        const fetchExistingData = async () => {
            if (!editId) return; //  use the computed id
            setLoading(true);
            try {
                const listItem = await sp.web.lists
                    .getByTitle("DepartmentInitiative")
                    .items.getById(editId)         //  correct id
                    .select(
                        "Id", "Title", "Description",
                        "Department/Id", "Department/DepartmentName",
                        "ApproverName/Id", "ApproverName/Title", "ApproverName/EMail",
                        "Attachment/Id", "Thumbnail/Id"
                    )
                    .expand("Department", "ApproverName", "Attachment", "Thumbnail")();

                // prefill (same as your code)...
                setTitle(listItem.Title || "");
                setDescription(listItem.Description || "");

                //  load approval history remarks also
                if (approvalId) {
                    const approvalItem = await sp.web.lists
                        .getByTitle("ApprovalHistory")
                        .items.getById(approvalId)
                        .select("Status", "Remarks")();

                    setStatus(approvalItem.Status || "");
                    setRemarks(approvalItem.Remarks || "");
                }

                if (listItem.Department?.Id && listItem.Department?.DepartmentName) {
                    const option = { value: listItem.Department.Id, label: listItem.Department.DepartmentName };
                    setDepartment(departments.find(d => d.value === option.value) || option);
                } else {
                    setDepartment(null);
                }
                await loadHierarchyFromList(listItem.Id);
                setSelectedUser(listItem.ApproverName?.EMail || "");
                if (listItem.Attachment) {
                    let fileIds: number[] = [];
                    if (Array.isArray(listItem.Attachment)) {
                        fileIds = listItem.Attachment.map((a: any) => a.Id);
                    } else if (listItem.Attachment.Id) {
                        fileIds = [listItem.Attachment.Id];
                    }

                    if (fileIds.length > 0) {
                        const filterString = fileIds.map((id) => `Id eq ${id}`).join(" or ");
                        const attachFiles = await sp.web.lists
                            .getByTitle("DepartmentInitiativeDocs")
                            .items.filter(filterString)
                            .select("Id", "FileRef", "FileLeafRef")();

                        const attachments = attachFiles.map((file: any) => ({
                            id: file.Id,
                            name: file.FileLeafRef,
                            url: `${window.location.origin}${file.FileRef}`,
                        }));

                        setExistingThumbnails(attachments);
                        setExistingThumbnailIds(fileIds);
                    } else {
                        setExistingThumbnails([]);
                        setExistingThumbnailIds([]);
                    }
                } else {
                    setExistingThumbnails([]);
                    setExistingThumbnailIds([]);
                }

                //  Prefill THUMBNAIL (single lookup → DepartmentInitiativeDocs)
                if (listItem.Thumbnail?.Id) {
                    const thumbId = listItem.Thumbnail.Id;
                    const thumbItem = await sp.web.lists
                        .getByTitle("DepartmentInitiativeDocs")
                        .items.getById(thumbId)
                        .select("Id", "FileRef", "FileLeafRef")();

                    const thumbFile = {
                        id: thumbItem.Id,
                        name: thumbItem.FileLeafRef,
                        url: `${window.location.origin}${thumbItem.FileRef}`,
                    };

                    setExistingIcons([thumbFile]);
                    setExistingIconIds([thumbFile.id]);
                } else {
                    setExistingIcons([]);
                    setExistingIconIds([]);
                }
                /////////////////////////////
                await loadApprovalHistory(editId);
                ////////////////
            } catch (err: any) {
                Swal.fire("Error", "Failed to load item details. Please try again.", "error");
            } finally {
                setLoading(false);
            }
        };

        if (editId) {
            fetchExistingData();   //  drive off editId
        } else {
            // reset (same as your code)
            setTitle(""); setDescription(""); setSelectedUser("");
            setDepartment(null);
            setExistingThumbnails([]); setExistingThumbnailIds([]);
            setExistingIcons([]); setExistingIconIds([]);
        }
    }, [editId, departments]);               //  dependency on editId (not item)


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
            "/sites/BAC/DepartmentInitiativeDocs"
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

        // Clear previous highlights
        Array.from(document.getElementsByClassName("border-on-error"))
            .forEach((el: Element) => el.classList.remove("border-on-error"));

        let isValid = true;

        const TitleInput = document.getElementById("TitleInput");
        const DescriptionInput = document.getElementById("Description");
        const deptControl = document.querySelector("#NewsDeptID .react-select__control") as HTMLElement;
        const employeeSelect = document.getElementById("EmployeeName");
        const fileInput = document.getElementById("newsThumbnails");
        const iconInput = document.getElementById("iconUpload");

        if (!selectedUser) {
            employeeSelect?.classList.add("border-on-error");
            isValid = false;
        }

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

        //  NEW: Section Hierarchy validation (LEAF descriptions)
        const leafCheck = validateLeafNodes(sectionHierarchy);

        if (!leafCheck.ok) {
            isValid = false;
        }

        //  Scroll to first highlighted error
        const firstInvalid = document.querySelector(".border-on-error");
        firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });

        //  Show popup if any missing
        if (!isValid) {
            Swal.fire("Please fill all the mandatory fields.");
        }

        return isValid;
    };



    const normalizeLookupIds = (ids: any): number[] => {
        if (!ids) return [];
        return Array.isArray(ids)
            ? ids.map((id) => Number(id)).filter(Boolean)
            : [Number(ids)].filter(Boolean);
    };




    ////////////////////////////////
    const loadApprovalHistory = async (departmentInitiativeId: number) => {
        const sp = getSP();

        const items = await sp.web.lists
            .getByTitle("ApprovalHistory")
            .items.filter(`DepartmentInitiativeIDId eq ${departmentInitiativeId}`)
            .select(
                "Id",
                "Status",
                "Remarks",
                "RequestedOn",
                "AssignedOn",
                "ApprovedOn",
                "RequestedBy/Id",
                "RequestedBy/Title",
                "AssignedTo/Id",
                "AssignedTo/Title",
                "ApprovedBy/Id",
                "ApprovedBy/Title"
            )
            .expand("RequestedBy", "AssignedTo", "ApprovedBy")
            .orderBy("Id", true)   // latest first
            .getAll();

        setApprovalHistory(items);
    };


    //  SECTION HIERARCHY LOGIC FUNCTIONS
    // // Add a new main section (root level)
    const addMainSection = () => {
        setSectionHierarchy((prev) => [
            ...prev,
            { id: crypto.randomUUID(), title: "", description: "", children: [] },
        ]);
    };

    // FIXED DEPTH LOGIC + CONFIGURABLE CHILD LIMIT (root=0)
    const MAX_DEPTH = 4; //  Change anytime ---shows the max depth for a complete section including parent 

    const addChildSection = (parentId: string) => {



        const addRecursively = (nodes: Section[], depth: number): Section[] => {

            return nodes.map((node) => {

                // When we find the parent
                if (node.id === parentId) {

                    if (depth >= MAX_DEPTH) {
                        Swal.fire({
                            icon: "warning",
                            title: "Depth Limit Reached!",
                            text: `Only ${MAX_DEPTH - 1} nested levels are allowed.`,
                            backdrop: false,
                        });

                        return node;
                    }
                    return {
                        ...node,
                        children: [
                            ...node.children,
                            {
                                id: crypto.randomUUID(),
                                title: "",
                                description: "",
                                children: [],
                            },
                        ],
                    };
                }

                return {
                    ...node,
                    children: addRecursively(node.children, depth + 1),
                };
            });
        };

        setSectionHierarchy((prev) => addRecursively(prev, 1)); // 1=root depth
    };




    // Delete any section node
    const deleteSection = (id: string) => {
        const removeRecursively = (nodes: Section[]): Section[] => {
            return nodes.filter((n) => {
                if (n.id === id) {
                    if (n.spId) setDeletedSectionIds((prev) => [...prev, n.spId!]);
                    return false;
                }
                n.children = removeRecursively(n.children);
                return true;
            });
        };
        setSectionHierarchy((prev) => removeRecursively(prev));
    };


    // Update field value (title/description)
    // FIXED: Update only the changed section (preserve focus)
    const updateSection = (id: string, field: keyof Section, value: string) => {
        setSectionHierarchy((prev) => {
            const updateNode = (nodes: Section[]): Section[] => {
                let changed = false;

                const newNodes = nodes.map((n) => {
                    if (n.id === id) {
                        changed = true;
                        return { ...n, [field]: value };
                    }

                    if (n.children?.length > 0) {
                        const updatedChildren = updateNode(n.children);
                        if (updatedChildren !== n.children) {
                            changed = true;
                            return { ...n, children: updatedChildren };
                        }
                    }

                    return n;
                });

                return changed ? newNodes : nodes; //  Preserve old refs if unchanged
            };

            return updateNode(prev);
        });
    };



    // Toggle collapse/expand
    const toggleCollapse = (id: string) => {
        const toggleRecursively = (nodes: Section[]): Section[] =>
            nodes.map((n) =>
                n.id === id
                    ? { ...n, isCollapsed: !n.isCollapsed }
                    : { ...n, children: toggleRecursively(n.children) }
            );
        setSectionHierarchy((prev) => toggleRecursively(prev));
    };



    // FIXED: SAVE SECTION HIERARCHY TO SHAREPOINT (with correct parent-child linking)
    const saveHierarchyToList = async (departmentInitiativeId: number) => {
        const sp = getSP();

        // Delete removed sections from SharePoint
        for (const delId of deletedSectionIds) {
            try {
                await sp.web.lists
                    .getByTitle("DepartmentInitiativeDetails")
                    .items.getById(delId)
                    .delete();
            } catch (err) {
            }
        }
        setDeletedSectionIds([]);

        // Flatten hierarchy but preserve local id-to-parent linkage
        const flattenHierarchy = (
            nodes: Section[],
            parentLocalId: string | null = null
        ): any[] => {
            const items: any[] = [];
            for (const n of nodes) {
                items.push({
                    localId: n.id, // local (UI) id
                    spId: n.spId || null, // SharePoint id if exists
                    title: n.title || "Untitled",
                    description: n.description || "",
                    parentLocalId, // track parent reference by localId
                });
                if (n.children?.length > 0) {
                    items.push(...flattenHierarchy(n.children, n.id));
                }
            }
            return items;
        };

        const flatNodes = flattenHierarchy(sectionHierarchy);
        const idMap: Record<string, number> = {}; // maps localId → SP Id

        // Save all nodes while keeping correct parent-child relationships
        for (const node of flatNodes) {
            try {
                if (node.spId) {
                    // Update existing item
                    await sp.web.lists
                        .getByTitle("DepartmentInitiativeDetails")
                        .items.getById(node.spId)
                        .update({
                            Title: node.title,
                            Description: node.description,
                            DepartmentInitiativeIDId: departmentInitiativeId,
                            DepartmentInitiativeDetailsIDId: node.parentLocalId
                                ? idMap[node.parentLocalId] || null
                                : null,
                        });
                    idMap[node.localId] = node.spId; // store mapping
                } else {
                    // Add new item
                    const added = await sp.web.lists
                        .getByTitle("DepartmentInitiativeDetails")
                        .items.add({
                            Title: node.title,
                            Description: node.description,
                            DepartmentInitiativeIDId: departmentInitiativeId,
                            DepartmentInitiativeDetailsIDId: node.parentLocalId
                                ? idMap[node.parentLocalId] || null
                                : null,
                        });
                    idMap[node.localId] = added.data.Id;
                }
            } catch (err) {
            }
        }

    };

    // LOAD SECTION HIERARCHY FROM SHAREPOINT
    const loadHierarchyFromList = async (departmentInitiativeId: number) => {
        const sp = getSP();

        //  Fetch all nodes for this main record
        const items = await sp.web.lists
            .getByTitle("DepartmentInitiativeDetails")
            .items.filter(`DepartmentInitiativeIDId eq ${departmentInitiativeId}`)
            .select("Id", "Title", "Description", "DepartmentInitiativeDetailsID/Id")
            .expand("DepartmentInitiativeDetailsID")();

        //  Build a tree from flat list
        const map: any = {};
        const roots: Section[] = [];

        items.forEach((item: any) => {
            map[item.Id] = {
                id: crypto.randomUUID(), // local UI ID
                spId: item.Id,
                title: item.Title || "",
                description: item.Description || "",
                children: [],
            };
        });

        items.forEach((item: any) => {
            const parentId = item.DepartmentInitiativeDetailsID?.Id;
            if (parentId && map[parentId]) {
                map[parentId].children.push(map[item.Id]);
            } else {
                roots.push(map[item.Id]);
            }
        });

        setSectionHierarchy(roots);
    };




    //  FIXED: Recursive Component (memoized to preserve focus)
    const RenderSection = React.memo(
        ({ section, level = 1 }: { section: Section; level?: number }) => {
            const titleRef = React.useRef<HTMLInputElement>(null);
            const descRef = React.useRef<HTMLTextAreaElement>(null);

            return (
                <div
                    className="p-3 mb-2"
                    style={{
                        borderLeft: `2px solid ${level % 2 === 0 ? "#007bff" : "#28a745"}`,
                        marginLeft: `${level * 15}px`,
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                    }}
                >
                    <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                            {/* --- Title Field --- */}
                            <input
                                id={`title-${section.id}`}
                                ref={titleRef}
                                type="text"
                                className="form-control mb-2"
                                placeholder="Title"
                                defaultValue={section.title}
                                onBlur={(e) =>
                                    updateSection(section.id, "title", e.target.value)
                                }
                                onFocus={() => {
                                    // keep latest value always synced when refocused
                                    if (titleRef.current)
                                        titleRef.current.value = section.title || "";
                                }}
                                readOnly={approvalMode}
                            />

                            {/* --- Description Field --- */}
                            <textarea
                                id={`desc-${section.id}`}
                                ref={descRef}
                                className="form-control"
                                rows={2}
                                placeholder="Description"
                                defaultValue={section.description}
                                onBlur={(e) =>
                                    updateSection(section.id, "description", e.target.value)
                                }
                                onFocus={() => {
                                    if (descRef.current)
                                        descRef.current.value = section.description || "";
                                }}
                                readOnly={approvalMode}
                            />
                        </div>

                        <div className="ms-2 d-flex flex-column">
                            <button
                                className="btn btn-sm btn-outline-secondary mb-1"
                                title="Collapse / Expand"
                                onClick={() => toggleCollapse(section.id)}
                            >
                                {section.isCollapsed ? "▶" : "▼"}
                            </button>

                            {!approvalMode && MAX_DEPTH && (
                                <button
                                    className="btn btn-sm btn-outline-success mb-1"
                                    title="Add Subsection"
                                    onClick={() => addChildSection(section.id)}
                                >
                                    <PlusCircle className="me-1" size={18} />
                                </button>
                            )}
                            {!approvalMode && (
                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    title="Delete Section"
                                    onClick={() => deleteSection(section.id)}
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>

                    </div>

                    {!section.isCollapsed &&
                        section.children.map((child) => (
                            <RenderSection key={child.id} section={child} level={level + 1} />
                        ))}
                </div>
            );
        }
    );



    ////////////////////////////
    //  Validate: Leaf nodes must have BOTH title & description
    const validateLeafNodes = (nodes: Section[]): { ok: boolean; errors: string[] } => {
        const errors: string[] = [];

        const checkNode = (node: Section) => {
            const isLeaf = node.children.length === 0;

            if (isLeaf) {
                let hasError = false;

                //  Title required
                if (!node.title || node.title.trim() === "") {
                    errors.push(`Title required for a leaf section.`);
                    document.getElementById(`title-${node.id}`)?.classList.add("border-on-error");
                    hasError = true;
                }

                //  Description required
                if (!node.description || node.description.trim() === "") {
                    errors.push(`Description required for a leaf section.`);
                    document.getElementById(`desc-${node.id}`)?.classList.add("border-on-error");
                    hasError = true;
                }

                if (hasError) return;
            }

            node.children.forEach((child) => checkNode(child));
        };

        nodes.forEach((n) => checkNode(n));

        return { ok: errors.length === 0, errors };
    };


    ////////////////////////////////


    //  Enhanced handleSubmit with deep debugging
    const handleSubmit = async () => {
        setLoading(true);
        //  Validate leaf descriptions
        const leafCheck = validateLeafNodes(sectionHierarchy);


        if (!leafCheck.ok) {
            Swal.fire({
                icon: "warning",
                title: "Missing Descriptions",
                html: leafCheck.errors.join("<br/>"),
                backdrop: false,
            });
            setLoading(false);
            return; // STOP SUBMIT
        }

        try {
            let uploadedAttachmentIds: number[] = [];
            let uploadedIconIds: number[] = [];

            //  DELETE OLD ATTACHMENTS
            if (deletedFileIds.length > 0) {
                for (const fileId of deletedFileIds) {
                    try {
                        await sp.web.lists.getByTitle("DepartmentInitiativeDocs").items.getById(fileId).delete();
                    } catch (err: any) {
                    }
                }
            }

            //  DELETE OLD ICONS
            if (deletedIconIds.length > 0) {
                for (const iconId of deletedIconIds) {
                    try {
                        await sp.web.lists.getByTitle("DepartmentInitiativeDocs").items.getById(iconId).delete();
                    } catch (err: any) {
                    }
                }
            }

            //  UPLOAD NEW ATTACHMENTS
            if (thumbnails.length > 0) {
                uploadedAttachmentIds = await uploadFilesToLibrary(thumbnails);
            }

            //  UPLOAD NEW ICONS
            if (Icons.length > 0) {
                uploadedIconIds = await uploadFilesToLibrary(Icons);
            }

            //  MERGE old + new attachment IDs (unique)
            let finalAttachmentIds: number[] = [
                ...existingThumbnailIds,
                ...uploadedAttachmentIds,
            ].filter((id, index, arr) => arr.indexOf(id) === index);

            const finalIconId =
                uploadedIconIds.length > 0
                    ? uploadedIconIds[0]
                    : existingIconIds[0] || null;
            // Resolve Approver (Person Field)
            const user = await sp.web.ensureUser(selectedUser);
            const userId = user?.data?.Id;
            if (!userId) {
                Swal.fire("Error", "Approver user could not be resolved!", "error");
                setLoading(false);
                return;
            }

            //  Build payload for multi lookup
            const payload: any = {
                Title: title?.trim() || "",
                Description: description?.trim() || "",
                DepartmentId: department?.value || null,
                ApproverNameId: userId,
                ThumbnailId: finalIconId ? Number(finalIconId) : null,
                AttachmentId: finalAttachmentIds.length ? finalAttachmentIds : [], //  FIXED
            };


            //  SAVE or UPDATE ITEM
            if (!!editId) {
                await sp.web.lists
                    .getByTitle("DepartmentInitiative")
                    .items.getById(editId!)
                    .update(payload);

                //  Save related hierarchy (for Edit)
                await saveHierarchyToList(editId!);

                Swal.fire("Updated successfully!", "", "success");
            } else {
                const result = await sp.web.lists
                    .getByTitle("DepartmentInitiative")
                    .items.add(payload);

                const newId = result?.data?.Id;

                // after creating the DepartmentInitiative and getting newId
                const currentUser = await sp.web.currentUser();

                await sp.web.lists.getByTitle("ApprovalHistory").items.add({
                    Title: `DI-${newId}`,
                    DepartmentInitiativeIDId: newId,
                    Status: "Pending",
                    RequestedById: currentUser.Id,
                    RequestedOn: new Date().toISOString(),
                    AssignedToId: currentUser.Id,
                    AssignedOn: new Date().toISOString(),
                    Remarks: ""                               // empty at creation
                });

                // refresh the table so the Pending row shows immediately
                await loadApprovalHistory(newId);

                //  Save related hierarchy (for New record)
                if (newId) {
                    await saveHierarchyToList(newId);
                }

                Swal.fire("Submitted successfully!", "", "success");
            }



            //  CLEANUP
            setDeletedFileIds([]);
            setDeletedIconIds([]);
            setThumbnails([]);
            setIcons([]);
            setExistingThumbnails([]);
            setExistingIcons([]);
            setSelectedUser("");

            onSave(payload);
        } catch (error: any) {
            Swal.fire("Error", "Failed to save the record.", "error");
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

        const isEdit = !!editId;

        Swal.fire({
            title: isEdit
                ? "Do you want to submit this record?"
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
                        title: isEdit ? "Submitted successfully." : "Submitted successfully.",
                        icon: "success",
                        confirmButtonText: "OK",
                        backdrop: false,
                    });
                } catch (error: any) {
                    Swal.fire({
                        title: "Error",
                        text: isEdit
                            ? "Failed to Submit record"
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



    ///////////
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };
    ////////
    const isActionAllowed = (status === "Pending");


    return (
        <>
            <div className="row">
                <div className="col-lg-4">
                    <CustomBreadcrumb Breadcrumb={Breadcrumb} />
                </div>
            </div>

            <div className="tab-content mt-0">
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
                                            readOnly={approvalMode}
                                        />
                                    </div>
                                </div>

                                <div className="col-lg-6">
                                    <div className="mb-3">
                                        <label htmlFor="simpleinput" className="form-label">
                                            Description<span className="text-danger">*</span>
                                        </label>
                                        <textarea

                                            id="Description"
                                            className="form-control"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            readOnly={approvalMode}> </textarea>
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
                                            isDisabled={approvalMode}
                                        />
                                    </div>
                                </div>

                                <div className="col-lg-6">
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Approver Name <span className="text-danger">*</span>
                                        </label>

                                        <select
                                            id="EmployeeName"
                                            className="form-control"
                                            value={selectedUser}
                                            onChange={(e) => setSelectedUser(e.target.value)}
                                            disabled={approvalMode}   >
                                            <option value="">-- Select Employee --</option>
                                            {users.map((user: any) => (
                                                <option key={user.Id} value={user.Email}>
                                                    {user.Title}
                                                </option>
                                            ))}
                                        </select>
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
                                            multiple
                                            onChange={(e) => {
                                                const inputEl = e.target as HTMLInputElement;
                                                const selectedFiles = inputEl.files ? Array.from(inputEl.files) : [];

                                                if (selectedFiles.length > 0) {
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

                                                    const validFiles = selectedFiles.filter((file) =>
                                                        allowedTypes.includes(file.type)
                                                    );

                                                    if (validFiles.length !== selectedFiles.length) {
                                                        Swal.fire({
                                                            icon: "error",
                                                            title: "Invalid File Type",
                                                            text: "Only document files are allowed (.pdf, .docx, .xlsx, .pptx, .csv).",
                                                            backdrop: false,
                                                        });
                                                        inputEl.value = "";
                                                        return;
                                                    }

                                                    //  Append new files instead of replacing
                                                    setThumbnails((prev) => [...prev, ...validFiles]);
                                                    inputEl.value = "";
                                                }
                                            }}
                                            disabled={isReadOnly}
                                        />

                                    </div>
                                </div>

                                <div className="col-lg-6">
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <label htmlFor="iconUpload" className="form-label">
                                                Thumbnail <span className="text-danger">*</span>
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
                                            disabled={isReadOnly}
                                        />

                                    </div>
                                </div>

                                <div className="col-12 text-center mt-3">
                                    {!approvalMode ? (
                                        <>
                                            {/* Normal Save/Update Buttons */}
                                            <button
                                                type="button"
                                                className="btn btn-success m-1"
                                                onClick={confirmAndSubmit}
                                            >
                                                {item?.Id ? "Update" : "Submit"}
                                            </button>
                                            <button type="button" className="btn btn-light m-1" onClick={onCancel}>
                                                <X className="me-1" size={16} />  Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            {/*  Remarks only if not APPROVED */}
                                            {/* {(status === "Pending" || status === "Rework") && ( */}
                                            {status === "Pending" && (


                                                <div className="mb-3">
                                                    <label style={{textAlign:'left',width:'100%'}} className="form-label">
                                                        Remarks
                                                        {/* Required only during Pending Reject/Rework */}
                                                        {status === "Pending" && (actionType === "Rejected" || actionType === "Rework") && (
                                                            <span className="text-danger">*</span>
                                                        )}
                                                    </label>
                                                    <textarea
                                                        id="Remarks"
                                                        className="form-control"
                                                        rows={3}
                                                        value={remarks}
                                                        onChange={(e) => setRemarks(e.target.value)}
                                                        placeholder=""




                                                    />
                                                </div>
                                            )}

                                            {/*  Buttons only in Pending state */}
                                            {/*  Only show action buttons if Pending */}
                                            {status === "Pending" && (
                                                <>
                                                    {/*  APPROVE - No Remarks */}
                                                    <button
                                                        type="button"
                                                        className="btn btn-success m-1"
                                                        onClick={() => handleApproval("Approved")}
                                                    >
                                                        Approve
                                                    </button>

                                                    {/*  REWORK - Remarks required */}
                                                    <button
                                                        type="button"
                                                        className="btn btn-warning m-1"
                                                        onClick={() => {
                                                            setActionType("Rework");
                                                            setShowRemarks(true);            //  Show remarks before popup
                                                            handleApproval("Rework");        //  Direct Popup + Validation
                                                        }}
                                                    >
                                                        Rework
                                                    </button>

                                                    {/*  REJECT - Remarks required */}
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger m-1"
                                                        onClick={() => {
                                                            setActionType("Rejected");
                                                            setShowRemarks(true);            //  Show remarks before popup
                                                            handleApproval("Rejected");      //  Direct Popup + Validation
                                                        }}
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}

                                            {/* Cancel always visible */}
                                            <button type="button" className="btn btn-light m-1" onClick={onCancel}
                                            >
                                                <X className="me-1" size={16} /> Cancel
                                            </button>
                                        </>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>



                    {/* ======================================================
 🧩 ADD SECTION HIERARCHY CARD
 This block appears below the main form
====================================================== */}
                    <div className="card mt-0">
                        <div className="card-body">
                            <h5 className="fw-bold mb-3">Add Section Hierarchy</h5>

                            {/* Add new Main Section */}
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="fw-bold">Main Section</span>
                                {!approvalMode && (
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-sm"
                                        onClick={addMainSection}
                                    >
                                        + Add
                                    </button>
                                )}
                            </div>

                            {/* Display all hierarchy levels */}
                            {sectionHierarchy.length > 0 ? (
                                sectionHierarchy.map((section) => (
                                    <RenderSection key={section.id} section={section} />
                                ))
                            ) : (
                                <p className="text-muted"></p>
                            )}
                        </div>
                    </div>


                    {/* AUDIT HISTORY*/}
                    <div className="card mt-0">
                        <div className="card-body">
                            <h5 className="fw-bold mb-3">Audit History</h5>
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped table-sm">
                                    <thead style={{ background: "#eef6f7" }}>
                                        <tr>
                                            <th style={{ width: 70 }}>S.No.</th>
                                            <th>Assigned To</th>
                                            <th>Requested By</th>
                                            <th>Requested On</th>
                                            <th>Action Taken By</th>
                                            <th>Action Taken On</th>
                                            <th>Remarks</th>
                                            <th style={{ width: 120 }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {approvalHistory && approvalHistory.length > 0 ? (
                                            approvalHistory.map((row: any, idx: number) => (
                                                <tr key={row.Id ?? idx}>
                                                    <td>{idx + 1}</td>
                                                    <td>{row?.AssignedTo?.Title || ""}</td>
                                                    <td>{row?.RequestedBy?.Title || ""}</td>
                                                    <td>{formatDate(row?.RequestedOn)}</td>
                                                    <td>{row?.ApprovedBy?.Title || ""}</td>
                                                    <td>{formatDate(row?.ApprovedOn)}</td>
                                                    <td>{row?.Remarks || ""}</td>
                                                    <td>
                                                        <span
                                                            className={
                                                                "badge " +
                                                                (row?.Status === "Approved"
                                                                    ? "bg-success"
                                                                    : row?.Status === "Rejected"
                                                                        ? "bg-danger"
                                                                        : row?.Status === "Rework"
                                                                            ? "bg-warning text-dark"
                                                                            : "bg-secondary")
                                                            }
                                                        >
                                                            {row?.Status || "-"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="text-center text-muted">
                                                    No audit history available.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
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
                                            //  Remove from new upload list
                                            setThumbnails((prev) => prev.filter((f) => f.name !== file.name));
                                        } else {
                                            //  Remove from existing attachment list
                                            setExistingThumbnails((prev) => prev.filter((f) => f.id !== file.id));
                                            setExistingThumbnailIds((prev) => prev.filter((id) => id !== file.id));
                                            setDeletedFileIds((prev) => [...prev, file.id]);
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
                                                {/* {(!approvalMode || status === "Rework") && ( */}
                                                {(!approvalMode && status === "Pending") && (


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
                                                )}
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
                            Below are the attached thumbnail files
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
                                            {/* {(!approvalMode || status === "Rework") && ( */}
                                            {(!approvalMode && status === "Pending") && (


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
                                            )}
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

export default MyApprovalsForm;
