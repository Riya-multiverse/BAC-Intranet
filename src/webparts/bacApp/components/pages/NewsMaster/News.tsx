import * as React from 'react'
import NewsForm from './NewsForm'
import NewsTable from './NewsTable'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// import '../../../../styles/global.scss';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'material-symbols/index.css';

const News = () => {

     const [showForm, setShowForm] = React.useState(false);
  const [editItem, setEditItem] = React.useState<any>(null); 

    
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
      {/* <h2>News Master</h2> */}
      {showForm ? (
        <NewsForm item={editItem} onCancel={handleCancel} onSave={handleSave} />
      ) : (
        <NewsTable onAdd={handleAdd} onEdit={handleEdit} />
      )}
    </div>
  )
}

export default News
