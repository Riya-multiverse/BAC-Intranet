import * as React from 'react'
import { Breadcrumb } from 'react-bootstrap';
import CustomBreadcrumb from '../../common/CustomBreadcrumb';
import { Share2, Share, Calendar } from 'react-feather';
import { getSP } from '../../../loc/pnpjsConfig';
import { SPFI } from '@pnp/sp';
import * as moment from 'moment';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { APP_URL } from '../../../../../Shared/Constant';
interface INewsListingProps {

    // onEdit: (item: any) => void;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
const NewsListing = ({ setLoading }: INewsListingProps) => {
    const sp: SPFI = getSP();
    const navigate = useNavigate();
    const [newsItems, setNewsItems] = React.useState<any[]>([]);
    const [allNews, setAllNews] = React.useState<any[]>([]); // 🔹 Store all fetched news
    const [category, setCategory] = React.useState<string>('All'); // 🔹 Category filter
    const [fromDate, setFromDate] = React.useState<string>(''); // 🔹 From date
    const [toDate, setToDate] = React.useState<string>(''); // 🔹 To date

    const [openDropdownIndex, setOpenDropdownIndex] = React.useState<number | null>(null);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdownIndex(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getDocumentLinkByID = async (AttachmentId: number[]) => {
        if (!AttachmentId || AttachmentId.length === 0) return [];

        try {
            const results = await Promise.all(
                AttachmentId.map(async (id) => {
                    const res = await sp.web.lists
                        .getByTitle("AnnouncementandNewsDocs")
                        .items.getById(id)
                        .select("*,FileRef,FileLeafRef")();
                    return res;
                })
            );

            return results; // Now results contains all fetched items
        } catch (error) {
            console.error("Error fetching data: ", error);
            return [];
        }
    };
    React.useEffect(() => {

        const fetchNews = async () => {
            setLoading(true);
            try {


                const items = await sp.web.lists
                    .getByTitle("AnnouncementAndNews")
                    .items.select(
                        "Id",
                        "Title",
                        "Description",
                        "Category",
                        "Department/DepartmentName",
                        "Department/Id",
                        "Overview",
                        "Created",
                        "Author/Title",
                        "Author/Id",
                        "Author/EMail",
                        "AnnouncementandNewsImageID/ID"
                    )
                    .expand("Department,Author,AnnouncementandNewsImageID")
                    .filter("SourceType eq 'News'")
                    .orderBy("Created", false)();

                // console.log("Raw News items:", items);

                // 🔹 Use Promise.all to wait for image fetch for each news item
                const formatted = await Promise.all(
                    items.map(async (item: any, index: number) => {
                        const imageIds =
                            item.AnnouncementandNewsImageID?.map((img: any) => img.ID) || [];

                        const imageLinks = imageIds.length > 0
                            ? await getDocumentLinkByID(imageIds)
                            : [];

                        return {
                            id: item.Id,
                            sno: index + 1,
                            title: item.Title,
                            description: item.Description,
                            department: item.Department?.DepartmentName || "",
                            departmentId: item.Department?.Id || null,
                            category: item.Category || "",
                            overview: item.Overview || "",
                            created: new Date(item.Created),
                            author: item.Author?.Title,
                            images: imageLinks.map((img: any) => ({
                                name: img.FileLeafRef,
                                url: img.FileRef,
                            })),
                        };
                    })
                );

                setAllNews(formatted);
                setNewsItems(formatted);
                // console.log("Formatted news with images:", formatted);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching news data:", err);
            } finally {
                setLoading(false);
            }
        };


        fetchNews();
    }, []);
    // 🔹 Apply filters whenever category/fromDate/toDate changes
    React.useEffect(() => {
        let filtered = [...allNews];
        // 🔸 Date validation
        if (fromDate && toDate && moment(toDate).isBefore(moment(fromDate))) {
            setToDate('');
            Swal.fire("To Date cannot be earlier than From Date.");
            return;
        }

        if (category !== 'All') {
            filtered = filtered.filter(
                (item) => item.category?.toLowerCase() === category.toLowerCase()
            );
        }

        if (fromDate) {
            const from = moment(fromDate).startOf('day');
            filtered = filtered.filter((item) =>
                moment(item.created).isSameOrAfter(from)
            );
        }

        if (toDate) {
            const to = moment(toDate).endOf('day');
            filtered = filtered.filter((item) =>
                moment(item.created).isSameOrBefore(to)
            );
        }

        setNewsItems(filtered);
    }, [category, fromDate, toDate, allNews]);

    const Breadcrumb = [

        {

            "MainComponent": "Home",

            "MainComponentURl": "Home",


        },

        {

            "MainComponent": "News",

            "MainComponentURl": "News",


        }

    ];
    return (
        <>

            <div className="row">
                <div className="col-lg-2">
                    <CustomBreadcrumb Breadcrumb={Breadcrumb} />

                </div>
                <div className="col-lg-10">
                    <div className="d-flex flex-wrap align-items-center justify-content-end mt-3 mb-3">
                        <div style={{ width: '310px' }}>
                            <label style={{ float: 'left', textAlign: 'right', width: '150px' }} htmlFor="inputPassword2" className="me-2 mt-1">Select Category</label>
                            <select
                                style={{ float: 'left', width: '130px' }}
                                className="form-select me-1"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)} // 🔹 Update category
                            >
                                <option>All</option>
                                <option>Internal</option>
                                <option>External</option>
                            </select></div>

                        <label htmlFor="status-select" className="me-2">From</label>
                        <div className="me-3">
                            <input
                                type="date"
                                className="form-control"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)} // 🔹 Update fromDate
                            />
                        </div>

                        <label htmlFor="status-select" className="me-2">To</label>
                        <div className="me-2">
                            <input
                                type="date"
                                className="form-control"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)} // 🔹 Update toDate
                            />
                        </div>





                    </div>
                </div>


            </div>

            {/* 🔹 News Cards Rendering */}
            {newsItems.length === 0 && (
                <p className="text-center text-muted mt-4">No news found.</p>
            )}

            {newsItems.slice(0, 1).map((item, index) => (<div className="row mt-2" key={item.id}>
                <div className="col-lg-5">
                    {/* <div className="imagemani mt-2 me-2">
                        <img src={require("../../../assets/Banner1.png")} data-themekey="#" />
                    </div> */}
                    {item.images.slice(0, 1).map((img: any, index: number) => (
                        <div key={index} className="imagemani mt-2 me-2">
                            <img src={img.url} alt={img.name || `image-${index}`} data-themekey="#" />
                        </div>
                    ))}
                </div>
                <div className="col-lg-7">
                    <div className="row">
                        <div className="col-sm-3 text-left">
                            <span style={{ "padding": "5px", "borderRadius": "4px", "fontWeight": 500, "color": "#009157", "top": 0, "position": "relative" }} className="posnew font-14 float-start mt-2">Latest News</span>

                        </div>
                        <div className="col-lg-12">
                            <h4 style={{ "lineHeight": "34px" }} className="page-title fw-700 mb-1  pe-5 font-28">{item.title}
                            </h4>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                <p className="mb-2 mt-1 d-block">
                                    <span style={{ "fontWeight": 400 }} className="pe-2 text-nowrap color-new font-12 mb-0 d-inline-block">
                                        <Calendar className="fe-calendar" /> {moment.utc(item.created).local().format("DD MMM YYYY")}  &nbsp;  &nbsp;  &nbsp;|
                                    </span>
                                    <span style={{ "fontWeight": 400 }} className="text-nowrap mb-0 color-new font-12 d-inline-block">
                                        Author: <span style={{ "color": "#009157", "fontWeight": 600 }}>{item.author} &nbsp;  &nbsp;  &nbsp;|&nbsp;  &nbsp;  &nbsp;
                                        </span>
                                        <span className="text-nowrap mb-0 color-new font-12 d-inline-block">
                                            4 min read
                                        </span>
                                    </span></p>

                                <div style={{ "clear": "both", "lineHeight": "22px" }}> <p style={{ "lineHeight": "20px", "fontWeight": 400 }} className="d-block color-new font-14">
                                    {item.description}
                                </p>
                                </div>
                                
                                {/* <div onClick={() => onEdit(item)} style={{ "height": "40px", "lineHeight": "24px" }} className="btn btn-primary rounded-pill font-16 mt-0">Read more..</div> */}
                                <div onClick={() => {
                                    sessionStorage.setItem("selectedNewsItem", JSON.stringify(item));
                                    sessionStorage.setItem("showNewsDetails", "true"); navigate("/NewsDetails")
                                }} style={{ "height": "40px", "lineHeight": "24px" }} className="btn btn-primary rounded-pill font-16 mt-0">Read more..</div>

                                {/* </a> */}

                            </div>
                        </div>
                    </div>

                </div>
            </div>))}
            <div className="tab-content mt-4">
                <div className="tab-pane show active" id="home1">
                    {newsItems.slice(1).map((item, index) => (
                        <div className="card mb-2">
                            <div className="card-body">
                                <div className="row align-items-start">
                                    <div className="col-sm-2" onClick={() => {
                                        sessionStorage.setItem("selectedNewsItem", JSON.stringify(item));
                                        sessionStorage.setItem("showNewsDetails", "true"); navigate("/NewsDetails");
                                    }} style={{ cursor: 'pointer' }}>
                                        {/* <a href="NewsInternal">  */}
                                        {/* <div className="imagehright">
                                            <img className="d-flex align-self-center me-3 w-100" src={require("../../../assets/Banner1.png")} alt="Generic placeholder image" />

                                        </div> */}
                                        {item.images.slice(0, 1).map((img: any, index: number) => (
                                            <div key={index} className="imagehright">
                                                <img className="d-flex align-self-center me-3 w-100" src={img.url} alt={img.name || `image-${index}`} data-themekey="#" />
                                            </div>
                                        ))}
                                        {/* </a> */}
                                    </div>
                                    <div className="col-sm-9">
                                        <div className="row">
                                            <div className="col-sm-3"> <span style={{ "marginTop": "2px" }} className="date-color font-12 float-start  mb-1 ng-binding"><Calendar className="fe-calendar" /> {moment.utc(item.created).local().format("DD MMM YYYY")}</span>  &nbsp; &nbsp;| &nbsp; <span style={{ "color": "#009157", "fontWeight": 600 }}>{item.category} </span> </div>

                                        </div>
                                        {/* <a href="javascript:void(0)"> */}
                                        <div className="w-100" onClick={() => {
                                            sessionStorage.setItem("selectedNewsItem", JSON.stringify(item));
                                            sessionStorage.setItem("showNewsDetails", "true"); navigate("/NewsDetails");
                                        }} style={{ cursor: 'pointer' }}>
                                            <h4 className="mt-0 mb-1 font-16 text-dark fw-bold ng-binding">{item.title}</h4>
                                            <p style={{ "color": "#6b6b6b" }} className="mb-2 font-14 ng-binding">{item.description}</p>
                                            <p className="read-more">Read more..</p>
                                        </div> {/* </a> */}

                                    </div>
                                    <div className="col-sm-1">
                                        <div className="text-end mt-0 mt-sm-0">
                                            <div className="btn-group">
                                                <button
                                                    type="button"
                                                    className="btn border-0 ps-0 pt-0"
                                                    onClick={() =>
                                                        setOpenDropdownIndex(
                                                            openDropdownIndex === index ? null : index
                                                        )
                                                    }
                                                >
                                                    <Share2 size={20} color="#6c757d" />
                                                </button>

                                                {openDropdownIndex === index && (
                                                    <div
                                                        className="dropdown-menu show shadow-sm rounded"
                                                        style={{
                                                            position: "absolute",
                                                            right: 0,
                                                            top: "100%",
                                                            minWidth: "160px",
                                                            display: "block",
                                                            background: "#fff",
                                                            zIndex: 1000,
                                                        }}
                                                    >
                                                        <button
                                                            className="dropdown-item"
                                                            onClick={() => {
                                                                const subject = encodeURIComponent(
                                                                    `Check out this news: ${item.title}`
                                                                );
                                                                const body = encodeURIComponent(
                                                                    `${item.description}\n\nLink: ${APP_URL}#/NewsDetails?newsId=${item.id}`
                                                                );
                                                                window.location.href = `mailto:?subject=${subject}&body=${body}`;
                                                                setOpenDropdownIndex(null);
                                                            }}
                                                        >
                                                            Share by Email
                                                        </button>
                                                        <button
                                                            className="dropdown-item"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(
                                                                    `${APP_URL}#/NewsDetails?newsId=${item.id}`
                                                                );
                                                                Swal.fire({
                                                                    backdrop: false,
                                                                    title: "Link copied!",
                                                                    icon: "success",
                                                                    confirmButtonText: "OK",
                                                                    showConfirmButton: true,
                                                                    allowOutsideClick: true,
                                                                });
                                                                setOpenDropdownIndex(null);
                                                            }}
                                                        >
                                                            Copy Link
                                                        </button>
                                                    </div>
                                                )}
                                            </div>



                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    ))}




                </div>


            </div>

        </>
    )
}

export default NewsListing
