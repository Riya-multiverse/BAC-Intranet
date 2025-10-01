import * as React from 'react';
import styles from './BacApp.module.scss';
import type { IBacAppProps } from './IBacAppProps';
// import { escape } from '@microsoft/sp-lodash-s


const BacApp = () => {
  const elementRef = React.useRef<HTMLDivElement>(null);
  return (
 
     <div id="wrapper" ref={elementRef}>
      <div
        className="app-menu "
        id="myHeader">
        {/* <VerticalSideBar _context={sp} /> */}
      </div>
      <div className="content-page"></div>
     </div>
  )
}

export default BacApp