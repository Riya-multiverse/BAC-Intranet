import *as React from 'react'
import QuickLinkForm from './QuickLinkForm';
import QuickLinkTable from './QuickLinkTable';

const QuickLink = () => {
    
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
        <QuickLinkForm item={editItem} onCancel={handleCancel} onSave={handleSave} />
      ) : (
        <QuickLinkTable onAdd={handleAdd} onEdit={handleEdit} />
      )}
    </div>
  )
}

export default QuickLink
