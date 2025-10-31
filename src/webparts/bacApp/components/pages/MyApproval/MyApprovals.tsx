import * as React from 'react'
import MyApprovalsForm from './MyApprovalsForm'
import MyApprovalsTable from './MyApprovalsTable'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../../../../styles/global.scss';

import 'bootstrap-icons/font/bootstrap-icons.css';
import 'material-symbols/index.css';

const MyApprovals = () => {

     const [showForm, setShowForm] = React.useState(false);
  const [editItem, setEditItem] = React.useState<any>(null); 
  const [Loading, setLoading] = React.useState(false);
    
  const handleAdd = () => {
    setEditItem(null);
    setShowForm(true);
  };

  const handleEdit = (payload:any) => {
  setEditItem(payload);  
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const handleSave = (data: any) => {
    console.log("Saved data", data);
    setShowForm(false);
    // 🔄 refresh table here (optional via state)
  };
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
          {/* <span>
            <img
              src={require("../../../assets/BAC_loader.gif")}
              className="alignrightl"
              alt="Loading..."
            />
          </span> */}
        </div>
      )}
      {/* <h2>News Master</h2> */}
      {showForm ? (
        <MyApprovalsForm
    item={editItem}
    approvalMode={editItem?.mode === "approval"}   // ← critical
    onCancel={() => setShowForm(false)}
    onSave={() => setShowForm(false)}
    setLoading={setLoading}
  />
      ) : (
        <MyApprovalsTable onAdd={handleAdd} onEdit={handleEdit} setLoading={setLoading} />
      )}
    </div>
  )
}

export default MyApprovals
