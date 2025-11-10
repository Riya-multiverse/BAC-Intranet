import * as  React from 'react'
import { Modal } from 'react-bootstrap'
import CustomBreadcrumb from '../../common/CustomBreadcrumb';
import { Calendar, Copy, Share2 } from 'react-feather';
import * as moment from 'moment';
import { getSP } from '../../../loc/pnpjsConfig';
import { SPFI } from '@pnp/sp';
import Swal from 'sweetalert2';

import { useLocation } from 'react-router-dom';
import { APP_URL } from '../../../../../Shared/Constant';
import { useNavigate } from "react-router-dom";
import FileViewer from "../../common/FileViewerNew";
import { FileText, File, Image as ImageIcon } from "react-feather";
import { ChevronDown, ChevronUp } from "react-feather";


const NewsInternal = () => {
    const navigate = useNavigate();
    const sp: SPFI = getSP();
    const location = useLocation();
    // const [currentUser, setCurrentUser] = React.useState<any>(null);
    const [showModal, setShowModal] = React.useState(false);
    const [selectedIndex, setSelectedIndex] = React.useState<number>(0);
    // const [comments, setComments] = React.useState<any[]>([]);
    // const [liked, setLiked] = React.useState(false);
    // const [commentText, setCommentText] = React.useState("");
    const [item, setEditItem] = React.useState<any>(null);
    // const [images, setImages] = React.useState<any[]>([]);        // documents
    const [details, setDetails] = React.useState<any[]>([]);      // hierarchy rows
    const [attachments, setAttachments] = React.useState<any[]>([]);
    const [showModalTemplateDoc, setShowModalTemplateDoc] = React.useState(false);
    const [showFileViewer, setShowFileViewer] = React.useState(false);
    const [selectedFileUrl, setSelectedFileUrl] = React.useState<string | null>(null);
    const [treeHierarchy, setTreeHierarchy] = React.useState<any[]>([]);
    const [collapsed, setCollapsed] = React.useState(false);
    const [Loading, setLoading] = React.useState(true);



    const Breadcrumb = [

        {

            "MainComponent": "Department Initiatives",

            "MainComponentURl": "DepartmentInitiatives",


        }, {

            "MainComponent": "Department Initiative Details",

            "MainComponentURl": "DepartmentInitiativeDetails",


        }

    ];

    React.useEffect(() => {
        if (!showModal || attachments.length === 0) return;

        const interval = setInterval(() => {
            setSelectedIndex((prev) =>
                prev === attachments.length - 1 ? 0 : prev + 1
            );
        }, 3000);

        return () => clearInterval(interval);
    }, [showModal, attachments.length]);


  


    React.useEffect(() => {
  const loadData = async () => {
    setLoading(true); //  Start Loader

    const savedItem = sessionStorage.getItem("selectedInitiativeItem");
    const show = sessionStorage.getItem("showInitiativeDetails") === "true";

    if (!savedItem || !show) {
      navigate("/DepartmentInitiative");
      return;
    }

    const parsed = JSON.parse(savedItem);
    parsed.attachmentIds = parsed.attachmentIds || [];
    setEditItem(parsed);

    try {
      if (parsed.attachmentIds.length > 0) {
        const docs = await getDocumentLinkByID(parsed.attachmentIds);
        setAttachments(docs);
      }

      if (parsed.id) {
        await loadHierarchy(parsed.id);
        await loadInitiativeItem(parsed.id);
      }
    } finally {
      setLoading(false); //  Stop Loader
    }
  };

  loadData();
}, []);




    const loadInitiativeItem = async (id: number) => {
        try {
            const item = await sp.web.lists
                .getByTitle("DepartmentInitiative")
                .items.getById(id)
                .select(
                    "Id",
                    "Title",
                    "Description",
                    "Created",
                    "Department/Id",
                    "Department/DepartmentName",
                    "Attachment/Id"
                )
                .expand("Department,Attachment")();

            const attachmentIds = Array.isArray(item.Attachment)
                ? item.Attachment.map((a: any) => a.Id)
                : [];


            const formattedItem = {
                id: item.Id,
                title: item.Title || "",
                description: item.Description || "",
                created: item.Created || "",

                department: item.Department?.DepartmentName || "",
                departmentId: item.Department?.Id || null,
                attachmentIds,
            };

            setEditItem(formattedItem); //  Set into state
        } catch (err) {
            console.error("Error loading initiative:", err);
            setEditItem(null);
        }
    };


    const getDocumentLinkByID = async (AttachmentIds: number[]) => {
        if (!AttachmentIds || AttachmentIds.length === 0) return [];

        try {
            const results = await Promise.all(
                AttachmentIds.map(async (id) => {
                    return await sp.web.lists
                        .getByTitle("DepartmentInitiativeDocs")
                        .items.getById(id)
                        .select("FileRef,FileLeafRef")();
                })
            );


            return results.map((d: any) => {
                const originalName = d.FileLeafRef;

                let cleanName = originalName
                    .replace(/^\d{8}_\d{6}_/, "")
                    .replace(/_/g, " ")
                    .trim();
                return {
                    name: cleanName,
                    url: `${window.location.origin}${d.FileRef}`,
                    originalName
                };
            });


        } catch (error) {
            console.error("Error fetching documents:", error);
            return [];
        }
    };

    const loadHierarchy = async (parentId: number) => {
        try {
            const rows = await sp.web.lists
                .getByTitle("DepartmentInitiativeDetails")
                .items.select(
                    "Id",
                    "Title",
                    "Description",
                    "DepartmentInitiativeID/Id",
                    "DepartmentInitiativeDetailsID/Id"
                )
                .expand("DepartmentInitiativeID,DepartmentInitiativeDetailsID")
                .filter(`DepartmentInitiativeID/Id eq ${parentId}`)
                .orderBy("Id", true)();

            setDetails(rows);


        } catch (err) {
            console.error("Error loading hierarchy:", err);
        }
    };
  React.useEffect(() => {
  if (details.length > 0) {
    const tree = buildHierarchy(true, false);
    setTreeHierarchy(tree); //  UPDATE STATE
  } else {
    setTreeHierarchy([]); //  reset if no items
  }
}, [details]);




   
    const handleFileClick = (fileUrl: string) => {
        if (!fileUrl) return;

        let fullFileUrl = fileUrl.startsWith("/")
            ? `${window.location.origin}${fileUrl}`
            : fileUrl;

        let viewUrl = fullFileUrl.toLowerCase();

        //  Office files: open in SharePoint’s internal viewer
        if (
            viewUrl.endsWith(".xlsx") ||
            viewUrl.endsWith(".xls") ||
            viewUrl.endsWith(".docx") ||
            viewUrl.endsWith(".doc") ||
            viewUrl.endsWith(".pptx") ||
            viewUrl.endsWith(".ppt")
        ) {
            viewUrl = `${fullFileUrl}?web=1`;
        }

        //  PDFs directly
        else if (viewUrl.endsWith(".pdf")) {
            viewUrl = fullFileUrl;
        }

        //  Images directly
        else if (
            viewUrl.endsWith(".png") ||
            viewUrl.endsWith(".jpg") ||
            viewUrl.endsWith(".jpeg") ||
            viewUrl.endsWith(".gif")
        ) {
            viewUrl = fullFileUrl;
        }

        console.log("Opening File URL:", viewUrl);

        setSelectedFileUrl(viewUrl);
        setShowFileViewer(true);
        setShowModalTemplateDoc(true);
    };

    const cancelModalAction = () => {
        setShowFileViewer(false);
        setShowModalTemplateDoc(false);
    };


    //  Convert flat details (SharePoint list) into a nested hierarchy like MyApprovalsForm
   // collapsedByDefault: true = everything collapsed
// expandRootOnly: true  = roots open, children collapsed
const buildHierarchy = (
  collapsedByDefault: boolean = true,
  expandRootOnly: boolean = false
) => {
  const map: Record<number, any> = {};
  const roots: any[] = [];

  //  Create nodes map
  details.forEach((item: any) => {
    map[item.Id] = {
      id: item.Id,
      title: item.Title || "",
      description: item.Description || "",
      children: [],
      isCollapsed: collapsedByDefault,   
    };
  });

  //  Link children
  details.forEach((item: any) => {
    const parentId = item?.DepartmentInitiativeDetailsID?.Id;
    if (parentId && map[parentId]) {
      map[parentId].children.push(map[item.Id]);
    } else {
      roots.push(map[item.Id]);
    }
  });

  // Optionally expand only root level
  if (expandRootOnly) {
    roots.forEach((r) => (r.isCollapsed = false));
  }

  return roots;
};


    const sectionHierarchy = treeHierarchy;




    const toggleCollapse = (id: number) => {
        const updateNodes = (nodes: any[]): any[] =>
            nodes.map((n) => {
                if (n.id === id) {
                    return { ...n, isCollapsed: !n.isCollapsed };
                }
                if (n.children?.length > 0) {
                    return { ...n, children: updateNodes(n.children) };
                }
                return n;
            });

        setTreeHierarchy((prev) => updateNodes(prev));
    };


  const RenderSection = ({ section, level = 1 }: { section: any; level?: number }) => {
  const hasChildren = section.children?.length > 0;
  const isOpen = !section.isCollapsed;

  return (
    <div
      className="mb-2"
      style={{ marginLeft: `${(level - 1) * 12}px` }}
    >
      {/* --- Title Row --- */}
      <div
        className="d-flex justify-content-between align-items-center p-2 bg-light border rounded"
        style={{ cursor: "pointer" }}
        onClick={() => toggleCollapse(section.id)}
      >
        <span className="fw-bold" style={{ fontSize: "15px" }}>
          {section.title || ""}
        </span>

        {/*  Chevron Icons */}
        {isOpen ? (
          <ChevronUp size={18} />
        ) : (
          <ChevronDown size={18} />
        )}
      </div>

      {/* --- Expanded Content Area --- */}
      {isOpen && (
        <div className="ps-3 pt-2 pb-2 border-start">
          {/*  Description Full Width */}
          {section.description && (
            <textarea
  className="form-control mb-2"
  rows={2}
  value={section.description}
  readOnly  
/>
          )}

          {/*  Child Sections (Horizontal Accordion continues) */}
          {hasChildren &&
            section.children.map((child: any) => (
              <RenderSection
                key={child.id}
                section={child}
                level={level + 1}
              />
            ))}
        </div>
      )}
    </div>
  );
};


if (Loading) {
  return (
    <div className="d-flex justify-content-center mt-5">
      <div className="loadernewadd mt-10 text-center">
        <img
          src={require("../../../assets/BAC_loader.gif")}
          className="alignrightl"
          alt="Loading..."
        />
        <span className="d-block mt-2 fw-bold">Loading...</span>
      </div>
    </div>
  );
}

if (!item) {


  
        return (
            <>
                <div className="row">
                    <div className="col-lg-2">

                        <CustomBreadcrumb Breadcrumb={Breadcrumb} />
                    </div>



                </div>
                <div className="text-center mt-5">
                    <h5 className="text-danger">No such news found.</h5>
                    <p>Please check the link or go back to the News list.</p>
                </div>
            </>

        );
    }
    else {
        return (
            <>
                <div className="row">
                    <div className="col-lg-2">

                        <CustomBreadcrumb Breadcrumb={Breadcrumb} />
                    </div>



                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="row mt-2">
                            <div className="col-lg-12">
                                <h4 className="page-title fw-700 mb-1 pe-5 font-28">
                                    {item?.title}
                                </h4>
                            </div>

                            <div className="row mt-2">
                                <div className="col-md-12 col-xl-12">
                                    <p className="mb-2 mt-1 d-block">
                                        <span className="pe-2 text-nowrap mb-0 d-inline-block">
                                            <Calendar className="fe-calendar" />{" "}
                                            {item?.created ? moment.utc(item.created).local().format("DD MMM YYYY") : ""}
                                            &nbsp; &nbsp; &nbsp;|&nbsp; &nbsp;
                                        </span>
                                        <span style={{ color: "#009157", fontWeight: 600 }} className="text-nowrap mb-0 d-inline-block">
                                            {item?.department}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="row mt-1">
                            <p className="d-block text-muted mt-2 font-14">{item?.description}</p>
                        </div>


                      <div className="row mt-4">

                            {/* LEFT PANEL: DOCUMENTS */}
                            <div className="col-lg-4 col-md-12">

                                <div className="card">
                                    <div className="card-body">
                                        <h5 className="fw-bold mb-3">Documents</h5>

                                        <div className="row internalmedia filterable-content">
                                            {attachments.length > 0 ? (
                                                attachments.map((file, index) => {
                                                    const lower = file.name.toLowerCase();
                                                    const isImage =
                                                        lower.endsWith(".png") ||
                                                        lower.endsWith(".jpg") ||
                                                        lower.endsWith(".jpeg") ||
                                                        lower.endsWith(".gif");

                                                    const isOffice =
                                                        lower.endsWith(".xlsx") ||
                                                        lower.endsWith(".xls") ||
                                                        lower.endsWith(".docx") ||
                                                        lower.endsWith(".doc") ||
                                                        lower.endsWith(".pptx") ||
                                                        lower.endsWith(".ppt");

                                                    const isPDF = lower.endsWith(".pdf");

                                                    return (
                                                        <div key={index} className="col-12 mb-2">
                                                            <div className="d-flex align-items-center gap-2">

                                                                {isImage && <ImageIcon size={18} color="#6c757d" />}
                                                                {isPDF && <FileText size={18} color="#6c757d" />}
                                                                {isOffice && <FileText size={18} color="#6c757d" />}
                                                                {!isImage && !isPDF && !isOffice && <File size={18} color="#6c757d" />}

                                                                <span
                                                                    className="text-dark font-13 text-truncate"
                                                                    style={{ cursor: "pointer", fontWeight: 600 }}
                                                                    onClick={() => handleFileClick(file.url)}
                                                                    title={file.name}
                                                                >
                                                                    {file.name}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <p className="text-muted">No documents available.</p>
                                            )}
                                        </div>

                                    </div>
                                </div>

                            </div>

                            {/* HIERARCHY */}
                            <div className="col-lg-8 col-md-12">

                                <div className="card">
                                    <div className="card-body">
                                        <h5 className="fw-bold mb-3">Section Hierarchy</h5>

                                        {sectionHierarchy.length > 0 ? (
                                            sectionHierarchy.map((section) => (
                                                <RenderSection key={section.id} section={section} />
                                            ))
                                        ) : (
                                            <p className="text-muted">No hierarchy items found.</p>
                                        )}
                                    </div>
                                </div>

                            </div>

                        </div>




                    </div>
                </div>




                {/* === File Viewer Modal === */}
                <Modal
                    show={showModalTemplateDoc}
                    onHide={() => setShowModalTemplateDoc(false)}
                    size={showFileViewer ? "xl" : "lg"}
                    className="newmobmodal"
                    centered
                >
                    <Modal.Body id="style-5">
                        {showFileViewer && (
                            <FileViewer
                                showfile={showFileViewer}
                                docurl={selectedFileUrl || undefined}
                                cancelAction={cancelModalAction}
                            />
                        )}
                    </Modal.Body>
                </Modal>

            </>
        )
    }


}

export default NewsInternal
