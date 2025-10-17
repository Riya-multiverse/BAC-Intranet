import * as React from 'react'
import AnnouncementListing from './AnnouncementListing'
import AnnouncementDetails from './AnnouncementDetails'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../../../../styles/global.scss';
import { getSP } from '../../../loc/pnpjsConfig';
import { SPFI } from '@pnp/sp';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'material-symbols/index.css';
const AnnouncementMain = () => {
  const [showForm, setShowForm] = React.useState(false);
  const [editItem, setEditItem] = React.useState<any>(null);
  const [Loading, setLoading] = React.useState(false);
  const sp: SPFI = getSP();
  return (
    <div>
      {Loading && (
        <div className="loadernewadd mt-10">
          <div>
            <img
              src={require("../../../assets/BAC_loader.gif")}
              className="alignrightl"
              alt="Loading..."
            />
          </div>
          <span>Loading </span>{" "}
          <span>
            <img
              src={require("../../../assets/edcnew.gif")}
              className="alignrightl"
              alt="Loading..."
            />
          </span>
        </div>
      )}
      {/* <h2>News Master</h2> */}
      {/* {showForm ? (
        <AnnouncementDetails item={editItem} onCancel={handleCancel} setLoading={setLoading} />
      ) : (
        <AnnouncementListing onEdit={handleEdit} setLoading={setLoading} />
      )} */}
       <AnnouncementListing setLoading={setLoading} />
    </div>
  )
}

export default AnnouncementMain
