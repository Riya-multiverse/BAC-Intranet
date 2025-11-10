import * as React from 'react';

import { Modal } from 'react-bootstrap';
import { CheckCircle, Trash2, X } from 'react-feather';
import { SITE_URL, Tenant_URL } from '../../../../../Shared/Constant';
import CustomBreadcrumb from '../../common/CustomBreadcrumb';
import Swal from 'sweetalert2';
import { getSP } from '../../../loc/pnpjsConfig';
import { PrincipalType, SPFI } from '@pnp/sp';
import { faDownload, faEye, faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { FormSubmissionMode } from '../../../../../Shared/Interfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Select from "react-select";
import * as moment from "moment";
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
const ProjectForm = ({ item, onCancel, onSave, setLoading }: IMyFormProps) => {
    const sp: SPFI = getSP();
    const [rows1, setRows1] = React.useState<any>([]);
    const [AttachmentpostArr, setAttachmentpostArr] = React.useState<any[]>([]);
    const [EnityData, setEnityData] = React.useState<IEntity[] | null>(null);
    const [editForm, setEditForm] = React.useState(false);
    const [editID, setEditID] = React.useState<number | null>(null);
    const [showModal, setShowModal] = React.useState(false);
    const [ValidDraft, setValidDraft] = React.useState(true);
    const [ValidSubmit, setValidSubmit] = React.useState(true);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const [formData, setFormData] = React.useState({
        DepartmentId: 0,
        ProjectName: '',


        // Status: '',
        ProjectOverview: '',
        ProjectPrivacy: '',
        StartDate: '',
        DueDate: '',
        TeamMembersId: [],

        TeamMembersValue: [],
        ProjectPriority: '',
        Budget: '',
    });
    const Breadcrumb = [

        {

            "MainComponent": "Settings",

            "MainComponentURl": "Settings",


        },

        {

            "MainComponent": "Project Master",

            "MainComponentURl": "ProjectMaster",


        }

    ];
    const getEntity = async () => {

        let arr: IEntity[] | null = null;

        await sp.web.lists.getByTitle("DepartmentMasterList").items.select("ID,DepartmentName").filter("Active eq 1")()

            .then((res) => {

                console.log(res);

                const newArray = res.map(({ ID, DepartmentName }) => ({ id: ID, name: DepartmentName }));

                // console.log(newArray, 'newArray');


                arr = newArray;

            })

            .catch((error) => {

                console.log("Error fetching data: ", error);

            });

        return arr;

    }

    const ApiCallFunc = async () => {
        setEnityData(await getEntity());
        const users = await sp.web.siteUsers();
        const people = users.filter(user => user.PrincipalType === PrincipalType.User);

        const Selectedoptions = people.map(item => ({
            value: item.Id,
            label: item.Title,
            // UserName: item.Title,
            // UserEmail: item.Email
        }));

        setRows1(Selectedoptions);
        if (item?.ID) {
            setEditForm(true);
            setFormData({


                ProjectName: item.ProjectName,
                ProjectOverview: item.ProjectOverview,
                ProjectPrivacy: item.ProjectPrivacy,
                StartDate: moment.utc(item.StartDate).local().format("YYYY-MM-DD"),
                DueDate: moment.utc(item.DueDate).local().format("YYYY-MM-DD"),
                TeamMembersId: item.TeamMembersId ? item.TeamMembersId : [],
                // TeamMembersValue: item.TeamMembersId ? Selectedoptions.filter((option) => item.TeamMembersId.includes(option.value)) : [],
                ProjectPriority: item.ProjectPriority,
                Budget: item.Budget,
                DepartmentId: item.DepartmentId,
                TeamMembersValue: item.TeamMembers?.map((approver: any) => ({
                    value: approver.ID,
                    label: approver.Title,
                })) || []

            });

            if (item.Attachment && item.AttachmentId.length > 0) {
                let arrn = await getDocumentLinkByID(item.AttachmentId);
                setAttachmentpostArr(arrn);
            }

        }
        else {
            setEditForm(false);
            setFormData({
                DepartmentId: 0,
                ProjectName: '',
                // Status: '',
                ProjectOverview: '',
                ProjectPrivacy: '',
                StartDate: '',
                DueDate: '',
                TeamMembersId: [],

                TeamMembersValue: [],
                ProjectPriority: '',
                Budget: '',
            });

        }

    }
    //#endregion

    // const getDocumentLinkByID = async (AttachmentId: []) => {
    //     // let results: IAttachment[] = [];
    //     let results: any[] = [];
    //     if (AttachmentId && AttachmentId.length > 0) {

    //         AttachmentId.forEach(async (id) => {
    //             await sp.web.lists.getByTitle("ProjectDocs").items.getById(id)
    //                 .select("*,FileRef, FileLeafRef")()
    //                 .then((res: any) => {
    //                     // console.log(res, ' let arrs=[]');
    //                     results.push(res);
    //                 })
    //                 .catch((error: any) => {
    //                     console.log("Error fetching data: ", error);
    //                 });

    //         });
    //          return results;
    //     }
    //     return results;
    // }

    const getDocumentLinkByID = async (AttachmentId: number[]) => {
        if (!AttachmentId || AttachmentId.length === 0) return [];

        try {
            const results = await Promise.all(
                AttachmentId.map(async (id) => {
                    const res = await sp.web.lists
                        .getByTitle("ProjectDocs")
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

                window.open(`${SITE_URL}/_layouts/15/WopiFrame.aspx?sourcedoc=${encodeURIComponent(obj.FileRef)}&action=default`, "_blank");
                // const viewerUrlppt = `${SITE_URL}/_layouts/15/WopiFrame.aspx?sourcedoc=${encodeURIComponent(obj.FileRef)}&action=embedview`
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
        setFormData((prevData) => {
            let updatedData = {
                ...prevData,
                [name]: name === "IsActive" ? value === "true" : value,
            };

            // 🔹 When StartDate changes:
            if (name === "StartDate") {
                // if no DueDate or DueDate < new StartDate → reset it
                if (!prevData.DueDate || prevData.DueDate < value) {
                    updatedData.DueDate = ""; // clear the due date
                }
            }

            return updatedData;
        });
    };

    const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>, libraryName: string, docLib: string) => {
        event.preventDefault();



        // const allowedTypes = [
        //     "image/jpeg",
        //     "image/png",
        //     "image/jpeg",

        // ];
        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/csv",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
                            text: "Only document files are allowed.",
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
                // setAttachmentpostArr(files);

                setAttachmentpostArr([...AttachmentpostArr, ...files]);








            } else {
                Swal.fire("upload a document")
            }
        }

    };





    // ////////////////
    const validateForm = async (fmode: FormSubmissionMode) => {
        const { ProjectName, DepartmentId, ProjectOverview, ProjectPrivacy, StartDate, DueDate, ProjectPriority, Budget, TeamMembersId } = formData;
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
            if (!ProjectName) {
                document.getElementById("ProjectName")?.classList.add("border-on-error");
                valid = false;
            }
            if (!ProjectOverview) {
                document.getElementById("ProjectOverview")?.classList.add("border-on-error");
                valid = false;
            }
            if (!ProjectPrivacy) {
                document.getElementById("ProjectPrivacy")?.classList.add("border-on-error");
                valid = false;
            }
            if (!StartDate) {
                document.getElementById("StartDate")?.classList.add("border-on-error");
                valid = false;
            }
            if (!DueDate) {
                document.getElementById("DueDate")?.classList.add("border-on-error");
                valid = false;
            }
            if (!ProjectPriority) {
                document.getElementById("ProjectPriority")?.classList.add("border-on-error");
                valid = false;
            }
            if (!Budget) {
                document.getElementById("Budget")?.classList.add("border-on-error");
                valid = false;
            }
            if (TeamMembersId.length == 0) {
                document.getElementById("TeamMembers")?.classList.add("border-on-error");
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
                        let attachmentId: any[] = [];
                        const folder = sp.web.getFolderByServerRelativePath('/sites/BAC/ProjectDocs');

                        if (AttachmentpostArr.length > 0) {
                            for (const file of AttachmentpostArr) {
                                if (!file.ID) {
                                    const newFileName = await getNewFileName(file.name);
                                    const uploadResult = await folder.files.addChunked(newFileName, file);
                                    const uploadedFile = uploadResult.file;
                                    const item = await uploadedFile.getItem<{ Id: number }>();
                                    // console.log(" Uploaded file ID:", item.Id);
                                    attachmentId.push(item.Id);
                                } else {
                                    attachmentId.push(file.ID);
                                }
                            }
                        }

                        const postPayload = {
                            ProjectName: formData.ProjectName,
                            ProjectOverview: formData.ProjectOverview,
                            ProjectPrivacy: formData.ProjectPrivacy,
                            AttachmentId: attachmentId || [],
                            ProjectPriority: formData.ProjectPriority,
                            Budget: formData.Budget,
                            DepartmentId: Number(formData.DepartmentId) || null,
                            TeamMembersId: formData.TeamMembersId.length > 0 ? formData.TeamMembersId : [],
                            StartDate: formData.StartDate ? new Date(formData.StartDate).toLocaleDateString("en-CA") : null,
                            DueDate: formData.DueDate ? new Date(formData.DueDate).toLocaleDateString("en-CA") : null,
                            // IsActive: formData.IsActive == true ? "Yes" : "No"

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
                        let attachmentId: any[] = [];
                        const folder = sp.web.getFolderByServerRelativePath('/sites/BAC/ProjectDocs');

                        if (AttachmentpostArr.length > 0) {
                            for (const file of AttachmentpostArr) {
                                if (!file.ID) {
                                    const newFileName = await getNewFileName(file.name);
                                    const uploadResult = await folder.files.addChunked(newFileName, file);
                                    const uploadedFile = uploadResult.file;
                                    const item = await uploadedFile.getItem<{ Id: number }>();
                                    // console.log(" Uploaded file ID:", item.Id);
                                    attachmentId.push(item.Id);
                                } else {
                                    attachmentId.push(file.ID);
                                }
                            }
                        }

                        //   // Create Post
                        const postPayload = {
                            ProjectName: formData.ProjectName,
                            ProjectOverview: formData.ProjectOverview,
                            ProjectPrivacy: formData.ProjectPrivacy,
                            AttachmentId: attachmentId || [],
                            ProjectPriority: formData.ProjectPriority,
                            Budget: formData.Budget,
                            DepartmentId: Number(formData.DepartmentId) || null,
                            TeamMembersId: formData.TeamMembersId.length > 0 ? formData.TeamMembersId : [],
                            StartDate: formData.StartDate ? new Date(formData.StartDate).toLocaleDateString("en-CA") : null,
                            DueDate: formData.DueDate ? new Date(formData.DueDate).toLocaleDateString("en-CA") : null,
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


        // AttachmentpostArr.splice(index, 1);
        setAttachmentpostArr((prevFiles: any[]) => prevFiles.filter((_file: any, i: number) => i !== index));

        // AttachmentpostArr.length > 0 ? "" : setShowModal(false);
        //  clearFileInput(name);


    };

    const updateItem = async (itemData: any, id: number) => {
        let resultArr: IItemUpdateResult | null = null;
        try {
            const newItem = await sp.web.lists.getByTitle('Projects').items.getById(id).update(itemData);
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
            const newItem = await sp.web.lists.getByTitle('Projects').items.add(itemData);

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
    const privacyOptions = [
        { label: "Private", value: "Private" },
        { label: "Team", value: "Team" },
        { label: "Public", value: "Public" },
    ];
    const priorities = [
        { label: 'High', value: 'High' },
        { label: 'Medium', value: 'Medium' },
        { label: 'Low', value: 'Low' },
    ];

    return (

        <>
            <div className="row">
                <div className="col-lg-4">
                    <CustomBreadcrumb Breadcrumb={Breadcrumb} />

                </div>
                <div className="col-12">
                    <div className="card">
                        <div className="card-body form-new">

                            <div className="row">
                                <div className="col-xl-6">
                                    <div className="mb-3">
                                        <label htmlFor="ProjectName" className="form-label">Project Name<span className="text-danger">*</span></label>
                                        <input type="text" id="ProjectName" className="form-control" placeholder="Enter project name" value={formData.ProjectName} name="ProjectName"
                                            onChange={(e) => onChange(e.target.name, e.target.value)} />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="ProjectOverview" className="form-label">Project Overview<span className="text-danger">*</span></label>
                                        <textarea className="form-control" id="ProjectOverview" placeholder="Enter some brief about project.." value={formData.ProjectOverview} name="ProjectOverview"
                                            onChange={(e) => onChange(e.target.name, e.target.value)}></textarea>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Project Privacy<span className="text-danger">*</span></label> <br />
                                        {/* <div className="form-check form-check-inline">
                                            <input type="radio" id="customRadio1" name="customRadio" className="form-check-input" />
                                            <label className="form-check-label" htmlFor="customRadio1">Private</label>
                                        </div>
                                        <div className="form-check form-check-inline">
                                            <input type="radio" id="customRadio2" name="customRadio" className="form-check-input" />
                                            <label className="form-check-label" htmlFor="customRadio2">Team</label>
                                        </div>
                                        <div className="form-check form-check-inline">
                                            <input type="radio" id="customRadio3" name="customRadio" className="form-check-input" />
                                            <label className="form-check-label" htmlFor="customRadio3">Public</label>
                                        </div> */}
                                        {privacyOptions.map((option, index) => (
                                            <div key={index} className="form-check form-check-inline">
                                                <input
                                                    type="radio"
                                                    id={`customRadio${index}`}
                                                    name="ProjectPrivacy"
                                                    value={option.value}
                                                    checked={formData.ProjectPrivacy === option.value}
                                                    onChange={(e) => onChange(e.target.name, e.target.value)}
                                                    className="form-check-input"
                                                />
                                                <label
                                                    className="form-check-label"
                                                    htmlFor={`customRadio${index}`}
                                                >
                                                    {option.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="row">
                                        <div className="col-lg-6">
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Start Date <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    id="StartDate"
                                                    name="StartDate"
                                                    className="form-control"
                                                    value={formData.StartDate}
                                                    onChange={(e) => onChange(e.target.name, e.target.value)}
                                                    min={today} // disable past dates
                                                />
                                            </div>
                                        </div>

                                        <div className="col-lg-6">
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Due Date <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    name="DueDate"
                                                    id="DueDate"
                                                    className="form-control"
                                                    value={formData.DueDate}
                                                    onChange={(e) => onChange(e.target.name, e.target.value)}
                                                    min={formData.StartDate || today} // disable past & before start date
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="project-priority" className="form-label">Project Priority<span className="text-danger">*</span></label>
                                        <select
                                            className="form-control"
                                            id="ProjectPriority"
                                            name="ProjectPriority"
                                            value={formData.ProjectPriority}
                                            onChange={(e) => onChange(e.target.name, e.target.value)}
                                            data-toggle="select2"
                                            data-width="100%"
                                        >
                                            <option value="">Select Priority</option>
                                            {priorities.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        {/* <select className="form-control select2-hidden-accessible" data-toggle="select2" data-width="100%" data-select2-id="1" aria-hidden="true">
                                            <option value="MD" data-select2-id="3">Medium</option>
                                            <option value="HI">High</option>
                                            <option value="LW">Low</option>
                                        </select> */}
                                        {/* <span className="select2 select2-container select2-container--default" dir="ltr" data-select2-id="2" style={{ "width": "100%" }}>
                                            <span className="selection"><span className="select2-selection select2-selection--single" role="combobox" aria-haspopup="true" aria-expanded="false" aria-disabled="false" aria-labelledby="select2-myiw-container">
                                                <span className="select2-selection__rendered" id="select2-myiw-container" role="textbox" aria-readonly="true" title="Medium">Medium</span><span className="select2-selection__arrow" role="presentation"><b role="presentation"></b></span></span></span><span className="dropdown-wrapper" aria-hidden="true"></span></span> */}
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="project-budget" className="form-label">Budget<span className="text-danger">*</span></label>
                                        <input type="text" id="Budget" className="form-control" placeholder="Enter project budget" value={formData.Budget} name="Budget" onChange={(e) => onChange(e.target.name, e.target.value)} />
                                    </div>

                                </div>



                                <div className="col-xl-6">
                                    {/* <div className="my-3 mt-xl-0">
                                        <label htmlFor="projectname" className="mb-0 form-label">Avatar</label>
                                        <p className="text-muted font-14">Recommended thumbnail size 800x400 (px).</p>




                                        <div className="dz-message needsclick">
                                            <i className="h3 text-muted dripicons-cloud-upload"></i>
                                            <h4>Drop files here or click to upload.</h4>
                                        </div>


                                        
                                        <div className="dropzone-previews mt-3" id="file-previews"></div>

                                        
                                        <div className="d-none" id="uploadPreviewTemplate">
                                            <div className="card mt-1 mb-0 shadow-none border">
                                                <div className="p-2">
                                                    <div className="row align-items-center">
                                                        <div className="col-auto">
                                                            <img data-dz-thumbnail="" src="#" className="avatar-sm rounded bg-light" alt="" data-themekey="#" />
                                                        </div>
                                                        <div className="col ps-0">
                                                            <a href="javascript:void(0);" className="text-muted fw-bold" data-dz-name=""></a>
                                                            <p className="mb-0" data-dz-size=""></p>
                                                        </div>
                                                        <div className="col-auto">
                                                            
                                                            <a href="" className="btn btn-link btn-lg text-muted" data-dz-remove="">
                                                                <i className="mdi mdi-close"></i>
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div> */}
                                    {/* <div className="col-lg-4"> */}
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
                                    {/* </div> */}
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between">
                                            <div>
                                                <label
                                                    htmlFor="bannerImage"

                                                    className="form-label"
                                                >
                                                    Documents
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
                                                                    {" "}{AttachmentpostArr.length} file(s) Attached
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
                                            // accept="image/*"
                                            accept=".pdf,.doc,.docx,.docs,.xls,.xlsx,.ppt,.pptx,.csv"
                                            onChange={(e) =>
                                                onFileChange(e, "bannerimg", "Document")
                                            }
                                            multiple
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="project-overview" className="form-label">Team Members<span className="text-danger">*</span></label>
                                        <Select
                                            // options={UserRoles.sort((a: any, b: any) => a.label.localeCompare(b.label))}
                                            // options={AllDept.sort((a: any, b: any) => a.label.localeCompare(b.label))}
                                            options={rows1}

                                            // isDisabled={InputDisabled}
                                            value={formData.TeamMembersValue}
                                            isMulti
                                            name="TeamMembers"
                                            id="TeamMembers"
                                            className={`newse`}

                                            // onChange={(selectedOptions: any) => handleDepartmentChangeTo(selectedOptions)}
                                            onChange={(selectedOptions: any) => {
                                                setFormData({
                                                    ...formData,
                                                    TeamMembersValue: selectedOptions,
                                                    TeamMembersId: selectedOptions.map((option: any) => option.value),
                                                });
                                            }}
                                            placeholder="Select members"

                                        />
                                        {/* <select className="form-control select2-hidden-accessible" data-toggle="select2" data-width="100%" data-select2-id="4" aria-hidden="true">
                                            <option data-select2-id="6" value="Select">Select</option>
                                            <option value="AZ">Mary Scott</option>
                                            <option value="CO">Holly Campbell</option>
                                            <option value="ID">Beatrice Mills</option>
                                            <option value="MT">Melinda Gills</option>
                                            <option value="NE">Linda Garza</option>
                                            <option value="NM">Randy Ortez</option>
                                            <option value="ND">Lorene Block</option>
                                            <option value="UT">Mike Baker</option>
                                        </select> */}
                                        {/* <span className="select2 select2-container select2-container--default" dir="ltr" data-select2-id="5" style={{ "width": "100%" }}><span className="selection"><span className="select2-selection select2-selection--single" role="combobox" aria-haspopup="true" aria-expanded="false" aria-disabled="false" aria-labelledby="select2-35w9-container"><span className="select2-selection__rendered" id="select2-35w9-container" role="textbox" aria-readonly="true" title="Select">Select</span><span className="select2-selection__arrow" role="presentation"><b role="presentation"></b></span></span></span><span className="dropdown-wrapper" aria-hidden="true"></span></span> */}

                                        {/* <div className="mt-2" id="tooltips-container">
                                            <a href="javascript:void(0);" className="d-inline-block">
                                                <img src="https://officeindia.sharepoint.com/sites/AlRostmania/CentralBankNewApp/NewAssests/images/users/user-6.jpg" className="rounded-circle avatar-xs" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="top" aria-label="Mat Helme" data-bs-original-title="Mat Helme" data-themekey="#" />
                                            </a>

                                            <a href="javascript:void(0);" className="d-inline-block">
                                                <img src="https://officeindia.sharepoint.com/sites/AlRostmania/CentralBankNewApp/NewAssests/images/users/user-7.jpg" className="rounded-circle avatar-xs" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="top" aria-label="Michael Zenaty" data-bs-original-title="Michael Zenaty" data-themekey="#" />
                                            </a>

                                            <a href="javascript:void(0);" className="d-inline-block">
                                                <img src="https://officeindia.sharepoint.com/sites/AlRostmania/CentralBankNewApp/NewAssests/images/users/user-8.jpg" className="rounded-circle avatar-xs" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="top" aria-label="James Anderson" data-bs-original-title="James Anderson" data-themekey="#" />
                                            </a>

                                            <a href="javascript:void(0);" className="d-inline-block">
                                                <img src="https://officeindia.sharepoint.com/sites/AlRostmania/CentralBankNewApp/NewAssests/images/users/user-4.jpg" className="rounded-circle avatar-xs" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="top" aria-label="Lorene Block" data-bs-original-title="Lorene Block" data-themekey="#" />
                                            </a>

                                            <a href="javascript:void(0);" className="d-inline-block">
                                                <img src="https://officeindia.sharepoint.com/sites/AlRostmania/CentralBankNewApp/NewAssests/images/users/user-5.jpg" className="rounded-circle avatar-xs" alt="friend" data-bs-container="#tooltips-container" data-bs-toggle="tooltip" data-bs-placement="top" aria-label="Mike Baker" data-bs-original-title="Mike Baker" data-themekey="#" />
                                            </a>
                                        </div> */}

                                    </div>
                                </div>
                            </div>

                            {/* <div className="col-lg-4">
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <label
                                                htmlFor="bannerImage"

                                                className="form-label"
                                            >
                                                Documents
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
                            </div> */}



                            {/* <div className="row mt-3">
                                        <div className="col-12 text-center">
                                            <button type="button" className="btn btn-success waves-effect waves-light m-1"><i className="fe-check-circle me-1"></i> Create</button>
                                            <button type="button" className="btn btn-light waves-effect waves-light m-1"><i className="fe-x me-1"></i> Cancel</button>
                                        </div>
                                    </div> */}
                            <div className="row mt-3">
                                <div className="col-12 text-center">
                                    <button type="button" className="btn btn-success waves-effect waves-light m-1" onClick={handleFormSubmit}> <CheckCircle className="me-1" size={16} /> {item && (item.id || item.ID) ? "Update" : "Submit"}</button>
                                    <button type="button" className="btn btn-light waves-effect waves-light m-1" onClick={onCancel}><X className="me-1" size={16} /> Cancel</button>
                                </div>
                            </div>

                        </div>
                    </div>
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
                            Below are the attachment details for Project Gallery
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
                                {/* <th style={{ minWidth: '40px', maxWidth: '40px' }}>Image</th> */}
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
                                        {/* <td style={{ minWidth: '40px', maxWidth: '40px' }} className="text-center">
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
                                        </td> */}
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
                                            <span
                                                title="Delete file"
                                                style={{
                                                    color: "red",
                                                    cursor: "pointer",
                                                    marginLeft: "10px",
                                                }}><Trash2 size={18} onClick={() => deleteLocalFile(index, AttachmentpostArr, "bannerimg")} /></span>
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

export default ProjectForm
