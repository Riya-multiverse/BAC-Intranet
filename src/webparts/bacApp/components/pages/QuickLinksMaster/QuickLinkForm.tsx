import *as React from 'react';
import { getSP } from '../../../loc/pnpjsConfig';
import { SPFI } from '@pnp/sp';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
    faDownload,
    faEye,
    faPaperclip,
} from "@fortawesome/free-solid-svg-icons";
import Swal from 'sweetalert2';
import { decryptId } from '../../../../../APIService/CryptoService';
import { CheckCircle, Trash2, X } from 'react-feather';
import CustomBreadcrumb from '../../common/CustomBreadcrumb';
import { FormSubmissionMode } from '../../../../../Shared/Interfaces';
import { SITE_URL, Tenant_URL } from '../../../../../Shared/Constant';
import { Modal } from "react-bootstrap";
interface IQuickLinkTableProps {
    item?: any;
    onCancel: () => void;
    onSave: (data: any) => void;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
interface IItemUpdateResult {
    /** The updated item data returned from SharePoint */
    data: any;

    /** The updated item instance (PnPjs Item object) */
    item: any;

}
interface IEntity {
    id: number;
    name: string;
}

interface IAttachment {
    ID: number;
    FileRef: string;
    FileLeafRef: string;
    serverRelativeUrl: string;
}
const QuickLinkForm = ({ item, onCancel, onSave, setLoading }: IQuickLinkTableProps) => {
    const sp: SPFI = getSP();
    //   const siteUrl = props.siteUrl;

    const [BnnerImagepostArr, setBannerImagepostArr] = React.useState<any[]>([]);
    const [ValidDraft, setValidDraft] = React.useState(true);
    const [ValidSubmit, setValidSubmit] = React.useState(true);
    const [editForm, setEditForm] = React.useState(false);
    const [editID, setEditID] = React.useState<number | null>(null);
    const [showModal, setShowModal] = React.useState(false);
    const [showDocTable, setShowDocTable] = React.useState(false);
    const [showImgModal, setShowImgTable] = React.useState(false);
    const [showBannerModal, setShowBannerTable] = React.useState(false);
    const [ImagepostArr, setImagepostArr] = React.useState<any[]>([]);
    const [ImagepostArr1, setImagepostArr1] = React.useState<any[]>([]);
    const [EnityData, setEnityData] = React.useState<IEntity[] | null>(null);
    const [formData, setFormData] = React.useState({
        Title: "",
        URL: "",
        RedirectTONewTab: false,
        IsActive: false,
        DepartmentId: 0
    });


    const Statusdata = [

        { ID: 1, Title: 'Yes' },
        { ID: 2, Title: 'No' },

    ];
    //#region onChange
    const onChange = async (name: string, value: string) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: name === "RedirectTONewTab" || name === "IsActive" ? value === "true" : value,

        }));


    };
    //#endregion
    const OpenFile = (obj: any, sts: string) => {

        const fileUrl = `${Tenant_URL}${obj.FileRef}`;
        // if (sts == "Open") {
        //   setShowfile(true);
        // }

        if (sts == "Open") {
            if (/\.(doc|docx|xls|xlsx|ppt|pptx|csv|docs)$/i.test(fileUrl)) {

                // window.open(`${SITE_URL}/_layouts/15/WopiFrame.aspx?sourcedoc=${encodeURIComponent(obj.FileRef)}&action=default`, "_blank");
                const viewerUrlppt = `${SITE_URL}/_layouts/15/WopiFrame.aspx?sourcedoc=${encodeURIComponent(obj.FileRef)}&action=embedview`
                // setredirecturl(viewerUrlppt);
            } else {
                window.open(fileUrl, "_blank"); // Open PDF and other files normally
                // setredirecturl(fileUrl);
            }

        } else if (sts == "Download") {
            const link = document.createElement("a");
            link.href = fileUrl;
            link.setAttribute("download", obj.FileLeafRef.replace(/^\d+_/, "")); // Suggests a filename for download

            // link.setAttribute("download", obj.FileLeafRef?.split('_')[2]); // Suggests a filename for download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        }



    }
    // const onFileChange = async (
    //     event: React.ChangeEvent<HTMLInputElement>,
    //     libraryName: string,
    //     docLib: string
    // ) => {
    //     debugger;
    //     //console.log("libraryName-->>>>", libraryName)
    //     event.preventDefault();
    //     let uloadDocsFiles: any[] = [];
    //     let uloadDocsFiles1: any[] = [];

    //     let uloadImageFiles: any[] = [];
    //     let uloadImageFiles1: any[] = [];

    //     let uloadBannerImageFiles: any[] = [];

    //     if (event.target.files && event.target.files.length > 0) {
    //         const files = Array.from(event.target.files);
    //         (event.target as HTMLInputElement).value = '';


    //         if (libraryName === "Gallery" || libraryName === "bannerimg") {
    //             // const imageVideoFiles = files.filter(
    //             //   (file) =>
    //             //     file.type.startsWith("image/") || file.type.startsWith("video/")
    //             // );
    //             var imageVideoFiles: any[] = [];
    //             if (libraryName === "Gallery") {
    //                 imageVideoFiles = files.filter(
    //                     (file) =>
    //                         file.type.startsWith("image/") || file.type.startsWith("video/")
    //                 );
    //             }
    //             else if (libraryName === "bannerimg") {
    //                 imageVideoFiles = files.filter(
    //                     (file) =>
    //                         file.type.startsWith("image/")
    //                 );
    //             }

    //             if (imageVideoFiles.length > 0) {
    //                 const arr = {
    //                     files: imageVideoFiles,
    //                     libraryName: libraryName,
    //                     docLib: docLib,
    //                     name: imageVideoFiles[0].name,
    //                     size: imageVideoFiles[0].size,
    //                     fileUrl: URL.createObjectURL(imageVideoFiles[0])
    //                 };

    //                 //console.log("arr-->>>", arr)
    //                 if (libraryName === "Gallery") {
    //                     uloadImageFiles.push(arr);
    //                     setImagepostArr(uloadImageFiles);
    //                     if (ImagepostArr1.length > 0) {
    //                         imageVideoFiles.forEach((ele) => {
    //                             //console.log("ele in if-->>>>", ele)
    //                             let arr1 = {
    //                                 ID: 0,
    //                                 Createdby: "",
    //                                 Modified: "",
    //                                 fileUrl: URL.createObjectURL(ele),
    //                                 fileSize: ele.size,
    //                                 fileType: ele.type,
    //                                 fileName: ele.name,
    //                             };
    //                             ImagepostArr1.push(arr1);
    //                         });
    //                         setImagepostArr1(ImagepostArr1);
    //                     } else {
    //                         imageVideoFiles.forEach((ele) => {
    //                             //console.log("ele in else-->>>>", ele)
    //                             let arr1 = {
    //                                 ID: 0,
    //                                 Createdby: "",
    //                                 Modified: "",
    //                                 fileUrl: URL.createObjectURL(ele),
    //                                 fileSize: ele.size,
    //                                 fileType: ele.type,
    //                                 fileName: ele.name,
    //                             };
    //                             uloadImageFiles1.push(arr1);
    //                         });
    //                         setImagepostArr1(uloadImageFiles1);
    //                     }
    //                 } else {
    //                     uloadBannerImageFiles.push(arr);
    //                     //console.log("uloadBannerImageFiles-->>", uloadBannerImageFiles)
    //                     setBannerImagepostArr(uloadBannerImageFiles);
    //                 }
    //             } else {
    //                 if (libraryName === "bannerimg") {
    //                     Swal.fire("only image can be upload");
    //                 } else {
    //                     Swal.fire("only image & video can be upload");
    //                 }

    //             }
    //         }
    //     }
    // };

    const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>, libraryName: string, docLib: string) => {
        event.preventDefault();



        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/jpeg",

        ];


        let uloadBannerImageFiles: any[] = [];
        let uloadImageFiles: any[] = [];
        let uloadImageFiles1: any[] = [];


        if (event.target.files && event.target.files.length > 0) {
            const files = Array.from(event.target.files);
            (event.target as HTMLInputElement).value = '';

            if (files.length > 0) {

                for (const fn of files) {
                    // const file = files[0];
                    if (!allowedTypes.includes(fn.type)) {
                        Swal.fire({
                            icon: "error",
                            title: "Invalid File Type",
                            text: "Only images and document files are allowed.",
                        });
                        return;
                    }

                    const fileType = fn.type.split("/")[0]; // Extract file type (image, pdf, etc.)
                    // const folder = sp.web.getFolderByServerRelativePath('Socialfeedimages');
                    // const uploadResult = await folder.files.addChunked(file.name, file);
                    // console.log("File uploaded successfully", uploadResult);

                    // Generate the preview URL dynamically
                    // const previewUrl = await generatePreviewUrl(uploadResult.data.ServerRelativeUrl);

                    //previewFile(previewUrl);
                    const preview = URL.createObjectURL(fn);
                    // fn.fileUrl = preview;

                }
                setBannerImagepostArr(files);







            } else {
                Swal.fire("upload a document")
            }
        }

    };

    const setShowModalFunc = (bol: boolean, name: string) => {
        if (name == "bannerimg") {
            setShowModal(bol);
            setShowBannerTable(true);
            setShowImgTable(false);
            setShowDocTable(false);
        } else if (name == "Gallery") {
            setShowModal(bol);
            setShowImgTable(true);
            setShowBannerTable(false);
            setShowDocTable(false);
        } else {
            setShowModal(bol);
            setShowDocTable(true);
            setShowBannerTable(false);
            setShowImgTable(false);
        }
    };
    const getEntity = async () => {

        let arr: IEntity[] | null = null;

        await sp.web.lists.getByTitle("DepartmentMasterList").items.select("ID,DepartmentName").filter("Active eq 1")()

            .then((res) => {

                console.log(res);

                const newArray = res.map(({ ID, DepartmentName }) => ({ id: ID, name: DepartmentName }));

                console.log(newArray, 'newArray');


                arr = newArray;

            })

            .catch((error) => {

                console.log("Error fetching data: ", error);

            });

        return arr;

    }
    //#endregion
    const ApiCallFunc = async () => {
        setEnityData(await getEntity());
        if (item?.ID) {
            setEditForm(true);
            setFormData({

                Title: item.Title,
                URL: item.URL,
                RedirectTONewTab: item.RedirectToNewTab,
                IsActive: item.IsActive,
                DepartmentId: item.DepartmentId
            });

            if (item.QuickLinksIDId) {
                let arrn = await getDocumentLinkByID(item.QuickLinksIDId);
                setBannerImagepostArr([arrn]);
            }

        }
        else {
            setEditForm(false);
            setFormData({
                Title: "",
                URL: "",
                RedirectTONewTab: false,
                IsActive: false,
                DepartmentId: 0
            });

        }

    }
    //#endregion

    React.useEffect(() => {

        ApiCallFunc();



        // formData.title = currentUser.Title;

    }, []);

    const getItemByID = async (id: any) => {

        let arr: any[] = [];
        let arrs: any[] = [];
        let bannerimg: any[] = [];
        await sp.web.lists.getByTitle("QuickLinks").items.select("*,Department/ID,Department/DepartmentName,QuickLinksID/ID").expand("QuickLinksID,Department").getById(id)
            .select("*")()
            .then((res) => {
                console.log(res, ' let arrs=[]');
                
                const parsedValues = {
                    ID: res?.ID,
                    Title: res.Title != undefined ? res.Title : "",
                    URL: res.URL != undefined ? res.URL : "",
                    RedirectToNewTab: res.RedirectToNewTab != undefined ? res.RedirectToNewTab : "",
                    IsActive: res.IsActive != undefined ? res.IsActive : false,
                    // QuickLinkImage: bannerimg,
                    // Entity: res.Entity,
                    // EntityId: res.EntityId

                    // other fields as needed
                };

                arr.push(parsedValues)

                // arr.push(res)
            })
            .catch((error) => {
                console.log("Error fetching data: ", error);
            });
        //   console.log(arr, 'arr');
        return arr;
    }

    const getDocumentLinkByID = async (AttachmentId: number | null) => {
        let results: IAttachment[] = [];

        if (AttachmentId) {
            await sp.web.lists.getByTitle("QuickLinkDocs").items.getById(AttachmentId)
                .select("*,FileRef, FileLeafRef")()
                .then((res: any) => {
                    console.log(res, ' let arrs=[]');
                    results = res;
                })
                .catch((error: any) => {
                    console.log("Error fetching data: ", error);
                });

            return results;
        }
    }



    const Breadcrumb = [

        {

            "MainComponent": "Settings",

            "MainComponentURl": "Settings",


        },

        {

            "MainComponent": "Quick Links Master",

            "MainComponentURl": "QuickLinksMaster",


        }

    ];

    const updateItem = async (itemData: any, id: number) => {
        let resultArr: IItemUpdateResult | null = null;
        try {
            const newItem = await sp.web.lists.getByTitle('QuickLinks').items.getById(id).update(itemData);
            //   console.log('Item added successfully:', newItem);
            resultArr = newItem
            // Perform any necessary actions after successful addition
        } catch (error) {
            console.log('Error adding item:', error);
            // Handle errors appropriately
            resultArr = null
        }
        return resultArr;
    };

    const addItem = async (itemData: any) => {

        let resultArr: IItemUpdateResult | null = null;
        try {
            const newItem = await sp.web.lists.getByTitle('QuickLinks').items.add(itemData);

            // console.log('Item added successfully:', newItem);

            resultArr = newItem
            // Perform any necessary actions after successful addition
        } catch (error) {
            // console.log('Error adding item:', error);
            Swal.fire(' Cancelled', '', 'error')
            // Handle errors appropriately
            resultArr = null
        }
        return resultArr;
    };
    const uploadFileBanner = async (file: any, docLib: string, siteUrl: string) => {
        let arr = {};

        const uploadResult = await sp.web.lists.getByTitle(docLib).rootFolder.files.addChunked(file.name, file, data => {
            console.log(`progress`, data);
        }, true);

        const fileUrl = uploadResult.data.ServerRelativeUrl;

        const imgMetadata = {
            "__metadata": { "type": "SP.FieldUrlValue" },
            "Description": file.name,
            "Url": `${siteUrl}${fileUrl}`
        };

        // await sp.web.lists.getByTitle(docLib).items.getById(uploadResult.data.UniqueId).update({
        //   "AnnouncementandNewsBannerImage": imgMetadata
        // });
        arr = {
            "type": "thumbnail",
            "name": file.name,
            "size": file.size,
            "serverUrl": siteUrl,
            "fileUrl": file.fileUrl,
            "fieldName": "BlogBannerImage",
            "serverRelativeUrl": fileUrl
        };
        return arr;
    };


    const validateForm = async (fmode: FormSubmissionMode) => {
        const { Title, URL, RedirectTONewTab, DepartmentId } = formData;
        // const { description } = richTextValues;
        let valid = true;
        let validateOverview: boolean = false;
        let validatetitlelength = false;
        let validateTitle = false;
        setValidDraft(true);
        setValidSubmit(true);
        Array.from(document.getElementsByClassName("border-on-error")).forEach((element: Element) => {
            element.classList.remove("border-on-error");
        });

        if (fmode == FormSubmissionMode.SUBMIT) {
            if (!Title) {
                document.getElementById("title")?.classList.add("border-on-error");
                valid = false;
            }
            if (!URL) {
                document.getElementById("URL")?.classList.add("border-on-error");
                valid = false;
            }

            if (!DepartmentId) {
                document.getElementById("DepartmentId")?.classList.add("border-on-error");
                valid = false;
            }
            if (BnnerImagepostArr.length == 0) {
                document.getElementById("bannerImage")?.classList.add("border-on-error");
                valid = false;
            }
            if (URL) {
                const urlPattern = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i;
                // urlPattern.test(URL);

                if (urlPattern.test(URL) == false) {
                    document.getElementById("URL")?.classList.add("border-on-error");
                    Swal.fire('Please enter valid link.');
                    return
                    //  valid = false;
                }

            }




            setValidSubmit(valid);

        }
        if (!valid && fmode == FormSubmissionMode.SUBMIT) {

            Swal.fire('Please fill all the mandatory fields.');

        }

        return valid;
    }
    const getNewFileName = async (originalFileName: string): Promise<string> => {

        const date = new Date();

        const components = [
            date.getDate().toString().padStart(2, '0'),
            (date.getMonth() + 1).toString().padStart(2, '0'),
            date.getFullYear().toString(),
            date.getHours().toString().padStart(2, '0'),
            date.getMinutes().toString().padStart(2, '0'),
            date.getSeconds().toString().padStart(2, '0'),
            date.getMilliseconds().toString().padStart(3, '0')
        ];
        const fileExtension = originalFileName.split('.').pop();
        const fileNameWithoutExtension = originalFileName.split('.').slice(0, -1).join('.');
        const NewFileName = `${components.join('')}_${fileNameWithoutExtension}.${fileExtension}`;


        // return `${userId}_${components.join('')}_${originalFileName}`;
        // return `${formData.memoFileName}_${originalFileName}`;
        return NewFileName
    };
    const handleFormSubmit = async () => {
        if (await validateForm(FormSubmissionMode.SUBMIT)) {
            if (editForm) {
                Swal.fire({
                    title: item?.ID
                        ? "Do you want to update this record?"
                        : "Do you want to submit this record?",
                    showConfirmButton: true,
                    showCancelButton: true,
                    confirmButtonText: "Yes",
                    cancelButtonText: "No",
                    icon: 'warning'
                }
                ).then(async (result) => {
                    console.log(result)
                    if (result.isConfirmed) {
                        setLoading(true);

                        const modalBackdrop = document.querySelector('.modal-backdrop');
                        if (modalBackdrop) {
                            modalBackdrop.classList.remove('modal-backdrop');
                            modalBackdrop.classList.remove('fade');
                            modalBackdrop.classList.remove('show');
                            // modalBackdrop.remove();
                        }
                        let galleryArray: any[] = [];
                        let bannerImageArray: any = {};
                        let DocumentName: string = "";
                        let attachmentId: number = 0;
                        const folder = sp.web.getFolderByServerRelativePath('/sites//BAC/QuickLinkDocs');

                        if (BnnerImagepostArr.length > 0) {
                            for (const file of BnnerImagepostArr) {
                                if (!file.ID) {
                                    const newFileName = await getNewFileName(file.name);
                                    const uploadResult = await folder.files.addChunked(newFileName, file);
                                    const uploadedFile = uploadResult.file;
                                    const item = await uploadedFile.getItem<{ Id: number }>();
                                    console.log(" Uploaded file ID:", item.Id);
                                    attachmentId = item.Id;
                                } else {
                                    attachmentId = file.ID;
                                }
                            }
                        }

                        const postPayload = {
                            Title: formData.Title,
                            URL: formData.URL,
                            RedirectToNewTab: formData.RedirectTONewTab,
                            QuickLinksIDId: attachmentId || null,
                            DepartmentId: Number(formData.DepartmentId) || null,
                            IsActive: formData.IsActive || null

                        };


                        //   console.log(postPayload);

                        const postResult = await updateItem(postPayload, item.ID);

                        setLoading(false);
                        Swal.fire({
                            title: item?.ID ? "Updated successfully." : "Submitted successfully.",
                            icon: 'success',
                            confirmButtonText: "OK",
                        }).then(async (result) => {
                            if (result.isConfirmed) {
                                onSave(postResult);
                            }
                        });



                    }

                })
            }
            else {
                Swal.fire({
                    title: 'Do you want to submit this request?',
                    showConfirmButton: true,
                    showCancelButton: true,
                    confirmButtonText: "yes",
                    cancelButtonText: "No",
                    icon: 'warning'
                }
                ).then(async (result) => {
                    //console.log("Form Submitted:", formValues, bannerImages, galleryImages, documents);
                    if (result.isConfirmed) {
                        setLoading(true);

                        const modalBackdrop = document.querySelector('.modal-backdrop');
                        if (modalBackdrop) {
                            modalBackdrop.classList.remove('modal-backdrop');
                            modalBackdrop.classList.remove('fade');
                            modalBackdrop.classList.remove('show');
                            // modalBackdrop.remove();
                        }


                        let galleryArray: any[] = [];
                        let bannerImageArray: any = {};
                        let DocumentName: string = "";
                        let attachmentId: number = 0;
                        const folder = sp.web.getFolderByServerRelativePath('/sites//BAC/QuickLinkDocs');

                        if (BnnerImagepostArr.length > 0) {
                            for (const file of BnnerImagepostArr) {
                                if (!file.ID) {
                                    const newFileName = await getNewFileName(file.name);
                                    const uploadResult = await folder.files.addChunked(newFileName, file);
                                    const uploadedFile = uploadResult.file;
                                    const item = await uploadedFile.getItem<{ Id: number }>();
                                    console.log(" Uploaded file ID:", item.Id);
                                    attachmentId = item.Id;
                                } else {
                                    attachmentId = file.ID;
                                }
                            }
                        }

                        //   // Create Post
                        const postPayload = {
                            Title: formData.Title,
                            URL: formData.URL,
                            RedirectToNewTab: formData.RedirectTONewTab,
                            QuickLinksIDId: attachmentId || null,
                            DepartmentId: Number(formData.DepartmentId) || null,
                            IsActive: formData.IsActive || null
                        };
                        // console.log(postPayload);

                        const postResult = await addItem(postPayload);
                        const postId = postResult?.data?.ID;


                        setLoading(false);
                        Swal.fire('Submitted successfully.', '', 'success').then(async (result) => {
                            if (result.isConfirmed) {
                                onSave(postResult);
                            }
                        });


                    }
                })

            }
        }

    }
    const deleteLocalFile = (index: number, BnnerArr: any[], name: string) => {


        BnnerImagepostArr.splice(index, 1);

        BnnerImagepostArr.length > 0 ? "" : setShowModal(false);
        //  clearFileInput(name);


    };


    return (
        <>
            <div style={{ paddingLeft: '1.3rem', paddingRight: '1.5rem' }} className="row">
                <div className="col-lg-4">
                    <CustomBreadcrumb Breadcrumb={Breadcrumb} />

                </div>
                <div className="card mt-3" >
                    <div className="card-body">
                        <div className="row mt-2">

                            <form className='row' >
                                <div className="col-lg-4">
                                    <div className="mb-3">
                                        <label htmlFor="title" className="form-label">
                                            Title <span className="text-danger">*</span>
                                        </label>
                                        <input style={{ padding: '6px' }}
                                            type="text"
                                            id="title"
                                            name="Title"
                                            placeholder='Enter Title'
                                            // className="form-control inputcss"
                                            className={`form-control`}
                                            value={formData.Title}
                                            onChange={(e) => onChange(e.target.name, e.target.value)}


                                        />


                                    </div>
                                </div>
                                <div className="col-lg-4">
                                    <div className="mb-3">
                                        <label htmlFor="URL" className="form-label">
                                            URL <span className="text-danger">*</span>
                                        </label>
                                        <input style={{ padding: '6px' }}
                                            type="text"
                                            id="URL"
                                            name="URL"
                                            placeholder='Enter URL'
                                            // className="form-control inputcss"
                                            className={`form-control `}
                                            value={formData.URL}
                                            onChange={(e) => onChange(e.target.name, e.target.value)}


                                        />


                                    </div>
                                </div>
                                <div className="col-lg-4">
                                    <div className="mb-3">
                                        <label htmlFor="DepartmentId" className="form-label">
                                            Department <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className={`form-select `}
                                            id="DepartmentId"
                                            name="DepartmentId"
                                            value={formData.DepartmentId}
                                            onChange={(e) => onChange(e.target.name, e.target.value)}
                                        // disabled={InputDisabled}
                                        >
                                            <option value="">Select</option>
                                            {
                                                EnityData?.map((item, index) => (
                                                    <option key={index} value={item.id}>{item.name}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                </div>
                                {/*  */}
                                {/* className={`form-label form-control ${!ValidDraft ? "border-on-error" : ""} ${!ValidSubmit ? "border-on-error" : ""}`} */}

                                <div className="col-lg-4">
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between">
                                            <div>
                                                <label
                                                    htmlFor="bannerImage"

                                                    className="form-label"
                                                >
                                                    Quick Link Image{" "}
                                                    <span className="text-danger">*</span>
                                                </label>
                                            </div>
                                            <div>
                                                <div>
                                                    {

                                                        BnnerImagepostArr.length > 0

                                                            ? (
                                                                <a className="text-primary"
                                                                    style={{
                                                                        fontSize: "0.875rem",
                                                                        cursor: "pointer",
                                                                        textDecoration: "none",
                                                                    }} onClick={() => setShowModal(true)}>
                                                                    <FontAwesomeIcon
                                                                        icon={faPaperclip}
                                                                    />
                                                                    {BnnerImagepostArr.length} file Attached
                                                                </a>
                                                            )
                                                            : ""

                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <input
                                            type="file"
                                            id="bannerImage"
                                            name="bannerImage"
                                            className={`form-control`}
                                            accept="image/*"
                                            onChange={(e) =>
                                                onFileChange(e, "bannerimg", "Document")
                                            }
                                        />
                                    </div>
                                </div>
                                {/*  */}
                                <div className="col-lg-2 mt-3">
                                    <div className="mt-3">
                                        <label htmlFor="title" className="form-label mb-0 me-2">
                                            Active
                                        </label>

                                        <input type="checkbox" id="IsActive"
                                            name="IsActive"
                                            checked={formData.IsActive} onChange={(e) =>
                                                onChange(e.target.name, e.target.checked.toString())
                                            } ></input>


                                    </div>
                                </div>

                                <div style={{ padding: '0px' }} className="col-lg-6 mt-3">
                                    <div className="mt-3">
                                        <label htmlFor="title" className="form-label mb-0 me-2">
                                            Want to Redirect in New Tab ?
                                        </label>

                                        <input type="checkbox" id="RedirectTONewTab"
                                            name="RedirectTONewTab"
                                            checked={formData.RedirectTONewTab} onChange={(e) =>
                                                onChange(e.target.name, e.target.checked.toString())
                                            } ></input>


                                    </div>
                                </div>







                            </form>

                        </div>
                    </div>

                </div>
            </div>
            <div className="row mt-3">
                <div className="col-12 text-center">
                    <button type="button" className="btn btn-success waves-effect waves-light m-1" onClick={handleFormSubmit}> <CheckCircle className="me-1" size={16} /> {item && (item.id || item.ID) ? "Update" : "Submit"}</button>
                    <button type="button" className="btn btn-light waves-effect waves-light m-1" onClick={onCancel}><X className="me-1" size={16} /> Cancel</button>
                </div>
            </div>


            {/*  */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size='lg' className="filemodal" >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <h4 className="font-16 text-dark fw-bold mb-1">
                            Attachment Details
                        </h4>
                        <p className="text-muted font-14 mb-0 fw-400">
                            Below are the attachment details for News Gallery
                        </p>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="" id="style-5">


                    {/* {showBannerModal &&
                        (
                            <> */}
                    <table className="mtbalenew table table-bordered" style={{ fontSize: '0.75rem' }}>
                        <thead style={{ background: '#eef6f7' }}>
                            <tr>
                                <th style={{ minWidth: '30px', maxWidth: '30px' }}>SNo.</th>
                                <th style={{ minWidth: '40px', maxWidth: '40px' }}>Image</th>
                                <th>File Name</th>
                                {/* <th style={{ minWidth: '40px', maxWidth: '40px' }}>File Size</th> */}
                                <th style={{ minWidth: '50px', maxWidth: '50px' }} className='text-center'>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {BnnerImagepostArr.map((file: any, index: number) => {
                                const date = new Date();
                                const fileExtension = file?.name ? file.name.split('.').pop() : "";
                                const fileNameWithoutExtension = file.name ? file.name.split('.').slice(0, -1).join('.') : "";
                                // const NewFileName = `${formData.memoFileName}_${fileNameWithoutExtension}_${components.join('')}.${fileExtension}`;
                                const NewFileName = `${fileNameWithoutExtension}.${fileExtension}`;
                                const previewUrl = file.FileRef
                                    ? file.FileRef : URL.createObjectURL(file);
                                return (
                                    <tr key={index}>
                                        <td style={{ minWidth: '30px', maxWidth: '30px' }} className='text-center'>{index + 1}</td>
                                        {/* <td style={{ minWidth: '50px', maxWidth: '50px', textAlign: 'center' }} >  <img style={{ width: '40px', height: '40px', borderRadius: '1000px' }} src={file.fileUrl ? file.fileUrl : `${file.serverRelativeUrl}`} /></td> */}
                                        <td style={{ minWidth: '40px', maxWidth: '40px' }} className="text-center">
                                            {previewUrl ? (
                                                <img
                                                    src={previewUrl}
                                                    alt={file.name ? NewFileName : file.FileLeafRef.replace(/^\d+_/, "")}
                                                    style={{
                                                        height: "60px",
                                                        width: "60px",
                                                        objectFit: "cover",
                                                        borderRadius: "8px",
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-muted">No preview</span>
                                            )}
                                        </td>
                                        <td title={file.name ? NewFileName : file.FileLeafRef.replace(/^\d+_/, "")
                                        }>
                                            {file.name ? NewFileName : file.FileLeafRef.replace(/^\d+_/, "")
                                            }
                                        </td>

                                        <td style={{ minWidth: '50px', maxWidth: '50px' }} className='text-center'>


                                            {file.ID && <> <span title='preview file'
                                                onClick={() => OpenFile(file, "Open")}
                                                style={{ color: "blue", cursor: "pointer", margin: "10px" }}
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                            </span>
                                                <span title='download file'
                                                    onClick={() => OpenFile(file, "Download")}
                                                    style={{ color: "blue", cursor: "pointer", margin: "10px" }}
                                                >
                                                    <FontAwesomeIcon icon={faDownload} />
                                                </span></>}
                                            <Trash2 size={18} onClick={() => deleteLocalFile(index, BnnerImagepostArr, "bannerimg")} />
                                        </td>
                                    </tr>)
                            })}
                        </tbody>
                    </table>
                    {/* </>
                        )} */}

                </Modal.Body>

            </Modal>
            {/*  */}

        </>
    )
}

export default QuickLinkForm
