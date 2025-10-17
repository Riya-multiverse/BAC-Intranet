import * as React from 'react'
import CustomBreadcrumb from '../../common/CustomBreadcrumb';
import { getSP } from '../../../loc/pnpjsConfig';
import { SPFI } from '@pnp/sp';
import { useNavigate } from 'react-router-dom';
import * as moment from 'moment';
const PhotoGalleryMain = () => {
    const sp: SPFI = getSP();
      const navigate = useNavigate();
    const [activeTab, setActiveTab] = React.useState("all");
    const [Loading, setLoading] = React.useState(false);
    const [masterlistdata, setmasterlistdata] = React.useState<any[]>([]);
    const Breadcrumb = [
        {
            MainComponent: "Home",

            MainComponentURl: "Home",
        },

        {
            MainComponent: "Photo Gallery",

            MainComponentURl: "PhotoGallery",
        },
    ];

   

    React.useEffect(() => {

        const fetchData = async () => {
            setLoading(true);
            try {
                const items = await sp.web.lists
                    .getByTitle("PhotoGallery")
                    .items.select(
                        "Id",
                        "Title",
                        "Department/Id,Created,Author/Title",
                        "Department/DepartmentName,PhotoGalleryIDId,PhotoGalleryID/ID"
                    )
                    .expand("Department,PhotoGalleryID,Author")
                    .orderBy("Created", false)();

                // const formatted = items.map((item: any, index: number) => ({

                //     Id: item.Id,
                //     SNo: index + 1,
                //     Title: item.Title || "",
                //     Department: item.Department?.DepartmentName || "",
                //     Created: item.Created,
                //     PhotoGalleryIDId: item.PhotoGalleryIDId
                // }));
                const formatted = await Promise.all(
                    items.map(async (item: any, index: number) => {
                        // const imageIds =
                        //     item.PhotoGalleryIDId?.map((img: any) => img.ID) || [];
                        const imageIds =
                            item.PhotoGalleryIDId || [];

                        const imageLinks = imageIds.length > 0
                            ? await getDocumentLinkByID(imageIds)
                            : [];

                        return {
                            Id: item.Id,
                            SNo: index + 1,
                            Title: item.Title || "",
                            Department: item.Department?.DepartmentName || "",

                            PhotoGalleryIDId: item.PhotoGalleryIDId,
                            Created:moment.utc(item.Created).local().format("DD MMM YYYY") ,
                            Author: item.Author?.Title,
                            images: imageLinks.map((img: any) => ({
                                name: img.FileLeafRef,
                                url: img.FileRef,
                            })),
                        };
                    })
                );
                setmasterlistdata(formatted);
            } catch (error) {
                console.error("Error fetching SuccessStories:", error);
            } finally {
                setLoading(false);
            }
        };


        fetchData();
    }, []);

    const getDocumentLinkByID = async (AttachmentId: number[]) => {
        if (!AttachmentId || AttachmentId.length === 0) return [];

        try {
            const results = await Promise.all(
                AttachmentId.map(async (id) => {
                    const res = await sp.web.lists
                        .getByTitle("PhotoGalleryDocs")
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

    return (
        <>
            {Loading && (
                <div className="loadernewadd mt-10">
                    <div>
                        <img
                            src={require("../../../assets/BAC_loader.gif")}
                            className="alignrightl"
                            alt="Loading..."
                        />
                    </div>
                    <span>Loading </span>{" "}
                    <span>
                        <img
                            src={require("../../../assets/edcnew.gif")}
                            className="alignrightl"
                            alt="Loading..."
                        />
                    </span>
                </div>
            )}
            <div className="row">
                <div className="col-xl-12 col-lg-12">
                    <div className="row">
                        <div className="col-lg-12">
                            <CustomBreadcrumb Breadcrumb={Breadcrumb} />

                        </div>
                        <div className="row mt-3">
                            <div className="col-12">
                                <div className="card p-2">
                                    <div className="">
                                        <div className="row">
                                            <div className="col-md-12">
                                                {/* <div className="text-center filter-menu">
                                                    <a href="javascript: void(0);" className="filter-menu-item active" data-rel="all">All</a>

                                                    <a href="javascript: void(0);" className="filter-menu-item" data-rel="graphic">Photo</a>

                                                    <a href="javascript: void(0);" className="filter-menu-item" data-rel="web">Latest Upload </a>
                                                </div> */}
                                                <div className="text-center filter-menu">
                                                    <button type='button'
                                                        className={`filter-menu-item btn ${activeTab === "all" ? "active" : ""
                                                            }`}
                                                        onClick={() => setActiveTab("all")}
                                                    >
                                                        All
                                                    </button>

                                                    <button type='button'
                                                        className={`filter-menu-item btn ${activeTab === "photo" ? "active" : ""
                                                            }`}
                                                        onClick={() => setActiveTab("photo")}
                                                    >
                                                        Photo
                                                    </button>

                                                    <button type='button'
                                                        className={`filter-menu-item btn ${activeTab === "latest" ? "active" : ""
                                                            }`}
                                                        onClick={() => setActiveTab("latest")}
                                                    >
                                                        Latest Upload
                                                    </button>
                                                </div>
                                            </div>


                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ "float": "left", "width": "100%" }} className="desknewview mt-0">


                            <div className="pb-0">
                                <div className="row internalmedia1  filterable-content mt-2">
                                    {masterlistdata.map((item) => (
                                        <div key={item.id} className="col-sm-6 col-xl-3 filter-item">
                                            <div className="gal-box" onClick={() => {
                                                sessionStorage.setItem("selectedItem", JSON.stringify(item));
                                                sessionStorage.setItem("showDetails", "true"); navigate("/PhotoGalleryInternal")
                                            }} >
                                                {item.images.slice(0, 1).map((img: any, index: number) => (
                                                    <a href="javascript:void(0)" className="image-popup" title={img.name}>
                                                        <div className="newbg">
                                                            <img src={img.url} width="100%" alt="Gallery" />
                                                        </div>
                                                    </a>
                                                ))}
                                                <div className="gall-info">
                                                    <h4 className="font-16 mb-0 text-dark fw-bold mt-0">
                                                        {item.Title}
                                                    </h4>
                                                    <p
                                                        style={{
                                                            borderRadius: 4,
                                                            fontWeight: 600,
                                                            color: "#da291c",
                                                            top: 3,
                                                            position: "relative",
                                                        }}
                                                        className="font-14 float-start mt-0 mb-1"
                                                    >
                                                        {item.PhotoGalleryIDId.length} Photos
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                    ))}

                                    {/* <div className="row internalmedia1  filterable-content mt-2">



                                    <div className="col-sm-6 col-xl-3 filter-item all web illustrator">
                                        <div className="gal-box">

                                            <a href="media-internal.html" className="image-popup" title="Screenshot-1">
                                                <div className="newbg">
                                                    <img src="gal1.jpg" width="100%" alt="Gallery Image" />
                                                </div>   </a>
                                            <div className="gall-info">
                                                <a href="media-internal.html"> <h4 className="font-16 mb-0 text-dark fw-bold mt-0"> New Bahrain International Airport</h4>
                                                    <p style={{ borderRadius: 4, fontWeight: 600, color: "#da291c", top: 3, position: "relative" }} className="font-14  float-start mt-0 mb-1">16 Photos</p>
                                                </a>
                                            </div> 
                            </div> 
                        </div> 


                        <div className="col-sm-6 col-xl-3 filter-item all web illustrator">
                            <div className="gal-box">

                                <a href="media-internal.html" className="image-popup" title="Screenshot-1">
                                    <div className="newbg">
                                        <img src="gall1.png" width="100%" alt="Gallery Image" />
                                    </div>   </a>
                                <div className="gall-info">
                                    <a href="media-internal.html"> <h4 className="font-16 mb-0 text-dark fw-bold mt-0">Bahrain Airport Hotel</h4>
                                        <p style={{ borderRadius: 4, fontWeight: 600, color: "#da291c", top: 3, position: "relative" }} className="font-14  float-start mt-0 mb-1">5 Photos</p>
                                    </a>
                                </div> 
                            </div> 
                        </div> 

                        <div className="col-sm-6 col-xl-3 filter-item all web illustrator">
                            <div className="gal-box">

                                <a href="media-internal.html" className="image-popup" title="Screenshot-1">
                                    <div className="newbg">
                                        <img src="gall3.png" width="100%" alt="Gallery Image" />
                                    </div>   </a>
                                <div className="gall-info">
                                    <a href="media-internal.html"> <h4 className="font-16 mb-0 text-dark fw-bold mt-0">Archaeology Gallery</h4>
                                        <p style={{ borderRadius: 4, fontWeight: 600, color: "#da291c", top: 3, position: "relative" }} className="font-14  float-start mt-0 mb-1">5 Photos</p>
                                    </a>
                                </div> 
                            </div> 
                        </div> 

                        <div className="col-sm-6 col-xl-3 filter-item all web illustrator">
                            <div className="gal-box">

                                <a href="#" className="image-popup" title="Screenshot-1">
                                    <div className="newbg">
                                        <img src="gal5.png" width="100%" alt="Gallery Image" />
                                    </div>   </a>
                                <div className="gall-info">
                                    <h4 className="font-16 mb-0 text-dark fw-bold mt-0">Duty Free Islands</h4>
                                    <p style={{ borderRadius: 4, fontWeight: 600, color: "#da291c", top: 3, position: "relative" }} className="font-14  float-start mt-0 mb-1">2 Photos</p>

                                </div>
                            </div>
                        </div> 

                        <div className="col-sm-6 col-xl-3 filter-item all web illustrator">
                            <div className="gal-box">

                                <a href="#" className="image-popup" title="Screenshot-1">
                                    <div className="newbg">
                                        <img src="gal6.png" width="100%" alt="Gallery Image" />
                                    </div>   </a>
                                <div className="gall-info">
                                    <h4 className="font-16 mb-0 text-dark fw-bold mt-0">Multi-Story Car Park B</h4>
                                    <p style={{ borderRadius: 4, fontWeight: 600, color: "#da291c", top: 3, position: "relative" }} className="font-14  float-start mt-0 mb-1">4 Photos</p>

                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6 col-xl-3 filter-item all web illustrator">
                            <div className="gal-box">

                                <a href="#" className="image-popup" title="Screenshot-1">
                                    <div className="newbg">
                                        <img src="gal7.png" width="100%" alt="Gallery Image" />
                                    </div>   </a>
                                <div className="gall-info">
                                    <h4 className="font-16 mb-0 text-dark fw-bold mt-0">Public Transport</h4>
                                    <p style={{ borderRadius: 4, fontWeight: 600, color: "#da291c", top: 3, position: "relative" }} className="font-14  float-start mt-0 mb-1">2 Photos</p>

                                </div>
                            </div>
                        </div>



                        <div className="col-sm-6 col-xl-3 filter-item all web illustrator">
                            <div className="gal-box">

                                <a href="#" className="image-popup" title="Screenshot-1">
                                    <div className="newbg">
                                        <img src="gal8.png" width="100%" alt="Gallery Image" />
                                    </div>   </a>
                                <div className="gall-info">
                                    <h4 className="font-16 mb-0 text-dark fw-bold mt-0">Dining & Restaurants</h4>
                                    <p style={{ borderRadius: 4, fontWeight: 600, color: "#da291c", top: 3, position: "relative" }} className="font-14  float-start mt-0 mb-1">16 Photos</p>

                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6 col-xl-3 filter-item all web illustrator">
                            <div className="gal-box">

                                <a href="#" className="image-popup" title="Screenshot-1">
                                    <div className="newbg">
                                        <img src="gal9.png" width="100%" alt="Gallery Image" />
                                    </div>   </a>
                                <div className="gall-info">
                                    <h4 className="font-16 mb-0 text-dark fw-bold mt-0">Souq Al Qaisariya</h4>
                                    <p style={{ borderRadius: 4, fontWeight: 600, color: "#da291c", top: 3, position: "relative" }} className="font-14  float-start mt-0 mb-1">2 Photos</p>


                                </div>
                            </div>
                        </div>


                    </div> */}
                                </div>
                            </div>
                            {/* If no items */}
                            {masterlistdata.length === 0 && (
                                <div className="text-center p-3 text-muted">No items found.</div>
                            )}
                        </div>


                    </div >





                </div >






            </div >

        </>
    )
}

export default PhotoGalleryMain
