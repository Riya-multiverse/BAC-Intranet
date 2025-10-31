import * as React from 'react'
import { ChevronRight } from 'react-feather';
//import "bootstrap/dist/css/bootstrap.min.css";
import {
    HashRouter as Router,
    Routes,
    Route,
    NavLink,
    Navigate,
} from "react-router-dom";
interface BreadcrumbItem {
    MainComponent?: string;
    MainComponentURl?: string;
    
}

interface CustomBreadcrumbProps {
    Breadcrumb: BreadcrumbItem[];
}


// const CustomBreadcrumb: React.FC<CustomBreadcrumbProps> = ({ Breadcrumb }) => {
    
//     return (
//         <nav>
//             <div className=''>
//                 <h4 className="page-title fw-bold mb-0 font-20">{Breadcrumb[1].ChildComponent}</h4>
//                 <ol className="breadcrumb mb-2">
//                     <li className="breadcrumb-item">
//                         {Breadcrumb[0].MainComponentURl && (
//                             <NavLink to={`/${Breadcrumb[0].MainComponentURl.replace(/^\//, '')}`}>
//                                 {Breadcrumb[0].MainComponent}
//                             </NavLink>
//                         )}

//                     </li>
//                     <li className="breadcrumb-item pt-arr">

//                         <ChevronRight size={20} color="#6c757d" />
//                     </li>
//                     <li className="breadcrumb-item active">



//                         {Breadcrumb[1].ChildComponentURl}



//                     </li>
//                 </ol>
//             </div>
//         </nav>
//     )
// }


const CustomBreadcrumb: React.FC<CustomBreadcrumbProps> = ({ Breadcrumb }) => {
  return (
    <nav>
      <div>
        {Breadcrumb.length > 0 && 
        <h4 className="page-title fw-bold mb-0 font-20">{Breadcrumb[Breadcrumb.length - 1].MainComponent}</h4>}
        <ol className="breadcrumb mb-2">
          {Breadcrumb.map((item, index) => {
            const isLast = index === Breadcrumb.length - 1;
            return (
              <li key={index} className={`breadcrumb-item ${isLast ? 'active' : ''}`}>
                {!isLast && item.MainComponentURl ? (
                  <NavLink to={`/${item.MainComponentURl.replace(/^\//, '')}`}>{item.MainComponent}</NavLink>
                ) : (
                  item.MainComponent
                )}
                {!isLast && (
                  <span className="pt-arr">
                    <ChevronRight size={20} color="#6c757d" />
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};




export default CustomBreadcrumb
