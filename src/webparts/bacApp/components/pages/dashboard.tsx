import * as React from 'react'
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';



const dashboard = () => {
    const [slideIndex, setSlideIndex] = React.useState(1);
    const slides = [
        {
            quote:
                "During a sudden network outage on June 18, the IT Helpdesk team restored all business-critical services within 2.5 hours.",
            author: "IT Helpdesk",
        },
        {
            quote:
                "Ground Operations achieved a 94% CSAT score in June, their highest this year, following the launch of a staff engagement initiative.",
            author: "Ground Operations",
        },
        {
            quote:
                "The Finance team fully automated monthly reconciliation reports using Power BI, saving an average of 20 hours per month.",
            author: "Finance Department",
        },
    ];

    // ✅ Show the first slide initially
    React.useEffect(() => {
        showSlides(slideIndex);
    }, [slideIndex]);

    // ✅ Next/Prev handlers
    const plusSlides = (n: number) => {
        let newIndex = slideIndex + n;
        if (newIndex > slides.length) newIndex = 1;
        if (newIndex < 1) newIndex = slides.length;
        setSlideIndex(newIndex);
    };

    // ✅ Dot click handler
    const currentSlide = (n: number) => {
        setSlideIndex(n);
    };

    // ✅ Just a wrapper for logic
    const showSlides = (n: number) => {
        // in React, no manual DOM needed — state handles this
        // This function is kept for clarity, but not doing direct DOM
    };

    return (
        <>


            <div className="row">
                <div className="col-xl-9 col-lg-9 tabview1">
                    <div className="row">
                        <div className="col-xl-8 col-lg-8 order-lg-2 order-xl-1">
                            {/* new post */}
                            <div className="carousel1">
                                <div id="carouselExampleIndicators" className="carousel slide" data-bs-ride="carousel">
                                    <ol className="carousel-indicators">
                                        <li data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" className="active"></li>
                                        <li data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1"></li>
                                        <li data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2"></li>
                                    </ol>
                                    <div className="carousel-inner" role="listbox">
                                        <div className="carousel-item active">
                                            <img style={{ width: '100%' }} src={require("../../assets/Banner1.png")} alt="..." className="d-block img-fluid" />
                                            <div className="carousel-caption d-none d-md-block">

                                                <p className="font-18 mb-1 mt-1 ps-4 pe-4 py-0">Bahrain Airport Company</p>
                                            </div>
                                        </div>
                                        <div className="carousel-item">
                                            <img style={{ width: '100%' }} src={require("../../assets/Banner2.png")} alt="..." className="d-block img-fluid" />
                                            <div className="carousel-caption d-none d-md-block">
                                                <p className="font-18 mb-1 mt-1  pe-4 ps-4 py-0">Bahrain Airport Company Signs MOU with Valo Aviation..</p>
                                            </div>
                                        </div>
                                        <div className="carousel-item">
                                            <img style={{ width: '100%' }} src={require("../../assets/Banner2.png")} alt="..." className="d-block img-fluid" />
                                            <div className="carousel-caption d-none d-md-block">
                                                <p className="font-18 mb-1 mt-1  pe-4 ps-4 py-0">Bahrain International Airport constantly works on exciting projects..</p>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            {/* end new post */}


                        </div>
                        <div className="col-xl-4 col-lg-4 order-lg-1 order-xl-1">
                            {/* start profile info */}
                            <div className="card announcementner">

                                <div className="card-body pb-0  height">
                                    <h4 className="header-title font-16 text-dark fw-bold mb-0">Latest Announcement <a style={{ float: 'right' }} className="font-11 fw-normal btn btn-primary rounded-pill waves-effect waves-light view-all" href="announcements.html">View All
                                    </a>
                                    </h4>

                                    <div className="border-bottom mt-1">
                                        <h4 className="mb-0 text-dark fw-bold font-14 mt-0 ng-binding">Hala means Hello in Arabic; Hala Bahrain welcomes visitors to
                                            make their journey..</h4>
                                        <p style={{ marginTop: '5px', lineHeight: '18px' }} className="mb-0 font-13 ng-binding ng-scope">14 Sep 2022</p>


                                        <div className="mt-1 mb-0">
                                            <a href="javascript: void(0);" className="btn btn-sm btn-link text-muted mb-0 font-18 ps-0"><i className="fe-heart text-primary floatl me-1 "></i> <span className="font-12 floatl">18 Likes</span> </a>
                                            <a href="javascript: void(0);" className="btn btn-sm btn-link text-muted mb-0 font-18 "><i className="fe-message-square text-warning floatl me-1"></i> <span className="font-12 floatl">15 Comments</span></a>

                                        </div>

                                    </div>

                                    <div className="mt-2">
                                        <h4 className="mb-0 text-dark fw-bold font-14 mt-0 ng-binding">Cargo & Logistics at Bahrain International Airport</h4>
                                        <p style={{ marginTop: '5px', lineHeight: '18px' }} className="mb-0 font-13 ng-binding ng-scope">14 Jan 2022</p>


                                        <div className="mt-1 mb-0">
                                            <a href="javascript: void(0);" className="btn btn-sm btn-link text-muted pt-0 mb-0 font-18 ps-0"><i className="fe-heart text-primary floatl me-1 "></i> <span className="font-12 floatl">18 Likes</span> </a>
                                            <a href="javascript: void(0);" className="btn btn-sm btn-link text-muted mb-0 font-18 "><i className="fe-message-square text-warning floatl me-1"></i> <span className="font-12 floatl">15 Comments</span></a>

                                        </div>


                                    </div>




                                </div>
                            </div>
                            {/* <!-- end profile info --> */}


                        </div>
                        {/* <!-- end col --> */}




                    </div>
                    <div className="row">
                        <div className="col-xl-12 col-lg-12">
                            <div className="card">
                                <div className="card-body">
                                    <h4 className="header-title font-16 text-dark fw-bold mb-0">Quick Links   <a style={{ "float": "right" }} className="font-11 fw-normal btn btn-primary rounded-pill waves-effect waves-light view-all" href="quick-links.html">View All
                                    </a></h4>
                                    <div className="row mt-3">

                                        <div className="col-sm-2">
                                            <a href="https://outlook.office365.com/"> <img src={require("../../assets/all-2.png")} width="100%" /> </a>
                                        </div>
                                        <div className="col-sm-2">
                                            <a href="https://onedrive.live.com/login"> <img src={require("../../assets/all-3.png")} width="100%" /> </a>
                                        </div>
                                        <div className="col-sm-2">
                                            <a href="https://www.microsoft.com/">  <img src={require("../../assets/all-4.png")} width="100%" /> </a>
                                        </div>
                                        <div className="col-sm-2">
                                            <a href="https://www.microsoft.com/en-us/microsoft-viva"> <img src={require("../../assets/all-5.png")} width="100%" /> </a>
                                        </div>
                                        <div className="col-sm-2">
                                            <a href="https://www.microsoft.com/en-in/microsoft-teams/group-chat-software"> <img src={require("../../assets/all-6.png")} width="100%" /> </a>
                                        </div>
                                        <div className="col-sm-2">
                                            <img src={require("../../assets/all-1.png")} width="100%" />
                                        </div>
                                    </div>

                                </div>
                            </div>


                        </div>



                        <div className="col-xl-5 col-lg-5">
                            <div className="card">


                                <div className="card-body pb-3 gheight">

                                    <h4 className="header-title font-16 text-dark fw-bold mb-0">Staff Recognition   <a style={{ "float": "right" }} className="font-11 fw-normal btn btn-primary rounded-pill waves-effect waves-light view-all" href="contacts-list.html">View All
                                    </a></h4>
                                    <div className="inbox-widget">
                                        <div className="inbox-item mt-1">
                                            <img src={require("../../assets/noun-achievement-6772537.png")} className="alignright" />
                                            <a href="contacts-profile.html"> <div className="inbox-item-img"><img style={{ "marginTop": "-5px" }} src={require("../../assets/user-2.jpg")} className="rounded-circle" alt="" /></div>
                                            </a>
                                            <a href="contacts-profile.html">  <p className="inbox-item-text fw-bold font-14 mb-0 text-dark mt-11 ng-binding">Atul Sharma</p>

                                            </a>
                                            <p style={{ "color": "#6b6b6b", "marginTop": "1px", "fontWeight": "500 !important" }} className="inbox-item-text font-12">IT Department</p>

                                        </div>
                                        <div className="inbox-item">
                                            <img src={require("../../assets/noun-achievement-6772537.png")} className="alignright" />
                                            <a href="contacts-profile.html"> <div className="inbox-item-img"><img style={{ "marginTop": "-5px" }} src={require("../../assets/user-3.jpg")} className="rounded-circle" alt="" /></div>
                                            </a>
                                            <a href="contacts-profile.html">  <p className="inbox-item-text fw-bold font-14 mb-0 text-dark mt-11 ng-binding">Nitin Gupta</p>
                                            </a><p style={{ "color": "#6b6b6b", "marginTop": "1px", "fontWeight": "500 !important" }} className="inbox-item-text font-12">HR Department</p>
                                        </div>
                                        <div className="inbox-item">
                                            <img src={require("../../assets/noun-achievement-6772537.png")} className="alignright" />
                                            <div className="inbox-item-img"><img src={require("../../assets/user-4.jpg")} className="rounded-circle" alt="" /></div>
                                            <p className="inbox-item-text fw-bold font-14 mb-0 text-dark mt-11 ng-binding">Varun Kumar</p>
                                            <p style={{ "color": "#6b6b6b", "marginTop": "1px", "fontWeight": "500 !important" }} className="inbox-item-text font-12">IT Department</p>
                                        </div>
                                        <div className="inbox-item border-0 pb-0">
                                            <img src={require("../../assets/noun-achievement-6772537.png")} className="alignright" />
                                            <div className="inbox-item-img"><img src={require("../../assets/user-2.jpg")} className="rounded-circle" alt="" /></div>

                                            <p className="inbox-item-text fw-bold font-14 mb-0 text-dark mt-11 ng-binding">Atul Sharma</p>
                                            <p style={{ "color": "#6b6b6b", "marginTop": "1px", "fontWeight": "500 !important" }} className="inbox-item-text font-12">Marketing</p>

                                        </div>


                                    </div>


                                </div>
                            </div>
                        </div>

                        <div className="col-xl-7 col-lg-7">
                            <div className="card">

                                <div className="card-body pb-0 gheight">
                                    <h4 className="header-title font-16 text-dark fw-bold mb-0">Policies, Procedures, Forms, and Guidelines
                                        <a style={{ "float": "right" }} className="font-11 fw-normal btn btn-primary rounded-pill waves-effect waves-light view-all" href="policy-procedure.html">View All
                                        </a></h4>


                                    <div className="row mt-2">
                                        <div >
                                            <div className="d-flex border-bottom heit8 align-items-start w-100 justify-content-between pe-0 mb-1 border-radius">

                                                <div className="col-sm-1 p-0">
                                                    <img src={require("../../assets/pdf.png")} width="50" alt="Generic placeholder image" />
                                                </div>
                                                <div className="col-sm-8">
                                                    <div className="w-100 ps-3 pt-0">

                                                        <h5 style={{ "marginTop": "10px", "paddingLeft": "7px" }} className="inbox-item-text fw-bold font-14 mb-0 text-dark">Remote Work Policy</h5>
                                                        <span style={{ "color": "#6b6b6b", "paddingLeft": "7px" }} className="font-12">Defines eligibility, expectations...</span>
                                                    </div>
                                                </div>
                                                <div className="col-sm-1"> <p className="btn btn-sm btn-link text-muted ps-0 pe-0 pt-2"> 2 MB  </p></div>

                                                <div style={{ "textAlign": "right", "paddingRight": "0px" }} className="col-sm-2 pt-2">
                                                    <img src={require("../../assets/eye.png")} className="ms-1" /> <img src={require("../../assets/download.png")} />
                                                </div>


                                                <div>

                                                </div>
                                            </div>

                                            <div className="d-flex border-bottom heit8 align-items-start w-100 justify-content-between pe-0 mb-1 border-radius">

                                                <div className="col-sm-1 p-0">
                                                    <img src={require("../../assets/pdf2.png")} width="50" alt="Generic placeholder image" />
                                                </div>
                                                <div className="col-sm-8">
                                                    <div className="w-100 ps-3 pt-0">

                                                        <h5 style={{ "marginTop": "10px", "paddingLeft": "7px" }} className="inbox-item-text fw-bold font-14 mb-0 text-dark">Travel & Expense Policy</h5>
                                                        <span style={{ "color": "#6b6b6b", "paddingLeft": "7px" }} className="font-12">Outlines rules for domestic and...</span>
                                                    </div>
                                                </div>
                                                <div className="col-sm-1"> <p className="btn btn-sm btn-link text-muted ps-0 pe-0 pt-2"> 2 MB  </p></div>
                                                <div style={{ "textAlign": "right", "paddingRight": "0px" }} className="col-sm-2 pt-2">
                                                    <img src={require("../../assets/eye.png")} className="ms-1" /> <img src={require("../../assets/download.png")} />
                                                </div>


                                                <div>

                                                </div>
                                            </div>
                                            <div className="d-flex border-bottom heit8 align-items-start w-100 justify-content-between pe-0 mb-1 border-radius">

                                                <div className="col-sm-1 p-0">
                                                    <img src={require("../../assets/pdf.png")} width="50" alt="Generic placeholder image" />
                                                </div>
                                                <div className="col-sm-8">
                                                    <div className="w-100 ps-3 pt-0">

                                                        <h5 style={{ "marginTop": "10px", "paddingLeft": "7px" }} className="inbox-item-text fw-bold font-14 mb-0 text-dark">IT Security Forms</h5>
                                                        <span style={{ "color": "#6b6b6b", "paddingLeft": "7px" }} className="font-12">Covers password protocols, data...</span>
                                                    </div>
                                                </div>
                                                <div className="col-sm-1"> <p className="btn btn-sm btn-link text-muted ps-0 pe-0 pt-2"> 2 MB  </p></div>

                                                <div style={{ "textAlign": "right", "paddingRight": "0px" }} className="col-sm-2 pt-2">
                                                    <img src={require("../../assets/eye.png")} className="ms-1" /> <img src={require("../../assets/download.png")} />
                                                </div>


                                                <div>

                                                </div>
                                            </div>

                                            <div className="d-flex border-bottom heit8 align-items-start w-100 justify-content-between pe-0 mb-1 border-radius">

                                                <div className="col-sm-1 p-0">
                                                    <img src={require("../../assets/pdf.png")} width="50" alt="Generic placeholder image" />
                                                </div>
                                                <div className="col-sm-8">
                                                    <div className="w-100 ps-3 pt-0">

                                                        <h5 style={{ "marginTop": "10px", "paddingLeft": "7px" }} className="inbox-item-text fw-bold font-14 mb-0 text-dark">Employee Conduct  Guidelines </h5>
                                                        <span style={{ "color": "#6b6b6b", "paddingLeft": "7px" }} className="font-12">stablishes professional standards...</span>
                                                    </div>
                                                </div>
                                                <div className="col-sm-1"> <p className="btn btn-sm btn-link text-muted ps-0 pe-0 pt-2"> 2 MB  </p></div>


                                                <div style={{ "textAlign": "right", "paddingRight": "0px" }} className="col-sm-2 pt-2">
                                                    <img src={require("../../assets/eye.png")} className="ms-1" /> <img src={require("../../assets/download.png")} />
                                                </div>


                                                <div>

                                                </div>
                                            </div>








                                        </div>








                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>






                </div>


                <div className="col-xl-3 col-lg-6 tabview2">

                    <div className="card">

                        <div className="card-body pb-1 news-fedd">
                            <h4 className="header-title text-dark  fw-bold mb-0">
                                Latest News <a style={{ "float": "right" }} className="font-11 fw-normal btn btn-primary rounded-pill waves-effect waves-light view-all" href="news-feed.html">View
                                    All </a></h4>
                            {/* <!-- <h4 className="header-title mb-3">News Feed</h4> --> */}
                            <div style={{ paddingTop: "12px" }}>
                                <div style={{ marginBottom: "7px" }} className="mt-0 border-bottom newpadd pt-0 ng-scope">
                                    <div className="imgh">
                                        <img src={require("../../assets/News1.png")} width="100%" />
                                    </div>
                                    <h4 style={{ lineHeight: "22px" }} className="fw-bold font-16 text-dark ng-binding">Bahrain Airport Company Signs MOU with..</h4>
                                    <p style={{ lineHeight: "22px" }} className="mb-2 font-14 ng-binding">His Excellency Dr. Shaikh Abdulla bin Ahmed Al Khalifa, Ministe..</p>
                                    <p className="mb-1 font-14 ng-binding">17 Jun 2025</p>

                                </div>

                                <div className="mt-0 mb-0 border-bottom border-0">
                                    <div className="imgh">
                                        <img src={require("../../assets/News2.png")} width="100%" />
                                    </div>
                                    <h4 style={{ listStyle: "22px" }} className="fw-bold font-16 text-dark ng-binding">Bahrain Airport Company conducts Emergency..</h4>
                                    <p style={{ listStyle: "22px" }} className="mb-2 font-14 ng-binding">Bahrain Airport Company (BAC), the operator and managing body..</p>
                                    <p className="mb-0 font-14 ng-binding">May 04th 2025</p></div>







                            </div>
                        </div>
                    </div>

                    <div className="card">

                        <div className="card-body pb-1">

                            <h4 className="header-title text-dark  fw-bold mb-0">
                                Success Stories </h4>
                            <div className="mt-0">

                                <div className="slideshow-container">

                                    {/* <div className="mySlides">
                                        <q>During a sudden network outage on June 18, the IT Helpdesk team restored all business-critical services within 2.5..</q>
                                        <p className="author">IT Helpdesk</p>
                                    </div>

                                    <div className="mySlides">
                                        <q>Ground Operations achieved a 94% CSAT score in June, their highest this year, following the launch of a staff...</q>
                                        <p className="author">Ground Operations</p>
                                    </div>

                                    <div className="mySlides">
                                        <q>The Finance team fully automated monthly reconciliation reports using Power BI, saving an average of 20...</q>
                                        <p className="author">Finance Department</p>
                                    </div> */}
                                    {slides.map((slide, index) => (
                                        <div
                                            key={index}
                                            className={`mySlides `}style={{ display: slideIndex === index + 1 ? "block" : "none" }}
                                        >
                                            <q>{slide.quote}</q>
                                            <p className="author">{slide.author}</p>
                                        </div>
                                    ))}



                                </div>

                                <div className="dot-container1">
                                    {slides.map((_, index) => (
                                        <span
                                            key={index}
                                            className={`dot1 ${slideIndex === index + 1 ? "active1" : ""}`}
                                            onClick={() => currentSlide(index + 1)}
                                        ></span>
                                    ))}
                                </div>

                                {/* <script>
                                    var slideIndex = 1;
                                    showSlides(slideIndex);

                                    function plusSlides(n) {
                                        showSlides(slideIndex += n);
}

                                    function currentSlide(n) {
                                        showSlides(slideIndex = n);
}

                                    function showSlides(n) {
  var i;
                                    var slides = document.getElementsByClassName("mySlides");
                                    var dots = document.getElementsByClassName("dot1");
  if (n > slides.length) {slideIndex = 1}
                                    if (n < 1) {slideIndex = slides.length}
                                    for (i = 0; i < slides.length; i++) {
                                        slides[i].style.display = "none";  
  }
                                    for (i = 0; i < dots.length; i++) {
                                        dots[i].className = dots[i].className.replace(" active1", "");
  }
                                    slides[slideIndex-1].style.display = "block";
                                    dots[slideIndex-1].className += " active1";
}
                                </script> */}





                            </div>
                        </div>

                    </div>



                </div>

            </div>
            {/* <!-- container --> */}
            <div className="row">
                <div className="col-xl-12 col-lg-12">
                    <div style={{ background: "transparent", boxShadow: "none", border: "0px solid #ccc !important", padding: "0px !important" }} className="card">


                        <div style={{ background: "transparent", border: "0px solid #ccc !important", padding: "0px !important" }} className="card-body pb-3">

                            <h4 className="header-title font-16 text-dark fw-bold mb-0">Projects of the Month   <a style={{ float: "right" }} className="font-11 fw-normal btn btn-primary rounded-pill waves-effect waves-light view-all" href="projects.html">View All
                            </a></h4>
                            <div className="row mt-2">
                                <div className="col-lg-4">
                                    <div className="card project-box">
                                        <div className="card-body">
                                            <div className="dropdown float-end">
                                                <a href="#" className="dropdown-toggle card-drop arrow-none" data-bs-toggle="dropdown" aria-expanded="false">
                                                    <i className="fe-more-horizontal- m-0 text-muted h3"></i>
                                                </a>
                                                <div className="dropdown-menu dropdown-menu-end">

                                                    <a className="dropdown-item" href="#">Delete</a>
                                                    <a className="dropdown-item" href="#">View Detail</a>

                                                </div>
                                            </div>
                                            {/* <!-- end dropdown --> */}
                                            {/* <!-- Title--> */}
                                            <h4 className="mt-0 mb-1"><a href="#" className="text-dark fw-bold font-16">Digital Transformation Project</a></h4>
                                            <p className="text-muted text-uppercase mb-1"> <small>IT Department</small></p>
                                            <div className="finish mb-2">Finished</div>
                                            <div>


                                            </div>
                                            {/* <!-- Desc--> */}
                                            <p style={{ color: "#98a6ad" }} className="date-color font-12  mb-3 sp-line-2">The IT team successfully implemented 10 self-service kiosks across Terminal 1 and Terminal 3..<a href="javascript:void(0);" className="fw-bold text-muted">view more</a>
                                            </p>
                                            {/* <!-- Task info--> */}
                                            <p className="mb-1 font-12">
                                                <span style={{ color: "#6e767e" }} className="pe-2 text-nowrap mb-1 d-inline-block">
                                                    <i className="fe-file-text text-muted"></i>
                                                    <b>1</b> Documents
                                                </span>
                                                <span style={{ color: "#6e767e" }} className="text-nowrap mb-1 d-inline-block">
                                                    <i className="fe-message-square text-muted"></i>
                                                    <b>0</b> Comments
                                                </span>
                                            </p>
                                            {/* <!-- Team--> */}
                                            <div className="avatar-group mb-0" id="tooltips-container">
                                                <a href="javascript: void(0);" className="avatar-group-item">
                                                    <img src={require("../../assets/user-1.jpg")} className="rounded-circle avatar-sm" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="bottom" aria-label="Mat Helme" data-bs-original-title="Mat Helme" data-themekey="#" />
                                                </a>

                                                <a href="javascript: void(0);" className="avatar-group-item">
                                                    <img src={require("../../assets/user-2.jpg")} className="rounded-circle avatar-sm" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="bottom" aria-label="Michael Zenaty" data-bs-original-title="Michael Zenaty" data-themekey="#" />
                                                </a>

                                                <a href="javascript: void(0);" className="avatar-group-item">
                                                    <img src={require("../../assets/user-3.jpg")} className="rounded-circle avatar-sm" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="bottom" aria-label="James Anderson" data-bs-original-title="James Anderson" data-themekey="#" />
                                                </a>

                                                <a href="javascript: void(0);" className="avatar-group-item">
                                                    <img src={require("../../assets/user-4.jpg")} className="rounded-circle avatar-sm" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="bottom" aria-label="Mat Helme" data-bs-original-title="Mat Helme" data-themekey="#" />
                                                </a>

                                                <a href="javascript: void(0);" className="text-dark font-12 fw-bold">
                                                    +5 more
                                                </a>
                                            </div>
                                            {/* <!-- Progress--> */}

                                        </div>
                                    </div>
                                    {/* <!-- end card box--> */}
                                </div>
                                <div className="col-lg-4">
                                    <div className="card project-box">
                                        <div className="card-body">
                                            <div className="dropdown float-end">
                                                <a href="#" className="dropdown-toggle card-drop arrow-none" data-bs-toggle="dropdown" aria-expanded="false">
                                                    <i className="fe-more-horizontal- m-0 text-muted h3"></i>
                                                </a>
                                                <div className="dropdown-menu dropdown-menu-end">

                                                    <a className="dropdown-item" href="#">Delete</a>
                                                    <a className="dropdown-item" href="#">View Detail</a>

                                                </div>
                                            </div>
                                            {/* <!-- end dropdown --> */}
                                            {/* <!-- Title--> */}
                                            <h4 className="mt-0 mb-1"><a href="#" className="text-dark fw-bold font-16">Green Office Certification Initiative</a></h4>
                                            <p className="text-muted text-uppercase mb-1"> <small>Facilities Department</small></p>
                                            <div style={{ "background": "#6b6f6f !important", "color": "#fff" }} className="finish mb-2">Ongoing</div>
                                            {/* <!-- Desc--> */}
                                            <p style={{ "color": "#98a6ad" }} className="date-color font-12  mb-3 sp-line-2">BAC’s Facilities team completed a company-wide energy audit and implemented
                                                ante...<a href="javascript:void(0);" className="fw-bold text-muted">view more</a>
                                            </p>
                                            {/* <!-- Task info--> */}
                                            <p className="mb-1 font-12">
                                                <span style={{ "color": "#6e767e" }} className="pe-2 text-nowrap mb-1 d-inline-block">
                                                    <i className="fe-file-text text-muted"></i>
                                                    <b>1</b> Documents
                                                </span>
                                                <span style={{ "color": "#6e767e" }} className="text-nowrap mb-1 d-inline-block">
                                                    <i className="fe-message-square text-muted"></i>
                                                    <b>0</b> Comments
                                                </span>
                                            </p>
                                            {/* <!-- Team--> */}
                                            <div className="avatar-group mb-0" id="tooltips-container">
                                                <a href="javascript: void(0);" className="avatar-group-item">
                                                    <img src={require("../../assets/user-1.jpg")} className="rounded-circle avatar-sm" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="bottom" aria-label="Mat Helme" data-bs-original-title="Mat Helme" data-themekey="#" />
                                                </a>

                                                <a href="javascript: void(0);" className="avatar-group-item">
                                                    <img src={require("../../assets/user-2.jpg")} className="rounded-circle avatar-sm" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="bottom" aria-label="Michael Zenaty" data-bs-original-title="Michael Zenaty" data-themekey="#" />
                                                </a>

                                                <a href="javascript: void(0);" className="avatar-group-item">
                                                    <img src={require("../../assets/user-3.jpg")} className="rounded-circle avatar-sm" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="bottom" aria-label="James Anderson" data-bs-original-title="James Anderson" data-themekey="#" />
                                                </a>


                                            </div>
                                            {/* <!-- Progress--> */}

                                        </div>
                                    </div>
                                    {/* <!-- end card box--> */}
                                </div>
                                <div className="col-lg-4">
                                    <div className="card project-box">
                                        <div className="card-body">
                                            <div className="dropdown float-end">
                                                <a href="#" className="dropdown-toggle card-drop arrow-none" data-bs-toggle="dropdown" aria-expanded="false">
                                                    <i className="fe-more-horizontal- m-0 text-muted h3"></i>
                                                </a>
                                                <div className="dropdown-menu dropdown-menu-end">

                                                    <a className="dropdown-item" href="#">Delete</a>
                                                    <a className="dropdown-item" href="#">View Detail</a>

                                                </div>
                                            </div>
                                            {/* <!-- end dropdown --> */}
                                            {/* <!-- Title--> */}
                                            <h4 className="mt-0 mb-1"><a href="#" className="text-dark fw-bold font-16">Employee Feedback Portal</a></h4>
                                            <p className="text-muted text-uppercase mb-1"> <small>HR Department</small></p>
                                            {/* <p className="text-muted text-uppercase mb-2"><i className="mdi mdi-account-circle"></i> <small>System Account</small></p> */}
                                            <div style={{ "background": "#6b6f6f !important", "color": "#fff" }} className="finish mb-2">Ongoing</div>
                                            {/* <!-- Desc--> */}
                                            <p style={{ "color": "#98a6ad" }} className="date-color font-12  mb-3 sp-line-2">HR launched a new internal feedback platform to gather employee suggestions
                                                ante...<a href="javascript:void(0);" className="fw-bold text-muted">view more</a>
                                            </p>
                                            {/* <!-- Task info--> */}
                                            <p className="mb-1 font-12">
                                                <span style={{ "color": "#6e767e" }} className="pe-2 text-nowrap mb-1 d-inline-block">
                                                    <i className="fe-file-text text-muted"></i>
                                                    <b>1</b> Documents
                                                </span>
                                                <span style={{ "color": "#6e767e" }} className="text-nowrap mb-1 d-inline-block">
                                                    <i className="fe-message-square text-muted"></i>
                                                    <b>0</b> Comments
                                                </span>
                                            </p>
                                            {/* <!-- Team--> */}
                                            <div className="avatar-group mb-0" id="tooltips-container">
                                                <a href="javascript: void(0);" className="avatar-group-item">
                                                    <img src={require("../../assets/user-1.jpg")} className="rounded-circle avatar-sm" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="bottom" aria-label="Mat Helme" data-bs-original-title="Mat Helme" data-themekey="#" />
                                                </a>

                                                <a href="javascript: void(0);" className="avatar-group-item">
                                                    <img src={require("../../assets/user-2.jpg")} className="rounded-circle avatar-sm" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="bottom" aria-label="Michael Zenaty" data-bs-original-title="Michael Zenaty" data-themekey="#" />
                                                </a>

                                                <a href="javascript: void(0);" className="avatar-group-item">
                                                    <img src={require("../../assets/user-3.jpg")} className="rounded-circle avatar-sm" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="bottom" aria-label="James Anderson" data-bs-original-title="James Anderson" data-themekey="#" />
                                                </a>


                                            </div>
                                            {/* <!-- Progress--> */}

                                        </div>
                                    </div>
                                    {/* <!-- end card box--> */}
                                </div>








                            </div>


                        </div>
                    </div>
                </div>


            </div>
        </>
    )
}

export default dashboard
