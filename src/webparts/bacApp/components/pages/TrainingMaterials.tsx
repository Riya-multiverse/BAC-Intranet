import * as React from "react";
//import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../../../../styles/global.scss";
import { SPFI } from "@pnp/sp";
import { getSP } from "../../loc/pnpjsConfig";
import { useEffect, useState } from "react";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/items/get-all";
import FileViewer from "../common/FileViewerNew";
import { Modal } from "react-bootstrap";
import CustomBreadcrumb from "../common/CustomBreadcrumb";

const Breadcrumb = [
    {
        MainComponent: "Home",

        MainComponentURl: "Home",
    },

    {
        MainComponent: "Training Materials",

        MainComponentURl: "TrainingMaterials",
    },
];

const TrainingMaterials = () => {
    const [trainingData, setTrainingData] = useState<any[]>([]);
    const [showFileViewer, setShowFileViewer] = useState(false);
    const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
    const [showModalTemplateDoc, setShowModalTemplateDoc] = useState(false);
    const [loading, setLoading] = React.useState<boolean>(false);

    useEffect(() => {
        const fetchTrainingData = async () => {
            setLoading(true);
            try {
                const sp: SPFI = getSP();

                // Step 1: Get items from TrainingMaterials list
                const items = await sp.web.lists
                    .getByTitle("TrainingMaterials")
                    .items.select(
                        "Title",
                        "Department/DepartmentName",
                        "TrainingMaterialsID/ID",
                        "TrainingMaterialsID/Title",
                        "PublishedBy/ID",
                        "PublishedBy/Title",
                        "PublishedBy/EMail"
                    )
                    .expand("Department", "TrainingMaterialsID", "PublishedBy")
                    .getAll();

                // Step 2: For each item, fetch the document details from TrainingMaterialsDocs library
                const enrichedItems = await Promise.all(
                    items.map(async (item: any) => {
                        let fileInfo = null;

                        const relatedDocId =
                            item.TrainingMaterialsID?.ID ||
                            item.TrainingMaterialsIDId ||
                            item.TrainingMaterialsID?.Id ||
                            item.TrainingMaterialsID;

                        if (relatedDocId && typeof relatedDocId === "number") {
                            try {
                                fileInfo = await sp.web.lists
                                    .getByTitle("TrainingMaterialsDocs")
                                    .items.getById(relatedDocId)
                                    .select("FileLeafRef", "FileRef")
                                    .expand("File")();
                            } catch (err) { }
                        } else {
                            console.warn("Invalid TrainingMaterialsID ");
                        }

                        return {
                            ...item,
                            FileLeafRef: fileInfo?.FileLeafRef || "",
                            FileRef: fileInfo?.FileRef || "",
                        };
                    })
                );

                setTrainingData(enrichedItems);
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };

        fetchTrainingData();
    }, []);

    // Helper function: Get custom icon based on file type
    const getFileIcon = (fileName: string) => {
        const ext = fileName.split(".").pop()?.toLowerCase() || "";

        switch (ext) {
            case "pdf":
                return require("../../assets/pdf2.png");
            case "doc":
            case "docx":
                return require("../../assets/Group_16811.png");
            case "ppt":
            case "pptx":
                return require("../../assets/Group_16812.png");
            case "xls":
            case "xlsx":
                return require("../../assets/xlsx.png");
            case "png":
            case "jpg":
            case "jpeg":
            case "gif":
                return require("../../assets/img.png");
            default:
            // return require("../../assets/file-icon.png");
        }
    };

    // File click logic (integrated with Office Viewer and modal)
    const handleFileClick = (fileUrl: string) => {
        if (!fileUrl) return;

        // Ensure absolute SharePoint URL
        let fullFileUrl = fileUrl;
        if (fileUrl.startsWith("/")) {
            fullFileUrl = `${window.location.origin}${fileUrl}`;
        }

        let viewUrl = fullFileUrl;
        const lowerUrl = fullFileUrl.toLowerCase();

        // Office files → open via Office viewer
        if (
            lowerUrl.endsWith(".xlsx") ||
            lowerUrl.endsWith(".xls") ||
            lowerUrl.endsWith(".docx") ||
            lowerUrl.endsWith(".doc") ||
            lowerUrl.endsWith(".pptx") ||
            lowerUrl.endsWith(".ppt")
        ) {
            // Use internal SharePoint viewer instead of external Office viewer
            viewUrl = `${fullFileUrl}?web=1`;
        }

        // PDFs render directly
        else if (lowerUrl.endsWith(".pdf")) {
            viewUrl = fullFileUrl;
        }

        // Images render directly
        else if (
            lowerUrl.endsWith(".png") ||
            lowerUrl.endsWith(".jpg") ||
            lowerUrl.endsWith(".jpeg") ||
            lowerUrl.endsWith(".gif")
        ) {
            viewUrl = fullFileUrl;
        }

        setSelectedFileUrl(viewUrl);
        setShowFileViewer(true);
        setShowModalTemplateDoc(true);
    };

    const cancelModalAction = () => {
        setShowFileViewer(false);
        setShowModalTemplateDoc(false);
    };

    return (
        <div className="row">
            <div className="col-xl-12 col-lg-12">
                <div className="row">
                    <div className="col-lg-12">
                        {/* <h4 className="page-title fw-bold mb-1 font-20">Training Materials</h4>
            <ol className="breadcrumb m-0">
              <li className="breadcrumb-item"><a href="javascript:void(0)">Home</a></li>
              <li className="breadcrumb-item"> <span className="fe-chevron-right"></span></li>
              <li className="breadcrumb-item active">Training Materials</li>
            </ol> */}
                        <CustomBreadcrumb Breadcrumb={Breadcrumb} />
                    </div>

                    <div
                        style={{ float: "left", width: "100%" }}
                        className="desknewview mt-3"
                    >
                        <div className="pb-0">
                            {loading ? (
                                // Loader shown while fetching
                                <div className="loadernewadd mt-10">
                                    <div>
                                        <img
                                            src={require("../../assets/BAC_loader.gif")}
                                            className="alignrightl"
                                            alt="Loading..."
                                        />
                                    </div>
                                    <span>Loading </span>{" "}
                                    <span>
                                        <img
                                            src={require("../../assets/edcnew.gif")}
                                            className="alignrightl"
                                            alt="Loading..."
                                        />
                                    </span>
                                </div>
                            ) : (
                                <div className="row internalmedia1 filterable-content mt-2">
                                    {trainingData.map((item, index) => (
                                        <div
                                            key={index}
                                            className="col-sm-6 col-xl-3 filter-item all web illustrator"
                                        >
                                            <div className="gal-box">
                                                <div
                                                    className="image-popup"
                                                    title={item.Title}
                                                    onClick={() => handleFileClick(item.FileRef)}
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    <div className="newbg">
                                                        {(() => {
                                                            const fileName =
                                                                item.FileLeafRef?.toLowerCase() || "";
                                                            const fileIcon = getFileIcon(fileName);

                                                            // Handle Videos
                                                            if (
                                                                fileName.endsWith(".mp4") ||
                                                                fileName.endsWith(".mov") ||
                                                                fileName.endsWith(".avi")
                                                            ) {
                                                                return (
                                                                    <img
                                                                        src={require("../../assets/Leader-Speak-video-icon.png")}
                                                                        alt="video-file-icon"
                                                                    />
                                                                );
                                                            }

                                                            // Handle Images
                                                            if (
                                                                fileName.endsWith(".png") ||
                                                                fileName.endsWith(".jpg") ||
                                                                fileName.endsWith(".jpeg") ||
                                                                fileName.endsWith(".gif")
                                                            ) {
                                                                return (
                                                                    <img
                                                                        src={require("../../assets/img.png")}
                                                                        alt="image-file-icon"
                                                                    />
                                                                );
                                                            }

                                                            // Otherwise, show mapped icon from assets
                                                            return (
                                                                <img
                                                                    src={fileIcon}
                                                                    alt="file-icon"
                                                                    style={{ width: "100%", borderRadius: "6px" }}
                                                                />
                                                            );
                                                        })()}
                                                    </div>
                                                </div>

                                                <div className="gall-info">
                                                    <h4 className="font-16 mb-0 text-dark fw-bold mt-0">
                                                        {item.Title}
                                                    </h4>

                                                    <p
                                                        style={{
                                                            borderRadius: "4px",
                                                            fontWeight: 600,
                                                            color: "#da291c",
                                                            top: "3px",
                                                            position: "relative",
                                                        }}
                                                        className="font-14 float-start mt-0 mb-1"
                                                    >
                                                        {item.Department?.DepartmentName || "N/A"}
                                                    </p>

                                                    <div style={{ clear: "both" }} className="mb-1 row">
                                                        <span
                                                            style={{
                                                                borderRadius: "4px",
                                                                fontWeight: "600",
                                                                top: "3px",
                                                                position: "relative",
                                                            }}
                                                            className="font-14 text-muted float-start mt-0"
                                                        >
                                                            Published by:{" "}
                                                            {item.PublishedBy?.Title || "Unknown"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Integrated React-Bootstrap Modal for FileViewer */}
            <Modal
                show={showModalTemplateDoc}
                onHide={() => setShowModalTemplateDoc(false)}
                size={showFileViewer ? "xl" : "lg"}
                className="newmobmodal"
            >
                <Modal.Body id="style-5">
                    <>
                        {showFileViewer && (
                            <FileViewer
                                showfile={showFileViewer}
                                docurl={selectedFileUrl || undefined}
                                cancelAction={cancelModalAction}
                            />
                        )}
                    </>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default TrainingMaterials;
