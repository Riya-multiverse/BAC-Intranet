import * as React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// import '../../../../styles/global.scss';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'material-symbols/index.css';
// import * as feather from 'feather-icons';
import { ChevronRight } from 'react-feather';

interface INewsFormProps {
  item?: any;
  onCancel: () => void;
  onSave: (data: any) => void;
}

const NewsForm = ({ item, onCancel, onSave }: INewsFormProps) => {
  return (
    <>

      {/* // <!-- start page title --> */}
                        <div className="row">
                            <div className="col-lg-4">
                                <h4 className="page-title fw-bold mb-1 font-20">News Master</h4>
                                <ol className="breadcrumb m-0">
                        
                                    <li className="breadcrumb-item"><a href="settings.html">Settings</a></li>
                                    <li className="breadcrumb-item"> 
                                        {/* <span className="fe-chevron-right"></span> */}
                                        <ChevronRight size={20} color="#000" />
                                        </li>
                                
                                    <li className="breadcrumb-item active">News Master</li>
                                </ol>
                            </div>
                           <div className="col-lg-8">
                            <div className="d-flex flex-wrap align-items-center justify-content-end mt-3">
                                <form className="d-flex flex-wrap align-items-center justify-content-start ng-pristine ng-valid">
                                    
                                    
                                    
                                  
                                    <a href="settings.html"> <button type="button" className="btn btn-secondary me-1 waves-effect waves-light" ><i className="fe-arrow-left me-1"></i>Back</button></a> 
                                 <a href="add-news.html">  <button type="button" className="btn btn-primary waves-effect waves-light" ><i className="fe-plus-circle me-1"></i>Add</button></a> 
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
                                        <div className="col-lg-6">
                                            <div className="mb-3">
                                                <label htmlFor="simpleinput" className="form-label">News Title<span className="text-danger">*</span></label>
                                                <input type="text" id="simpleinput" className="form-control"/>
                                            </div>
                                        </div>
                                     
                                   
                                        <div className="col-lg-6">
                                            <div className="mb-3">
                                                <label htmlFor="simpleinput" className="form-label">Thumbnail
                                                    <span className="text-danger">*</span></label>
                                                <input type="file" id="simpleinput" className="form-control"/>
                                            </div>
                                        </div>
                                      
                                        <div className="col-lg-12">
                                            <div className="mb-3">
                                                <label htmlFor="simpleinput" className="form-label">Description
                                                    <span className="text-danger">*</span></label>
                                                    <textarea className="form-control"  id="floatingTextarea2" style={{ height: "100px" }}></textarea>
                                            </div>
                                        </div>

                                        <div className="row mt-3">
                                            <div className="col-12 text-center">
                                           <a href="news-master.html"><button type="button" className="btn btn-success waves-effect waves-light m-1" onClick={onSave}><i className="fe-check-circle me-1"></i> Submit</button> </a>
                                                <button type="button" className="btn btn-light waves-effect waves-light m-1" onClick={onCancel}><i className="fe-x me-1"></i> Cancel</button>
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

export default NewsForm
