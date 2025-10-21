import * as React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../../../../styles/global.scss";
import { useState, useEffect } from "react";
import { getSP } from "../../loc/pnpjsConfig";
import CustomBreadcrumb from "../common/CustomBreadcrumb";

const Breadcrumb = [
  {
    MainComponent: "Home",

    MainComponentURl: "Home",
  },

  {
    MainComponent: "Templates and Forms",

    MainComponentURl: "TemplatesandForms",
  },
];

const TemplateandForms = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  //file size
  const formatSize = (bytes: number | null | undefined): string => {
    if (bytes == null) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(1) + " KB";
    return (kb / 1024).toFixed(1) + " MB";
  };

  useEffect(() => {
    const fetchTemplatesAndForms = async () => {
      const sp = getSP();

      try {
        setLoading(true);

        //Fetch all TemplateAndForms items
        const items = await sp.web.lists
          .getByTitle("TemplateAndForms")
          .items.select(
            "ID",
            "Title",
            "Description",
            "Department/DepartmentName",
            "IconID/ID",
            "AttachmentID/ID"
          )
          .expand("Department", "IconID", "AttachmentID")();

        if (items.length === 0) {
          setTemplates([]);
          return;
        }

        //  Collect all unique document IDs (safe for older TS targets)
        const allIds: number[] = [];
        items.forEach((i: any) => {
          if (i.AttachmentID?.ID && !allIds.includes(i.AttachmentID.ID)) {
            allIds.push(i.AttachmentID.ID);
          }
          if (i.IconID?.ID && !allIds.includes(i.IconID.ID)) {
            allIds.push(i.IconID.ID);
          }
        });

        // Fetch corresponding TemplateDocs
        let fileMap: Record<number, any> = {};
        if (allIds.length > 0) {
          const filterString = allIds.map((id) => `Id eq ${id}`).join(" or ");

          const files = await sp.web.lists
            .getByTitle("TemplateDocs")
            .items.filter(filterString)
            .select(
              "Id",
              "OData__UIVersionString",
              "File/Name",
              "File/ServerRelativeUrl",
              "File/Length"
            )
            .expand("File")();

          fileMap = (files || []).reduce((acc: any, f: any) => {
            const fileData = {
              FileName: f.File?.Name || "",
              FileUrl: f.File?.ServerRelativeUrl
                ? `${window.location.origin}${f.File.ServerRelativeUrl}`
                : "",
              FileSize: f.File?.Length || 0,
              FileVersion: f.OData__UIVersionString || "",
            };
            acc[f.Id] = fileData;
            return acc;
          }, {});
        } else {
        }

        //  Map items for UI
        const mappedItems = await Promise.all(
          items.map(async (item: any, index: number) => {
            let iconUrl = "";
            let fileUrl = "";
            let fileSize = "";
            let fileVersion = "";

            //Handle Icon (with decoding-safe try/catch)
            if (item.IconID?.ID) {
              try {
                const iconDoc = await sp.web.lists
                  .getByTitle("TemplateDocs")
                  .items.getById(item.IconID.ID)
                  .select("File/ServerRelativeUrl")
                  .expand("File")();

                iconUrl = iconDoc?.File?.ServerRelativeUrl
                  ? `${window.location.origin}${iconDoc.File.ServerRelativeUrl}`
                  : "";
              } catch (error: any) {
                iconUrl = "";
              }
            }

            //Handle Attachments (same safe logic)
            if (item.AttachmentID?.ID) {
              try {
                const attachDoc = await sp.web.lists
                  .getByTitle("TemplateDocs")
                  .items.getById(item.AttachmentID.ID)
                  .select(
                    "File/ServerRelativeUrl,File/Length,OData__UIVersionString"
                  )
                  .expand("File")();

                fileUrl = attachDoc?.File?.ServerRelativeUrl
                  ? `${window.location.origin}${attachDoc.File.ServerRelativeUrl}`
                  : "";

                fileSize = attachDoc?.File?.Length
                  ? formatSize(attachDoc.File.Length)
                  : "";

                fileVersion = attachDoc?.OData__UIVersionString || "";
              } catch (error: any) {
                fileUrl = "";
                fileSize = "";
                fileVersion = "";
              }
            }

            //Final Mapped Object
            const mapped = {
              ID: item.ID,
              Title: item.Title || "",
              Description: item.Description || "",
              Department: item.Department?.DepartmentName || "General",
              IconUrl: iconUrl,
              FileUrl: fileUrl,
              FileSize: fileSize,
              FileVersion: fileVersion,
            };
            return mapped;
          })
        );
        setTemplates(mappedItems);
      } catch (error: any) {
      } finally {
        setLoading(false);
      }
    };

    fetchTemplatesAndForms();
  }, []);

  return (
    <div className="row">
      <div className="col-xl-12 col-lg-12">
        <div className="row">
          <div className="col-lg-12 mb-3">
            {/* <h4 className="page-title fw-bold mb-1 font-20">Template and Forms</h4>
                                <ol className="breadcrumb m-0">
                        
                                    <li className="breadcrumb-item"><a href="javascript:void(0)">Home</a></li>
                                    <li className="breadcrumb-item"> <span className="fe-chevron-right"></span></li>
                                    <li className="breadcrumb-item active">Template and Forms</li>
                                </ol> */}
            <CustomBreadcrumb Breadcrumb={Breadcrumb} />
          </div>

          {loading ? (
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
            <main>
              <div className="cards">
                {templates &&
                  templates.map((item: any, index: number) => (
                    <div className="card" key={index}>
                      {item.IconUrl ? (
                        <img
                          src={item.IconUrl}
                          alt={item.Title}
                          className="card-icon"
                          style={{
                            width: "50px",
                            height: "50px",
                            margin: "15px auto",
                          }}
                        />
                      ) : (
                        <i className="fas fa-file-alt card-icon"></i>
                      )}

                      <div className="card-body">
                        {/* Title */}
                        <h3>{item.Title}</h3>

                        {/* Department */}
                        <div className="meta">
                          <i className="fas fa-folder"></i>{" "}
                          {item.Department ? item.Department : ""}{" "}
                          {item.FileVersion && <>• v{item.FileVersion}</>}{" "}
                          {item.FileSize && <>• {item.FileSize}</>}
                        </div>

                        {/* Description */}
                        <div className="details">{item.Description || ""}</div>

                        {/* Download Button */}
                        {item.FileUrl ? (
                          <a
                            href={item.FileUrl}
                            className="download-btn"
                            download
                            onClick={(e) => {
                              const link = document.createElement("a");
                              link.href = item.FileUrl;
                              const fileName = item.FileUrl.split("/")
                                .pop()
                                ?.split("_")
                                .pop();
                              link.download = fileName || item.Title;
                              link.click();
                              e.preventDefault();
                            }}
                          >
                            <i className="fas fa-download"></i> Download
                          </a>
                        ) : (
                          <span className="text-muted small">
                            No file available
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </main>
          )}
        </div>
      </div>

      {/* <!-- Modal --> */}
      {/* <!-- Modal --> */}
    </div>
  );
};

export default TemplateandForms;
