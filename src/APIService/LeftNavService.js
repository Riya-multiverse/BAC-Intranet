
// import Swal from 'sweetalert2';
export const getLeftNavitems = async (_sp) => {
 
    let arr = []
    let arrs = []
    let bannerimg = []
    await _sp.web.lists.getByTitle("BACSidebarNavigation").
    items.select("*").filter("IsActive eq 1").getAll()
      .then((res) => {
        console.log(res, ' let arrs=[]');
       
 
        //  arr.push(res)
        arr = res;
      })
      .catch((error) => {
        console.log("Error fetching data: ", error);
      });
    console.log(arr, 'arr');
    return arr;
  }