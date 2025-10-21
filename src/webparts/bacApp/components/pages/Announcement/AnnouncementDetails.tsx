import * as React from 'react'
import { Modal } from 'react-bootstrap'
import CustomBreadcrumb from '../../common/CustomBreadcrumb';
import { Calendar, Copy, Share2 } from 'react-feather';
import * as moment from 'moment';
import { getSP } from '../../../loc/pnpjsConfig';
import { SPFI } from '@pnp/sp';
import Swal from 'sweetalert2';
import CommentsCard from '../../common/CommentsCard';
import { APP_URL } from '../../../../../Shared/Constant';
import { useLocation } from 'react-router';
const AnnouncementDetails = () => {
  const sp: SPFI = getSP();
  const location = useLocation();
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0);
  const [comments, setComments] = React.useState<any[]>([]);
  const [liked, setLiked] = React.useState(false);
  const [commentText, setCommentText] = React.useState("");
  const [item, setEditItem] = React.useState<any>(null);
  const Breadcrumb = [

    {

      "MainComponent": "Announcements",

      "MainComponentURl": "Announcements",


    }, {

      "MainComponent": "Announcements Details",

      "MainComponentURl": "AnnouncementsDetails",


    }

  ];

  React.useEffect(() => {
    if (!showModal) return; // run only when modal is open

    const interval = setInterval(() => {
      setSelectedIndex((prev) =>
        prev === item.images.length - 1 ? 0 : prev + 1
      );
    }, 3000); // 3 seconds interval

    return () => clearInterval(interval); // cleanup when modal closes or unmounts
  }, [showModal, item?.images?.length]);

  React.useEffect(() => {
    const savedItem = sessionStorage.getItem("selectedNewsItem");
    const showDetail = sessionStorage.getItem("showNewsDetails") === "true";

    if (savedItem && showDetail) {
      // setEditItem(JSON.parse(savedItem));
      
      // fetchComments(JSON.parse(savedItem));
    }
    const hash = window.location.hash; // e.g. "#/AnnouncementsDetails?aId=44"
    if (hash.startsWith("#/AnnouncementsDetails")) {
      // parse query params inside hash
      const queryString = hash.split("?")[1]; // "aId=44"
      const params = new URLSearchParams(queryString);
      const aId = params.get("aId"); // "44"
      console.log(aId); // "44"
      if (aId) {
        // setShowForm(true);
        sessionStorage.removeItem("selectedNewsItem");
        sessionStorage.removeItem("showNewsDetails");
        loadNewsItem(parseInt(aId, 10));

      }
    }

  }, [location.search]);

  const loadNewsItem = async (id: number) => {
    try {
      //   setLoading(true);

      const item = await sp.web.lists
        .getByTitle("AnnouncementAndNews")
        .items.getById(id)
        .select(
          "Id",
          "Title",
          "Description",
          "SourceType",
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

      if (item && item.SourceType === "Announcements") {
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
          // category: item.Category || "",
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
        fetchComments(formattedItem);
        // setShowForm(true); // Show NewsDetails page
      }
      else {
        setEditItem(null);
      }

      // console.log("Formatted news with images:", formattedItem);

    } catch (err) {
      console.error("Error fetching news data:", err);
    } finally {
      //   setLoading(false);
    }
  };

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


  //  React.useEffect(() => {
  //         fetchComments();
  //     }, [item.id]);


  const fetchComments = async (item: any) => {
    try {
      const items = await sp.web.lists
        .getByTitle("NewsandAnnouncementComments")
        .items.select("ID", "CommentText", "Created", "Author/Title,Author/EMail,Author/ID", "ParentCommentID/ID")
        .expand("Author", "ParentCommentID")
        .filter(`NewsID eq ${item.id}`)
        .orderBy("Created", false)();

      // Separate main comments and replies
      if (items) {
        const mainComments = items.filter((i) => !i.ParentCommentID);
        const replies = items.filter((i) => i.ParentCommentID);
        const currentUser = await sp.web.currentUser();
        setCurrentUser(currentUser);
        // Group replies under parent
        const nestedComments = mainComments.map((c) => ({
          ...c,
          Replies: replies.filter((r) => r.ParentCommentID?.ID === c.ID),
        }));

        setComments(nestedComments);
      }

    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;

    try {
      const addedComment = await sp.web.lists.getByTitle("NewsandAnnouncementComments").items.add({
        CommentText: commentText,
        NewsIDId: item.id
      });

      // Create a new comment object to append
      const newComment = {
        ID: addedComment.data.ID,
        CommentText: commentText,
        Created: moment.utc(new Date()).local().format("DD MMM YYYY, hh:mm A"),
        Author: { Title: currentUser.Title, EMail: currentUser.Email },
        Replies: []
      };



      setComments(prev => [newComment, ...prev]); // Add to top of list
      // setCommentText(""); // Clear input
      Swal.fire({
        title: "Comment Added Successfully",
        icon: 'success',
        confirmButtonText: "OK",
      }).then(async (result) => {
        if (result.isConfirmed) {
          setCommentText("");
        }
      });
    } catch (err) {
      console.error(err);
    }
  };
  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
    setShowModal(true);
  };
  const handlePrev = () => {
    setSelectedIndex((prev) =>
      prev === 0 ? item.images.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setSelectedIndex((prev) =>
      prev === item.images.length - 1 ? 0 : prev + 1
    );
  };

  if (!item) {
    return (
      <>
        <div className="row">
          <div className="col-lg-2">

            <CustomBreadcrumb Breadcrumb={Breadcrumb} />
          </div>



        </div>
        <div className="text-center mt-5">
          <h5 className="text-danger">No such announcement found.</h5>
          <p>Please check the link or go back to the Announcement list.</p>
        </div>
      </>

    );
  }
  else {
    return (
      <>
        <div className="row">
          <div className="col-lg-2">

            <CustomBreadcrumb Breadcrumb={Breadcrumb} />
          </div>



        </div>

        <div className="row">
          <div className="col-12">


            <div className="row mt-2">


              <div className="col-lg-12">
                <h4 style={{ "lineHeight": "34px" }} className="page-title fw-700 mb-1  pe-5 font-28">{item?.title}</h4>
              </div>
              <div className="row mt-2">
                <div className="col-md-12 col-xl-12">
                  <p className="mb-2 mt-1 d-block">
                    <span className="pe-2 text-nowrap mb-0 d-inline-block">
                      <Calendar className="fe-calendar" />  {moment.utc(item?.created).local().format("DD MMM YYYY")}   &nbsp;  &nbsp;  &nbsp;
                      {/* |&nbsp;  &nbsp; */}
                    </span>
                    {/* <span style={{ color: "#009157", fontWeight: 600 }} className="text-nowrap mb-0 d-inline-block">
                                        {item?.category}
                                    </span> */}
                    <span className="text-nowrap mb-0 d-inline-block" onClick={() => {
                      const subject = encodeURIComponent(
                        `Check out this news: ${item.title}`
                      );
                      const body = encodeURIComponent(
                        `${item.description}\n\nLink: ${APP_URL}#/AnnouncementsDetails?aId=${item.id}`
                      );
                      window.location.href = `mailto:?subject=${subject}&body=${body}`;

                    }}>
                      <Share2 size={20} color="#6c757d" />   Share by email &nbsp;  &nbsp;  &nbsp;|&nbsp;  &nbsp;  &nbsp;
                    </span>
                    <span className="text-nowrap mb-0 d-inline-block" onClick={() => {
                      navigator.clipboard.writeText(
                        `${APP_URL}#/AnnouncementsDetails?aId=${item.id}`
                      );
                      Swal.fire({
                        backdrop: false,
                        title: "Link copied!",
                        icon: "success",
                        confirmButtonText: "OK",
                        showConfirmButton: true,
                        allowOutsideClick: true,
                      });
                    }}>
                      {/* <i className="fe-link"></i>    */}
                      <Copy size={16} color="#6c757d" />
                      Copy link &nbsp;  &nbsp;  &nbsp;
                    </span>

                  </p>

                </div>
              </div>








            </div>

            <div className="row mt-0
                                            
                                            ">

              <p style={{ "lineHeight": "22px" }} className="d-block text-muted mt-2 font-14">{item?.overview}</p>
            </div>

            <div className="row internalmedia filterable-content mt-3">

              {item?.images?.map((img: any, index: number) => (
                <div className={`col-sm-6 col-xl-3 filter-item all ${index % 2 === 0 ? "web illustrator" : "graphic photography"
                  }`}>
                  <div className="gal-box">
                    <a onClick={() => handleImageClick(index)}
                      className="image-popup"
                      title={`Screenshot-${index + 1}`}
                      style={{ cursor: "pointer" }}>
                      <img src={img.url} alt={img.name || `image-${index}`} className="img-fluid" data-themekey="#" />
                    </a>

                  </div>
                </div>))}







            </div>
            <div className="row mt-2
                                            
                                            ">
              {/* <!-- <h4 className="fw-bold mb-0 font-18">Overview:</h4> --> */}
              <p style={{ "lineHeight": "22px" }} className="d-block text-muted mt-2 mb-0 font-14">{item?.overview}</p>
            </div>

            {/* ////news comments and replies starts */}


            <div className="row mt-3">
              <div className="col-lg-6">
                <div className="card">
                  <div className="card-body">


                    <h4 className="mt-0 mb-3 text-dark fw-bold font-16">Comments</h4>

                    <textarea className="form-control text-dark form-control-light mb-2" placeholder="Write your comment" id="Comment-textarea" value={commentText}
                      onChange={(e) => setCommentText(e.target.value)} ></textarea>
                    <div className="text-end">

                      <div className="btn-group mb-2 ms-2">
                        <button type="button" className="btn btn-primary btn-sm" onClick={submitComment}>Submit</button>
                      </div>
                    </div>




                  </div>
                </div>
              </div>

            </div>
            {comments && <CommentsCard newsId={item?.id} comments={comments} />}


          </div>
        </div>



        {/*  */}
        {/* === Modal with Auto Carousel === */}
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          size="lg"
          centered
          className="filemodal"
        >
          <Modal.Header closeButton />
          <Modal.Body>
         {item?.images && item.images.length > 0 && (   <div className="custom-carousel text-center position-relative">
              <img
                key={selectedIndex} // key triggers smooth fade
                src={item?.images[selectedIndex]?.url||""}
                alt={`slide-${selectedIndex}`}
                className="img-fluid rounded"
                style={{
                  maxHeight: "500px",
                  objectFit: "contain",
                  transition: "opacity 0.8s ease-in-out",
                }}
              />

              {/* Prev Button */}
              <button
                className="btn btn-light position-absolute top-50 start-0 translate-middle-y"
                style={{ opacity: 0.7 }}
                onClick={handlePrev}
              >
                <span className="carousel-control-prev-icon"></span>
              </button>

              {/* Next Button */}
              <button
                className="btn btn-light position-absolute top-50 end-0 translate-middle-y"
                style={{ opacity: 0.7 }}
                onClick={handleNext}
              >
                <span className="carousel-control-next-icon"></span>
              </button>
            </div>)}
          </Modal.Body>
        </Modal>
      </>
    )
  }


}

export default AnnouncementDetails
