import * as React from 'react'
import CustomBreadcrumb from '../../common/CustomBreadcrumb'
import { getSP } from '../../../loc/pnpjsConfig';
import { SPFI } from '@pnp/sp';
import { useLocation } from 'react-router-dom';
const PhotoGalleryInternal = () => {
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
      MainComponent: "Photo Gallery",

      MainComponentURl: "PhotoGallery",
    },

    {
      MainComponent: "Photo Gallery Internal",

      MainComponentURl: "PhotoGalleryInternal",
    },
  ];

  React.useEffect(() => {
    const savedItem = sessionStorage.getItem("selectedItem");
    const showDetail = sessionStorage.getItem("showDetails") === "true";

    if (savedItem && showDetail) {
      setEditItem(JSON.parse(savedItem));
      //   setShowForm(true);
      // fetchComments(JSON.parse(savedItem));
    }
    // const hash = window.location.hash; // e.g. "#/AnnouncementsDetails?aId=44"
    // if (hash.startsWith("#/AnnouncementsDetails")) {
    //   // parse query params inside hash
    //   const queryString = hash.split("?")[1]; // "aId=44"
    //   const params = new URLSearchParams(queryString);
    //   const aId = params.get("aId"); // "44"
    //   console.log(aId); // "44"
    //   if (aId) {
    //     // setShowForm(true);
    //     sessionStorage.removeItem("selectedNewsItem");
    //     sessionStorage.removeItem("showNewsDetails");
    //     loadNewsItem(parseInt(aId, 10));

    //   }
    // }

  }, [location.search]);
  return (
    <>
      <div className="row">
        <div className="col-lg-4">
          <CustomBreadcrumb Breadcrumb={Breadcrumb} />
        </div>



      </div>


      <div className="row">
        <div className="col-12">


          <div className="row mt-2">


            <div className="col-lg-12">
              <h4 style={{ lineHeight: "34px;" }} className="page-title fw-700 mb-1  pe-5 font-28">{item?.Title}</h4>
            </div>
            <div className="row mt-0">
              <div className="col-md-12 col-xl-12">
                <p className="mb-2 mt-1 d-block">
                  <span className="pe-2 text-nowrap mb-0 d-inline-block">
                    <i className="fe-calendar"></i>  {item?.Created}  &nbsp;  &nbsp;  &nbsp;|
                  </span>
                  <span style={{
                    fontWeight: " 600",
                    color: "#009157"
                  }} className="text-nowrap mb-0 d-inline-block">
                    {item?.Department}
                  </span>


                </p>

              </div>
            </div>








          </div>

          <div className="row mt-0
                                            
                                            ">


          </div>

          <div className="row filterable-content internalmedia mt-3">

            {item?.images.map((img: any, index: number) => (<div className="col-sm-6 col-xl-3 filter-item all web illustrator">
              <div className="gal-box">
                <a data-bs-toggle="modal" data-bs-target="#centermodal" className="image-popup" title="Screenshot-1">
                  <img src={img.url} className="img-fluid" alt="work-thumbnail" />
                </a>

              </div>
            </div>
            ))}
            {/* <div className="col-sm-6 col-xl-3 filter-item all graphic photography">
              <div className="gal-box">
                <a data-bs-toggle="modal" data-bs-target="#centermodal" className="image-popup" title="Screenshot-1">
                  <img src="gall-interanl-2.jpg" className="img-fluid" alt="work-thumbnail" />
                </a>

              </div>
            </div>

            <div className="col-sm-6 col-xl-3 filter-item all web illustrator">
              <div className="gal-box">
                <a data-bs-toggle="modal" data-bs-target="#centermodal" className="image-popup" title="Screenshot-1">
                  <img src="gall-interanl-3.jpg" className="img-fluid" alt="work-thumbnail" />
                </a>

              </div>
            </div>

            <div className="col-sm-6 col-xl-3 filter-item all graphic illustrator">
              <div className="gal-box">
                <a data-bs-toggle="modal" data-bs-target="#centermodal" className="image-popup" title="Screenshot-1">
                  <img src="gall-interanl-4.jpg" className="img-fluid" alt="work-thumbnail" />
                </a>

              </div>
            </div> */}






          </div>
          {/* <div className="row filterable-content internalmedia mt-1">

            <div className="col-sm-6 col-xl-3 filter-item all web illustrator">
              <div className="gal-box">
                <a data-bs-toggle="modal" data-bs-target="#centermodal" className="image-popup" title="Screenshot-1">
                  <img src="gall-interanl-5.jpg" alt="work-thumbnail" />
                </a>

              </div>
            </div>

            <div className="col-sm-6 col-xl-3 filter-item all graphic photography">
              <div className="gal-box">
                <a data-bs-toggle="modal" data-bs-target="#centermodal" className="image-popup" title="Screenshot-1">
                  <img src="gall-interanl-6.jpg" className="img-fluid" alt="work-thumbnail" />
                </a>

              </div>
            </div>

            <div className="col-sm-6 col-xl-3 filter-item all web illustrator">
              <div className="gal-box">
                <a data-bs-toggle="modal" data-bs-target="#centermodal" className="image-popup" title="Screenshot-1">
                  <img src="gall-interanl-7.jpg" className="img-fluid" alt="work-thumbnail" />
                </a>

              </div>
            </div>

            <div className="col-sm-6 col-xl-3 filter-item all graphic illustrator">
              <div className="gal-box">
                <a data-bs-toggle="modal" data-bs-target="#centermodal" className="image-popup" title="Screenshot-1">
                  <img src="gall-interanl-8.jpg" className="img-fluid" alt="work-thumbnail" />
                </a>

              </div>
            </div>






          </div>
          <div className="row filterable internalmedia  mt-1">

            <div className="col-sm-6 col-xl-3 filter-item all web illustrator">
              <div className="gal-box">
                <a data-bs-toggle="modal" data-bs-target="#centermodal" className="image-popup" title="Screenshot-1">
                  <img src="gall-interanl-9.jpg" className="img-fluid" alt="work-thumbnail" />
                </a>

              </div>
            </div>

            <div className="col-sm-6 col-xl-3 filter-item all graphic photography">
              <div className="gal-box">
                <a data-bs-toggle="modal" data-bs-target="#centermodal" className="image-popup" title="Screenshot-1">
                  <img src="gall-interanl-10.jpg" className="img-fluid" alt="work-thumbnail" />
                </a>

              </div>
            </div>

            <div className="col-sm-6 col-xl-3 filter-item all web illustrator">
              <div className="gal-box">
                <a data-bs-toggle="modal" data-bs-target="#centermodal" className="image-popup" title="Screenshot-1">
                  <img src="gall-interanl-11.jpg" className="img-fluid" alt="work-thumbnail" />
                </a>

              </div>
            </div>

            <div className="col-sm-6 col-xl-3 filter-item all graphic illustrator">
              <div className="gal-box">
                <a data-bs-toggle="modal" data-bs-target="#centermodal" className="image-popup" title="Screenshot-1">
                  <img src="gall-interanl-12.jpg" className="img-fluid" alt="work-thumbnail" />
                </a>

              </div>
            </div>






          </div> */}



        </div>






      </div>

    </>
  )
}

export default PhotoGalleryInternal
