import * as React from 'react'
import { APP_URL } from '../../../../Shared/Constant';
import CustomBreadcrumb from '../common/CustomBreadcrumb';
import { getSP } from '../../loc/pnpjsConfig';
import { SPFI } from '@pnp/sp';
import { Tenant_URL } from '../../../../Shared/Constant';
const DEFAULT_ICON = require("../../assets/noun-approval-5526052.png");

import {
    HashRouter as Router,
    Routes,
    Route,
    NavLink,
    Navigate,
} from "react-router-dom";

const settings = () => {

    const sp: SPFI = getSP();
    const [masterItems, setmasterItems] = React.useState([]);
    const [siteID, setSiteID] = React.useState<string | null>(null);
    const [settingsListId, setSettingsListId] = React.useState<string | null>(null);
    const Breadcrumb = [

        {

            "MainComponent": "Home",

            "MainComponentURl": "Home",


        },

        {

            "MainComponent": "Settings",

            "MainComponentURl": "Settings",


        }

    ];
    const getMasterItems = async () => {
        const currentUser = await sp.web.currentUser();

        // Get groups for the current user
        const userGroups = await sp.web.currentUser.groups();

        // console.log("userGroups", userGroups);
        let grptitle: String[] = [];
        for (var i = 0; i < userGroups.length; i++) {
            grptitle.push(userGroups[i].Title.toLowerCase());
        }

        let arr: any = [];

        const list = sp.web.lists.getByTitle("Settings");

        const listInfo = await list.select("Id")();
        setSettingsListId(listInfo?.Id ?? null);

        await list.items
            .select("*,Audience/Title,Audience/ID")
            .expand("Audience")
            .filter("IsActive eq 'Yes'")
            .orderBy("Order0", true)
            .getAll()
            .then((res: any) => {
                // console.log(res, ' let arrs=[]');


                //  arr.push(res)
                // arr = res;
                let securednavitems = res.filter((nav: any) => {
                    return (!nav.EnableAudienceTargeting || (nav.EnableAudienceTargeting && nav.Audience && nav.Audience.some((nv1: any) => { return grptitle.includes(nv1.Title.toLowerCase()) || nv1.ID == currentUser.Id })))
                }
                );

                arr = securednavitems;

            })

            .catch((error: any) => {
                console.log("Error fetching data: ", error);
            });
        // console.log(arr, 'arr');
        return arr;
    }

    const fetchData = async () => {
        try {
            const sideNav = await getMasterItems();
            // console.table(sideNav);
            setmasterItems(sideNav)


        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, []);



    React.useEffect(() => {
        (async () => {
            try {
                //  Only fetch site ID 
                const siteInfo = await sp.site.select("Id")();
                setSiteID(siteInfo?.Id ?? null);
            } catch (err) {
                console.error("Failed to load siteId", err);
            }
        })();
    }, [sp]);




    function safeParse(jsonLike: any) {
        try {
            if (!jsonLike) return null;
            return typeof jsonLike === "string" ? JSON.parse(jsonLike) : jsonLike;
        } catch {
            return null;
        }
    }


    function getImageIcon(item: any, siteID: string | null, settingsListId: string | null) {
        const imageData = safeParse(item?.ImageIcon);

        if (!imageData) return null;

        //  If serverRelativeUrl present → build URL with Tenant URL
        if (imageData.serverRelativeUrl) {
            return `${Tenant_URL}${imageData.serverRelativeUrl}`;
        }

        //  Thumbnail fallback logic
        if (siteID && settingsListId && imageData.fileName && item?.ID) {
            return `${window.location.origin}/_api/v2.1/sites('${siteID}')/lists('${settingsListId}')/items('${item.ID}')/attachments('${imageData.fileName}')/thumbnails/0/c400x400/content`;
        }

        return null;
    }


    return (
        <>
            <CustomBreadcrumb Breadcrumb={Breadcrumb} />


            <div className="row manage-master mt-3">


                {masterItems.map((item: any, index: number) => (

                    <div className="col-md-3">
                        <NavLink to={`/${item.LinkUrl.replace(/^\//, '')}`}>

                            {/* <a href="javascript:void(0)"> */}
                            <div className="card-master box1 mb-3">
                                <div className="icon">
                                    {/* <img src={require("../../assets/noun-approval-5526052.png")} data-themekey="#" /> */}
                                    <img
                                        src={getImageIcon(item, siteID, settingsListId) ?? DEFAULT_ICON}
                                        alt={item?.Title ?? "icon"}
                                        data-themekey="#"
                                    />

                                </div>
                                <p className="text-dark">{item.Title}</p>

                            </div>
                        </NavLink>
                        {/* </a> */}
                    </div>

                ))}


                {/* <div className="col-md-3">
                    <a href="javascript:void(0)">
                        <div className="card-master box1">
                            <div className="icon">
                                <img src={require("../../assets/noun-awards-3455472.png")} data-themekey="#" />
                            </div>
                            <p className="text-dark">User Training</p>

                        </div>
                    </a>
                </div>

                <div className="col-md-3">

                    <a href="javascript:void(0)">
                        <div className="card-master box1">
                            <div className="icon">
                                <img src={require("../../assets/noun_news_518193bn.png")} data-themekey="#" />
                            </div>
                            <p className="text-dark">News</p>

                        </div>
                    </a>
                </div>



                <div className="col-md-3">

                    <a href="javascript:void(0)">
                        <div className="card-master box1">
                            <div className="icon">
                                <img src={require("../../assets/noun-publication-4594256.png")} data-themekey="#" />
                            </div>
                            <p className="text-dark">Announcements</p>

                        </div>
                    </a>
                </div> */}

            </div>
        </>
    )
}

export default settings
