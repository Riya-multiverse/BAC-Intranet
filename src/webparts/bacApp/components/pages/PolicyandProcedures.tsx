import * as React from 'react'
import CustomBreadcrumb from '../common/CustomBreadcrumb';
import { SPFI } from "@pnp/sp";
import { getSP } from "../../loc/pnpjsConfig";
import { Modal } from 'react-bootstrap';
import { Trash2 } from 'react-feather';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { faSort } from '@fortawesome/free-solid-svg-icons';
import FileViewer from "../common/FileViewerNew";
import "../../../../styles/global.scss";


const PolicyandProcedures = () => {
    const sp: SPFI = getSP();
    const [gridItems, setgridItems] = React.useState<any[]>([]);
    const [filteredItems, setFilteredItems] = React.useState<any[]>([]);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [category, setCategory] = React.useState("all");
    const [activeTag, setActiveTag] = React.useState("");
    const [viewMode, setViewMode] = React.useState("cards");
    const [modalItem, setModalItem] = React.useState<any>(null);
    const [showModal, setShowModal] = React.useState(false);
    const [categoryList, setCategoryList] = React.useState<any[]>([]);
    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [showFileViewer, setShowFileViewer] = useState(false);
    const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
     const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;


    const Breadcrumb = [
        {
            MainComponent: "Home",

            MainComponentURl: "Home",
        },

        {
            MainComponent: "Policy and Procedures",

            MainComponentURl: "PolicyandProcedures",
        },
    ];

    const [filters, setFilters] = useState({
        sno: "",
        title: "",
        category: "",
        policytype: "",
        date: "",
    });

    // Handle Filter Change — adds typing for event and field
    const handleFilterChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: string
    ): void => {
        const value = e.target.value.toLowerCase();
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    // Handle Sort Change — adds typing for field
    const handleSortChange = (field: string): void => {
        const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
        setSortField(field);
        setSortOrder(order);
    };


    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString("en-US", { month: "short" }); 
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    //Derived pagination data
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredItems.slice(startIndex, endIndex);

    //Handlers
    const handlePageChange = (page: number) => setCurrentPage(page);
    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };
    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    React.useEffect(() => {
        setLoading(true);
        const fetchPolicies = async () => {
            try {


                const items = await sp.web.lists
                    .getByTitle("PolicyandProcedures")
                    .items.select(
                        "Id",
                        "Title",
                        "Description",
                        "Category/Id",
                        "Category/Category",
                        "PolicyType/Id",
                        "PolicyType/Title",
                        "Attachment/Id",
                        "Created",
                        "Modified"
                    )
                    .expand("Category", "PolicyType", "Attachment")
                    .orderBy("Created", false)();
                // const formatted = items.map((item: any, index: number) => {
                //     const formattedItem = {
                //         id: item.Id,
                //         sno: index + 1,
                //         title: item.Title,
                //         description: item.Description,
                //         policytype: item.PolicyType?.Title || "",
                //         policyId: item.PolicyType?.Id || null,
                //         category: item.Category?.Category || "",
                //         categoryId: item.Category?.Id || null,
                //         attachmentId: item.Attachment?.Id || null,
                //         PolicyType: item.PolicyType,
                //         Category: item.Category,
                //         date: item.Created ? new Date(item.Created).toLocaleDateString() : "",
                //         modified: item.Modified ? new Date(item.Modified).toLocaleDateString() : ""
                //     };
                //     return formattedItem;
                // });


                // setgridItems(formatted);


                const formatted = await Promise.all(
                    items.map(async (item: any, index: number) => {
                        let fileUrl = "";
                        let fileName = "";

                        // 🔹 If the lookup Attachment field has an ID, fetch that file from PolicyDocs
                        if (item.Attachment?.Id) {
                            try {
                                const docItem = await sp.web.lists
                                    .getByTitle("PolicyDocs")
                                    .items.getById(item.Attachment.Id)
                                    .select("FileRef", "FileLeafRef")();

                                if (docItem?.FileRef) {
                                    fileUrl = `${window.location.origin}${docItem.FileRef}`;
                                    fileName = docItem.FileLeafRef;
                                }
                            } catch (err) {
                                console.error("Error fetching from PolicyDocs:", err);
                            }
                        }

                        return {
                            id: item.Id,
                            sno: index + 1,
                            title: item.Title,
                            description: item.Description,
                            category: item.Category?.Category || "",
                            policytype: item.PolicyType?.Title || "",
                            date: formatDate(item.Created),
                            modified: formatDate(item.Modified),

                            fileUrl,
                            fileName,
                        };
                    })
                );

                setgridItems(formatted);

            } catch (err) {
            } finally {
                setLoading(false);
            }
        };

        fetchPolicies();
    }, []);


    const handleFileClick = (fileUrl: string) => {
        if (!fileUrl) return;

        let fullUrl = fileUrl;
        const lowerUrl = fullUrl.toLowerCase();

        // Office docs open with web viewer
        if (
            lowerUrl.endsWith(".xlsx") ||
            lowerUrl.endsWith(".xls") ||
            lowerUrl.endsWith(".docx") ||
            lowerUrl.endsWith(".doc") ||
            lowerUrl.endsWith(".pptx") ||
            lowerUrl.endsWith(".ppt")
        ) {
            fullUrl = `${fileUrl}?web=1`;
        }

        setSelectedFileUrl(fullUrl);
        setShowFileViewer(true);
    };

    const cancelModalAction = () => {
        setShowFileViewer(false);
        setSelectedFileUrl(null);
    };


    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoryItems = await sp.web.lists
                    .getByTitle("CategoryMasterList")
                    .items.select("Id", "Category")();

                const formatted = categoryItems.map((item: any) => ({
                    id: item.Id,
                    name: item.Category
                }));

                setCategoryList(formatted);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, []);

    React.useEffect(() => {
        let filtered = gridItems.filter((d) => {
            return (
                (!filters.sno || d.sno.toString().includes(filters.sno)) &&
                (!filters.title || d.title?.toLowerCase().includes(filters.title)) &&
                (!filters.category || d.category?.toLowerCase().includes(filters.category)) &&
                (!filters.policytype || d.policytype?.toLowerCase().includes(filters.policytype)) &&
                (!filters.date || d.date?.toLowerCase().includes(filters.date))
            );
        });

        if (sortField) {
            filtered = filtered.sort((a, b) => {
                const aVal = (a[sortField] || "").toString().toLowerCase();
                const bVal = (b[sortField] || "").toString().toLowerCase();
                if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
                if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
                return 0;
            });
        }

        setFilteredItems(filtered);
    }, [filters, sortField, sortOrder, gridItems]);



    // Filtering Logic
    React.useEffect(() => {
        const q = searchQuery.trim().toLowerCase();
        const filtered = gridItems.filter((d) => {
            const matchesQ =
                !q ||
                d.title?.toLowerCase().includes(q) ||
                d.description?.toLowerCase().includes(q) ||
                d.category?.toLowerCase().includes(q) ||
                d.policytype?.toLowerCase().includes(q);
            const matchesCat = category === "all" || d.category.toLowerCase() === category;
            const matchesTag = !activeTag || activeTag === "" || d.policytype?.toLowerCase() === activeTag.toLowerCase();
            return matchesQ && matchesCat && matchesTag;
        });
        setFilteredItems(filtered);
    }, [searchQuery, category, activeTag, gridItems]);

    const getInitials = (title: string) => {
        if (!title) return "";
        const words = title
            .split(" ")
            .filter(w => w.trim() !== "" && w.trim() !== "&");
        return (
            (words[0]?.[0]?.toUpperCase() || "") +
            (words[1]?.[0]?.toUpperCase() || "")
        );
    };

    const capitalize = (s: string) =>
        s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

    const latestFive = [...gridItems]
        .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())
        .slice(0, 5);


    const handleFileDownload = (fileUrl: string, title: string) => {

        //  Clean only timestamp/date prefixes, keep valid underscores
        const fullName = fileUrl.split("/").pop() || title;
        let cleanName = fullName
            // remove patterns like 20241021_092020_ (date_time)
            .replace(/^\d{8}_\d{6}_/, "")
            // remove patterns like 20241021_ (date only)
            .replace(/^\d{8}_/, "")
            // remove any stray double underscores left by cleaning
            .replace(/^_+/, "")
            .trim();

        //  Optional: preserve extension if missing (safety)
        if (!/\.[a-zA-Z0-9]+$/.test(cleanName) && fullName.includes(".")) {
            cleanName += "." + fullName.split(".").pop();
        }
        // Build SharePoint download URL (forces download)
        const encodedUrl = encodeURIComponent(fileUrl);
        const downloadUrl = `${window.location.origin}/_layouts/15/download.aspx?SourceUrl=${encodedUrl}`;
        // Trigger download
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = cleanName || title;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };





    return (
        <>
            <div className="row">
                <div className="col-xl-12 col-lg-12">
                    <div className="row">
                        <div className="col-lg-12">
                            {/* <h4 className="page-title fw-bold mb-1 font-20">Policy and Procedures</h4>
                            <ol className="breadcrumb m-0">

                                <li className="breadcrumb-item"><a href="dashboard.html">Home</a></li>
                                <li className="breadcrumb-item"> <span className="fe-chevron-right"></span></li>
                                <li className="breadcrumb-item active">Policy and Procedures</li>
                            </ol> */}
                            <CustomBreadcrumb Breadcrumb={Breadcrumb} />
                        </div>




                    </div>





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
                    {/* 🔧 Filters Section */}
                    <div className="controls mt-0 d-flex gap-3 align-items-end flex-wrap">
                        <div className="search position-relative" style={{ minWidth: "280px" }}>
                            <i className="fas fa-search" style={{ color: "var(--muted)", position: "absolute", left: "10px", top: "12px" }}></i>
                            <input
                                placeholder="Search policies, e.g., 'safety', 'procurement'"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ paddingLeft: "30px" }}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    title="Clear"
                                    style={{ border: "0", background: "transparent", cursor: "pointer", color: "var(--muted)", position: "absolute", right: "10px", top: "10px" }}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            )}
                        </div>

                        <div className="filter">
                            <label style={{ fontSize: "13px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>Category</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                <option value="all">All</option>
                                {categoryList.map((cat) => (
                                    <option key={cat.id} value={cat.name.toLowerCase()}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>

                        </div>

                        <div className="view-toggle">
                            <label style={{ fontSize: "13px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>View</label>
                            <select value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                                <option value="cards">Card View</option>
                                <option value="table">Table View</option>
                            </select>
                        </div>
                    </div>

                    {/* 🏷️ Tags */}
                    <div className="tags mt-3 d-flex gap-2 flex-wrap">
                        {["", "policy", "procedure", "guideline", "template"].map((t) => (
                            <div
                                key={t || "all"}
                                className={`tag ${activeTag === t ? "active" : ""}`}
                                data-tag={t}
                                onClick={() => setActiveTag(t)}
                                style={{
                                    cursor: "pointer",
                                    padding: "6px 12px",
                                    borderRadius: "20px",
                                    background: activeTag === t ? "var(--primary)" : "var(--light)",
                                    color: activeTag === t ? "#fff" : "var(--dark)",
                                }}
                            >
                                {t ? capitalize(t) : "All"}
                            </div>
                        ))}
                    </div>

                    {/* 🧩 Layout */}
                    <div className="layout d-flex mt-2 flex-wrap">
                        <section style={{ flex: "1 1 70%" }}>
                            {/* No results */}
                            {filteredItems.length === 0 ? (
                                <div id="noResults" className="empty">No documents match your search or filters.</div>
                            ) : viewMode === "cards" ? (
                                <div className="doc-list ">
                                    {filteredItems.map((item) => (
                                        <div className="doc-card " key={item.id} >
                                            <div className="doc-thumb ">
                                                {getInitials(item.title)}
                                            </div>
                                            <div className="doc-meta ">
                                                <h5 className='mt-0 font-16 fw-bold text-dark mb-1'>{item.title}</h5>
                                                <p > {item.description || ""}</p>
                                                <div className="doc-actions ">
                                                    <button type="button" className="btn view" onClick={() => handleFileClick(item.fileUrl)}>
                                                        <i className="fas fa-eye"></i> View
                                                    </button>
                                                    <button type="button" className="btn download" onClick={() => handleFileDownload(item.fileUrl, item.title)}>
                                                        <i className="fas fa-download"></i> Download
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <table className="mtbalenew mt-0 table-centered table-nowrap table-borderless mb-0">
                                    <thead>
                                        <tr>

                                            {/* S.No. */}
                                            <th style={{ minWidth: "40px", maxWidth: "40px" }}>
                                                <div className="d-flex flex-column bd-highlight">
                                                    <div className="d-flex pb-2"
                                                        style={{ justifyContent: "space-between" }}>
                                                        <span>S.No.</span>
                                                        {/* <span onClick={() => handleSortChange("sno")} style={{ cursor: "pointer" }}>
                                                        <FontAwesomeIcon icon={faSort} />
                                                    </span> */}
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="S.No."
                                                        value={filters.sno}
                                                        onChange={(e) => handleFilterChange(e, "sno")}
                                                        className="inputcss"
                                                        style={{ width: "100%" }}
                                                    />
                                                </div>
                                            </th>
                                            {/* Title */}
                                            <th style={{ minWidth: "160px", maxWidth: "160px" }}>
                                                <div className="d-flex flex-column bd-highlight">
                                                    <div className="d-flex pb-2"
                                                        style={{ justifyContent: "space-between" }}>
                                                        <span>Title</span>
                                                        <span onClick={() => handleSortChange("title")} style={{ cursor: "pointer" }}>
                                                            <FontAwesomeIcon icon={faSort} />
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Filter Title"
                                                        value={filters.title}
                                                        onChange={(e) => handleFilterChange(e, "title")}
                                                        className="inputcss"
                                                        style={{ width: "100%" }}
                                                    />
                                                </div>
                                            </th>
                                            {/* Category */}
                                            <th style={{ minWidth: "140px", maxWidth: "140px" }}>
                                                <div className="d-flex flex-column bd-highlight">
                                                    <div className="d-flex pb-2"
                                                        style={{ justifyContent: "space-between" }}>
                                                        <span>Category</span>
                                                        <span onClick={() => handleSortChange("category")} style={{ cursor: "pointer" }}>
                                                            <FontAwesomeIcon icon={faSort} />
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Filter Category"
                                                        value={filters.category}
                                                        onChange={(e) => handleFilterChange(e, "category")}
                                                        className="inputcss"
                                                        style={{ width: "100%" }}
                                                    />
                                                </div>
                                            </th>

                                            {/* Policy Type */}
                                            <th style={{ minWidth: "140px", maxWidth: "140px" }}>
                                                <div className="d-flex flex-column bd-highlight">
                                                    <div className="d-flex pb-2"
                                                        style={{ justifyContent: "space-between" }}>
                                                        <span>Type</span>
                                                        <span onClick={() => handleSortChange("policytype")} style={{ cursor: "pointer" }}>
                                                            <FontAwesomeIcon icon={faSort} />
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Filter Type"
                                                        value={filters.policytype}
                                                        onChange={(e) => handleFilterChange(e, "policytype")}
                                                        className="inputcss"
                                                        style={{ width: "100%" }}
                                                    />
                                                </div>
                                            </th>
                                            {/* Date */}
                                            <th style={{ minWidth: "130px", maxWidth: "150px" }}>
                                                <div className="d-flex flex-column bd-highlight">
                                                    <div className="d-flex pb-2"
                                                        style={{ justifyContent: "space-between" }}>
                                                        <span>Date</span>
                                                        <span onClick={() => handleSortChange("date")} style={{ cursor: "pointer" }}>
                                                            <FontAwesomeIcon icon={faSort} />
                                                        </span>
                                                    </div>
                                                    <div className="bd-highlight">
                                                        <input
                                                            type="text"
                                                            placeholder="Filter Date"
                                                            value={filters.date}
                                                            onChange={(e) => handleFilterChange(e, "date")}
                                                            className="inputcss"
                                                            style={{ width: "100%" }}
                                                        />
                                                    </div>
                                                </div>
                                            </th>

                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="text-center">No records found</td>
                                            </tr>
                                        ) : (
                                            filteredItems.map((item, index) => (
                                                <tr key={item.id}>
                                                    <td style={{ minWidth: "40px", maxWidth: "40px" }}>{index + 1}</td>
                                                    <td style={{ minWidth: "160px", maxWidth: "160px" }}>{item.title || ""}</td>
                                                    <td style={{ minWidth: "140px", maxWidth: "140px" }}>{item.category || ""}</td>
                                                    <td style={{ minWidth: "140px", maxWidth: "140px" }}>{item.policytype || ""}</td>
                                                    <td style={{ minWidth: "130px", maxWidth: "130px" }}>{item.date || ""}</td>
                                                    <td>
                                                        <button type="button" className="btn view" onClick={() => handleFileClick(item.fileUrl)}>
                                                            <i className="fas fa-eye"></i>
                                                        </button>
                                                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => handleFileDownload(item.fileUrl, item.title)}>
                                                            <i className="fas fa-download"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </section>

                        {/* 📂 Quick Access */}
                        <aside style={{ flex: "1 1 25%", marginLeft: "20px" }}>
                            <div className="card">
                                <h5 className='header-title font-16 text-dark fw-bold mb-0'><i className="fas fa-folder-open"></i> Quick Access</h5>
                                <p style={{ color: "var(--muted)", marginTop: "6px" }}> Frequently used documents.</p>
                                <table className="doc-table" id="quickTable">
                                    <thead>
                                        <tr><th>Document</th><th>Date</th></tr>
                                    </thead>
                                    <tbody>
                                        {latestFive.map((d) => (
                                            <tr key={d.id}>
                                                <td style={{ padding: "8px" }}>{d.title}</td>
                                                <td style={{ padding: "8px" }}>{d.modified}</td>

                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </aside>
                    </div>
                </main>


                                    )}


                                    {!loading && viewMode === "table" && (
                <nav className="justify-content-end mt-3">
                    <ul className="pagination pagination-rounded justify-content-end">
                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                            <a className="page-link" onClick={handlePrevPage} aria-label="Previous">
                                <span aria-hidden="true">«</span>
                            </a>
                        </li>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <li
                                key={page}
                                className={`page-item ${currentPage === page ? "active" : ""}`}
                            >
                                <a className="page-link" onClick={() => handlePageChange(page)}>
                                    {page}
                                </a>
                            </li>
                        ))}

                        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                            <a className="page-link" onClick={handleNextPage} aria-label="Next">
                                <span aria-hidden="true">»</span>
                            </a>
                        </li>
                    </ul>
                </nav>
                                    )}


                {/* </Modal.Body> */}

                {/* </Modal> */}

                <Modal show={showFileViewer} onHide={cancelModalAction} size="xl" className="newmobmodal">
                    <Modal.Body>
                        {showFileViewer && selectedFileUrl && (
                            <FileViewer
                                showfile={showFileViewer}
                                docurl={selectedFileUrl}
                                cancelAction={cancelModalAction}
                            />
                        )}
                    </Modal.Body>
                </Modal>

            </div>

        </>
    )
}

export default PolicyandProcedures
