import * as React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// import '../../../../styles/global.scss';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'material-symbols/index.css';
// import * as feather from 'feather-icons';
import { ChevronRight } from 'react-feather';

interface INewsTableProps {
    onAdd: () => void;
    onEdit: (item: any) => void;
}

const NewsTable = ({ onAdd, onEdit }: INewsTableProps) => {
    return (
        <>

        {/* <!-- start page title --> */}
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
                                    
                                    {/* <!-- <label for="status-select" className="me-2">Sort By</label>
                                    
                                    </div> --> */}
                                    
                                  
                                    {/* <a href="settings.html">  */}
                                        <button type="button" className="btn btn-secondary me-1 waves-effect waves-light" onClick={onAdd}><i className="fe-arrow-left me-1"></i>Back</button>
                                        {/* </a>  */}
                                 {/* <a href="add-news.html">  */}
                                     <button type="button" className="btn btn-primary waves-effect waves-light" onClick={onEdit}><i className="fe-plus-circle me-1"></i>Add</button>
                                     {/* </a>  */}
                                </form>
                                
                                
                                {/* <!-- <button type="button" className="btn btn-secondary waves-effect waves-light" data-bs-toggle="modal" data-bs-target="#custom-modal"><i className="fe-filter me-1"></i>Filter</button> --> */}
                        
                            {/* <!-- <button type="button" className="btn btn-secondary waves-effect waves-light" data-bs-toggle="modal" data-bs-target="#custom-modal"><i className="fe-filter me-1"></i>Filter</button> --> */}
                        
                        
                        
                         </div>
                           </div>
                          
                           
                        </div>
                        {/* <!-- end page title --> */}
        <div className="tab-content mt-3">


            <div className="tab-pane show active" id="profile1" role="tabpanel">

                <div className="card">
                    <div className="card-body">


                        <div id="cardCollpase4" className="collapse show">
                            <div className="table-responsive pt-0">
                                <table className="mtable table-centered table-nowrap table-borderless mb-0">
                                    <thead>
                                        <tr>
                                            <th style={{"borderBottomLeftRadius": "10px", "minWidth": "50px", "maxWidth": "50px"}}>S.No.</th>
                                            <th >News Title</th>
                                            <th >Description</th>
                                            <th style={{"minWidth": "80px", "maxWidth": "80px"}}>Created</th>


                                            <th style={{"borderBottomRightRadius": "10px", "minWidth": "50px", "maxWidth": "50px"}}>Action</th>

                                        </tr>
                                    </thead>
                                    <tbody style={{"maxHeight": "5000px"}}>
                                        {/* <!-- ngRepeat: item in DirectoryArr|orderBy:'Created' --> */}

                                        <tr>
                                            <td style={{"minWidth": "50px", "maxWidth": "50px"}}>1</td>
                                            <td>BAC expansion plans will focus on high-growth sectors in emerging markets in the Middle East and North Africa (MENA) region
                                                A</td>
                                            <td>BAC expansion plans will focus on hi</td>
                                            <td style={{"minWidth": "80px", "maxWidth": "80px"}}>18/06/2024</td>

                                            {/* <!-- <td className="ng-binding"></td> --> */}


                                            <td style={{"minWidth": "50px", "maxWidth": "50px"}} className="ng-binding"> <a href="edit-news.html" className="action-icon text-primary"> <i className="fe-edit"></i></a>
                                                <a href="javascript:void(0);" className="action-icon text-danger"> <i className="fe-trash-2"></i></a>

                                            </td>

                                        </tr>


                                        <tr>
                                            <td style={{"minWidth": "50px", "maxWidth": "50px"}}>2</td>
                                            <td>BAC expansion plans will focus on high-growth sectors in emerging markets in the Middle East and North Africa (MENA) region
                                                A</td>
                                            <td>BAC expansion plans will focus on hi</td>
                                            <td style={{"minWidth": "80px", "maxWidth": "80px"}}>18/06/2024</td>

                                            {/* <!-- <td className="ng-binding"></td> --> */}


                                            <td style={{"minWidth": "50px", "maxWidth": "50px"}} className="ng-binding"> <a href="edit-news.html" className="action-icon text-primary"> <i className="fe-edit"></i></a>
                                                <a href="javascript:void(0);" className="action-icon text-danger"> <i className="fe-trash-2"></i></a>

                                            </td>

                                        </tr>
                                        <tr>
                                            <td style={{"minWidth": "50px", "maxWidth": "50px"}}>3</td>
                                            <td>BAC expansion plans will focus on high-growth sectors in emerging markets in the Middle East and North Africa (MENA) region
                                                A</td>
                                            <td>BAC expansion plans will focus on hi</td>
                                            <td style={{"minWidth": "80px", "maxWidth": "80px"}}>18/06/2024</td>

                                            {/* <!-- <td className="ng-binding"></td> --> */}


                                            <td style={{"minWidth": "50px", "maxWidth": "50px"}} className="ng-binding"> <a href="edit-news.html" className="action-icon text-primary"> <i className="fe-edit"></i></a>
                                                <a href="javascript:void(0);" className="action-icon text-danger"> <i className="fe-trash-2"></i></a>

                                            </td>

                                        </tr>


                                        <tr>
                                            <td style={{"minWidth": "50px", "maxWidth": "50px"}}>4</td>
                                            <td>BAC expansion plans will focus on high-growth sectors in emerging markets in the Middle East and North Africa (MENA) region
                                                A</td>
                                            <td>BAC expansion plans will focus on hi</td>
                                            <td style={{"minWidth": "80px", "maxWidth": "80px"}}>18/06/2024</td>

                                            {/* <!-- <td className="ng-binding"></td> --> */}

                                            <td style={{"minWidth": "50px", "maxWidth": "50px"}} className="ng-binding"> <a href="edit-news.html" className="action-icon text-primary"> <i className="fe-edit"></i></a>
                                                <a href="javascript:void(0);" className="action-icon text-danger"> <i className="fe-trash-2"></i></a>

                                            </td>

                                        </tr>
                                        <tr>
                                            <td style={{"minWidth": "50px", "maxWidth": "50px"}}>5</td>
                                            <td>BAC expansion plans will focus on high-growth sectors in emerging markets in the Middle East and North Africa (MENA) region
                                                A</td>
                                            <td>BAC expansion plans will focus on hi</td>
                                            <td style={{"minWidth": "80px", "maxWidth": "80px"}}>18/06/2024</td>

                                            {/* <!-- <td className="ng-binding"></td> --> */}

                                            <td style={{"minWidth": "50px", "maxWidth": "50px"}} className="ng-binding"> <a href="edit-news.html" className="action-icon text-primary"> <i className="fe-edit"></i></a>
                                                <a href="javascript:void(0);" className="action-icon text-danger"> <i className="fe-trash-2"></i></a>

                                            </td>
                                        </tr>


                                        <tr>
                                            <td style={{"minWidth": "50px", "maxWidth": "50px"}}>6</td>
                                            <td>BAC expansion plans will focus on high-growth sectors in emerging markets in the Middle East and North Africa (MENA) region
                                                A</td>
                                            <td>BAC expansion plans will focus on hi</td>
                                            <td style={{"minWidth": "80px", "maxWidth": "80px"}}>18/06/2024</td>

                                            {/* <!-- <td className="ng-binding"></td> --> */}


                                            <td style={{"minWidth": "50px", "maxWidth": "50px"}} className="ng-binding"> <a href="edit-news.html" className="action-icon text-primary"> <i className="fe-edit"></i></a>
                                                <a href="javascript:void(0);" className="action-icon text-danger"> <i className="fe-trash-2"></i></a>

                                            </td>

                                        </tr>
                                        <tr>
                                            <td style={{"minWidth": "50px", "maxWidth": "50px"}}>
                                                7</td>
                                            <td>BAC expansion plans will focus on high-growth sectors in emerging markets in the Middle East and North Africa (MENA) region
                                                A</td>
                                            <td>BAC expansion plans will focus on hi</td>
                                            <td style={{"minWidth": "80px", "maxWidth": "80px"}}>18/06/2024</td>

                                            {/* <!-- <td className="ng-binding"></td> --> */}
                                            <td style={{"minWidth": "50px", "maxWidth": "50px"}} className="ng-binding"> <a href="edit-news.html" className="action-icon text-primary"> <i className="fe-edit"></i></a>
                                                <a href="javascript:void(0);" className="action-icon text-danger"> <i className="fe-trash-2"></i></a>

                                            </td>

                                        </tr>

                                        <tr>
                                            <td style={{"minWidth": "50px", "maxWidth": "50px"}}>8</td>
                                            <td>BAC expansion plans will focus on high-growth sectors in emerging markets in the Middle East and North Africa (MENA) region
                                                A</td>
                                            <td>BAC expansion plans will focus on hi</td>
                                            <td style={{"minWidth": "80px", "maxWidth": "80px"}}>18/06/2024</td>

                                            {/* <!-- <td className="ng-binding"></td> --> */}

                                            <td style={{"minWidth": "50px", "maxWidth": "50px"}} className="ng-binding"> <a href="edit-news.html" className="action-icon text-primary"> <i className="fe-edit"></i></a>
                                                <a href="javascript:void(0);" className="action-icon text-danger"> <i className="fe-trash-2"></i></a>

                                            </td>

                                        </tr>
                                        <tr>
                                            <td style={{"minWidth": "50px", "maxWidth": "50px"}}>9</td>
                                            <td>BAC expansion plans will focus on high-growth sectors in emerging markets in the Middle East and North Africa (MENA) region
                                                A</td>
                                            <td>BAC expansion plans will focus on hi</td>
                                            <td style={{"minWidth": "80px", "maxWidth": "80px"}}>18/06/2024</td>

                                            {/* <!-- <td className="ng-binding"></td> --> */}

                                            <td style={{"minWidth": "50px", "maxWidth": "50px"}} className="ng-binding"> <a href="edit-news.html" className="action-icon text-primary"> <i className="fe-edit"></i></a>
                                                <a href="javascript:void(0);" className="action-icon text-danger"> <i className="fe-trash-2"></i></a>

                                            </td>

                                        </tr>
                                        <tr>
                                            <td style={{"minWidth": "50px", "maxWidth": "50px"}}>10</td>
                                            <td>BAC expansion plans will focus on high-growth sectors in emerging markets in the Middle East and North Africa (MENA) region
                                                A</td>
                                            <td>BAC expansion plans will focus on hi</td>
                                            <td style={{"minWidth": "80px", "maxWidth": "80px"}}>18/06/2024</td>

                                            {/* <!-- <td className="ng-binding"></td> --> */}

                                            <td style={{"minWidth": "50px", "maxWidth": "50px"}} className="ng-binding"> <a href="edit-news.html" className="action-icon text-primary"> <i className="fe-edit"></i></a>
                                                <a href="javascript:void(0);" className="action-icon text-danger"> <i className="fe-trash-2"></i></a>

                                            </td>

                                        </tr>

                                    </tbody>
                                </table>
                                <nav className="justify-content-end mt-2">
                                    <ul className="pagination pagination-rounded justify-content-end">
                                        <li className="page-item">
                                            <a className="page-link" href="javascript: void(0);" aria-label="Previous">
                                                <span aria-hidden="true">«</span>
                                            </a>
                                        </li>
                                        <li className="page-item"><a className="page-link" href="javascript: void(0);">1</a></li>
                                        <li className="page-item"><a className="page-link" href="javascript: void(0);">2</a></li>
                                        <li className="page-item active"><a className="page-link" href="javascript: void(0);">3</a></li>
                                        <li className="page-item"><a className="page-link" href="javascript: void(0);">4</a></li>
                                        <li className="page-item"><a className="page-link" href="javascript: void(0);">5</a></li>
                                        <li className="page-item">
                                            <a className="page-link" href="javascript: void(0);" aria-label="Next">
                                                <span aria-hidden="true">»</span>
                                            </a>
                                        </li>
                                    </ul>
                                </nav>
                            </div> 
                            {/* <!-- .table-responsive --> */}
                        </div>
                         {/* <!-- end collapse--> */}
                    </div> 
                    {/* <!-- end card-body--> */}
                </div>




            </div></div>
            </>
    )
}

export default NewsTable
