import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import *as React from 'react'
import { Modal } from 'react-bootstrap';
import { CheckCircle, Trash2, X } from 'react-feather';
import { SITE_URL, Tenant_URL } from '../../../../../Shared/Constant';
import CustomBreadcrumb from '../../common/CustomBreadcrumb';
import Swal from 'sweetalert2';
import { getSP } from '../../../loc/pnpjsConfig';
import { SPFI } from '@pnp/sp';
import { faDownload, faEye, faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { FormSubmissionMode } from '../../../../../Shared/Interfaces';
interface IMyFormProps {
    item?: any;
    onCancel: () => void;
    onSave: (data: any) => void;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
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
interface IItemUpdateResult {
    /** The updated item data returned from SharePoint */
    data: any;

    /** The updated item instance (PnPjs Item object) */
    item: any;

}
const BannerForm = ({ item, onCancel, onSave, setLoading }: IMyFormProps) => {
    const sp: SPFI = getSP();
    const [AttachmentpostArr, setAttachmentpostArr] = React.useState<any[]>([]);
    const [EnityData, setEnityData] = React.useState<IEntity[] | null>(null);
    const [editForm, setEditForm] = React.useState(false);
    const [editID, setEditID] = React.useState<number | null>(null);
    const [showModal, setShowModal] = React.useState(false);
    const [ValidDraft, setValidDraft] = React.useState(true);
    const [ValidSubmit, setValidSubmit] = React.useState(true);
    const [formData, setFormData] = React.useState({
        Title: "",


        IsActive: false,
        DepartmentId: 0
    });
    const Breadcrumb = [

        {

            "MainComponent": "Home",

            "MainComponentURl": "Home",


        },

        {

            "MainComponent": "Banner Master",

            "MainComponentURl": "BannerMaster",


        }

    ];
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

    const ApiCallFunc = async () => {
        setEnityData(await getEntity());
        if (item?.ID) {
            setEditForm(true);
            setFormData({

                Title: item.Title,
                // URL: item.URL,
                // RedirectTONewTab: item.RedirectToNewTab,
                IsActive: item.IsActive =="Yes" ? true : false,
                DepartmentId: item.DepartmentId
            });

            if (item.BannerImageIDId) {
                let arrn = await getDocumentLinkByID(item.BannerImageIDId);
                setAttachmentpostArr([arrn]);
            }

        }
        else {
            setEditForm(false);
            setFormData({
                Title: "",
                // URL: "",
                // RedirectTONewTab: false,
                IsActive: false,
                DepartmentId: 0
            });

        }

    }
    //#endregion

    const getDocumentLinkByID = async (AttachmentId: number | null) => {
        let results: IAttachment[] = [];

        if (AttachmentId) {
            await sp.web.lists.getByTitle("BannerDocs").items.getById(AttachmentId)
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

    React.useEffect(() => {

        ApiCallFunc();



        // formData.title = currentUser.Title;

    }, []);
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
    //#region onChange
    const onChange = async (name: string, value: string) => {
        setFormData((prevData) => ({
            ...prevData,
            // [name]: value,
            [name]: name === "IsActive" ? (value === "true" ? true : false) : value,
        }));



    };
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
                setAttachmentpostArr(files);







            } else {
                Swal.fire("upload a document")
            }
        }

    };





    // ////////////////
    const validateForm = async (fmode: FormSubmissionMode) => {
        const { Title, DepartmentId } = formData;
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


            if (!DepartmentId) {
                document.getElementById("DepartmentId")?.classList.add("border-on-error");
                valid = false;
            }
            if (AttachmentpostArr.length == 0) {
                document.getElementById("bannerImage")?.classList.add("border-on-error");
                valid = false;
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
                        const folder = sp.web.getFolderByServerRelativePath('/sites/BAC/BannerDocs');

                        if (AttachmentpostArr.length > 0) {
                            for (const file of AttachmentpostArr) {
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

                            BannerImageIDId: attachmentId || null,
                            DepartmentId: Number(formData.DepartmentId) || null,
                            IsActive: formData.IsActive == true?"Yes":"No"

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
                        const folder = sp.web.getFolderByServerRelativePath('/sites/BAC/BannerDocs');

                        if (AttachmentpostArr.length > 0) {
                            for (const file of AttachmentpostArr) {
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
                            BannerImageIDId: attachmentId || null,
                            DepartmentId: Number(formData.DepartmentId) || null,
                            IsActive: formData.IsActive == true?"Yes":"No"
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


        AttachmentpostArr.splice(index, 1);

        AttachmentpostArr.length > 0 ? "" : setShowModal(false);
        //  clearFileInput(name);


    };

    const updateItem = async (itemData: any, id: number) => {
        let resultArr: IItemUpdateResult | null = null;
        try {
            const newItem = await sp.web.lists.getByTitle('Banner').items.getById(id).update(itemData);
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
            const newItem = await sp.web.lists.getByTitle('Banner').items.add(itemData);

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


    // ///////////
    return (
        <>
            <div  className="row">
                <div className="col-lg-4">
                    <CustomBreadcrumb Breadcrumb={Breadcrumb} />

                </div>
                <div className='px-2'>
                <div className="card mt-2" >
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
                                {/* <div className="col-lg-4">
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
                                </div> */}
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
                                                    Banner Image
                                                    <span className="text-danger">*</span>
                                                </label>
                                            </div>
                                            <div>
                                                <div>
                                                    {

                                                        AttachmentpostArr.length > 0

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
                                                                    {AttachmentpostArr.length} file(s) Attached
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

                                {/* <div style={{ padding: '0px' }} className="col-lg-6 mt-3">
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
                                </div> */}







                            </form>

                        </div>
                    </div>

                </div></div>
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
                            {AttachmentpostArr.map((file: any, index: number) => {
                                const date = new Date();
                                const fileExtension = file?.name ? file.name.split('.').pop() : "";
                                const fileNameWithoutExtension = file?.name ? file.name.split('.').slice(0, -1).join('.') : "";
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
                                            <Trash2 size={18} onClick={() => deleteLocalFile(index, AttachmentpostArr, "bannerimg")} />
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

export default BannerForm
