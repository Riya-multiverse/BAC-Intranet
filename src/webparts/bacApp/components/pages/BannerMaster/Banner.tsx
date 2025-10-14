import * as React from 'react'
import BannerForm from './BannerForm';
import BannerTable from './BannerTable';

const Banner = () => {
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
      {showForm ? (
        <BannerForm item={editItem} onCancel={handleCancel} onSave={handleSave} setLoading={setLoading}/>
      ) : (
        <BannerTable onAdd={handleAdd} onEdit={handleEdit} setLoading={setLoading}/>
      )} 
    </div>
  )
}

export default Banner
