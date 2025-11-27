import * as React from 'react'
import { useState } from 'react';

import { SPFI } from '@pnp/sp';
import { getSP } from '../../loc/pnpjsConfig';
import { SITE_URL } from '../../../../Shared/Constant';
import * as moment from 'moment';
interface INewsCommentsProps {
    newsId: number; // pass current news item ID
    comments: any[];
}

const CommentsCard = ({ newsId, comments }: INewsCommentsProps) => {
    const sp: SPFI = getSP();
    const [currentUser, setCurrentUser] = React.useState<any>(null);
    const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
    const [likedComments, setLikedComments] = useState<{ [key: number]: boolean }>({});
    const [likesData, setLikesData] = useState<{ [key: number]: { count: number; likedByUser: boolean } }>({});

    const [localComments, setLocalComments] = useState<any[]>(comments);

    React.useEffect(() => {
        // const currentUser = await sp.web.currentUser();
        // setCurrentUser(sp.web.currentUser());
        setLocalComments(comments);

        fetchLikesForVisibleComments();

    }, [comments]);

    const fetchLikesForVisibleComments = async () => {
        try {
            const currentUser = await sp.web.currentUser();
            setCurrentUser(currentUser);
            const commentIds = comments.map(c => c.ID);

            if (commentIds.length === 0) return;

            // Fetch likes for only these comment IDs
            const likeItems = await sp.web.lists
                .getByTitle("NewsandAnnouncementCommentLikes")
                .items.select("ID", "CommentID/ID", "User/ID")
                .expand("CommentID", "User")();

            // Filter likes only for comments in current page
            const filteredLikes = likeItems.filter(l => commentIds.includes(l.CommentID?.ID));

            // Build dictionary for quick lookup
            const data: { [key: number]: { count: number; likedByUser: boolean } } = {};

            commentIds.forEach(id => {
                const likesForComment = filteredLikes.filter(l => l.CommentID?.ID === id);
                data[id] = {
                    count: likesForComment.length,
                    likedByUser: likesForComment.some(l => l.User?.ID === currentUser.Id)
                };
            });

            setLikesData(data);
        } catch (err) {
            console.error("Error fetching likes:", err);
        }
    };


    // const handleReplySubmit = async (parentId: number) => {
    //     if (!replyText[parentId]?.trim()) return;

    //     try {
    //         await sp.web.lists.getByTitle("NewsandAnnouncementComments").items.add({
    //             CommentText: replyText[parentId],
    //             NewsIDId: newsId,
    //             ParentCommentIDId: parentId,
    //         });

    //         setReplyText((prev) => ({ ...prev, [parentId]: "" }));
    //         // fetchComments();
    //     } catch (error) {
    //         console.error("Error submitting reply:", error);
    //     }
    // };
    const handleReplySubmit = async (parentId: number) => {
        if (!replyText[parentId]?.trim()) return;

        try {
            // ✅ Add reply to SharePoint list
            const addedItem = await sp.web.lists
                .getByTitle("NewsandAnnouncementComments")
                .items.add({
                    CommentText: replyText[parentId],
                    NewsIDId: newsId,
                    ParentCommentIDId: parentId,
                });

            // ✅ Get current user (for reply display)
            const currentUser = await sp.web.currentUser();

            // ✅ Build new reply object (mimic structure)
            const newReply = {
                ID: addedItem.data.ID,
                CommentText: replyText[parentId],
                Created: new Date().toISOString(),
                Author: {
                    Title: currentUser.Title,
                    EMail: currentUser.Email,
                },
            };

            // ✅ Clear input box
            setReplyText((prev) => ({ ...prev, [parentId]: "" }));

            // ✅ Update local state with new reply
            setLocalComments((prev) =>
                prev.map((comment) =>
                    comment.ID === parentId
                        ? { ...comment, Replies: [newReply, ...(comment.Replies || [])] } // ✅ new reply on top
                        : comment
                )
            );

        } catch (error) {
            console.error("Error submitting reply:", error);
        }
    };


    // const toggleLike = (commentId: number) => {
    //     setLikedComments((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
    // };
    const toggleLike = async (commentId: number) => {
        try {
            const currentUser = await sp.web.currentUser();
            const current = likesData[commentId];

            if (!current?.likedByUser) {
                // ➕ LIKE

                // 1️⃣ Add entry in Likes list
                await sp.web.lists.getByTitle("NewsandAnnouncementCommentLikes").items.add({
                    CommentIDId: commentId,
                    UserId: currentUser.Id
                });

                // 2️⃣ Update count in Comments list
                await sp.web.lists
                    .getByTitle("NewsandAnnouncementComments")
                    .items.getById(commentId)
                    .update({
                        LikesCount: (current?.count || 0) + 1
                    });

                // 3️⃣ Update state locally
                setLikesData(prev => ({
                    ...prev,
                    [commentId]: {
                        count: (current?.count || 0) + 1,
                        likedByUser: true
                    }
                }));

            } else {
                // ➖ UNLIKE

                // 1️⃣ Find the existing like item
                const existingLike = await sp.web.lists
                    .getByTitle("NewsandAnnouncementCommentLikes")
                    .items.filter(`CommentID/ID eq ${commentId} and User/ID eq ${currentUser.Id}`)
                    .select("ID")();

                if (existingLike.length > 0) {
                    await sp.web.lists
                        .getByTitle("NewsandAnnouncementCommentLikes")
                        .items.getById(existingLike[0].ID)
                        .delete();
                }

                // 2️⃣ Update count in Comments list
                await sp.web.lists
                    .getByTitle("NewsandAnnouncementComments")
                    .items.getById(commentId)
                    .update({
                        LikesCount: Math.max((current?.count || 1) - 1, 0)
                    });

                // 3️⃣ Update local state
                setLikesData(prev => ({
                    ...prev,
                    [commentId]: {
                        count: Math.max((current?.count || 1) - 1, 0),
                        likedByUser: false
                    }
                }));
            }
        } catch (err) {
            console.error("Error updating like:", err);
        }
    };



    return (

        <div className="row mt-2">
            <div className="col-xl-6">
            {localComments.filter((_, index) => (index+1) % 2 !== 0).map((comment,idx) => {
                const profilePicUrl = `${SITE_URL}/_layouts/15/userphoto.aspx?size=L&username=${comment.Author?.EMail}`;
                const commentedDate = moment.utc(comment.Created).local().format("DD MMM YYYY, hh:mm A");
                const CurrprofilePicUrl = `${SITE_URL}/_layouts/15/userphoto.aspx?size=L&username=${currentUser?.Email}`;
                // const cardClass = index+1 % 2 === 0 ? "even-comment" : "odd-comment";
                return (
                // <div className="col-xl-6" key={comment.ID}>
                    <div className={`card team-fedd `}>
                        <div className="card-body nose mx-2 mb-2 mt-2">
                            <div className="row">
                                <div className="d-flex align-items-start">
                                    <img
                                        className="me-2 mt-0 avatar-sm rounded-circle"
                                        src={profilePicUrl}
                                        alt="User"
                                    />
                                    <div className="w-100  mt-0" style={{paddingLeft: "45px;"}}>
                                        <h5 className="mt-0  mb-0">
                                            <a href="#" className="text-dark fw-bold font-14">
                                                {comment.Author?.Title}
                                            </a>
                                        </h5>
                                        <p className="text-muted font-12">
                                            <small>{commentedDate}</small>
                                        </p>
                                    </div>
                                </div>

                                <p className="mt-2">{comment.CommentText}</p>

                                <div className="mt-0 mb-2 d-flex align-items-center">
                                    {/* <a href="javascript:void(0);" className="btn btn-sm btn-link text-muted ps-0">
                                        <i
                                            className={`bi ${likedComments[comment.ID] ? "bi-heart-fill text-danger" : "bi-heart text-danger"}`}
                                            style={{ fontSize: "20px", cursor: "pointer" }}
                                            onClick={() => toggleLike(comment.ID)}
                                        ></i>{" "}
                                        2k Likes
                                    </a> */}
                                    <a href="javascript:void(0);" className="btn btn-sm btn-link text-muted ps-0 d-flex align-items-center">
                                        <i
                                            className={`bi ${likesData[comment.ID]?.likedByUser ? "bi-heart-fill text-danger" : "bi-heart text-danger"}`}
                                            style={{ fontSize: "12px", cursor: "pointer" }}
                                            onClick={() => toggleLike(comment.ID)}
                                        ></i>{" "}
                                        {likesData[comment.ID]?.count || 0} Likes
                                    </a>

                                    <a href="javascript:void(0);" className="btn btn-sm btn-link text-muted d-flex align-items-center">
                                        <i className="bi bi-chat"></i>{" "}
                                        {comment.Replies?.length || 0} Replies
                                    </a>
                                </div>

                                {/* Replies */}
                                {comment.Replies?.length > 0 && (

                                    <ul className="timeline1 mt-0 pt-0" style={{ marginLeft: 7, padding: 0 }}>
                                        {comment.Replies.map((reply: any) => {
                                            const profilePicUrl = `${SITE_URL}/_layouts/15/userphoto.aspx?size=L&username=${reply.Author?.EMail}`;
                                            const commentedDate = moment.utc(reply.Created).local().format("DD MMM YYYY, hh:mm A");
                                            return (
                                                <li className="timeline-item" key={reply.ID}>
                                                    <span className="img-time">
                                                        <img src={profilePicUrl} className="w30" />
                                                    </span>
                                                    <span className="img-time-text img-time-text1">
                                                        <h5 className="text-dark fw-bold font-14">{reply.Author?.Title}</h5>
                                                        <p className="mb-0">{reply.CommentText}</p>
                                                        <p className="mb-0 text-muted font-12">
                                                            {commentedDate}
                                                        </p>
                                                    </span>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                )}
                            </div>

                            {/* Reply box */}
                            <div className="d-flex position-relative align-items-start mt-1">
                                <div className="al nice me-2 mt-2">
                                    <img src={CurrprofilePicUrl} className="w30" />
                                </div>
                                <div className="w-100">
                                    <input
                                        type="text"
                                        className="form-control ht form-control-sm"
                                        placeholder="Reply to comment.."
                                        value={replyText[comment.ID] || ""}
                                        onChange={(e) =>
                                            setReplyText((prev) => ({ ...prev, [comment.ID]: e.target.value }))
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault(); // Prevent default form submission
                                                handleReplySubmit(comment.ID);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                // </div>
            )
            })}
             </div>

             <div className="col-xl-6">
            {localComments.filter((_, index) => (index+1) % 2 === 0).map((comment,idx) => {
                const profilePicUrl = `${SITE_URL}/_layouts/15/userphoto.aspx?size=L&username=${comment.Author?.EMail}`;
                const commentedDate = moment.utc(comment.Created).local().format("DD MMM YYYY, hh:mm A");
                const CurrprofilePicUrl = `${SITE_URL}/_layouts/15/userphoto.aspx?size=L&username=${currentUser?.Email}`;
                // const cardClass = index+1 % 2 === 0 ? "even-comment" : "odd-comment";
                return (
                // <div className="col-xl-6" key={comment.ID}>
                    <div className={`card team-fedd`}>
                        <div className="card-body nose mx-2 mb-2 mt-2">
                            <div className="row">
                                <div className="d-flex align-items-start">
                                    <img
                                        className="me-2 mt-0 avatar-sm rounded-circle"
                                        src={profilePicUrl}
                                        alt="User"
                                    />
                                    <div className="w-100  mt-0">
                                        <h5 className="mt-0  mb-0">
                                            <a href="#" className="text-dark fw-bold font-14">
                                                {comment.Author?.Title}
                                            </a>
                                        </h5>
                                        <p className="text-muted font-12">
                                            <small>{commentedDate}</small>
                                        </p>
                                    </div>
                                </div>

                                <p className="mt-2">{comment.CommentText}</p>

                                <div className="mt-0 mb-2 d-flex align-items-center">
                                    {/* <a href="javascript:void(0);" className="btn btn-sm btn-link text-muted ps-0">
                                        <i
                                            className={`bi ${likedComments[comment.ID] ? "bi-heart-fill text-danger" : "bi-heart text-danger"}`}
                                            style={{ fontSize: "20px", cursor: "pointer" }}
                                            onClick={() => toggleLike(comment.ID)}
                                        ></i>{" "}
                                        2k Likes
                                    </a> */}
                                    <a href="javascript:void(0);" className="btn btn-sm btn-link text-muted ps-0 d-flex align-items-center">
                                        <i
                                            className={`bi ${likesData[comment.ID]?.likedByUser ? "bi-heart-fill text-danger" : "bi-heart text-danger"}`}
                                            style={{ fontSize: "12px", cursor: "pointer" }}
                                            onClick={() => toggleLike(comment.ID)}
                                        ></i>{" "}
                                        {likesData[comment.ID]?.count || 0} Likes
                                    </a>

                                    <a href="javascript:void(0);" className="btn btn-sm btn-link text-muted d-flex align-items-center">
                                        <i  className="bi bi-chat"></i>{" "}
                                        {comment.Replies?.length || 0} Replies
                                    </a>
                                </div>

                                {/* Replies */}
                                {comment.Replies?.length > 0 && (

                                    <ul className="timeline1 mt-0 pt-0" style={{ marginLeft: 7, padding: 0 }}>
                                        {comment.Replies.map((reply: any) => {
                                            const profilePicUrl = `${SITE_URL}/_layouts/15/userphoto.aspx?size=L&username=${reply.Author?.EMail}`;
                                            const commentedDate = moment.utc(reply.Created).local().format("DD MMM YYYY, hh:mm A");
                                            return (
                                                <li className="timeline-item" key={reply.ID}>
                                                    <span className="img-time">
                                                        <img src={profilePicUrl} className="w30" />
                                                    </span>
                                                    <span className="img-time-text img-time-text1">
                                                        <h5 className="text-dark fw-bold font-14">{reply.Author?.Title}</h5>
                                                        <p className="mb-0">{reply.CommentText}</p>
                                                        <p className="mb-0 text-muted font-12">
                                                            {commentedDate}
                                                        </p>
                                                    </span>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                )}
                            </div>

                            {/* Reply box */}
                            <div className="d-flex position-relative align-items-start mt-1">
                                <div className="al nice me-2 mt-2">
                                    <img src={CurrprofilePicUrl} className="w30" />
                                </div>
                                <div className="w-100">
                                    <input
                                        type="text"
                                        className="form-control ht form-control-sm"
                                        placeholder="Reply to comment.."
                                        value={replyText[comment.ID] || ""}
                                        onChange={(e) =>
                                            setReplyText((prev) => ({ ...prev, [comment.ID]: e.target.value }))
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault(); // Prevent default form submission
                                                handleReplySubmit(comment.ID);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                // </div>
            )
            })}
             </div>
        </div>

    )
}

export default CommentsCard
