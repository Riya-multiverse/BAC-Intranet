import * as React from 'react'

const BreadCrumb = () => {
  return (
    // <!-- start page title -->
                        <div className="row">
                            <div className="col-lg-4">
                                <h4 className="page-title fw-bold mb-1 font-20">News Master</h4>
                                <ol className="breadcrumb m-0">
                        
                                    <li className="breadcrumb-item"><a href="settings.html">Settings</a></li>
                                    <li className="breadcrumb-item"> <span className="fe-chevron-right"></span></li>
                                
                                    <li className="breadcrumb-item active">News Master</li>
                                </ol>
                            </div>
                           <div className="col-lg-8">
                            <div className="d-flex flex-wrap align-items-center justify-content-end mt-3">
                                <form className="d-flex flex-wrap align-items-center justify-content-start ng-pristine ng-valid">
                                    
                                    {/* <!-- <label for="status-select" className="me-2">Sort By</label>
                                    
                                    </div> --> */}
                                    
                                  
                                    <a href="settings.html"> <button type="button" className="btn btn-secondary me-1 waves-effect waves-light" ><i className="fe-arrow-left me-1"></i>Back</button></a> 
                                 <a href="add-news.html">  <button type="button" className="btn btn-primary waves-effect waves-light" ><i className="fe-plus-circle me-1"></i>Add</button></a> 
                                </form>
                                
                                
                                {/* <!-- <button type="button" className="btn btn-secondary waves-effect waves-light" data-bs-toggle="modal" data-bs-target="#custom-modal"><i className="fe-filter me-1"></i>Filter</button> --> */}
                        
                            {/* <!-- <button type="button" className="btn btn-secondary waves-effect waves-light" data-bs-toggle="modal" data-bs-target="#custom-modal"><i className="fe-filter me-1"></i>Filter</button> --> */}
                        
                        
                        
                         </div>
                           </div>
                          
                           
                        </div>
                        // <!-- end page title -->
  )
}

export default BreadCrumb
