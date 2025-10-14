import * as React from 'react'
import FaqForm from './FaqForm'
import FaqTable from './FaqTable'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../../../../styles/global.scss';

import 'bootstrap-icons/font/bootstrap-icons.css';
import 'material-symbols/index.css';

const Faq = () => {

     const [showForm, setShowForm] = React.useState(false);
  const [editItem, setEditItem] = React.useState<any>(null); 
  const [Loading, setLoading] = React.useState(false);
  const [faqList, setFaqList] = React.useState<any[]>([]);

    
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
      {showForm ? (
        <FaqForm item={editItem} onCancel={handleCancel} onSave={handleSave} setLoading={setLoading}/>
      ) : (
        <FaqTable onAdd={handleAdd} onEdit={handleEdit} data={faqList} setLoading={setLoading} />
      )}
    </div>
  )
}

export default Faq
