import * as React from 'react'
import NewsListing from './NewsListing';
import NewsDetails from './NewsDetails';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../../../../styles/global.scss';
import { getSP } from '../../../loc/pnpjsConfig';
import { SPFI } from '@pnp/sp';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'material-symbols/index.css';
const NewsMain = () => {
  const [showForm, setShowForm] = React.useState(false);
  const [editItem, setEditItem] = React.useState<any>(null);
  const [Loading, setLoading] = React.useState(false);
  const sp: SPFI = getSP();
  //   const handleAdd = () => {
  //     setEditItem(null);
  //     setShowForm(true);
  //   };
  React.useEffect(() => {
    // const savedItem = sessionStorage.getItem("selectedNewsItem");
    // const showDetail = sessionStorage.getItem("showNewsDetails") === "true";

    // if (savedItem && showDetail) {
    //   setEditItem(JSON.parse(savedItem));
    //   setShowForm(true);
    // }
    // const hash = window.location.hash; // e.g. "#/News?newsId=44"
    // if (hash.startsWith("#/News")) {
    //   // parse query params inside hash
    //   const queryString = hash.split("?")[1]; // "newsId=44"
    //   const params = new URLSearchParams(queryString);
    //   const newsId = params.get("newsId"); // "44"
    //   console.log(newsId); // "44"
    //   if (newsId) {
    //     // setShowForm(true);
    //     sessionStorage.removeItem("selectedNewsItem");
    //     sessionStorage.removeItem("showNewsDetails");
    //     loadNewsItem(parseInt(newsId, 10));
        
    //   }
    // }
  }, []);
  const getDocumentLinkByID = async (AttachmentId: number[]) => {
    if (!AttachmentId || AttachmentId.length === 0) return [];

    try {
      const results = await Promise.all(
        AttachmentId.map(async (id) => {
          const res = await sp.web.lists
            .getByTitle("AnnouncementandNewsDocs")
            .items.getById(id)
            .select("*,FileRef,FileLeafRef")();
          return res;
        })
      );

      return results; // Now results contains all fetched items
    } catch (error) {
      console.error("Error fetching data: ", error);
      return [];
    }
  };

  const loadNewsItem = async (id: number) => {
    try {
      setLoading(true);

      const item = await sp.web.lists
        .getByTitle("AnnouncementAndNews")
        .items.getById(id)
        .select(
          "Id",
          "Title",
          "Description",
          "Category",
          "Department/DepartmentName",
          "Department/Id",
          "Overview",
          "Created",
          "Author/Title",
          "Author/Id",
          "Author/EMail",
          "AnnouncementandNewsImageID/ID"
        )
        .expand("Department,Author,AnnouncementandNewsImageID")();

      if (item) {
        // Get image IDs
        const imageIds =
          item?.AnnouncementandNewsImageID?.map((img: any) => img.ID) || [];

        // Fetch image links
        const imageLinks = imageIds.length > 0
          ? await getDocumentLinkByID(imageIds)
          : [];

        // Format the item
        const formattedItem = {
          id: item.Id,
          title: item.Title,
          description: item.Description,
          department: item.Department?.DepartmentName || "",
          departmentId: item.Department?.Id || null,
          category: item.Category || "",
          overview: item.Overview || "",
          created: new Date(item.Created),
          author: item.Author?.Title,
          images: imageLinks.map((img: any) => ({
            name: img.FileLeafRef,
            url: img.FileRef,
          })),
        };

        // ✅ Set it directly into state
        setEditItem(formattedItem);
        setShowForm(true); // Show NewsDetails page
      }

      // console.log("Formatted news with images:", formattedItem);

    } catch (err) {
      console.error("Error fetching news data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setShowForm(true);
    // sessionStorage.setItem("selectedNewsItem", JSON.stringify(item));
    // sessionStorage.setItem("showNewsDetails", "true");
  };

  const handleCancel = () => {
    setShowForm(false);
    // sessionStorage.removeItem("selectedNewsItem");
    // sessionStorage.removeItem("showNewsDetails");
  };

  //   const handleSave = (data: any) => {
  //     console.log("Saved data", data);
  //     setShowForm(false);
  //     // 🔄 refresh table here (optional via state)
  //   };

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
        <NewsDetails item={editItem} onCancel={handleCancel} setLoading={setLoading} />
      ) : (
        <NewsListing onEdit={handleEdit} setLoading={setLoading} />
      )} */}
      {/* <NewsListing  onEdit={handleEdit} setLoading={setLoading} /> */}
      <NewsListing  setLoading={setLoading} />
    </div>
  )
}

export default NewsMain
