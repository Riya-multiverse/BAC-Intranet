import * as React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
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
  isCollapsed?: boolean;
}
const Breadcrumb = [
  { MainComponent: "Settings", MainComponentURl: "Settings" },
  {
    MainComponent: "Department Initiative ",
    MainComponentURl: "DepartmentInitiativeMaster",
  },
];

const DepartmentInitiativeForm = ({
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
  const [approvalHistory, setApprovalHistory] = React.useState<any[]>([]);
  const [isReworkMode, setIsReworkMode] = React.useState(false);
  const [status, setStatus] = React.useState<string>("Pending");
  const [isFormDisabled, setIsFormDisabled] = React.useState<boolean>(false);




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

//  const openFile = (fileObj: any, action: "Open" | "Download") => {
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
      if (!item || !item.Id) return;
      setLoading(true);

      try {


        //  Fetch main item details (IDs only)
        const listItem = await sp.web.lists
          .getByTitle("DepartmentInitiative")
          .items.getById(item.Id)
          .select(
            "Id",
            "Title",
            "Description",
            "Department/Id",
            "Department/DepartmentName",
            "ApproverName/Id",
            "ApproverName/Title",
            "ApproverName/EMail",
            "Attachment/Id",
            "Thumbnail/Id"
          )
          .expand("Department", "ApproverName", "Attachment", "Thumbnail")();


        // Prefill text fields
        setTitle(listItem.Title || "");
        setDescription(listItem.Description || "");
        //  Department mapping logic
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
        ///////////////////////////////
        await loadHierarchyFromList(listItem.Id);
        //  Prefill Approver (Person Field)
        if (listItem.ApproverName && listItem.ApproverName.EMail) {

          setSelectedUser(listItem.ApproverName.EMail);
        } else {

          setSelectedUser("");
        }


        // Prefill Attachment file
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

        //  Prefill Thumbnail file 
        if (listItem.Thumbnail && listItem.Thumbnail.Id) {
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

        await loadApprovalHistory(listItem.Id);

        if (approvalHistory.length > 0) {
          const latest = approvalHistory[0];

          if (latest.Status === "Rework") {
            setIsReworkMode(true);
          } else {
            setIsReworkMode(false);
          }
        }

      } catch (err: any) {

        Swal.fire("Error", "Failed to load item details. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    };

    if (item && item.Id) {
      fetchExistingData();
      loadApprovalHistory(item.Id);
      loadLatestStatus(item.Id);
    }
    else {
      // Reset form if new
      setTitle("");
      setDescription("");
      setSelectedUser("");
      setDepartment(null);
      setExistingThumbnails([]);
      setExistingThumbnailIds([]);
      setExistingIcons([]);
      setExistingIconIds([]);

      setSectionHierarchy([
        {
          id: crypto.randomUUID(),
          title: "",
          description: "",
          children: [],
          isCollapsed: false,
        },
      ]);

    }
  }, [item, departments]);


  React.useEffect(() => {
    if (!approvalHistory || approvalHistory.length === 0) return;

    const latest = approvalHistory[0];
    const latestStatus = latest?.Status || "";


    setIsReworkMode(latestStatus === "Rework");
  }, [approvalHistory]);


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
      .orderBy("Id", true)


      .getAll();

    setApprovalHistory(items);
  };

  // Fetch only latest status for disable logic
  const loadLatestStatus = async (departmentInitiativeId: number) => {
    const latest = await sp.web.lists
      .getByTitle("ApprovalHistory")
      .items.filter(`DepartmentInitiativeIDId eq ${departmentInitiativeId}`)
      .select("Id", "Status")
      .orderBy("Id", false)();

    if (latest.length > 0) {
      const latestStatus = latest[0].Status;
      setStatus(latestStatus);
      setIsReworkMode(latestStatus === "Rework");

      //  Disable form when fully approved/rejected
      setIsFormDisabled(
        latestStatus === "Approved" ||
        latestStatus === "Rejected"
      );
    }
  };

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

    // Section Hierarchy validation (LEAF descriptions)
    const leafCheck = validateLeafNodes(sectionHierarchy);

    if (!leafCheck.ok) {
      isValid = false;
    }

    //  Scroll to first highlighted error
    const firstInvalid = document.querySelector(".border-on-error");
    firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });

    //Show popup if any missing
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




  //  SECTION HIERARCHY LOGIC FUNCTIONS
  // Add a new main section (root level)
  const addMainSection = () => {
    setSectionHierarchy((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: "", description: "", children: [] },
    ]);
  };


  //  FIXED DEPTH LOGIC + CONFIGURABLE CHILD LIMIT (root=0)
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




  //  Update only the changed section 
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

        return changed ? newNodes : nodes;
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




  //  FIXED: SAVE SECTION HIERARCHY TO SHAREPOINT (with correct parent-child linking)
  const saveHierarchyToList = async (departmentInitiativeId: number) => {
    const sp = getSP();

    //  Delete removed sections from SharePoint
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

    // 1️ Flatten hierarchy but preserve local id-to-parent linkage
    const flattenHierarchy = (
      nodes: Section[],
      parentLocalId: string | null = null
    ): any[] => {
      const items: any[] = [];
      for (const n of nodes) {
        items.push({
          localId: n.id, // local (UI) id
          spId: n.spId || null, // SharePoint id if exists
          title: n.title || "",
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
          idMap[node.localId] = node.spId;
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

    // Fetch all nodes for this main record
    const items = await sp.web.lists
      .getByTitle("DepartmentInitiativeDetails")
      .items.filter(`DepartmentInitiativeIDId eq ${departmentInitiativeId}`)
      .select("Id", "Title", "Description", "DepartmentInitiativeDetailsID/Id")
      .expand("DepartmentInitiativeDetailsID")();

    //Build a tree from flat list
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


  //  Recursive Component 
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
                readOnly={isFormDisabled}
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
                readOnly={isFormDisabled}
              />
            </div>

            <div className="ms-2 d-flex flex-column">
              {/* Collapse / Expand — always visible */}
              <button
                className="btn btn-sm btn-outline-secondary mb-1"
                title="Collapse / Expand"
                onClick={() => toggleCollapse(section.id)}
              >
                {section.isCollapsed ? "▶" : "▼"}
              </button>

              {/* + / Delete only in NEW or REWORK */}
              {!isFormDisabled && level < MAX_DEPTH && (
                <button
                  className="btn btn-sm btn-outline-success mb-1"
                  title="Add Subsection"
                  onClick={() => addChildSection(section.id)}
                >
                  <PlusCircle className="me-1" size={18} />
                </button>
              )}

              {/* Delete allowed at ANY level when editable */}
              {!isFormDisabled && (
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



  /////////////////////////////
  // Validate: Leaf nodes must have BOTH title & description
 const validateLeafNodes = (nodes: Section[]): { ok: boolean; errors: string[] } => {
    const errors: string[] = [];
    let lastLeaf: Section | null = null;

    const findLastLeaf = (node: Section) => {
        if (node.children.length === 0) {
            lastLeaf = node; // overwrite => last one in traversal
        } else {
            node.children.forEach(findLastLeaf);
        }
    };

    // ✅ First pass — find last leaf node
    nodes.forEach(findLastLeaf);

    const validateNode = (node: Section) => {
        const isLeaf = node.children.length === 0;

        if (isLeaf) {
            if (node === lastLeaf) {
                // ✅ Last Leaf → Title + Description required
                if (!node.title?.trim()) {
                    errors.push("Last leaf Title required");
                    document.getElementById(`title-${node.id}`)?.classList.add("border-on-error");
                }
                if (!node.description?.trim()) {
                    errors.push("Last leaf Description required");
                    document.getElementById(`desc-${node.id}`)?.classList.add("border-on-error");
                }
            } else {
                // ✅ Other leaf → Only Title required
                if (!node.title?.trim()) {
                    errors.push("Leaf Title required");
                    document.getElementById(`title-${node.id}`)?.classList.add("border-on-error");
                }
            }
        } 
        else {
            // ✅ Parent → Only Title required
            if (!node.title?.trim()) {
                errors.push("Parent Title required");
                document.getElementById(`title-${node.id}`)?.classList.add("border-on-error");
            }
        }

        node.children.forEach(validateNode);
    };

    nodes.forEach(validateNode);

    return { ok: errors.length === 0, errors };
};




  ////////////////////////////////



  const getCurrentUserId = async () => {
    const current = await sp.web.currentUser();
    return current.Id;
  };

  //  Enhanced handleSubmit with deep debugging
  const handleSubmit = async () => {
    setLoading(true);
    // Validate leaf descriptions
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

      // DELETE OLD ATTACHMENTS
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

      // Build payload for multi lookup
      const payload: any = {
        Title: title?.trim() || "",
        Description: description?.trim() || "",
        DepartmentId: department?.value || null,
        ApproverNameId: userId,
        ThumbnailId: finalIconId ? Number(finalIconId) : null,
        AttachmentId: finalAttachmentIds.length ? finalAttachmentIds : [], //  FIXED
      };

      // SAVE or UPDATE ITEM
      if (item && item.Id) {
        await sp.web.lists
          .getByTitle("DepartmentInitiative")
          .items.getById(item.Id)
          .update(payload);

        // Save related hierarchy (for Edit)
        await saveHierarchyToList(item.Id);
        if (isReworkMode) {
          const currentUser = await sp.web.currentUser();
          const assignedToId = userId ?? (await sp.web.ensureUser(selectedUser)).data?.Id;
          await sp.web.lists.getByTitle("ApprovalHistory").items.add({
            Title: title?.trim(),
            DepartmentInitiativeIDId: item.Id,
            Status: "Pending",
            AssignedToId: userId,
            AssignedOn: new Date(),
            RequestedById: currentUser.Id,
            RequestedOn: new Date(),
            ApprovedById: null,
            ApprovedOn: null,
            Remarks: ""
          });

          //  Reload Audit History table
          await loadApprovalHistory(item.Id);
        }
        setIsReworkMode(false);

        Swal.fire("Updated successfully!", "", "success");
      } else {
        const result = await sp.web.lists
          .getByTitle("DepartmentInitiative")
          .items.add(payload);

        const newId = result?.data?.Id;
        //Save related hierarchy (for New record)
        if (newId) {

          const currentUserId = await getCurrentUserId();

          await sp.web.lists.getByTitle("ApprovalHistory").items.add({
            Title: title?.trim(),
            DepartmentInitiativeIDId: newId,
            Status: "Pending",
            AssignedToId: userId,
            AssignedOn: new Date(),
            RequestedById: currentUserId,
            RequestedOn: new Date(),
            ApprovedById: null,
            ApprovedOn: null,
            Remarks: ""
          });
          await loadApprovalHistory(newId);
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

    const isEdit = item && item.Id;

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
          if (item && item.Id) {
            await loadApprovalHistory(item.Id);
            await loadLatestStatus(item.Id);
          }
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
              ? "Failed to submit record"
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




  /////////////////
  const isReadOnly = !!(item?.Id) && !isReworkMode;


  /////////////
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
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
                      readOnly={isFormDisabled}
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
                      readOnly={isFormDisabled}
                    > </textarea>
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
                      isdisabled={isFormDisabled}
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
                      disabled={isFormDisabled}
                    >
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
                      disabled={isFormDisabled}
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
                      disabled={isFormDisabled}
                    />
                  </div>
                </div>

                <div className="col-12 text-center mt-3">
                
                  {/*  Show Submit button => Only New OR Rework */}
                  {(!item?.Id || status === "Rework") && (
                    <button
                      type="button"
                      className="btn btn-success waves-effect waves-light m-1"
                      onClick={confirmAndSubmit}
                    >
                      <CheckCircle className="me-1" size={16} />
                      Submit
                    </button>
                  )}

                  {/*  Cancel always visible */}
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



          {/* ADD SECTION HIERARCHY CARD*/}
          <div className="card mt-4">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Add Section Hierarchy</h5>

              {/* Add new Main Section */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-bold">Main Section</span>

                {!isFormDisabled && (
                  <button type="button" className="btn btn-primary btn-sm" onClick={addMainSection}>
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



          {/*  AUDIT HISTORY — LAST SECTION */}
          <div className="card mt-4">
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
                              {row?.Status || ""}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        {/* <td colSpan={7} className="text-center text-muted">
                No audit history available.
              </td> */}
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
                        {(status === "Rework" || !item?.Id) && (

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
                        onClick={() => openFile(file, "Open")}
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
                      {(status === "Rework" || !item?.Id) && (

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

export default DepartmentInitiativeForm;
