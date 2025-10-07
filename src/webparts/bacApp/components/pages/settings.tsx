import * as React from 'react'
import { APP_URL } from '../../../../Shared/Constant';
import CustomBreadcrumb from '../common/CustomBreadcrumb';
import { getSP } from '../../loc/pnpjsConfig';
import { SPFI } from '@pnp/sp';
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

    let arr: any = []
    // let arrs: any[] = []
    // let bannerimg: any[] = []
    await sp.web.lists.getByTitle("Settings").
      items.select("*,Audience/Title,Audience/ID").expand("Audience").filter("IsActive eq 'Yes'").orderBy("Order0",true).getAll()
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
  


    return (
        <>
        <CustomBreadcrumb Breadcrumb={Breadcrumb}/>
            

            <div className="row manage-master mt-3">


               {masterItems.map((item: any, index: number) => (

                 <div className="col-md-3">
                     <NavLink to={`/${item.LinkUrl.replace(/^\//, '')}`}>

                    {/* <a href="Approvals-Master.html"> */}
                        <div className="card-master box1">
                            <div className="icon">
                                <img src={require("../../assets/noun-approval-5526052.png")} data-themekey="#" />
                            </div>
                            <p className="text-dark">{item.Title}</p>

                        </div>
                        </NavLink>
                    {/* </a> */}
                </div>

                ))}
               

                {/* <div className="col-md-3">
                    <a href="mediaevent.html">
                        <div className="card-master box1">
                            <div className="icon">
                                <img src={require("../../assets/noun-awards-3455472.png")} data-themekey="#" />
                            </div>
                            <p className="text-dark">User Training</p>

                        </div>
                    </a>
                </div>

                <div className="col-md-3">

                    <a href="news-master.html">
                        <div className="card-master box1">
                            <div className="icon">
                                <img src={require("../../assets/noun_news_518193bn.png")} data-themekey="#" />
                            </div>
                            <p className="text-dark">News</p>

                        </div>
                    </a>
                </div>



                <div className="col-md-3">

                    <a href="announcement-master.html">
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
