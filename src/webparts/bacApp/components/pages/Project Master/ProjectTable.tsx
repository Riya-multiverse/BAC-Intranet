import * as React from 'react'
import { ArrowLeft, ChevronRight, Edit, PlusCircle, Trash2 } from 'react-feather';
import { faArrowLeft, faEllipsisV, faFileExport, faPlusCircle, faSort } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomBreadcrumb from '../../common/CustomBreadcrumb';
import { SPFI } from "@pnp/sp/presets/all";
import { getSP } from '../../../loc/pnpjsConfig';
import * as XLSX from "xlsx";
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
interface IMyTableProps {
    onAdd: () => void;
    onEdit: (item: any) => void;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProjectTable = ({ onAdd, onEdit, setLoading }: IMyTableProps) => {
    const sp: SPFI = getSP();
    const [masterlistdata, setmasterlistdata] = React.useState<any[]>([]);
    const [sortConfig, setSortConfig] = React.useState({ key: '', direction: 'ascending' });
    const [isOpen, setIsOpen] = React.useState(false);
    const navigate = useNavigate();
    const toggleDropdown = () => {

        setIsOpen(!isOpen);

    };
    const Breadcrumb = [

        {

            "MainComponent": "Settings",

            "MainComponentURl": "Settings",


        },

        {

            "MainComponent": "Project Master",

            "MainComponentURl": "ProjectMaster",


        }

    ];

    React.useEffect(() => {
        ApiCall();
    });

    const ApiCall = async () => {
        let QuickLinkArr: any[] = [];

        QuickLinkArr = await getMasterListData();


        setmasterlistdata(QuickLinkArr);

    };

    const getMasterListData = async () => {
        let arr: any[] = []
        const currentUser = await sp.web.currentUser();

        //   if (isSuperAdmin == "Yes") {
        await sp.web.lists.getByTitle("Projects").items.select("*,Attachment/ID,Department/ID,Department/DepartmentName,TeamMembers/ID,TeamMembers/Title,TeamMembers/EMail").expand("TeamMembers,Attachment,Department").orderBy("Created", false).getAll()
            .then((res) => {

                arr = res;
            })
            .catch((error) => {
                console.log("Error fetching data: ", error);
            });

        return arr;
    }
    const [filters, setFilters] = React.useState({
        SNo: '',
        ProjectName: '',

        Department: { ID: '', DepartmentName: '' },
        Status: '',
        ProjectOverview: '',
        ProjectPrivacy: '',
        StartDate: '',
        DueDate: '',
        // TeamMembers: { ID: '', Title: '', EMail: '' },
        ProjectPriority: '',
        Budget: '',

    });

    const applyFiltersAndSorting = (data: any[]) => {
        // debugger
        // Filter data
        const filteredData = data.filter((item, index) => {
            return (
                (filters.SNo === '' || String(index + 1).includes(filters.SNo)) &&
                (filters.ProjectName === '' || item.ProjectName.toLowerCase().includes(filters.ProjectName.toLowerCase())) &&
                (filters.Status === '' || item.Status.toLowerCase().includes(filters.Status.toLowerCase())) &&
                (filters.ProjectOverview === '' || String(item.ProjectOverview).toLowerCase() === filters.ProjectOverview.toLowerCase()) &&
                (filters.Budget === '' || String(item.Budget).toLowerCase() === filters.Budget.toLowerCase()) &&
                (filters.ProjectPrivacy === '' || item.ProjectPrivacy.toLowerCase().includes(filters.ProjectPrivacy.toLowerCase())) &&
                // (filters?.RedirectToNewTab === '' || item?.RedirectToNewTab?.toLowerCase().includes(filters?.RedirectToNewTab?.toLowerCase()))&&
                (Object.keys(filters.Department).length === 0 || item.Department?.DepartmentName?.toLowerCase().includes(filters.Department.DepartmentName.toLowerCase())) &&
                // (filters.IsActive === '' || String(item.IsActive ? 'Yes' : 'No').toLowerCase() === filters.IsActive.toLowerCase())

                (filters?.ProjectPriority === '' || item?.ProjectPriority?.toLowerCase().includes(filters?.ProjectPriority?.toLowerCase()))
            );
        });
        const sortedData = filteredData.sort((a, b) => {
            if (sortConfig.key === 'SNo') {
                // Sort by index
                const aIndex = data.indexOf(a);
                const bIndex = data.indexOf(b);

                return sortConfig.direction === 'ascending' ? aIndex - bIndex : bIndex - aIndex;
            } else if (sortConfig.key) {
                // Sort by other keys
                if (sortConfig.key === "Department") {
                    const aValue = a.Department?.DepartmentName?.toLowerCase() || '';
                    const bValue = b.Department?.DepartmentName?.toLowerCase() || '';
                    if (aValue < bValue) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (aValue > bValue) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }


                }
                else {
                    const aValue = a[sortConfig.key] ? a[sortConfig.key].toLowerCase() : '';
                    const bValue = b[sortConfig.key] ? b[sortConfig.key].toLowerCase() : '';
                    if (aValue < bValue) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (aValue > bValue) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }
                }




            }
            return 0;
        });
        return sortedData;
    };

    const filteredQuickLinkData = applyFiltersAndSorting(masterlistdata);

    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredQuickLinkData.length / itemsPerPage);

    const handlePageChange = (pageNumber: any) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredQuickLinkData.slice(startIndex, endIndex);
    const handleSortChange = (key: string) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            ...(field === "Department"
                ? { Department: { ...prevFilters.Department, DepartmentName: e.target.value } } // Corrected bracket placement
                : { [field]: e.target.value }) // Update other fields normally
        }));
    };

    //#region Download exl file
    const handleExportClick = () => {
        const exportData = currentData.map((item, index) => ({
            // 'S.No.': startIndex + index + 1,
            // 'Title': item.Title,
            // 'Url': item.Url,

            // 'Status': item.Status,
            // 'Submitted Date': item.Created,
            "S.No.": startIndex + index + 1,

            Title: item.Title,

            // URL: item.URL,
            Department: item.Department.DepartmentName,

            // "Redirect to new tab": item.RedirectToNewTab,

            Active: item.IsActive,

            "Submitted Date": item.Created,
        }));

        exportToExcel(exportData, "Quick Links");
    };
    const exportToExcel = (data: any[], fileName: string) => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    };

    const handleDelete = async (id: number) => {
        Swal.fire({
            title: "Do you want to delete this record?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            reverseButtons: false,
            backdrop: false,
            allowOutsideClick: false,
        }).then(async (result) => {
            if (result.isConfirmed) {
                setLoading(true);
                try {
                    //   const sp = getSP();
                    //   const item = await sp.web.lists
                    //   .getByTitle("AnnouncementAndNews")
                    //   .items.getById(id)
                    //   .select("Id", "AnnouncementandNewsImageID/Id")
                    //   .expand("AnnouncementandNewsImageID")();

                    // const fileIds = item?.AnnouncementandNewsImageID?.map((f: any) => f.Id) || [];
                    // console.log(" Related file IDs to delete:", fileIds);

                    // // Delete related files from document library
                    // for (const fileId of fileIds) {
                    //   try {
                    //     await sp.web.lists
                    //       .getByTitle("AnnouncementandNewsDocs")
                    //       .items.getById(fileId)
                    //       .delete();
                    //     console.log(` File with ID ${fileId} deleted from document library`);
                    //   } catch (fileErr) {
                    //     console.error(` Failed to delete file ID ${fileId}`, fileErr);
                    //   }
                    // }
                    await sp.web.lists
                        .getByTitle("QuickLinks")
                        .items.getById(id)
                        .delete();

                    //  Remove deleted item from local state
                    setmasterlistdata((prev) => prev.filter((n) => n.id !== id));

                    //  Success Alert
                    Swal.fire({
                        backdrop: false,
                        title: "Deleted successfully.",
                        icon: "success",
                        confirmButtonText: "OK",
                        showConfirmButton: true,
                        allowOutsideClick: false,
                    });
                } catch (err) {
                    console.error("Error deleting item:", err);
                    Swal.fire({
                        title: "Error",
                        text: "Failed to delete the record.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                } finally {
                    setLoading(false);
                }
            }
        });
    };
    return (
        <>

            {/* // <!-- start page title --> */}
            <div className="row">
                <div className="col-lg-4">
                    <CustomBreadcrumb Breadcrumb={Breadcrumb} />

                </div>
                <div className="col-lg-8">
                    <div className="d-flex flex-wrap align-items-center justify-content-end mt-3">
                        <form className="d-flex flex-wrap align-items-center justify-content-start ng-pristine ng-valid">



                            <button type="button" className="btn btn-secondary me-1 waves-effect waves-light" onClick={() => navigate("/Settings")}> <ArrowLeft size={18} className="me-1" />Back</button>

                            <button type="button" className="btn btn-primary waves-effect waves-light" onClick={onEdit}><PlusCircle className="me-1" size={18} />Add</button>


                        </form>



                    </div>
                </div>


            </div>
            {/* // <!-- end page title --></> */}
            <div className="card cardCss mt-4 mb-0">
                <div className="card-body">
                    <div id="cardCollpase4" className="collapse show">
                        <div className="table-responsive pt-0">
                            <table className="mtbalenew mt-0 table-centered table-nowrap table-borderless mb-0">
                                <thead>
                                    <tr>
                                        <th style={{
                                            borderBottomLeftRadius: '0px', minWidth: '40px',
                                            maxWidth: '40px', borderTopLeftRadius: '0px'
                                        }}>
                                            <div className="d-flex pb-2"
                                                style={{ justifyContent: 'space-between' }}>
                                                <span>S.No.</span>
                                                <span onClick={() => handleSortChange('SNo')}>
                                                    <FontAwesomeIcon icon={faSort} />
                                                </span>
                                            </div>
                                            <div className="bd-highlight">
                                                <input
                                                    type="text"
                                                    placeholder="SNo"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault(); // Prevents the new line in textarea
                                                        }
                                                    }}
                                                    onChange={(e) => handleFilterChange(e, 'SNo')}
                                                    className="inputcss"
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                        </th>
                                        <th style={{ minWidth: '120px', maxWidth: '120px' }}>
                                            <div className="d-flex flex-column bd-highlight ">
                                                <div className="d-flex pb-2" style={{ justifyContent: 'space-evenly' }}>
                                                    <span >ProjectName</span>  <span onClick={() => handleSortChange('ProjectName')}><FontAwesomeIcon icon={faSort} /> </span></div>
                                                <div className=" bd-highlight">
                                                    <input type="text" placeholder="Filter by ProjectName" onChange={(e) => handleFilterChange(e, 'ProjectName')}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault(); // Prevents the new line in textarea
                                                            }
                                                        }}
                                                        className='inputcss' style={{ width: '100%' }} />
                                                </div>
                                            </div>
                                        </th>

                                        <th style={{ minWidth: '120px', maxWidth: '120px' }}>
                                            <div className="d-flex flex-column bd-highlight ">
                                                <div className="d-flex pb-2" style={{ justifyContent: 'space-evenly' }}>
                                                    <span >Project Privacy</span>  <span onClick={() => handleSortChange('ProjectPrivacy')}><FontAwesomeIcon icon={faSort} /> </span></div>
                                                <div className=" bd-highlight">
                                                    <input type="text" placeholder="Filter by Project Privacy" onChange={(e) => handleFilterChange(e, 'ProjectPrivacy')}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault(); // Prevents the new line in textarea
                                                            }
                                                        }}
                                                        className='inputcss' style={{ width: '100%' }} />
                                                </div>
                                            </div>
                                        </th>

                                        <th style={{ minWidth: '120px', maxWidth: '120px' }}>
                                            <div className="d-flex flex-column bd-highlight ">
                                                <div className="d-flex pb-2" style={{ justifyContent: 'space-evenly' }}>
                                                    <span >Department</span>  <span onClick={() => handleSortChange('Department')}><FontAwesomeIcon icon={faSort} /> </span></div>
                                                <div className=" bd-highlight">
                                                    <input type="text" placeholder="Filter by Department" onChange={(e) => handleFilterChange(e, 'Department')}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault(); // Prevents the new line in textarea
                                                            }
                                                        }}
                                                        className='inputcss' style={{ width: '100%' }} />
                                                </div>
                                            </div>
                                        </th>



                                        <th style={{ minWidth: '120px', maxWidth: '120px' }}>
                                            <div className="d-flex flex-column bd-highlight ">
                                                <div className="d-flex pb-2" style={{ justifyContent: 'space-evenly' }}>
                                                    <span >Project Priority</span>  <span onClick={() => handleSortChange('ProjectPriority')}><FontAwesomeIcon icon={faSort} /> </span></div>
                                                <div className=" bd-highlight">
                                                    <input type="text" placeholder="Filter by Project Priority" onChange={(e) => handleFilterChange(e, 'ProjectPriority')}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault(); // Prevents the new line in textarea
                                                            }
                                                        }}
                                                        className='inputcss' style={{ width: '100%' }} />
                                                </div>
                                            </div>
                                        </th>
                                        <th style={{ minWidth: '120px', maxWidth: '120px' }}>
                                            <div className="d-flex flex-column bd-highlight ">
                                                <div className="d-flex pb-2" style={{ justifyContent: 'space-evenly' }}>
                                                    <span >Start Date</span>  <span onClick={() => handleSortChange('StartDate')}><FontAwesomeIcon icon={faSort} /> </span></div>
                                                <div className=" bd-highlight">
                                                    <input type="text" placeholder="Filter by Start Date" onChange={(e) => handleFilterChange(e, 'StartDate')}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault(); // Prevents the new line in textarea
                                                            }
                                                        }}
                                                        className='inputcss' style={{ width: '100%' }} />
                                                </div>
                                            </div>
                                        </th>
                                        <th style={{ minWidth: '120px', maxWidth: '120px' }}>
                                            <div className="d-flex flex-column bd-highlight ">
                                                <div className="d-flex pb-2" style={{ justifyContent: 'space-evenly' }}>
                                                    <span >Due Date</span>  <span onClick={() => handleSortChange('DueDate')}><FontAwesomeIcon icon={faSort} /> </span></div>
                                                <div className=" bd-highlight">
                                                    <input type="text" placeholder="Filter by Due Date" onChange={(e) => handleFilterChange(e, 'DueDate')}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault(); // Prevents the new line in textarea
                                                            }
                                                        }}
                                                        className='inputcss' style={{ width: '100%' }} />
                                                </div>
                                            </div>
                                        </th>
                                        {/* <th style={{ minWidth: '80px', maxWidth: '80px' }}>
                                            <div className="d-flex flex-column bd-highlight ">
                                                <div className="d-flex pb-2" style={{ justifyContent: 'space-evenly' }}>
                                                    <span >Status</span>  <span onClick={() => handleSortChange('Status')}><FontAwesomeIcon icon={faSort} /> </span></div>
                                                <div className=" bd-highlight">
                                                    <input type="text" placeholder="Filter by Status" onChange={(e) => handleFilterChange(e, 'Status')}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault(); // Prevents the new line in textarea
                                                            }
                                                        }}
                                                        className='inputcss' style={{ width: '100%' }} />
                                                </div>
                                            </div>
                                        </th> */}


                                        <th style={{ textAlign: 'center', minWidth: '80px', maxWidth: '80px', borderBottomRightRadius: '0px', borderTopRightRadius: '0px' }}> <div className="d-flex flex-column bd-highlight pb-2">

                                            <div className="d-flex  pb-2" style={{ justifyContent: 'space-evenly' }}>  <span >Action</span> <div className="dropdown">

                                                <FontAwesomeIcon icon={faEllipsisV} onClick={toggleDropdown} size='xl' />

                                            </div>

                                            </div>

                                            <div className=" bd-highlight">   <div id="myDropdown" className={`dropdown-content ${isOpen ? 'show' : ''}`}>

                                                <div onClick={handleExportClick} className="" >

                                                    <FontAwesomeIcon icon={faFileExport} />  Export

                                                </div>

                                            </div></div>


                                        </div>

                                            <div style={{ height: '32px' }}></div>

                                        </th>

                                    </tr>
                                </thead>
                                <tbody style={{ maxHeight: '5000px' }}>
                                    {currentData.length === 0 ?
                                        (
                                            <div className="no-results" style={{ display: 'flex', justifyContent: 'center' }}>No results found</div>
                                        )
                                        :
                                        currentData.map((item, index) => {
                                            const date = new Date(item.StartDate);
                                            const StartDateday = date.getDate();
                                            const StartDatemonth = date.toLocaleString("default", {
                                                month: "short",
                                            });
                                             const StartDateyear = date.getFullYear();
                                             const date2 = new Date(item.DueDate);
                                            const DueDateday = date2.getDate();
                                            const DueDatemonth = date2.toLocaleString("default", {
                                                month: "short",
                                            });
                                             const DueDateyear = date2.getFullYear();
                                            return (
                                                <tr key={index}>
                                                    <td style={{ minWidth: '40px', maxWidth: '40px' }}><div style={{ marginLeft: '10px' }} className='indexdesign'> {index + 1}</div>  </td>

                                                    {/* <td style={{ minWidth: '120px', maxWidth: '120px' }}>{item.URL}</td> */}
                                                    <td style={{ minWidth: '120px', maxWidth: '120px' }}>{item.ProjectName}</td>
                                                    <td style={{ minWidth: '120px', maxWidth: '120px' }}>{item.ProjectPrivacy}</td>
                                                    <td style={{ minWidth: '120px', maxWidth: '120px' }}>{item?.Department?.DepartmentName}</td>
                                                    <td style={{ minWidth: '120px', maxWidth: '120px' }}>{item.ProjectPriority}</td>
                                                    <td style={{ minWidth: '120px', maxWidth: '120px' }}> {`${StartDateday} ${StartDatemonth} ${StartDateyear}`}</td>
                                                    <td style={{ minWidth: '120px', maxWidth: '120px' }}> {`${DueDateday} ${DueDatemonth} ${DueDateyear}`}</td>
                                                    {/* <td style={{ minWidth: '80px', maxWidth: '80px', textAlign: 'center' }}>  <div className='btn btn-status newlight'> {item.RedirectToNewTab ? "Yes" : "No"} </div> </td> */}
                                                    {/* <td style={{ minWidth: '80px', maxWidth: '80px', textAlign: 'center' }}>  <div className='btn btn-status newlight'> {item.IsActive} </div> </td> */}
                                                    {/* <td style={{ minWidth: '80px', maxWidth: '80px' }} className="ng-binding">
                                                        <div className="d-flex  pb-0" style={{ justifyContent: 'center', gap: '5px' }}>
                                                            <button type="button" className="btn btn-secondary me-1 waves-effect waves-light" onClick={onAdd}><i className="fe-arrow-left me-1"></i>Back</button>
                                                            <button type="button" className="btn btn-primary waves-effect waves-light" onClick={onEdit}><i className="fe-plus-circle me-1"></i>Add</button>
                                                            
                                                        </div>
                                                    </td> */}
                                                    <td style={{ minWidth: "80px", maxWidth: "80px" }} className="ng-binding">
                                                        <a
                                                            href="javascript:void(0);"
                                                            className="action-icon text-primary"
                                                            onClick={() => onEdit(item)}
                                                        >
                                                            <Edit size={18} />
                                                        </a>
                                                        <a
                                                            href="javascript:void(0);"
                                                            className="action-icon text-danger"
                                                            onClick={() => handleDelete(item.id)}
                                                        >
                                                            <Trash2 size={18} />
                                                        </a>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>


                            <nav className="pagination-container">
                                <ul className="pagination">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <a
                                            className="page-link"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            aria-label="Previous"
                                        >
                                            «
                                        </a>
                                    </li>
                                    {Array.from({ length: totalPages }, (_, num) => (
                                        <li
                                            key={num}
                                            className={`page-item ${currentPage === num + 1 ? 'active' : ''}`}
                                        >
                                            <a
                                                className="page-link"
                                                onClick={() => handlePageChange(num + 1)}
                                            >
                                                {num + 1}
                                            </a>
                                        </li>
                                    ))}
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <a
                                            className="page-link"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            aria-label="Next"
                                        >
                                            »
                                        </a>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProjectTable
