import * as React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../../../../styles/global.scss';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'material-symbols/index.css';
// import * as feather from 'feather-icons';
import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { getSP } from "../../../loc/pnpjsConfig";
import { ChevronRight } from 'react-feather';
import Swal from "sweetalert2";
import { CheckCircle, X, Trash2 } from "react-feather";
import CustomBreadcrumb from '../../common/CustomBreadcrumb';

interface IFaqFormProps {
  item?: any;
  onCancel: () => void;
  onSave: (data: any) => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
const Breadcrumb = [

    {

        "MainComponent": "Settings",

        "MainComponentURl": "Settings",


    },

    {

        "MainComponent": "FAQ Master",

        "MainComponentURl": "FAQMaster",


    }

];

const FaqForm = ({ item, onCancel, onSave ,setLoading}: IFaqFormProps) => {
    const [question, setQuestion] = React.useState<string>("");
  const [answer, setAnswer] = React.useState<string>("");

   const _sp: SPFI = getSP();

    // Prefill values in edit mode (when item is passed)
  React.useEffect(() => {
    if (item) {
      setQuestion(item.Question || "");
      setAnswer(item.Answer || "");
    }
    else {
    setQuestion("");
    setAnswer("");
  }
}, [item]);

  //validation Function
  const validateForm = async () => {
     Array.from(document.getElementsByClassName("border-on-error")).forEach(
      (el: Element) => el.classList.remove("border-on-error")
    );

    let isValid = true;

    //  Check Question field
    const questionInput = document.getElementById("faqQuestion");
    if (!question.trim()) {
      questionInput?.classList.add("border-on-error");
      isValid = false;
    }

    //  Check Answer field
    const answerInput = document.getElementById("faqAnswer");
    if (!answer.trim()) {
      answerInput?.classList.add("border-on-error");
      isValid = false;
    }

    //  Show alert if any field invalid
    if (!isValid) {
      Swal.fire("Please fill all the mandatory fields.");
    
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setLoading(true); 
    try {
     
      const payload = {
        Question: question,
        Answer: answer,
      };

      if (item && item.Id) {
        //  Update existing FAQ (Edit Mode)
        await _sp.web.lists.getByTitle("FAQ").items.getById(item.Id).update(payload);
        console.log("FAQ updated:", payload);
      } else {
        //  Add new FAQ (Add Mode)
        await _sp.web.lists.getByTitle("FAQ").items.add(payload);
        console.log("FAQ added:", payload);
      }

      //  Reset form after save
      onSave(payload);
      setQuestion("");
      setAnswer("");
    } catch (error) {
      console.error("Error saving FAQ:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to save the record.",
        icon: "error",
        backdrop:"false"
      });
    } finally {
      setLoading(false); 
    }
  };

  //Confirmation dialog 
  const confirmAndSubmit = async () => {
    const isValid = await validateForm(); //  Validate before submit
    if (!isValid) {
          Swal.fire({
            title: "Please fill all the mandatory fields.",
            icon: "warning",
            confirmButtonText: "OK",
            backdrop: false,
            allowOutsideClick: false,
          });
          return;
        }

    const isEdit = item && item.Id; //  Detect mode (Add/Edit)

    //  Confirmation popup 
    Swal.fire({
      title: isEdit ? "Do you want to update this FAQ?" : "Do you want to Submit this FAQ?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      reverseButtons: false,
      backdrop: false,
      allowOutsideClick: false,
    }).then(async (result:any) => {
      if (result.isConfirmed) {
        try {
          await handleSubmit(); 
          Swal.fire({
            title: isEdit ? "Updated successfully." : "Submitted successfully.",
            icon: "success",
            confirmButtonText: "OK",
            backdrop: false,
          });
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: isEdit
              ? "Failed to update the FAQ"
              : "Failed to submit the FAQ",
            icon: "error",
            confirmButtonText: "OK",
            backdrop: false,
          });
        }
      }
    });
  };
  
  return (
    <>

      {/* // <!-- start page title --> */}
                        <div className="row">
                            <div className="col-lg-4">
                                {/* <h4 className="page-title fw-bold mb-1 font-20">FAQ Master</h4>
                                <ol className="breadcrumb m-0">
                        
                                    <li className="breadcrumb-item"><a href="settings.html">Settings</a></li>
                                    <li className="breadcrumb-item"> 
                                        <span className="fe-chevron-right"></span>
                                        
                                        </li>
                                
                                    <li className="breadcrumb-item active">FAQ Master</li>
                                </ol> */}
                                <CustomBreadcrumb Breadcrumb={Breadcrumb} />
                            </div>
                           <div className="col-lg-8">
                            <div className="d-flex flex-wrap align-items-center justify-content-end mt-3">
                                <form className="d-flex flex-wrap align-items-center justify-content-start ng-pristine ng-valid">
                                    
                                    
                                    
                                  
                                    {/* <a href="settings.html"> <button type="button" className="btn btn-secondary me-1 waves-effect waves-light" ><i className="fe-arrow-left me-1"></i>Back</button></a> 
                                 <a href="add-news.html">  <button type="button" className="btn btn-primary waves-effect waves-light" ><i className="fe-plus-circle me-1"></i>Add</button></a>  */}
                                </form>
                                
                                
                              
                         </div>
                           </div>
                          
                           
                        </div>
                        {/* // <!-- end page title --></> */}

     <div className="tab-content mt-3">
                  

                        <div className="tab-pane show active" id="profile1" role="tabpanel">
                           
                            <div className="card">
                                <div className="card-body">

                                    <div className="row mt-2">
                                        <div className="col-sm-4">
                                            <div className="mb-3">
                                                <label htmlFor="simpleinput" className="form-label">Question<span className="text-danger">*</span></label>
                                                <input type="text" id="faqQuestion" className="form-control" value={question}
                      onChange={(e:any) => setQuestion(e.target.value)}/>
                                            </div>
                                        </div>
                                     
                                   
                                        {/* <div className="col-lg-6">
                                            <div className="mb-3">
                                                <label htmlFor="simpleinput" className="form-label">Thumbnail
                                                    <span className="text-danger">*</span></label>
                                                <input type="file" id="simpleinput" className="form-control"/>
                                            </div>
                                        </div> */}
                                      
                                        <div className="col-sm-4">
                                            <div className="mb-3">
                                                <label htmlFor="simpleinput" className="form-label">Answer
                                                    <span className="text-danger">*</span></label>
                                                    <textarea className="form-control"  id="faqAnswer" value={answer}
                      onChange={(e) => setAnswer(e.target.value)}></textarea>
                                            </div>
                                        </div>

                                        <div className="row mt-3">
                                            <div className="col-12 text-center">
                                          <button type="button" className="btn btn-success waves-effect waves-light m-1"  onClick={confirmAndSubmit}> <CheckCircle className="me-1" size={16} />
                      {item && item.Id ? "Update" : "Submit"}
                    </button> 
                                                <button type="button" className="btn btn-light waves-effect waves-light m-1" onClick={onCancel}> <X className="me-1" size={16} /> Cancel
                    </button>
                                            </div>
                                        </div>
                                    </div>
                               

                         
                                </div> 
                                {/* <!-- end card-body--> */}
                            </div>
                        


                           
                        </div></div>
      
    </>
  )
}

export default FaqForm
