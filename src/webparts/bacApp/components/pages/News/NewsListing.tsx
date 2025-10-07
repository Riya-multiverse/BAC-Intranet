import * as React from 'react'
import { Breadcrumb } from 'react-bootstrap';
import CustomBreadcrumb from '../../common/CustomBreadcrumb';
import { Share2, Share,Calendar } from 'react-feather';
import { getSP } from '../../../loc/pnpjsConfig';
import { SPFI } from '@pnp/sp';
interface INewsListingProps {
    
    onEdit: (item: any) => void;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
const NewsListing = ({onEdit, setLoading }: INewsListingProps) => {
    const [newsItems, setNewsItems] = React.useState<any[]>([]);
    React.useEffect(() => {

        const fetchNews = async () => {
            try {
                const sp: SPFI = getSP();
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
                        "Created"
                    )
                    .expand("Department").filter("SourceType eq 'News'")
                    .orderBy("Created", false)();

                console.log(" Raw News items:", items);

                const formatted = items.map((item: any, index: number) => ({
                    id: item.Id,
                    sno: index + 1,
                    title: item.Title,
                    description: item.Description,
                    department: item.Department?.DepartmentName || "",
                    departmentId: item.Department?.Id || null,
                    category: item.Category || "",
                    overview: item.Overview || "",
                    created: new Date(item.Created).toLocaleDateString(),
                }));

                setNewsItems(formatted);
                console.log(" Formatted news data:", formatted);
            } catch (err) {
                console.error(" Error fetching news data:", err);
            }
            finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

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
                    {/* <h4 className="page-title fw-bold mb-1 font-20">News</h4>
                    <ol className="breadcrumb m-0">

                        <li className="breadcrumb-item"><a href="dashboard.html">Home</a></li>
                        <li className="breadcrumb-item"> <span className="fe-chevron-right"></span></li>
                        <li className="breadcrumb-item active">News</li>
                    </ol> */}
                </div>
                <div className="col-lg-10">
                    <div className="d-flex flex-wrap align-items-center justify-content-end mt-3 mb-3">
                        <div style={{ width: '310px' }}>
                            <label style={{ float: 'left', textAlign: 'right', width: '150px' }} htmlFor="inputPassword2" className="me-2 mt-1">Select Category</label>
                            <select style={{ float: 'left', width: '130px' }} className="form-select me-1">
                                <option>All</option>
                                <option>Internal</option>
                                <option>External</option>
                            </select></div>

                        <label htmlFor="status-select" className="me-2">From</label>
                        <div className="me-3">
                            <input type="date" className="form-control my-1 my-md-0" id="inputPassword2" placeholder="Search..." />
                        </div>

                        <label htmlFor="status-select" className="me-2">To</label>
                        <div className="me-2">
                            <input type="date" className="form-control my-1 my-md-0" id="inputPassword2" placeholder="Search..." />
                        </div>





                    </div>
                </div>


            </div>

            <div className="row mt-2">
                <div className="col-lg-5">
                    <div className="imagemani mt-2 me-2">
                        <img src={require("../../../assets/Banner1.png")} data-themekey="#" />
                    </div>
                </div>
                <div className="col-lg-7">
                    <div className="row">
                        <div className="col-sm-3 text-left">
                            <span style={{ "padding": "5px", "borderRadius": "4px", "fontWeight": 500, "color": "#009157", "top": 0, "position": "relative" }} className="posnew font-14 float-start mt-2">Latest News</span>

                        </div>
                        <div className="col-lg-12">
                            <h4 style={{ "lineHeight": "34px" }} className="page-title fw-700 mb-1  pe-5 font-28">Bahrain Airport Company Signs MOU with Valo Aviation, at Paris Airshow 2025, highlighting its Commitment...
                            </h4>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                <p className="mb-2 mt-1 d-block">
                                    <span style={{ "fontWeight": 400 }} className="pe-2 text-nowrap color-new font-12 mb-0 d-inline-block">
                                        <Calendar className="fe-calendar" />  17 Jun 2025  &nbsp;  &nbsp;  &nbsp;|
                                    </span>
                                    <span style={{ "fontWeight": 400 }} className="text-nowrap mb-0 color-new font-12 d-inline-block">
                                        Author: <span style={{ "color": "#009157", "fontWeight": 600 }}>Ali Rashid &nbsp;  &nbsp;  &nbsp;|&nbsp;  &nbsp;  &nbsp;
                                        </span>
                                        <span className="text-nowrap mb-0 color-new font-12 d-inline-block">
                                            4 min read
                                        </span>
                                    </span></p>

                                <div style={{ "clear": "both", "lineHeight": "22px" }}> <p style={{ "lineHeight": "20px", "fontWeight": 400 }} className="d-block color-new font-14">His Excellency Dr. Shaikh Abdullah bin Ahmed Al Khalifa, Minister of Transportation and Telecommunications, affirmed the Kingdom of Bahrain’s continued commitment to the development of the business aviation sector as an integral part of the national air transport system, in line with regional and international advancements in the aviation industry.</p>
                                </div>
                                <a href="newsnew-internal.html"> <div style={{ "height": "40px", "lineHeight": "24px" }} className="btn btn-primary rounded-pill font-16 mt-0">Read more..</div> </a>

                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <div className="tab-content mt-4">
                <div className="tab-pane show active" id="home1">
                    {newsItems.map((item, index) => (
                        <div className="card mb-2">
                            <div className="card-body">
                                <div className="row align-items-start">
                                    <div className="col-sm-2">
                                        <a href="NewsInternal">   <div className="imagehright">
                                            <img className="d-flex align-self-center me-3 w-100" src={require("../../../assets/Banner1.png")} alt="Generic placeholder image" />

                                        </div> </a>
                                    </div>
                                    <div className="col-sm-9">
                                        <div className="row">
                                            <div className="col-sm-3"> <span style={{ "marginTop": "2px" }} className="date-color font-12 float-start  mb-1 ng-binding"><Calendar className="fe-calendar" /> {item.created}</span>  &nbsp; &nbsp;| &nbsp; <span style={{ "color": "#009157", "fontWeight": 600 }}>{item.category} </span> </div>

                                        </div>
                                        <a href="newsnew-internal.html">  <div className="w-100">
                                            <h4 className="mt-0 mb-1 font-16 text-dark fw-bold ng-binding">{item.title}</h4>
                                            <p style={{ "color": "#6b6b6b" }} className="mb-2 font-14 ng-binding">{item.description}</p>
                                            <p className="read-more">Read more..</p>
                                        </div> </a>

                                    </div>
                                    <div className="col-sm-1">
                                        <div className="text-end mt-0 mt-sm-0">
                                            <div className="btn-group">
                                                <button type="button" className="btn border-0 ps-0 pt-0 dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                    {/* <i className="fe-share-2 font-22 text-dark"></i> */}
                                                    <Share2 size={20} color="#6c757d" />
                                                </button>
                                                <div className="dropdown-menu" >
                                                    <a className="dropdown-item" href="#">Share by email</a>
                                                    <a className="dropdown-item" href="#">Copy Link</a>

                                                </div>
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
