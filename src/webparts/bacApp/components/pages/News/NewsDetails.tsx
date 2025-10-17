import * as React from 'react'
import CustomBreadcrumb from '../../common/CustomBreadcrumb';
import { Modal } from 'react-bootstrap';
import { Calendar } from 'react-feather';
import * as moment from 'moment';
import { getSP } from '../../../loc/pnpjsConfig';
import { SPFI } from '@pnp/sp';
import Swal from 'sweetalert2';
import CommentsCard from '../../common/CommentsCard';
import '../../../../../styles/global.scss';
interface INewsDetailsProps {
    item?: any;
    onCancel: () => void;

    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
const Breadcrumb = [

    {

        "MainComponent": "News",

        "MainComponentURl": "News",


    }, {

        "MainComponent": "News Details",

        "MainComponentURl": "NewsDetails",


    }

];


const NewsDetails = ({ item, onCancel, setLoading }: INewsDetailsProps) => {
    const sp: SPFI = getSP();
    const [currentUser, setCurrentUser] = React.useState<any>(null);
    const [showModal, setShowModal] = React.useState(false);
    const [selectedIndex, setSelectedIndex] = React.useState<number>(0);
    const [comments, setComments] = React.useState<any[]>([]);
    const [liked, setLiked] = React.useState(false);
    const [commentText, setCommentText] = React.useState("");
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

    React.useEffect(() => {
        if (!showModal) return; // run only when modal is open

        const interval = setInterval(() => {
            setSelectedIndex((prev) =>
                prev === item.images.length - 1 ? 0 : prev + 1
            );
        }, 3000); // 3 seconds interval

        return () => clearInterval(interval); // cleanup when modal closes or unmounts
    }, [showModal, item.images.length]);
    React.useEffect(() => {
        fetchComments();
    }, [item.id]);


    const fetchComments = async () => {
        try {
            const items = await sp.web.lists
                .getByTitle("NewsandAnnouncementComments")
                .items.select("ID", "CommentText", "Created", "Author/Title,Author/EMail,Author/ID", "ParentCommentID/ID")
                .expand("Author", "ParentCommentID")
                .filter(`NewsID eq ${item.id}`)
                .orderBy("Created", false)();

            // Separate main comments and replies
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
        } catch (err) {
            console.error("Error fetching comments:", err);
        }
    };

 
const submitComment = async () => {
    if (!commentText.trim()) return;

    try {
        const addedComment = await sp.web.lists.getByTitle("NewsandAnnouncementComments").items.add({
            CommentText: commentText,
            NewsIDId:  item.id
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

    return (
        <>
            <div className="row">
                <div className="col-lg-2">
                    {/* <h4 className="page-title fw-bold mb-1 font-20">News</h4>
                    <ol className="breadcrumb m-0">

                        <li className="breadcrumb-item"><a href="dashboard.html">Home</a></li>
                        <li className="breadcrumb-item"> <span className="fe-chevron-right"></span></li>
                        <li className="breadcrumb-item active"><a href="news-feed.html">News</a></li>
                    </ol> */}
                    <CustomBreadcrumb Breadcrumb={Breadcrumb} />
                </div>



            </div>

            <div className="row">
                <div className="col-12">


                    <div className="row mt-2">


                        <div className="col-lg-12">
                            <h4 style={{ "lineHeight": "34px" }} className="page-title fw-700 mb-1  pe-5 font-28">{item.title}</h4>
                        </div>
                        <div className="row mt-2">
                            <div className="col-md-12 col-xl-12">
                                <p className="mb-2 mt-1 d-block">
                                    <span className="pe-2 text-nowrap mb-0 d-inline-block">
                                        <Calendar className="fe-calendar" />  {moment.utc(item.created).local().format("DD MMM YYYY")}   &nbsp;  &nbsp;  &nbsp;|&nbsp;  &nbsp;
                                    </span>
                                    <span style={{ color: "#009157", fontWeight: 600 }} className="text-nowrap mb-0 d-inline-block">
                                        {item.category}
                                    </span>

                                </p>

                            </div>
                        </div>








                    </div>

                    <div className="row mt-0
                                            
                                            ">

                        <p style={{ "lineHeight": "22px" }} className="d-block text-muted mt-2 font-14">{item.overview}</p>
                    </div>

                    <div className="row internalmedia filterable-content mt-3">

                        {item.images.map((img: any, index: number) => (
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
                        <p style={{ "lineHeight": "22px" }} className="d-block text-muted mt-2 mb-0 font-14">{item.overview}</p>
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
                    <CommentsCard newsId={item.id} comments={comments}/>
                    {/* <div className="row mt-2">
                        <div className="col-xl-6">
                            <div className="card team-fedd">

                                <div className="card-body nose mx-2 mb-2  mt-2">

                                    <div className="row">

                                        <div className="d-flex align-items-start">
                                            <img className="me-2 mt-0 avatar-sm rounded-circle" src="assets/images//users/user-6.jpg" alt="Generic placeholder image" />

                                            <div className="w-100 mt-0">

                                                <h5 className="mt-0  mb-0"><a href="#" className="text-dark fw-bold font-14">System Account</a></h5>
                                                <p className="text-muted font-12"><small>12-Mar-2024 15:28</small></p>
                                            </div>
                                        </div>

                                        <p className="mt-2">Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin.Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin. </p>
                                        <div className="mt-0 mb-2">
                                            <a href="javascript: void(0);" className="btn btn-sm btn-link text-muted ps-0"><i
                                                className={`bi ${liked ? 'bi-heart-fill text-danger' : 'bi-heart text-danger'}`}
                                                style={{ fontSize: '24px', cursor: 'pointer' }}
                                                onClick={() => setLiked(!liked)}
                                            ></i>
                                                2k Likes</a>
                                            <a href="javascript: void(0);" className="btn btn-sm btn-link text-muted"><i className="bi bi-chat"></i>


                                                <i className="bi bi-chat-fill"></i> 184 Replies</a>

                                        </div>


                                        <ul style={{ "marginLeft": "7px !important", "padding": "0px !important" }} className="timeline1 mt-0 pt-0">
                                            <li className="timeline-item ng-scope">
                                                <span className="img-time"> <img src="assets/images//users/user-6.jpg" className="w30" data-themekey="#" /> </span>
                                                <span className="img-time-text img-time-text1">
                                                    <h5 className="ng-binding text-dark fw-bold font-14">Varun Sharma</h5>
                                                    <p className="mb-0 para-width ng-binding">
                                                        This is good, how are you?
                                                    </p>
                                                    <p className="mb-0 para-width1  text-muted font-12 ng-binding">05-Oct-2023 12:09</p>

                                                </span>
                                            </li>
                                            <li className="timeline-item">
                                                <span className="img-time"> <img src="assets/images//users/user-6.jpg" className="w30" data-themekey="#" /> </span>
                                                <span className="img-time-text img-time-text1">
                                                    <h5 className="ng-binding text-dark fw-bold font-14">Varun Sharma</h5>
                                                    <p className="mb-0 para-width  text-muted ng-binding">
                                                        This is good, how are you?
                                                    </p>
                                                    <p className="mb-0 para-width1 font-12 ng-binding">05-Oct-2023 12:09</p>

                                                </span>
                                            </li>

                                        </ul>

                                    </div>


                                    <div className="d-flex position-relative align-items-start mt-3">
                                        <div className="al nice me-2 mt-2"><img src="assets/images//users/user-6.jpg" className="w30" data-themekey="#" /></div>
                                        <div className="w-100">

                                            <input type="text" className="form-control ht form-control-sm" placeholder="Reply to comment.." />
                                        </div>
                                    </div>

                                </div>




                            </div>
                        </div>
                        <div className="col-xl-6">

                            <div className="card team-fedd">

                                <div className="card-body nose mx-2 mb-2  mt-2">

                                    <div className="row">

                                        <div className="d-flex align-items-start">
                                            <img className="me-2 mt-0 avatar-sm rounded-circle" src="assets/images//users/user-6.jpg" alt="Generic placeholder image" />

                                            <div className="w-100 mt-0">

                                                <h5 className="mt-0 font-16 fw600 mb-0"><a href="#" className="text-dark fw-bold font-14">System Account</a></h5>
                                                <p className="text-muted font-12"><small>12-Mar-2024 15:28</small></p>
                                            </div>
                                        </div>

                                        <p className="mt-2">Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin.Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin. </p>
                                        <div className="mt-0 mb-2">
                                            <a href="javascript: void(0);" className="btn btn-sm btn-link text-muted ps-0"><i className="mdi mdi-heart text-primary"></i> 2k Likes</a>


                                        </div>


                                    </div>


                                    <div className="d-flex position-relative align-items-start mt-1">

                                        <div className="w-100">
                                            <div className="al nice me-2 mt-2"><img src="assets/images//users/user-6.jpg" className="w30" data-themekey="#" /></div>
                                            <input type="text" className="form-control ht form-control-sm" placeholder="Reply to comment.." />
                                        </div>
                                    </div>

                                </div>




                            </div>
                            <div className="card team-fedd">

                                <div className="card-body nose mx-2 mb-2  mt-2">

                                    <div className="row">

                                        <div className="d-flex align-items-start">
                                            <img className="me-2 mt-0 avatar-sm rounded-circle" src="assets/images//users/user-6.jpg" alt="Generic placeholder image" />

                                            <div className="w-100 mt-0">

                                                <h5 className="mt-0 font-16 fw600 mb-0"><a href="#" className="text-dark fw-bold font-14">System Account</a></h5>
                                                <p className="text-muted"><small>12-Mar-2024 15:28</small></p>
                                            </div>
                                        </div>

                                        <p className="mt-2">Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin.Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin. </p>
                                        <div className="mt-0 mb-2">
                                            <a href="javascript: void(0);" className="btn btn-sm btn-link text-muted ps-0"><i className="mdi mdi-heart text-primary"></i> 2k Likes</a>


                                        </div>


                                    </div>


                                    <div className="d-flex position-relative align-items-start mt-1">

                                        <div className="w-100">
                                            <div className="al nice me-2 mt-2"><img src="assets/images//users/user-6.jpg" className="w30" data-themekey="#" /></div>
                                            <input type="text" className="form-control ht form-control-sm" placeholder="Reply to comment.." />
                                        </div>
                                    </div>

                                </div>




                            </div>

                        </div>


                    </div> */}
                    {/* ///news comments and replies ends */}

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
                    <div className="custom-carousel text-center position-relative">
                        <img
                            key={selectedIndex} // key triggers smooth fade
                            src={item?.images[selectedIndex]?.url}
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
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default NewsDetails
