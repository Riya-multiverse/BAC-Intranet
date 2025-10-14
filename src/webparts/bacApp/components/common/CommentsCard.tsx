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
    const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
    const [likedComments, setLikedComments] = useState<{ [key: number]: boolean }>({});

  const [localComments, setLocalComments] = useState<any[]>(comments);

React.useEffect(() => {
  setLocalComments(comments);
}, [comments]);



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
          ? { ...comment, Replies: [...(comment.Replies || []), newReply] }
          : comment
      )
    );
  } catch (error) {
    console.error("Error submitting reply:", error);
  }
};


    const toggleLike = (commentId: number) => {
        setLikedComments((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
    };


    return (

        <div className="row mt-2">
            {localComments.map((comment) => {
                const profilePicUrl = `${SITE_URL}/_layouts/15/userphoto.aspx?size=L&username=${comment.Author?.EMail}`;
                return (<div className="col-xl-6" key={comment.ID}>
                    <div className="card team-fedd">
                        <div className="card-body nose mx-2 mb-2 mt-2">
                            <div className="row">
                                <div className="d-flex align-items-start">
                                    <img
                                        className="me-2 mt-0 avatar-sm rounded-circle"
                                        src={profilePicUrl}
                                        alt="User"
                                    />
                                    <div className="w-100 mt-0">
                                        <h5 className="mt-0 mb-0">
                                            <a href="#" className="text-dark fw-bold font-14">
                                                {comment.Author?.Title}
                                            </a>
                                        </h5>
                                        <p className="text-muted font-12">
                                            <small>{moment.utc(comment.Created).local().format("DD MMM YYYY, hh:mm A")}</small>
                                        </p>
                                    </div>
                                </div>

                                <p className="mt-2">{comment.CommentText}</p>

                                <div className="mt-0 mb-2">
                                    <a href="javascript:void(0);" className="btn btn-sm btn-link text-muted ps-0">
                                        <i
                                            className={`bi ${likedComments[comment.ID] ? "bi-heart-fill text-danger" : "bi-heart text-danger"}`}
                                            style={{ fontSize: "20px", cursor: "pointer" }}
                                            onClick={() => toggleLike(comment.ID)}
                                        ></i>{" "}
                                        2k Likes
                                    </a>
                                    <a href="javascript:void(0);" className="btn btn-sm btn-link text-muted">
                                        <i className="mdi mdi-comment-multiple-outline"></i>{" "}
                                        {comment.Replies?.length || 0} Replies
                                    </a>
                                </div>

                                {/* Replies */}
                                {comment.Replies?.length > 0 && (

                                    <ul className="timeline1 mt-0 pt-0" style={{ marginLeft: 7, padding: 0 }}>
                                        {comment.Replies.map((reply: any) => {
                                            const profilePicUrl = `${SITE_URL}/_layouts/15/userphoto.aspx?size=L&username=${reply.Author?.EMail}`;

                                            return (
                                                <li className="timeline-item" key={reply.ID}>
                                                    <span className="img-time">
                                                        <img src={profilePicUrl} className="w30" />
                                                    </span>
                                                    <span className="img-time-text img-time-text1">
                                                        <h5 className="text-dark fw-bold font-14">{reply.Author?.Title}</h5>
                                                        <p className="mb-0">{reply.CommentText}</p>
                                                        <p className="mb-0 text-muted font-12">
                                                            {moment.utc(reply.Created).local().format("DD MMM YYYY, hh:mm A")}
                                                        </p>
                                                    </span>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                )}
                            </div>

                            {/* Reply box */}
                            <div className="d-flex position-relative align-items-start mt-3">
                                <div className="al nice me-2 mt-2">
                                    <img src={profilePicUrl} className="w30" />
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
                </div>)
            })}
        </div>

    )
}

export default CommentsCard
