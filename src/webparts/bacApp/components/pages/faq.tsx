import * as React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../../../../styles/faqglobal.scss";
// import "../../../../styles/global.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useState } from "react";
import { getSP } from "../../loc/pnpjsConfig";
import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { ChevronRight } from 'react-feather';
import CustomBreadcrumb from "../common/CustomBreadcrumb";
const faq = () => {
  const sp: SPFI = getSP();
  const [faqItems, setFaqItems] = useState<any[]>([]);
 const Breadcrumb = [

        {

            "MainComponent": "Home",

            "MainComponentURl": "Home",
           

        },

        {

            "MainComponent": "FAQs",

            "MainComponentURl": "FAQs",
             

        }

    ];
  React.useEffect(() => {
    sp.web.lists
      .getByTitle("FAQ")
      .items.select("Id", "Question", "Answer")()
      .then((items) => {
        setFaqItems(items);
      })
      .catch(console.error);
  }, []);

  React.useEffect(() => {
    if (faqItems.length > 0) {
      const faqElements = document.querySelectorAll(".faq-item");
      faqElements.forEach((item) => {
        const question = item.querySelector(".faq-question");
        if (question) {
          question.addEventListener("click", () => {
            item.classList.toggle("active");
          });
        }
      });
    }
  }, [faqItems]);

  return (
    <div className="content">
      {/* <!-- Start Content--> */}
      <div className="container-fluid  paddb">
        {/* <!-- start page title --> */}
        <div className="row">
          <div className="col-xl-12 col-lg-12">
            <div className="row">
              <div className="col-lg-12 mb-3">
                {/* <h4 className="page-title fw-bold mb-1 font-20">
                  FAQs
                </h4>
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <a href="dashboard.html">Home</a>
                  </li>
                  <li className="breadcrumb-item">
                    <ChevronRight size={14} />
                  </li>
                  <li className="breadcrumb-item active">FAQs</li>
                </ol> */}
                <CustomBreadcrumb Breadcrumb={Breadcrumb}/>
              </div>
               

              <main>
                <div className="faq-container">
                  {faqItems.map((item) => (
                    <div key={item.Id} className="faq-item">
                      <div className="faq-question">
                        <i className="fas fa-chevron-down"></i> {item.Question}
                      </div>
                      <div className="faq-answer">{item.Answer}</div>
                    </div>
                  ))}
                </div>
              </main>
            </div>
          </div>

          {/* <!-- Modal -->
  <!-- Modal --> */}
        </div>
        {/* <!-- end content --> */}
      </div>
    </div>
  );
};

export default faq;
