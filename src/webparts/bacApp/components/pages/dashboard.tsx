import * as React from "react";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import { SPFI } from "@pnp/sp";
import { getSP } from "../../loc/pnpjsConfig";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import FileViewer from "../common/FileViewerNew";
import { Modal } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
const dashboard = () => {
    const navigate = useNavigate();
    const [slideIndex, setSlideIndex] = React.useState(1);
    const [banners, setBanners] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [newsItems, setNewsItems] = React.useState<any[]>([]);
    const [announcements, setAnnouncements] = React.useState<any[]>([]);
    const [quickLinks, setQuickLinks] = React.useState<any[]>([]);
    const [recognitions, setRecognitions] = React.useState<any[]>([]);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [successList, setSuccessList] = React.useState<any[]>([]);
    const [projects, setProjects] = React.useState<any[]>([]);
    const [policies, setPolicies] = useState<any[]>([]);
    const [showFileViewer, setShowFileViewer] = useState(false);
    const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
    const [showModal, setShowModal] = React.useState(false);
    const [modalItem, setModalItem] = React.useState<any[]>([]);
    //  Define dashboard display limits for "View All" visibility
    const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

    const toggleExpand = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };
    //  Define limits for dashboard sections
    const DISPLAY_LIMITS = {
        news: 2,
        announcements: 2,
        quickLinks: 6,
        recognitions: 4,
        policies: 4,
        projects: 3,
    };

    //  Truncate by word count
    const truncateByWords = (text: string, maxWords: number): string => {
        if (!text) return "";
        const words = text.split(" ");
        if (words.length <= maxWords) return text;
        return words.slice(0, maxWords).join(" ") + "...";
    };




    const sp: SPFI = getSP();
    // const slides = [
    //     {
    //         quote:
    //             "During a sudden network outage on June 18, the IT Helpdesk team restored all business-critical services within 2.5 hours.",
    //         author: "IT Helpdesk",
    //     },
    //     {
    //         quote:
    //             "Ground Operations achieved a 94% CSAT score in June, their highest this year, following the launch of a staff engagement initiative.",
    //         author: "Ground Operations",
    //     },
    //     {
    //         quote:
    //             "The Finance team fully automated monthly reconciliation reports using Power BI, saving an average of 20 hours per month.",
    //         author: "Finance Department",
    //     },
    // ];

    //  Show the first slide initially
    // React.useEffect(() => {
    //     showSlides(slideIndex);
    // }, [slideIndex]);

    // useEffect(() => {
    //     const timer = setInterval(() => {
    //         setCurrentSlideIndex((prev) => (prev + 1) % 3); // rotates every 3 slides
    //     }, 5000); // 5 seconds
    //     return () => clearInterval(timer);
    // }, []);

    useEffect(() => {
    if (banners.length > 0) {
      const carouselElement = document.querySelector("#carouselExampleIndicators");
      if (carouselElement) {
        const bootstrap = require("bootstrap");
        const carousel = new bootstrap.Carousel(carouselElement, {
          interval: 5000, // 5 seconds
          ride: "carousel", // auto start
          pause: false, // keeps sliding even if hovered
          wrap: true,
        });
      }
    }
  }, [banners]);


    //fetch Banners
    React.useEffect(() => {
        const fetchBanners = async () => {
            setLoading(true);
            try {
                const bannerItems = await sp.web.lists
                    .getByTitle("Banner")
                    .items.select("Id", "Title", "IsActive", "BannerImageID/ID")
                    .expand("BannerImageID")
                    .filter("IsActive eq 'Yes'")
                    .top(3)();

                const bannersWithImages = await Promise.all(
                    bannerItems.map(async (banner: any) => {
                        const imageLookupId = banner.BannerImageID?.ID;
                        if (imageLookupId) {
                            try {
                                const imageItem = await sp.web.lists
                                    .getByTitle("BannerDocs")
                                    .items.getById(imageLookupId)
                                    .select("FileRef")();

                                return {
                                    ...banner,
                                    ImageUrl: `${window.location.origin}${imageItem.FileRef}`,
                                };
                            } catch {
                                return { ...banner, ImageUrl: null };
                            }
                        } else {
                            return { ...banner, ImageUrl: null };
                        }
                    })
                );

                setBanners(bannersWithImages);
            } catch (err) {
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, []);

    // //  Next/Prev handlers
    // const plusSlides = (n: number) => {
    //     let newIndex = slideIndex + n;
    //     if (newIndex > slides.length) newIndex = 1;
    //     if (newIndex < 1) newIndex = slides.length;
    //     setSlideIndex(newIndex);
    // };

    // //  Dot click handler
    // const currentSlide = (n: number) => {
    //     setSlideIndex(n);
    // };

    // //  Just a wrapper for logic
    // const showSlides = (n: number) => {
    //     // in React, no manual DOM needed — state handles this
    //     // This function is kept for clarity, but not doing direct DOM
    // };

    //  Helper to get image URLs from doc library
    const getDocumentLinkByID = async (AttachmentId: number[]) => {
        if (!AttachmentId || AttachmentId.length === 0) return [];
        try {
            const results = await Promise.all(
                AttachmentId.map(async (id) => {
                    const res = await sp.web.lists
                        .getByTitle("AnnouncementandNewsDocs")
                        .items.getById(id)
                        .select("Id", "FileRef", "FileLeafRef")();
                    return res;
                })
            );
            return results;
        } catch (error) {
            return [];
        }
    };
    //fetch news
    React.useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            try {
                //  Fetch all news items (SourceType = 'News')
                const items = await sp.web.lists
                    .getByTitle("AnnouncementAndNews")
                    .items.select(
                        "Id",
                        "Title",
                        "Description",
                        "Created",
                        "AnnouncementandNewsImageID/ID"
                    )
                    .expand("AnnouncementandNewsImageID")
                    .filter("SourceType eq 'News' and IsActive eq 'Yes'")
                    .orderBy("Created", false) // latest first
                    .top(DISPLAY_LIMITS.news + 1)(); // only top 2 for dashboard display



                //  Combine news items with their linked images
                const formatted = await Promise.all(
                    items.map(async (item: any) => {
                        const imageIds =
                            item.AnnouncementandNewsImageID?.map((img: any) => img.ID) || [];

                        const imageLinks =
                            imageIds.length > 0 ? await getDocumentLinkByID(imageIds) : [];

                        return {
                            id: item.Id,
                            title: item.Title || "",
                            description: item.Description || "",
                            created: new Date(item.Created),
                            images: imageLinks.map((img: any) => ({
                                name: img.FileLeafRef,
                                url: `${window.location.origin}${img.FileRef}`,
                            })),
                        };
                    })
                );

                //  Save formatted data to state
                setNewsItems(formatted);
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    //ftech announcements
    React.useEffect(() => {
        const fetchAnnouncements = async () => {
            setLoading(true);

            try {
                const sp: SPFI = getSP();

                //  Fetch latest active announcements
                const announcementItems = await sp.web.lists
                    .getByTitle("AnnouncementAndNews")
                    .items.select(
                        "Id",
                        "Title",
                        "Created",
                        "IsActive",
                        "SourceType",
                        "Description",
                        "Department/DepartmentName",
                        "Department/Id",
                        "Overview",
                        "Created",
                        "Author/Title",
                        "Author/Id",
                        "Author/EMail",
                        "AnnouncementandNewsImageID/ID"
                    )
                    .expand("AnnouncementandNewsImageID,Department,Author")
                    .filter("SourceType eq 'Announcements' and IsActive eq 'Yes'")
                    .orderBy("Created", false)
                    .top(DISPLAY_LIMITS.announcements + 1)(); // only top 2 for dashboard

                //  Fetch all comments with linked NewsID (Announcement ID)
                // const allComments = await sp.web.lists
                //     .getByTitle("NewsandAnnouncementComments")
                //     .items.select("Id", "NewsID/Id", "IsDeleted")
                //     .expand("NewsID")
                //     .filter("IsDeleted eq 0")();

                // // Build a map of comment counts by announcement ID
                // const commentCountMap: Record<number, number> = {};
                // allComments.forEach((c: any) => {
                //     const newsId = c.NewsID?.Id;
                //     if (newsId) {
                //         commentCountMap[newsId] = (commentCountMap[newsId] || 0) + 1;
                //     }
                // });

                // //  Fetch likes — each like links to CommentID → NewsID
                // const allLikes = await sp.web.lists
                //     .getByTitle("NewsandAnnouncementCommentLikes")
                //     .items.select("Id", "CommentID/Id")
                //     .expand("CommentID")();

                // //  Create a map from CommentID → NewsID using comments
                // const commentToNewsMap: Record<number, number> = {};
                // allComments.forEach((c: any) => {
                //     if (c.Id && c.NewsID?.Id) {
                //         commentToNewsMap[c.Id] = c.NewsID.Id;
                //     }
                // });

                //  Count likes per NewsID using the map
                // const likeCountMap: Record<number, number> = {};
                // allLikes.forEach((like: any) => {
                //     const commentId = like.CommentID?.Id;
                //     const newsId = commentToNewsMap[commentId];
                //     if (newsId) {
                //         likeCountMap[newsId] = (likeCountMap[newsId] || 0) + 1;
                //     }
                // });

                // //  Format final announcement list
                // const formattedAnnouncements = announcementItems.map(
                //     (item: any, index: number) => {
                //         const announcementId = item.Id;

                //         return {
                //             id: announcementId,
                //             sno: index + 1,
                //             title: item.Title,
                //             created: new Date(item.Created),
                //             likes: likeCountMap[announcementId] || 0,
                //             comments: commentCountMap[announcementId] || 0,
                //         };
                //     }
                // );

                //  Save to state

                //  Combine news items with their linked images
                const formattedAnnouncements = await Promise.all(
                    announcementItems.map(async (item: any) => {
                        const imageIds =
                            item.AnnouncementandNewsImageID?.map((img: any) => img.ID) || [];

                        const imageLinks =
                            imageIds.length > 0 ? await getDocumentLinkByID(imageIds) : [];

                        return {
                            id: item.Id,
                            title: item.Title || "",
                            description: item.Description || "",
                            created: new Date(item.Created),
                            images: imageLinks.map((img: any) => ({
                                name: img.FileLeafRef,
                                url: `${window.location.origin}${img.FileRef}`,
                            })),
                        };
                    })
                );

                //  Save formatted data to state
                setAnnouncements(formattedAnnouncements);
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, []);

    //fetch quick links

    React.useEffect(() => {
        const fetchQuickLinks = async () => {
            setLoading(true);

            try {
                const sp: SPFI = getSP();

                //  Fetch top 6 active QuickLinks
                const quickLinkItems = await sp.web.lists
                    .getByTitle("QuickLinks")
                    .items.select(
                        "ID",
                        "Title",
                        "URL",
                        "RedirectToNewTab",
                        "IsActive",
                        "QuickLinksID/ID"
                    )
                    .expand("QuickLinksID")
                    .filter("IsActive eq 1")
                    .orderBy("ID", true)
                    .top(DISPLAY_LIMITS.quickLinks + 1)();

                //  Fetch actual image files from QuickLinkDocs
                const mappedLinks = await Promise.all(
                    quickLinkItems.map(async (item: any) => {
                        let imageUrl = "";

                        if (item?.QuickLinksID?.ID) {
                            try {
                                const doc = await sp.web.lists
                                    .getByTitle("QuickLinkDocs")
                                    .items.getById(item.QuickLinksID.ID)
                                    .select("FileRef")();

                                imageUrl = doc.FileRef;
                            } catch (error) { }
                        }

                        return {
                            ID: item.ID,
                            Title: item.Title || "",
                            URL: item.URL || "#",
                            RedirectToNewTab: !!item.RedirectToNewTab,
                            ImageUrl: imageUrl,
                        };
                    })
                );

                setQuickLinks(mappedLinks);
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };

        fetchQuickLinks();
    }, []);

    //staff recognition
    useEffect(() => {
        let cancelled = false;

        const fetchRecognitions = async () => {
            setLoading(true);
            try {
                const sp: SPFI = getSP();

                //  Fetch Employee Recognition list items
                const rawItems = await sp.web.lists
                    .getByTitle("EmployeeRecognition")
                    .items.select(
                        "Id",
                        "Title",
                        "EmployeeName/Id",
                        "EmployeeName/Title",
                        "EmployeeName/EMail"
                    )
                    .expand("EmployeeName")
                    .orderBy("Id", false)
                    .top(DISPLAY_LIMITS.recognitions + 1)(); // Top 10 staff recognitions

                //  Get all site users (those who have access)
                const allUsers = await sp.web.siteUsers();

                //  Get department for each user from User Profile Service
                const userDepartments: Record<string, string> = {};
                await Promise.all(
                    allUsers.map(async (user) => {
                        try {
                            const department = await sp.profiles.getUserProfilePropertyFor(
                                user.LoginName,
                                "Department"
                            );
                            if (department)
                                userDepartments[user.Email?.toLowerCase()] = department;
                        } catch {
                            // Skip users without a department
                        }
                    })
                );

                //  Merge recognition data with department info for each recognized employee
                const mapped = rawItems.map((it: any) => {
                    const emp = it.EmployeeName;
                    let person = { Id: null as number | null, Title: "", EMail: "" };

                    if (Array.isArray(emp)) {
                        person.Id = emp[0]?.Id ?? null;
                        person.Title = emp[0]?.Title ?? "";
                        person.EMail = emp[0]?.EMail ?? "";
                    } else if (typeof emp === "object" && emp) {
                        person.Id = emp.Id ?? null;
                        person.Title = emp.Title ?? "";
                        person.EMail = emp.EMail ?? "";
                    }
                    // Normalize email (remove claims prefix, lowercase)
                    const normalizeEmail = (email: string | undefined) => {
                        if (!email) return "";
                        return email
                            .replace(/^i:0#.f\|membership\|/i, "")
                            .trim()
                            .toLowerCase();
                    };

                    const emailKey = normalizeEmail(person.EMail);
                    const dept =
                        emailKey && userDepartments[emailKey]
                            ? userDepartments[emailKey]
                            : "Department not available";

                    // Avatar photo
                    const avatarUrl =
                        person.EMail && person.EMail !== ""
                            ? `/_layouts/15/userphoto.aspx?size=M&username=${encodeURIComponent(
                                person.EMail
                            )}`
                            : "";

                    const profileUrl = person.Id
                        ? `/SitePages/Profile.aspx?userId=${person.Id}`
                        : "javascript:void(0)";

                    return {
                        id: it.Id,
                        name: person.Title || it.Title || "",
                        department: dept,
                        avatarUrl,
                        profileUrl,
                    };
                });

                if (!cancelled) setRecognitions(mapped);
            } catch (err) {
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchRecognitions();
        return () => {
            cancelled = true;
        };
    }, []);

    //fetch policy and procedure

    //Helper to format file size
    const formatSize = (bytes: number | null | undefined): string => {
        if (bytes == null) return "";
        const kb = bytes / 1024;
        if (kb < 1024) return kb.toFixed(1) + " KB";
        return (kb / 1024).toFixed(1) + " MB";
    };

    useEffect(() => {
        const fetchPolicies = async () => {
            setLoading(true);
            const sp = getSP();

            try {


                //  Fetch PolicyandProcedures items
                const items = await sp.web.lists
                    .getByTitle("PolicyandProcedures")
                    .items.select(
                        "Id",
                        "Title",
                        "Description",
                        "Attachment/Id",
                        "AttachmentId",
                        "Category/Category",
                        "PolicyType/Title"
                    )
                    .expand("Attachment", "Category", "PolicyType")
                    .orderBy("Created", false)
                    .top(4)();



                // Collect all attachment IDs
                const allAttachmentIds: number[] = [];
                items.forEach((it: any) => {
                    if (Array.isArray(it.Attachment)) {
                        it.Attachment.forEach(
                            (a: any) => a?.Id && allAttachmentIds.push(Number(a.Id))
                        );
                    } else if (it.Attachment?.Id) {
                        allAttachmentIds.push(Number(it.Attachment.Id));
                    } else if (it.AttachmentId) {
                        allAttachmentIds.push(Number(it.AttachmentId));
                    }
                });



                // Fetch matching files directly with expand(File)
                let fileMap: Record<number, any> = {};

                if (allAttachmentIds.length > 0) {
                    const filterString = allAttachmentIds
                        .map((id) => `Id eq ${id}`)
                        .join(" or ");

                    const files = await sp.web.lists
                        .getByTitle("PolicyDocs")
                        .items.filter(filterString)
                        .select("Id", "File/Name", "File/ServerRelativeUrl", "File/Length")
                        .expand("File")();



                    // Build quick lookup map
                    fileMap = (files || []).reduce((acc: any, f: any) => {
                        acc[f.Id] = {
                            Id: f.Id,
                            FileName: f.File?.Name || "",
                            FileUrl: f.File?.ServerRelativeUrl
                                ? `${window.location.origin}${f.File.ServerRelativeUrl}`
                                : "",
                            FileSize: f.File?.Length || 0,
                        };
                        return acc;
                    }, {});
                } else {

                }

                // Map final formatted array
                const formatted = (items || []).map((item: any) => {
                    let attachId: number | null = null;
                    if (Array.isArray(item.Attachment) && item.Attachment.length > 0)
                        attachId = item.Attachment[0]?.Id;
                    else if (item.Attachment?.Id) attachId = item.Attachment.Id;
                    else if (typeof item.AttachmentId === "number")
                        attachId = item.AttachmentId;

                    const fileWrapper = attachId ? fileMap[attachId] : null;


                    return {
                        Id: item.Id,
                        Title: item.Title,
                        Description: item.Description,
                        Category: item.Category?.Category || "",
                        PolicyType: item.PolicyType?.Title || "",
                        FileName: fileWrapper?.FileName || "",
                        FileUrl: fileWrapper?.FileUrl || "",
                        FileSize: fileWrapper?.FileSize
                            ? formatSize(fileWrapper.FileSize)
                            : "",
                    };
                });


                setPolicies(formatted);
            } catch (err) {

            } finally {
                setLoading(false);
            }
        };

        fetchPolicies();
    }, []);

    const handleFileView = (fileUrl: string) => {
        if (!fileUrl) return;

        let fullFileUrl = fileUrl.startsWith("/")
            ? `${window.location.origin}${fileUrl}`
            : fileUrl;

        let resolvedUrl = fullFileUrl;
        const lowerUrl = fullFileUrl.toLowerCase();

        // Office documents open using SharePoint viewer
        if (
            lowerUrl.endsWith(".xlsx") ||
            lowerUrl.endsWith(".xls") ||
            lowerUrl.endsWith(".docx") ||
            lowerUrl.endsWith(".doc") ||
            lowerUrl.endsWith(".pptx") ||
            lowerUrl.endsWith(".ppt")
        ) {
            resolvedUrl = `${fullFileUrl}?web=1`;
        }

        // PDFs or images open directly
        else if (
            lowerUrl.endsWith(".pdf") ||
            lowerUrl.endsWith(".png") ||
            lowerUrl.endsWith(".jpg") ||
            lowerUrl.endsWith(".jpeg") ||
            lowerUrl.endsWith(".gif")
        ) {
            resolvedUrl = fullFileUrl;
        }

        setSelectedFileUrl(resolvedUrl);
        setShowFileViewer(true);
    };

    const getCleanFileName = (fileName: string): string => {
        if (!fileName) return "file";
        const parts = fileName.split("_");

        // If the name has at least 3 parts, drop the first two
        if (parts.length > 2 && /^\d{8}$/.test(parts[0])) {
            return parts.slice(2).join("_");
        }

        // Otherwise, return as-is
        return fileName;
    };

    //fetch story
    React.useEffect(() => {
        setLoading(true);
        const fetchSuccessStories = async () => {
            try {
                const items = await sp.web.lists
                    .getByTitle("SuccessStories")
                    .items.select(
                        "Id",
                        "SuccessStories",
                        "Department/Id",
                        "Department/DepartmentName"
                    )
                    .expand("Department")
                    .orderBy("Created", false)
                    .top(6)();

                const formatted = items.map((item: any, index: number) => ({
                    Id: item.Id,
                    SNo: index + 1,
                    SuccessStories: item.SuccessStories || "",
                    Department: item.Department?.DepartmentName || "",
                }));

                setSuccessList(formatted);
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };

        fetchSuccessStories();
    }, [setLoading]);

    //project of the month
    React.useEffect(() => {
        const fetchProjects = async () => {
            try {
                const sp: SPFI = getSP();

                const items = await sp.web.lists
                    .getByTitle("Projects")
                    .items.select(
                        "Id",
                        "Title",
                        "ProjectName",
                        "ProjectOverview",
                        "StartDate",
                        "DueDate",
                        "Department/DepartmentName",
                        "Department/Id",
                        "TeamMembers/Title",
                        "TeamMembers/EMail",
                        "TeamMembers/Id",
                        "Attachment/ID"
                    )
                    .expand("Department,TeamMembers,Attachment")
                    .orderBy("Created", false)
                    .top(6)(); // Top 6 projects for dashboard

                const today = new Date();

                const formatted = items.map((item: any, index: number) => {
                    const startDate = item.StartDate ? new Date(item.StartDate) : null;
                    const dueDate = item.DueDate ? new Date(item.DueDate) : null;

                    //  Status Logic
                    let computedStatus = "Not Started";
                    if (startDate && dueDate) {
                        if (today < startDate) {
                            computedStatus = "Not Started";
                        } else if (today >= startDate && today <= dueDate) {
                            computedStatus = "Ongoing";
                        } else if (today > dueDate) {
                            computedStatus = "Finished";
                        }
                    }

                    return {
                        id: item.Id,
                        sno: index + 1,
                        name: item.ProjectName || "Untitled Project",
                        overview: item.ProjectOverview || "",
                        department: item.Department?.DepartmentName || "",
                        teamMembers: item.TeamMembers || [],
                        startDate: startDate,
                        dueDate: dueDate,
                        status: computedStatus, // ← dynamic
                        documents: item.Attachment ? item.Attachment.length : 0, // lookup count
                    };
                });

                setProjects(formatted);
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);


    //  Control "View All" button visibility dynamically
    const showViewAll = {
        announcements: announcements.length > DISPLAY_LIMITS.announcements,
        quickLinks: quickLinks.length > DISPLAY_LIMITS.quickLinks,
        recognitions: recognitions.length > DISPLAY_LIMITS.recognitions,
        policies: policies.length > DISPLAY_LIMITS.policies,
        projects: projects.length > DISPLAY_LIMITS.projects,
    };



    return (
        <>
            {loading ? (
                <div className="loadernewadd mt-10">
                    <div>
                        <img
                            src={require("../../assets/BAC_loader.gif")}
                            className="alignrightl"
                            alt="Loading..."
                        />
                    </div>
                    <span>Loading </span>{" "}
                    <span>
                        <img
                            src={require("../../assets/edcnew.gif")}
                            className="alignrightl"
                            alt="Loading..."
                        />
                    </span>
                </div>
            ) : (
                <>
                    <div className="row">
                        <div className="col-xl-9 col-lg-9 tabview1">
                            <div className="row">
                                <div className="col-xl-8 col-lg-8 order-lg-2 order-xl-1">
                                    {/* new post */}
                                    <div className="carousel1">
                                        <div
                                            id="carouselExampleIndicators"
                                            className="carousel slide"
                                            data-bs-ride="carousel"
                                        >
                                            <ol className="carousel-indicators">
                                                {banners && banners.length > 0 && (
                                                    banners.map((banner: any, index: number) => (<li
                                                        data-bs-target="#carouselExampleIndicators"
                                                        data-bs-slide-to={index}
                                                        className={`${index === 0 ? "active" : ""}`}
                                                    ></li>)))}
                                                {/* <li
                                                    data-bs-target="#carouselExampleIndicators"
                                                    data-bs-slide-to="1"
                                                ></li>
                                                <li
                                                    data-bs-target="#carouselExampleIndicators"
                                                    data-bs-slide-to="2"
                                                ></li> */}
                                            </ol>
                                            <div className="carousel-inner" role="listbox" id="bannerCarousel">
                                                {banners && banners.length > 0 ? (
                                                    banners.map((banner: any, index: number) => (
                                                        <div
                                                            key={banner.Id}
                                                            className={`carousel-item ${index === 0 ? "active" : ""
                                                                }`}
                                                        >
                                                            <img
                                                                style={{ width: "100%" }}
                                                                src={
                                                                    banner.ImageUrl

                                                                }
                                                                alt={banner.Title || "..."}
                                                                className="d-block img-fluid"
                                                            />
                                                            <div className="carousel-caption d-none d-md-block">
                                                                <p className="font-18 mb-1 mt-1 ps-4 pe-4 py-0">
                                                                    {banner.Title}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <>
                                                        <div>No Banner Found.</div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {/* end new post */}
                                </div>
                                <div className="col-xl-4 col-lg-4 order-lg-1 order-xl-1">
                                    {/* start profile info */}
                                    <div className="card announcementner">
                                        <div className="card-body pb-0 height">
                                            <h4 className="header-title font-16 text-dark fw-bold mb-0">
                                                Latest Announcement
                                                {showViewAll.announcements && (
                                                    <NavLink
                                                        to="/Announcements"
                                                        style={{ float: "right" }}
                                                        className="font-11 fw-normal btn btn-primary rounded-pill waves-effect waves-light view-all"
                                                    >
                                                        View All
                                                    </NavLink>
                                                )}
                                            </h4>


                                            {announcements && announcements.length > 0 ? (
                                                announcements.slice(0, DISPLAY_LIMITS.announcements).map((item, index) => (
                                                    <div style={{ cursor: "pointer" }} onClick={() => {
                                                        sessionStorage.setItem("selectedNewsItem", JSON.stringify(item));
                                                        sessionStorage.setItem("showNewsDetails", "true"); navigate("/AnnouncementsDetails")
                                                    }}
                                                        key={item.id}
                                                        className={`${index === 0 ? "border-bottom mt-1" : "mt-2"
                                                            }`}
                                                    >
                                                        <h4 className="mb-0 text-dark fw-bold font-14 mt-0 ng-binding">
                                                            {truncateByWords(item.title, 12)}
                                                        </h4>
                                                        <p
                                                            style={{ marginTop: "5px", lineHeight: "18px" }}
                                                            className="mb-0 font-13 ng-binding ng-scope"
                                                        >
                                                            {new Date(item.created).toLocaleDateString(
                                                                "en-GB",
                                                                {
                                                                    day: "2-digit",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                }
                                                            )}
                                                        </p>

                                                        {/* <div className="mt-1 mb-0">
                                                            <a
                                                                href="javascript: void(0);"
                                                                className="btn btn-sm btn-link text-muted mb-0 font-18 ps-0"
                                                            >
                                                                <i className="fe-heart text-primary floatl me-1 "></i>{" "}
                                                                <span className="font-12 floatl">
                                                                    {item.likes} Likes
                                                                </span>
                                                            </a>
                                                            <a
                                                                href="javascript: void(0);"
                                                                className="btn btn-sm btn-link text-muted mb-0 font-18 "
                                                            >
                                                                <i className="fe-message-square text-warning floatl me-1"></i>{" "}
                                                                <span className="font-12 floatl">
                                                                    {item.comments} Comments
                                                                </span>
                                                            </a>
                                                        </div> */}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="mt-2 text-muted font-13">
                                                    No records found.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {/* <!-- end profile info --> */}
                                </div>
                                {/* <!-- end col --> */}
                            </div>
                            <div className="row">
                                <div className="col-xl-12 col-lg-12">
                                    <div className="card">
                                        <div className="card-body">
                                            <h4 className="header-title font-16 text-dark fw-bold mb-0">
                                                Quick Links

                                                {showViewAll.quickLinks && (
                                                    <NavLink
                                                        to="/QuickLinks"
                                                        style={{ float: "right" }}
                                                        className="font-11 fw-normal btn btn-primary rounded-pill waves-effect waves-light view-all"
                                                    >
                                                        View All
                                                    </NavLink>
                                                )}
                                            </h4>

                                            <div className="row mt-3">
                                                {quickLinks && quickLinks.length > 0 ? (
                                                    quickLinks.slice(0, DISPLAY_LIMITS.quickLinks).map((link: any, index: number) => (
                                                        <div className="col-sm-2" key={index}>
                                                            <a
                                                                href={link.URL}
                                                                target={
                                                                    link.RedirectToNewTab ? "_blank" : "_self"
                                                                }
                                                                rel={
                                                                    link.RedirectToNewTab
                                                                        ? "noopener noreferrer"
                                                                        : undefined
                                                                }
                                                            >
                                                                <img
                                                                    src={
                                                                        link.ImageUrl && link.ImageUrl !== ""
                                                                            ? link.ImageUrl
                                                                            : "https://via.placeholder.com/100x100?text=No+Image"
                                                                    }
                                                                    width="100%"
                                                                    alt={link.Title || "Quick Link"}
                                                                />
                                                            </a>
                                                            {/* <p className="text-center mt-1 font-13 text-dark fw-500">
                                {link.Title}
                              </p> */}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center text-muted mt-3">
                                                        <p className="font-13 mb-0">No records found</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-xl-5 col-lg-5">
                                    <div className="card">
                                        <div className="card-body pb-3 gheight">
                                            <h4 className="header-title font-16 text-dark fw-bold mb-0">
                                                Staff Recognition
                                                {showViewAll.recognitions && (
                                                    <NavLink
                                                        to="/EmployeeRecognition"
                                                        style={{ float: "right" }}
                                                        className="font-11 fw-normal btn btn-primary rounded-pill waves-effect waves-light view-all"
                                                    >
                                                        View All
                                                    </NavLink>
                                                )}
                                            </h4>

                                            <div className="inbox-widget">
                                                {recognitions && recognitions.length > 0 ? (
                                                    recognitions.slice(0, DISPLAY_LIMITS.recognitions).map((rec: any, idx: number) => (
                                                        <div
                                                            key={rec.id || idx}
                                                            className={`inbox-item ${idx === recognitions.length - 1
                                                                ? "border-0 pb-0"
                                                                : "mt-1"
                                                                }`}
                                                        >
                                                            {/* Right-side achievement icon */}
                                                            <img
                                                                src={require("../../assets/noun-achievement-6772537.png")}
                                                                className="alignright"
                                                            />

                                                            {/* Employee photo */}
                                                            <a href={rec.profileUrl}>
                                                                <div className="inbox-item-img">
                                                                    <img
                                                                        style={{ marginTop: "-5px" }}
                                                                        src={
                                                                            rec.avatarUrl && rec.avatarUrl !== ""
                                                                                ? rec.avatarUrl
                                                                                : ""
                                                                        }
                                                                        className="rounded-circle"
                                                                        alt={rec.name}
                                                                    />
                                                                </div>
                                                            </a>

                                                            {/* Employee name */}
                                                            <a href={rec.profileUrl}>
                                                                <p className="inbox-item-text fw-bold font-14 mb-0 text-dark mt-11 ng-binding">
                                                                    {rec.name}
                                                                </p>
                                                            </a>

                                                            {/* Employee department (correct field) */}
                                                            <p
                                                                style={{
                                                                    color: "#6b6b6b",
                                                                    marginTop: "1px",
                                                                    fontWeight: "500 !important",
                                                                }}
                                                                className="inbox-item-text font-12"
                                                            >
                                                                {rec.department || "Department not available"}
                                                            </p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center mt-2">
                                                        <p className="font-13 mb-0 text-muted">
                                                            No recognitions found
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                <div className="col-xl-7 col-lg-7">
                                    <div className="card">
                                        <div className="card-body pb-0 gheight">
                                            <h4 className="header-title font-16 text-dark fw-bold mb-0">
                                                Policies, Procedures, Forms, and Guidelines
                                                {/* <a
                                                    style={{ float: "right" }}
                                                    className="font-11 fw-normal btn btn-primary rounded-pill waves-effect waves-light view-all"
                                                    href="javascript:void(0)"
                                                >
                                                    View All
                                                </a> */}

                                                <NavLink
                                                    to="/PolicyandProcedures"
                                                    style={{ float: "right" }}
                                                    className="font-11 fw-normal btn btn-primary rounded-pill waves-effect waves-light view-all"
                                                >
                                                    View All
                                                </NavLink>
                                            </h4>

                                            <div className="row mt-2">
                                                <div>
                                                    {policies && policies.length > 0 ? (
                                                        policies.map((policy: any, index: number) => (
                                                            <div
                                                                key={policy.Id || index}
                                                                className="d-flex border-bottom heit8 align-items-start w-100 justify-content-between pe-0 mb-1 border-radius"
                                                            >
                                                                {/*  File Icon */}
                                                                <div className="col-sm-1 p-0">
                                                                    <img
                                                                        src={
                                                                            policy.FileName
                                                                                ? policy.FileName.toLowerCase().endsWith(
                                                                                    ".pdf"
                                                                                )
                                                                                    ? require("../../assets/pdf2.png")
                                                                                    : policy.FileName.toLowerCase().endsWith(
                                                                                        ".doc"
                                                                                    ) ||
                                                                                        policy.FileName.toLowerCase().endsWith(
                                                                                            ".docx"
                                                                                        )
                                                                                        ? require("../../assets/Group_16811.png")
                                                                                        : policy.FileName.toLowerCase().endsWith(
                                                                                            ".xls"
                                                                                        ) ||
                                                                                            policy.FileName.toLowerCase().endsWith(
                                                                                                ".xlsx"
                                                                                            )
                                                                                            ? require("../../assets/xlsx.png")
                                                                                            : policy.FileName.toLowerCase().endsWith(
                                                                                                ".ppt"
                                                                                            ) ||
                                                                                                policy.FileName.toLowerCase().endsWith(
                                                                                                    ".pptx"
                                                                                                )
                                                                                                ? require("../../assets/Group_16812.png")
                                                                                                : require("../../assets/xlsx.png")
                                                                                : require("../../assets/xlsx.png")
                                                                        }
                                                                        width="50"
                                                                        alt={policy.Title || "File Icon"}
                                                                    />
                                                                </div>

                                                                {/*  Title + Description */}
                                                                <div className="col-sm-7">
                                                                    <div className="w-100 ps-3 pt-0">
                                                                        <h5
                                                                            style={{
                                                                                marginTop: "10px",
                                                                                paddingLeft: "7px",
                                                                            }}
                                                                            className="inbox-item-text fw-bold font-14 mb-0 text-dark"
                                                                        >
                                                                            {truncateByWords(policy.Title, 3)}

                                                                        </h5>
                                                                        <span
                                                                            style={{
                                                                                color: "#6b6b6b",
                                                                                paddingLeft: "7px",
                                                                            }}
                                                                            className="font-12"
                                                                        >
                                                                            {truncateByWords(policy.Description, 5)}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {/*  File Size */}
                                                                <div className="col-sm-2 text-end">
                                                                    <p
                                                                        className="text-muted font-12 mb-0 pt-3 pe-2"
                                                                        style={{ whiteSpace: "nowrap" }}
                                                                    >
                                                                        {policy.FileSize || ""}
                                                                    </p>
                                                                </div>

                                                                {/*  View + Download Actions */}
                                                                <div
                                                                    style={{
                                                                        textAlign: "right",
                                                                        paddingRight: "0px",
                                                                    }}
                                                                    className="col-sm-2 pt-2"
                                                                >
                                                                    <img
                                                                        src={require("../../assets/eye.png")}
                                                                        className="ms-1"
                                                                        style={{ cursor: "pointer" }}
                                                                        title="View"
                                                                        onClick={() =>
                                                                            handleFileView(policy.FileUrl)
                                                                        }
                                                                    />
                                                                    <img
                                                                        src={require("../../assets/download.png")}
                                                                        style={{
                                                                            cursor: "pointer",
                                                                            marginLeft: "8px",
                                                                        }}
                                                                        title="Download"
                                                                        onClick={() => {
                                                                            if (!policy.FileUrl) return;
                                                                            const a = document.createElement("a");
                                                                            a.href = policy.FileUrl;
                                                                            a.download = getCleanFileName(
                                                                                policy.FileName || "file"
                                                                            );
                                                                            a.click();
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-muted font-13 mt-2 mb-2 ps-2">
                                                            No policies found.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-3 col-lg-6 tabview2">
                            <div className="card">
                                <div className="card-body pb-1 news-fedd">
                                    <h4 className="header-title text-dark fw-bold mb-0">
                                        Latest News
                                        {newsItems.length > DISPLAY_LIMITS.news && (
                                            <NavLink
                                                to="/News"
                                                style={{ float: "right" }}
                                                className="font-11 fw-normal btn btn-primary rounded-pill waves-effect waves-light view-all"
                                            >
                                                ViewAll
                                            </NavLink>
                                        )}
                                    </h4>
                                    {/* <!-- <h4 className="header-title mb-3">News Feed</h4> --> */}
                                    <div style={{ paddingTop: "12px" }}>
                                        {newsItems &&
                                            newsItems.length > 0 &&
                                            newsItems.slice(0, DISPLAY_LIMITS.news).map((news: any, index: number) => (
                                                <div onClick={() => {
                                                    sessionStorage.setItem("selectedNewsItem", JSON.stringify(news));
                                                    sessionStorage.setItem("showNewsDetails", "true"); navigate("/NewsDetails")
                                                }}
                                                    key={news.id}
                                                    style={{ cursor: "pointer", marginBottom: index === 0 ? "7px" : "0" }}
                                                    className={`mt-0 ${index === 0
                                                        ? "border-bottom newpadd pt-0 ng-scope"
                                                        : "mt-0 mb-0 border-bottom border-0"
                                                        }`}
                                                >
                                                    <div className="imgh">
                                                        <img
                                                            src={
                                                                news.images && news.images.length > 0
                                                                    ? news.images[0].url
                                                                    : require("../../assets/News1.png")
                                                            }
                                                            width="100%"
                                                        />
                                                    </div>
                                                    <h4
                                                        style={{ lineHeight: "22px" }}
                                                        className="fw-bold font-16 text-dark ng-binding"
                                                    >
                                                        {truncateByWords(news.title, 6)}
                                                    </h4>
                                                    <p
                                                        style={{ lineHeight: "22px" }}
                                                        className="mb-2 font-14 ng-binding"
                                                    >
                                                        {truncateByWords(news.description, 10)}
                                                    </p>
                                                    <p className="mb-1 font-14 ng-binding">
                                                        {new Date(news.created).toLocaleDateString(
                                                            "en-GB",
                                                            {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                            }
                                                        )}
                                                    </p>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                            <div className="card">
                                <div className="card-body pb-1">
                                    <h4 className="header-title text-dark fw-bold mb-0">
                                        Success Stories
                                    </h4>

                                    <div className="mt-0">
                                        <div className="slideshow-container">
                                            {successList && successList.length > 0 ? (
                                                successList.map((item: any, index: number) => (
                                                    <div
                                                        key={index}
                                                        className="mySlides"
                                                        style={{
                                                            display: index === currentSlideIndex ? "block" : "none",
                                                        }}
                                                    >
                                                        <q>{item.SuccessStories}</q>
                                                        <p className="author">{item.Department}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center text-muted font-13 mt-2">
                                                    No Success Stories found
                                                </div>
                                            )}
                                        </div>

                                        {successList && successList.length > 0 && (
                                            <div className="dot-container1">
                                                {successList.map((_: any, index: number) => (
                                                    <span
                                                        key={index}
                                                        className={`dot1 ${index === currentSlideIndex ? "active1" : ""
                                                            }`}
                                                        onClick={() => setCurrentSlideIndex(index)}
                                                    ></span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>


                    {/* <!-- container --> */}
                    <div className="row">
                        <div className="col-xl-12 col-lg-12">
                            <div
                                style={{
                                    background: "transparent",
                                    boxShadow: "none",
                                    border: "0px solid #ccc !important",
                                    padding: "0px !important",
                                }}
                                className="card"
                            >
                                <div
                                    style={{
                                        background: "transparent",
                                        border: "0px solid #ccc !important",
                                        padding: "0px !important",
                                    }}
                                    className="card-body pb-3"
                                >
                                    <h4 className="header-title font-16 text-dark fw-bold mb-0">
                                        Projects of the Month{" "}
                                        {/* <a
                                            style={{ float: "right" }}
                                            className="font-11 fw-normal btn btn-primary rounded-pill waves-effect waves-light view-all"
                                            href="javascript:void(0)"
                                        >
                                            View All
                                        </a> */}
                                        <NavLink
                                            to="/Projects"
                                            style={{ float: "right" }}
                                            className="font-11 fw-normal btn btn-primary rounded-pill waves-effect waves-light view-all"
                                        >
                                            View All
                                        </NavLink>
                                    </h4>

                                    <div className="row mt-2">
                                        {projects && projects.length > 0 ? (
                                            projects.slice(0, 3).map((proj: any, index: number) => (
                                                <div className="col-lg-4" key={index}>
                                                    <div className="card project-box">
                                                        <div className="card-body">
                                                            <div className="dropdown float-end">
                                                                <a
                                                                    href="#"
                                                                    className="dropdown-toggle card-drop arrow-none"
                                                                    data-bs-toggle="dropdown"
                                                                    aria-expanded="false"
                                                                >
                                                                    <i className="fe-more-horizontal- m-0 text-muted h3"></i>
                                                                </a>
                                                                <div className="dropdown-menu dropdown-menu-end">
                                                                    <a className="dropdown-item" href="#">
                                                                        Delete
                                                                    </a>
                                                                    <a className="dropdown-item" href="#">
                                                                        View Detail
                                                                    </a>
                                                                </div>
                                                            </div>

                                                            {/* <!-- Title--> */}
                                                            <h4 className="mt-0 mb-1">
                                                                <a
                                                                    href="#"
                                                                    className="text-dark fw-bold font-16"
                                                                >
                                                                    {proj.name}
                                                                </a>
                                                            </h4>
                                                            <p className="text-muted text-uppercase mb-1">
                                                                <small>{proj.department}</small>
                                                            </p>

                                                            <div
                                                                className="finish mb-2"
                                                                style={{
                                                                    background:
                                                                        proj.status === "Ongoing"
                                                                            ? "#6b6f6f"
                                                                            : proj.status === "Finished"
                                                                                ? "#28a745"
                                                                                : "#999",
                                                                    color: "#fff",
                                                                }}
                                                            >
                                                                {proj.status}
                                                            </div>

                                                            {/* <!-- Desc--> */}
                                                            {/* <p
                                                                style={{ color: "#98a6ad" }}
                                                                className="date-color font-12 mb-3 sp-line-2"
                                                            >
                                                                {truncateByWords(proj.overview, 15)}{" "}
                                                                <a
                                                                    href="javascript:void(0);"
                                                                    className="fw-bold text-muted"
                                                                >
                                                                    view more
                                                                </a>
                                                            </p> */}
                                                            <p style={{ color: "#98a6ad" }} className="date-color font-12 mb-3 sp-line-2">
                                                                {expandedIndex === index
                                                                    ? proj.overview
                                                                    : proj.overview?.length > 100
                                                                        ? `${proj.overview.substring(0, 100)}...`
                                                                        : proj.overview}

                                                                {proj.overview?.length > 100 && (
                                                                    <a
                                                                        href="javascript:void(0);"
                                                                        onClick={() => toggleExpand(index)}
                                                                        className="fw-bold text-muted ms-1"
                                                                    >
                                                                        {expandedIndex === index ? "view less" : "view more"}
                                                                    </a>
                                                                )}
                                                            </p>

                                                            {/* <!-- Task info--> */}
                                                            <p className="mb-1 font-12">
                                                                <span
                                                                    style={{ color: "#6e767e" }}
                                                                    className="pe-2 text-nowrap mb-1 d-inline-block"
                                                                >
                                                                    <i className="fe-file-text text-muted"></i>
                                                                    <b>{proj.documents}</b> Documents
                                                                </span>
                                                                {/* <span
                                  style={{ color: "#6e767e" }}
                                  className="text-nowrap mb-1 d-inline-block"
                                >
                                  <i className="fe-message-square text-muted"></i>
                                  <b>{proj.comments || 0}</b> Comments
                                </span> */}
                                                            </p>

                                                            {/* <!-- Team--> */}
                                                            <div
                                                                className="avatar-group mb-0"
                                                                id="tooltips-container"
                                                            >
                                                                {proj.teamMembers &&
                                                                    proj.teamMembers.length > 0 ? (
                                                                    proj.teamMembers
                                                                        .slice(0, 4)
                                                                        .map((member: any, idx: number) => (
                                                                            <a
                                                                                key={idx}
                                                                                href="javascript: void(0);"
                                                                                className="avatar-group-item"
                                                                            >
                                                                                <img
                                                                                    src={`/_layouts/15/userphoto.aspx?size=S&username=${member.EMail}`}
                                                                                    className="rounded-circle avatar-sm"
                                                                                    alt={member.Title}
                                                                                    data-bs-container="#tooltips-container"
                                                                                    data-bs-toggle="tooltip"
                                                                                    data-bs-placement="bottom"
                                                                                    aria-label={member.Title}
                                                                                    data-bs-original-title={member.Title}
                                                                                    data-themekey="#"
                                                                                />
                                                                            </a>
                                                                        ))
                                                                ) : (
                                                                    <a
                                                                        href="javascript: void(0);"
                                                                        className="text-muted font-12"
                                                                    >
                                                                        No Team
                                                                    </a>
                                                                )}

                                                                {proj.teamMembers &&
                                                                    proj.teamMembers.length > 4 && (
                                                                        <a onClick={() => { setModalItem(proj?.teamMembers || []); setShowModal(true) }}
                                                                            href="javascript: void(0);"
                                                                            className="text-dark font-12 fw-bold"
                                                                        >
                                                                            +{proj.teamMembers.length - 4} more
                                                                        </a>
                                                                    )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center text-muted mt-2">
                                                <p>No Projects Found</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Modal
                        show={showFileViewer}
                        onHide={() => setShowFileViewer(false)}
                        size="xl"
                        className="newmobmodal"
                    >
                        <Modal.Body id="style-5">
                            {showFileViewer && (
                                <FileViewer
                                    showfile={showFileViewer}
                                    docurl={selectedFileUrl || undefined}
                                    cancelAction={() => setShowFileViewer(false)}
                                />
                            )}
                        </Modal.Body>
                    </Modal>

                    <Modal show={showModal} onHide={() => setShowModal(false)} size='lg' className="filemodal" >
                        <Modal.Header closeButton>
                            <Modal.Title>
                                {/* <h4 className="font-16 text-dark fw-bold mb-1">
                                                    Attachment Details
                                                </h4>
                                                <p className="text-muted font-14 mb-0 fw-400">
                                                    Below are the attachment details for Project Gallery
                                                </p> */}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="" id="style-5">
                            <div className="modal-body attending-user">
                                <p style={{ display: "block;" }}>{modalItem.length} Members</p>
                                <ul>
                                    {modalItem.map((item: any, index: number) => (
                                        <li key={index}>
                                            {/* <a
                                                            href={`https://multiversedemo.sharepoint.com/sites/CentralBankUAE/SitePages/NewApp.aspx#/UserProfile?UserProfileID=${item.Id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        > */}
                                            {/* {item.IsPicture ? ( */}
                                            <img
                                                src={`/_layouts/15/userphoto.aspx?size=S&username=${item.EMail}`}
                                                className="rounded-circle avatar-sm"
                                                alt={item.Title}
                                                title={item.Title}

                                            />
                                            {/* <img title={item.Title} src={`/_layouts/15/userphoto.aspx?size=S&username=${item.EMail}`} alt={item.Title} /> */}
                                            {/* ) : (
                                                                <div
                                                                    title={item.Name}
                                                                    className="profile-dot imgbgnew1"
                                                                    style={{ backgroundColor: item.backgroundcolor }}
                                                                >
                                                                    <figure></figure>
                                                                    <figcaption style={{ color: item.color }} className="paddt1">
                                                                        {item.Initials}
                                                                    </figcaption>
                                                                </div>
                                                            )} */}
                                            <span>{item.Title}</span>
                                            {/* </a> */}
                                        </li>
                                    ))}
                                </ul>

                            </div>


                        </Modal.Body>

                    </Modal>
                </>
            )}
        </>
    );
};

export default dashboard;
