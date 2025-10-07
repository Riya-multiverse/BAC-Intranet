import *as React from 'react';
import { getSP } from '../../../loc/pnpjsConfig';
import { SPFI } from '@pnp/sp';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { decryptId } from '../../../../../APIService/CryptoService';
interface IQuickLinkTableProps {
    item?: any;
    onCancel: () => void;
    onSave: (data: any) => void;
}

const QuickLinkForm = ({ item, onCancel, onSave }: IQuickLinkTableProps) => {
    const sp: SPFI = getSP();
    //   const siteUrl = props.siteUrl;
    const [Loading, setLoading] = React.useState(false);
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
    const [formData, setFormData] = React.useState({
        Title: "",
        URL: "",
        RedirectTONewTab: false,
        IsActive: false
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
    const onFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>,
        libraryName: string,
        docLib: string
    ) => {
        debugger;
        //console.log("libraryName-->>>>", libraryName)
        event.preventDefault();
        let uloadDocsFiles: any[] = [];
        let uloadDocsFiles1: any[] = [];

        let uloadImageFiles: any[] = [];
        let uloadImageFiles1: any[] = [];

        let uloadBannerImageFiles: any[] = [];

        if (event.target.files && event.target.files.length > 0) {
            const files = Array.from(event.target.files);
            (event.target as HTMLInputElement).value = '';


            if (libraryName === "Gallery" || libraryName === "bannerimg") {
                // const imageVideoFiles = files.filter(
                //   (file) =>
                //     file.type.startsWith("image/") || file.type.startsWith("video/")
                // );
                var imageVideoFiles: any[] = [];
                if (libraryName === "Gallery") {
                    imageVideoFiles = files.filter(
                        (file) =>
                            file.type.startsWith("image/") || file.type.startsWith("video/")
                    );
                }
                else if (libraryName === "bannerimg") {
                    imageVideoFiles = files.filter(
                        (file) =>
                            file.type.startsWith("image/")
                    );
                }

                if (imageVideoFiles.length > 0) {
                    const arr = {
                        files: imageVideoFiles,
                        libraryName: libraryName,
                        docLib: docLib,
                        name: imageVideoFiles[0].name,
                        size: imageVideoFiles[0].size,
                        fileUrl: URL.createObjectURL(imageVideoFiles[0])
                    };

                    //console.log("arr-->>>", arr)
                    if (libraryName === "Gallery") {
                        uloadImageFiles.push(arr);
                        setImagepostArr(uloadImageFiles);
                        if (ImagepostArr1.length > 0) {
                            imageVideoFiles.forEach((ele) => {
                                //console.log("ele in if-->>>>", ele)
                                let arr1 = {
                                    ID: 0,
                                    Createdby: "",
                                    Modified: "",
                                    fileUrl: URL.createObjectURL(ele),
                                    fileSize: ele.size,
                                    fileType: ele.type,
                                    fileName: ele.name,
                                };
                                ImagepostArr1.push(arr1);
                            });
                            setImagepostArr1(ImagepostArr1);
                        } else {
                            imageVideoFiles.forEach((ele) => {
                                //console.log("ele in else-->>>>", ele)
                                let arr1 = {
                                    ID: 0,
                                    Createdby: "",
                                    Modified: "",
                                    fileUrl: URL.createObjectURL(ele),
                                    fileSize: ele.size,
                                    fileType: ele.type,
                                    fileName: ele.name,
                                };
                                uloadImageFiles1.push(arr1);
                            });
                            setImagepostArr1(uloadImageFiles1);
                        }
                    } else {
                        uloadBannerImageFiles.push(arr);
                        //console.log("uloadBannerImageFiles-->>", uloadBannerImageFiles)
                        setBannerImagepostArr(uloadBannerImageFiles);
                    }
                } else {
                    if (libraryName === "bannerimg") {
                        Swal.fire("only image can be upload");
                    } else {
                        Swal.fire("only image & video can be upload");
                    }

                }
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
                // const bannerimgobject = res.QuickLinkImage != "{}" && JSON.parse(res.QuickLinkImage)
                // console.log(bannerimgobject[0], 'bannerimgobject');

                // bannerimg.push(bannerimgobject);
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

    //#endregion
    const ApiCallFunc = async () => {
        // const entityDefaultitem = await getEntity(sp);
        // if (entityDefaultitem.find((item) => item.name === 'Global').id) {
        //   formData.EntityId = entityDefaultitem.find((item) => item.name === 'Global').id;

        // }
        // setEnityData(await getEntity(sp)) //Entity

        //     // setCurrentUser(await getCurrentUser(sp, siteUrl))
        //     const Currusers :any= await getCurrentUser(sp, siteUrl);
        //     const users = await sp.web.siteUsers();

        //     // const options = users.map(item => ({
        //     //   value: item.Id,
        //     //   label: item.Title,
        //     //   UserName :item.Title,
        //     //   UserEmail :item.Email
        //     // }));

        //     // setRows(options);
        // // if(Currusers){
        //   const formobj = {
        //     Title: "",
        //      URL: "",
        //     RedirectTONewTab:false  


        //    }
        //   setFormData(formobj);

        // }
        // var encryptedId = "U2FsdGVkX1/ZSx0oFhvAh5NpBkgWn8gIfZcjgTT+DyI=";
        // sessionStorage.setItem("quicklinkId", encryptedId)
        let formitemid;
        //#region getdataByID
        if (sessionStorage.getItem("quicklinkId") != undefined && sessionStorage.getItem("quicklinkId") != null) {
            const iD = sessionStorage.getItem("quicklinkId")
            let iDs = decryptId(iD)
            formitemid = Number(iDs);
            //   setFormItemId(Number(iDs))
        }
        // else {
        //   let formitemidparam = getUrlParameterValue('contentid');
        //   if (formitemidparam) {
        //     formitemid = Number(formitemidparam);
        //     setFormItemId(Number(formitemid));
        //   }
        // }

        //#region getdataByID


        // /////////////////

        // if (sessionStorage.getItem("announcementId") != undefined) {
        if (formitemid) {
            // const iD = sessionStorage.getItem("announcementId")
            // let iDs = decryptId(iD)
            const setDelegateById = await getItemByID(Number(formitemid))

            // console.log(setBannerById, 'setBannerById');
            setEditID(Number(setDelegateById[0].ID))
            if (setDelegateById.length > 0) {
                debugger
                setEditForm(true)
                // setCategoryData(await getCategory(sp, Number(setBannerById[0]?.TypeMaster))) // Category
                // const startDate = setDelegateById[0].StartDate ?new Date(setDelegateById[0].StartDate).toISOString()?.split("T")[0]:"";
                // const endDate =setDelegateById[0].EndDate? new Date(setDelegateById[0].EndDate).toISOString()?.split("T")[0]:"";


                let arr = {

                    Title: setDelegateById[0].Title,
                    URL: setDelegateById[0].URL,
                    RedirectTONewTab: setDelegateById[0].RedirectToNewTab,
                    EntityId: setDelegateById[0].EntityId ? setDelegateById[0].EntityId : 0,
                    IsActive: setDelegateById[0].IsActive
                    // QuickLinkImage: setDelegateById[0]?.QuickLinkImage,


                }
                let banneimagearr = []
                if (setDelegateById[0].QuickLinkImage.length > 0) {
                    banneimagearr = setDelegateById[0].QuickLinkImage
                    console.log(banneimagearr, 'banneimagearr');

                    setBannerImagepostArr(banneimagearr);
                    setFormData(arr)

                }
                else {
                    setFormData(arr)
                }

                // setFormData(arr)

                // setFormData((prevValues) => ({
                //   ...prevValues,
                //   [FeaturedAnnouncement]: setBannerById[0].FeaturedAnnouncement === "on" ? true : false, // Ensure the correct boolean value is set for checkboxes
                // }));

            }


        }
    }
    //#endregion
    return (
        <>
            <div style={{ paddingLeft: '1.3rem', paddingRight: '1.5rem' }} className="row">
                <div className="card mt-3" >
                    <div className="card-body">
                        <div className="row mt-2">
                            {Loading ?
                                // <div className="loadercss" role="status">Loading...
                                //   <img src={require('../../../Assets/ExtraImage/loader.gif')} style={{ height: '80px', width: '70px' }} alt="Check" />
                                // </div>
                                <div style={{ minHeight: '100vh', marginTop: '100px' }} className="loadernewadd mt-10">
                                    {/* <div>
                                        <img
                                            src={require("../../../CustomAsset/edc-gif.gif")}
                                            className="alignrightl"
                                            alt="Loading..."
                                        />
                                    </div> */}
                                    <span>Loading </span>{" "}
                                    {/* <span>
                                        <img
                                            src={require("../../../CustomAsset/edcnew.gif")}
                                            className="alignrightl"
                                            alt="Loading..."
                                        />
                                    </span> */}
                                </div>
                                :
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
                                                className={`form-control ${(!ValidDraft) ? "border-on-error" : ""} ${(!ValidSubmit) ? "border-on-error" : ""}`}
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
                                                className={`form-control ${(!ValidDraft) ? "border-on-error" : ""} ${(!ValidSubmit) ? "border-on-error" : ""}`}
                                                value={formData.URL}
                                                onChange={(e) => onChange(e.target.name, e.target.value)}


                                            />


                                        </div>
                                    </div>
                                    {/* <div className="col-lg-4">
                                        <div className="mb-3">
                                            <label htmlFor="EntityId" className="form-label">
                                                Department <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className={`form-select ${(!ValidSubmit) ? "border-on-error" : ""}`}
                                                id="EntityId"
                                                name="EntityId"
                                                value={formData.EntityId}
                                                onChange={(e) => onChange(e.target.name, e.target.value)}
                                                disabled={InputDisabled}
                                            >
                                                <option value="">Select</option>
                                                {
                                                    EnityData.map((item, index) => (
                                                        <option key={index} value={item.id}>{item.name}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div> */}
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
                                                        Image{" "}
                                                        <span className="text-danger">*</span>
                                                    </label>
                                                </div>
                                                <div>
                                                    <div>
                                                        {
                                                            BnnerImagepostArr[0] != false &&
                                                                BnnerImagepostArr.length > 0 &&
                                                                BnnerImagepostArr != undefined
                                                                ? BnnerImagepostArr.length == 1 && (
                                                                    <a style={{ fontSize: "0.875rem" }} onClick={() => setShowModalFunc(true, "bannerimg")}>
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
                                                className={`form-control ${(!ValidDraft) ? "border-on-error" : ""} ${(!ValidSubmit) ? "border-on-error" : ""}`}
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
                            }
                        </div>
                    </div>

                </div>
            </div>
            <div className="row mt-3">
                <div className="col-12 text-center">
                    <a href="news-master.html"><button type="button" className="btn btn-success waves-effect waves-light m-1" onClick={onSave}><i className="fe-check-circle me-1"></i> Submit</button> </a>
                    <button type="button" className="btn btn-light waves-effect waves-light m-1" onClick={onCancel}><i className="fe-x me-1"></i> Cancel</button>
                </div>
            </div>

        </>
    )
}

export default QuickLinkForm
