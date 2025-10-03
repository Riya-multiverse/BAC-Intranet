import * as React from 'react'
// import useUboldConfig from '../common/unboldConfig';
const settings = () => {
    //  useUboldConfig();
    return (
        <>

            <div className="row manage-master mt-3">


                <div className="col-md-3">

                    <a href="Approvals-Master.html">
                        <div className="card-master box1">
                            <div className="icon">
                                <img src={require("../../assets/noun-approval-5526052.png")} data-themekey="#"/>
                            </div>
                            <p className="text-dark">Admin Approvals</p>

                        </div>
                    </a>
                </div>

                <div className="col-md-3">
                    <a href="mediaevent.html">
                        <div className="card-master box1">
                            <div className="icon">
                                <img src={require("../../assets/noun-awards-3455472.png")} data-themekey="#"/>
                            </div>
                            <p className="text-dark">User Training</p>

                        </div>
                    </a>
                </div>

                <div className="col-md-3">

                    <a href="news-master.html">
                        <div className="card-master box1">
                            <div className="icon">
                                <img src={require("../../assets/noun_news_518193bn.png")} data-themekey="#"/>
                            </div>
                            <p className="text-dark">News</p>

                        </div>
                    </a>
                </div>



                <div className="col-md-3">

                    <a href="announcement-master.html">
                        <div className="card-master box1">
                            <div className="icon">
                                <img src={require("../../assets/noun-publication-4594256.png")} data-themekey="#"/>
                            </div>
                            <p className="text-dark">Announcements</p>

                        </div>
                    </a>
                </div>

            </div>
        </>
    )
}

export default settings
