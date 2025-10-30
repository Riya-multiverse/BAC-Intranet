import * as React from 'react'
import EmployeeRecognitionForm from './EmployeeRecognitionForm'
import EmployeeRecognitionTable from './EmployeeRecognitionTable'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../../../../styles/global.scss';

import 'bootstrap-icons/font/bootstrap-icons.css';
import 'material-symbols/index.css';

const EmployeeRecognition = () => {

  const [showForm, setShowForm] = React.useState(false);
  const [editItem, setEditItem] = React.useState<any>(null); 
  const [Loading, setLoading] = React.useState(false);
 

    
  const handleAdd = () => {
    setEditItem(null);
    setShowForm(true);
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
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
              src={require("../../../assets/edc-gif.gif")}
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
      {showForm ? (
        <EmployeeRecognitionForm item={editItem} onCancel={handleCancel} onSave={handleSave} setLoading={setLoading} />
      ) : (
        <EmployeeRecognitionTable onAdd={handleAdd} onEdit={handleEdit} setLoading={setLoading}/>
      )}
    </div>
  )
}

export default EmployeeRecognition
