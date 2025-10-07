import * as React from 'react'
import CustomBreadcrumb from '../../common/CustomBreadcrumb';

interface INewsDetailsProps {
    item?: any;
    onCancel: () => void;

    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
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

const NewsDetails = ({ item, onCancel, setLoading }: INewsDetailsProps) => {
    return (
        <>
            <div className="row">
                <div className="col-lg-2">
                    {/* <h4 className="page-title fw-bold mb-1 font-20">News</h4>
                    <ol className="breadcrumb m-0">

                        <li className="breadcrumb-item"><a href="dashboard.html">Home</a></li>
                        <li className="breadcrumb-item"> <span className="fe-chevron-right"></span></li>
                        <li className="breadcrumb-item active"><a href="news-feed.html">News</a></li>
                    </ol> */}
                    <CustomBreadcrumb Breadcrumb={Breadcrumb} />
                </div>



            </div>

            <div className="row">
                <div className="col-12">


                    <div className="row mt-2">


                        <div className="col-lg-12">
                            <h4 style={{ "lineHeight": "34px" }} className="page-title fw-700 mb-1  pe-5 font-28">Bahrain Airport Company Signs MOU with Valo Aviation, at Paris Airshow 2025, highlighting its Commitment to Supporting Partners Through Infrastructure Tailored to Their Operational Needs</h4>
                        </div>
                        <div className="row mt-2">
                            <div className="col-md-12 col-xl-12">
                                <p className="mb-2 mt-1 d-block">
                                    <span className="pe-2 text-nowrap mb-0 d-inline-block">
                                        <i className="fe-calendar"></i>  18 Jun 2024   &nbsp;  &nbsp;  &nbsp;|&nbsp;  &nbsp;
                                    </span>
                                    <span style={{ color: "#009157", fontWeight: 600 }} className="text-nowrap mb-0 d-inline-block">
                                        Internal
                                    </span>

                                </p>

                            </div>
                        </div>








                    </div>

                    <div className="row mt-0
                                            
                                            ">

                        <p style={{ "lineHeight": "22px" }} className="d-block text-muted mt-2 font-14"> His Excellency Dr. Shaikh Abdullah bin Ahmed Al Khalifa, Minister of Transportation and Telecommunications, affirmed the Kingdom of Bahrain’s continued commitment to the development of the business aviation sector as an integral part of the national air transport system, in line with regional and international advancements in the aviation industry. </p>
                    </div>

                    <div className="row internalmedia filterable-content mt-3">

                        <div className="col-sm-6 col-xl-3 filter-item all web illustrator">
                            <div className="gal-box">
                                <a data-bs-toggle="modal" data-bs-target="#centermodal" className="image-popup" title="Screenshot-1">
                                    <img src="assets/images/new1.png" className="img-fluid" alt="work-thumbnail" data-themekey="#" />
                                </a>

                            </div>
                        </div>

                        <div className="col-sm-6 col-xl-3 filter-item all graphic photography">
                            <div className="gal-box">
                                <a data-bs-toggle="modal" data-bs-target="#centermodal" className="image-popup" title="Screenshot-1">
                                    <img src={require("../../../assets/Banner1.png")} className="img-fluid" alt="work-thumbnail" data-themekey="#" />
                                </a>

                            </div>
                        </div>

                        <div className="col-sm-6 col-xl-3 filter-item all web illustrator">
                            <div className="gal-box">
                                <a data-bs-toggle="modal" data-bs-target="#centermodal" className="image-popup" title="Screenshot-1">
                                    <img src={require("../../../assets/Banner2.png")} className="img-fluid" alt="work-thumbnail" data-themekey="#" />
                                </a>

                            </div>
                        </div>

                        <div className="col-sm-6 col-xl-3 filter-item all graphic illustrator">
                            <div className="gal-box">
                                <a data-bs-toggle="modal" data-bs-target="#centermodal" className="image-popup" title="Screenshot-1">
                                    <img src={require("../../../assets/Banner2.png")} className="img-fluid" alt="work-thumbnail" data-themekey="#" />
                                </a>

                            </div>
                            {/* <!-- end gal-box --> */}
                        </div>
                        {/* <!-- end col --> */}






                    </div>
                    <div className="row mt-2
                                            
                                            ">
                        {/* <!-- <h4 className="fw-bold mb-0 font-18">Overview:</h4> --> */}
                        <p style={{ "lineHeight": "22px" }} className="d-block text-muted mt-2 mb-0 font-14">His Excellency stated that the support extended to business aviation falls within the framework of the Kingdom’s strategic direction to establish an advanced and competitive operational environment—enhancing the Kingdom of Bahrain’s position as a regional hub, attracting international investments and operators, and contributing to the diversification and sustainability of the national economy.</p>
                    </div>

                    <div className="row mt-0
                                            
                                            ">
                        {/* <!-- <h4 className="fw-bold mb-0 font-18">Overview:</h4> --> */}
                        <p style={{ "lineHeight": "22px" }} className="d-block text-muted mt-2 font-14">His Excellency further highlighted that providing dedicated infrastructure and advanced facilities for business aviation services constitutes a key pillar in reinforcing Bahrain International Airport’s (BIA) status as a flexible and efficient hub for this segment. He emphasized that this new partnership reflects the growing confidence of specialized companies in the operational environment in the Kingdom of Bahrain and strengthens the ongoing collaboration between the Ministry of Transportation and Telecommunications and Gulf Air Group (GFG) to advance the Kingdom’s aviation sector across all fields. </p>
                    </div>

                </div>
            </div>
        </>
    )
}

export default NewsDetails
