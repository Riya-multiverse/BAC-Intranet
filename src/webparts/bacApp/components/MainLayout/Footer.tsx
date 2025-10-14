import * as React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// import '../../../../styles/global.scss';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'material-symbols/index.css';
const Footer = () => {
  return (
    <>
    <footer className="footer">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-6">
            
            <div>© 2025
               {/* <script>document.write(new Date().getFullYear())</script>  */}
               Bahrain Airport Company, All Rights Reserved. </div>
          </div>
          <div className="col-md-6">
            <div className="d-none d-md-flex gap-4 align-item-center justify-content-md-end footer-links">
              <a href="javascript: void(0);">About</a>
              <a href="javascript: void(0);">Support</a>
              <a href="javascript: void(0);">Contact Us</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
    </>
  )
}

export default Footer