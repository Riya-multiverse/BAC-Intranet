import * as React from 'react';
//import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import '../../../../styles/global.scss';
import CustomBreadcrumb from '../common/CustomBreadcrumb';

const SectionOverview = () => {

  const Breadcrumb = [

        {

            "MainComponent": "Home",

            "MainComponentURl": "Home",
           

        },

        {

            "MainComponent": "Section Overview",

            "MainComponentURl": "SectionOverview",
             

        }

    ];
  return (
   <div id="wrapper">

<div >
      <div >
        <div className="row">
          <div className="col-xl-12 col-lg-12">
            {/* <div className="row">
              <div className="col-lg-12">
                <h4 className="page-title fw-bold mb-1 font-20">Section Overview</h4>
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item"><a href="javascript:void(0)">Home</a></li>
                  <li className="breadcrumb-item"><span className="fe-chevron-right"></span></li>
                  <li className="breadcrumb-item active">Section Overview</li>
                </ol>
              </div>
            </div> */}
             <CustomBreadcrumb Breadcrumb={Breadcrumb}/>
             </div></div>

             <div className="row">
          <div className="col-xl-12 col-lg-12">
              <div className="grid mt-1">
                <div>
                  {/* Overview Card */}
                  <div className="row">
                    <div className="col-md-5">
                      <div className="card h-100 mb-0">
                        <div className="card-body">
                          <h2 className="page-title text-dark mb-0 font-16">
                            <img src={require("../../assets/sec-1.png")} alt="" />&nbsp; Department Overview
                          </h2>
                          <p className="mt-2 text-dark">
                           The Strategy Department at <strong>Bahrain Airport Company (BAC)</strong> plays a critical role in guiding the organization’s direction.  
            It ensures that BAC’s mission, vision, and long-term goals are translated into clear strategies and measurable outcomes that support Bahrain’s 
            economic development and the success of Bahrain International Airport.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-7 ">
                      <div className="card h-100 mb-0">
                        <div className="card-body">
                          <h2 className="page-title text-dark mb-2 font-16">
                            <img src={require("../../assets/sec-2.png")} alt="" />&nbsp; Roles & Responsibilities
                          </h2>
                          <ul className="text-dark">
                            <li>Define corporate strategy and align departmental objectives with national goals.</li>
<li>Monitor key performance indicators (KPIs) and ensure accountability across functions.</li>
<li>Lead business planning and support executive decision-making with data insights.</li>
<li>Coordinate with regulatory bodies and government stakeholders for policy alignment.</li>
<li>Identify risks, opportunities, and growth areas within the aviation and logistics sector.</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-7 mt-3">
                      <div className="card h-100 mt-0">
                        <div className="card-body">
                          <h2 className="page-title text-dark font-16 mb-2">
                            <img src={require("../../assets/sec-3.png")} alt="" />&nbsp; Key Functions
                          </h2>
                          <div className="function-list">
  <div className="function mb-2">
    <strong className="text-dark">
      <img src={require("../../assets/sec-5.png")} />&nbsp; Strategic Planning
    </strong>
    <br />
    <span >
      Develop long-term strategies and translate them into annual business plans.
    </span>
  </div>

  <div className="function mb-2">
    <strong  className="text-dark">
      <img src={require("../../assets/sec-6.png")} />&nbsp; Performance Management
    </strong>
    <br />
    <span >
      Track progress against KPIs and ensure alignment with BAC’s vision.
    </span>
  </div>

  <div className="function mb-2">
    <strong  className="text-dark">
      <img src={require("../../assets/sec-7.png")} />&nbsp; Stakeholder Engagement
    </strong>
    <br />
    <span >
      Collaborate with airlines, regulators, and government partners.
    </span>
  </div>

  <div className="function">
    <strong  className="text-dark">
      <img src={require("../../assets/sec-8.png")} />&nbsp; Innovation & Transformation
    </strong>
    <br />
    <span >
      Drive continuous improvement, digital transformation, and new initiatives.
    </span>
  </div>
</div>

                        </div>
                      </div>
                    </div>

                    <div className="col-md-5 mt-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h2 className="page-title text-dark font-16 mb-2">
                            <img src={require("../../assets/sec-2.png")} alt="" />&nbsp; How Sections Contribute
                          </h2>
                          <p className="text-dark">Each section within the Strategy Department contributes uniquely...</p>
                        <ul>
<li><strong  className="text-dark">Planning:</strong> Aligns corporate strategy with operational needs.</li>
<li><strong  className="text-dark">Performance:</strong> Measures and tracks results.</li>
<li><strong  className="text-dark">Innovation:</strong> Introduces new solutions to improve competitiveness.</li>
<li><strong  className="text-dark">Engagement:</strong> Builds relationships with internal & external stakeholders.</li>
</ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <aside>
                  <div className="card mt-3">
                    <div className="card-body">
  <h2 className="page-title fw-bold mb-1 font-16">
    <img src={require("../../assets/sec-4.png")} />&nbsp; Contact
  </h2>

  <p>
    <strong className="text-dark">
      <img src={require("../../assets/sec-5.png")} />&nbsp; Strategy Department
    </strong>
    <br />
    <span style={{ paddingLeft: "25px" }}>
      Bahrain Airport Company — Corporate HQ, Muharraq
    </span>
  </p>

  <p>
    <strong className="text-dark">
      <img src={require("../../assets/sec-6.png")} />&nbsp; <i className="fe-phone"></i> +973 17X XXXX
    </strong>
  </p>

  <p>
    <strong className="text-dark">
      <img src={require("../../assets/sec-7.png")} />&nbsp; <i className="fe-envelope"></i>
      <a href="mailto:strategy@bahrainairport.bh">strategy@bahrainairport.bh</a>
    </strong>
  </p>
</div>

                  </div>
                </aside>
              </div>
              </div>
              </div>
          </div>
        </div>
      </div>
    

  

 


  )
}

export default SectionOverview