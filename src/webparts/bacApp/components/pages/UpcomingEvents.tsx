import * as React from "react";
import { useEffect, useState } from "react";
import { SPFI, spfi, SPFx } from "@pnp/sp";
import { IItem } from "@pnp/sp/items";
import { WebPartContext } from "@microsoft/sp-webpart-base";

//import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../../../../styles/global.scss";

import * as feather from "feather-icons";
import { getSP } from "../../loc/pnpjsConfig";
import CustomBreadcrumb from "../common/CustomBreadcrumb";


interface IEventItem {
  EventTitle: string;
  UpcomingEventDate: string;
}

const UpcomingEvents = () => {
  const [events, setEvents] = useState<IEventItem[]>([]);

  useEffect(() => {
    const sp: SPFI = getSP();

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const startIso = start.toISOString();

    sp.web.lists
      .getByTitle("Events")
      .items.select("EventTitle", "UpcomingEventDate")
      .filter(`UpcomingEventDate ge datetime'${startIso}'`)
      .orderBy("UpcomingEventDate", true)
      .top(4)()
      .then((data: any[]) => {
        const sorted = (data as IEventItem[]).sort(
          (a, b) =>
            new Date(a.UpcomingEventDate).getTime() - new Date(b.UpcomingEventDate).getTime()
        );
        setEvents(sorted);
      })
      .catch((error) => console.error(" Error fetching events:", error));
  }, []);

  useEffect(() => {
    feather.replace();
  }, [events]);
  const Breadcrumb = [

        {

            "MainComponent": "Home",

            "MainComponentURl": "Home",


        },

        {

            "MainComponent": "Upcoming Events",

            "MainComponentURl": "UpcomingEvents",


        }

    ];
  

  return (
    <div>
      {/* Start Content */}
     
        {/* start page title */}
        <div className="row">
          <div className="col-xl-12 col-lg-12">
           
              
                 <CustomBreadcrumb Breadcrumb={Breadcrumb} />
              </div>
            </div>

            <div className="row">
            <div className="col-xl-12 col-lg-12">
              <div className="card mt-1">
                <div className="card-body pb-1">
                  <div>
                    {events.length === 0 ? (
                      <p>No upcoming events found.</p>
                    ) : (
                      events.map((item, index) => {
                        const date = new Date(item.UpcomingEventDate);
                        const day = date.getDate();
                        const month = date.toLocaleString("default", {
                          month: "short",
                        });
                        const year = date.getFullYear();

                        return (
                          <div
                            key={index}
                            className="row align-items-center border-bottom mb-0 ng-scope"
                            style={{
                              padding: "0px 0px 0px 0px",
                              width: "100%",
                              margin: "auto",
                            }}
                          >
                            <div className="col-sm-1 upcom1">
                              <div className="icon-1 event me-0">
                                <h4 className="ng-binding">{day}</h4>
                                <p className="ng-binding">{`${month} ${year
                                  .toString()
                                  .slice(2)}`}</p>
                              </div>
                            </div>

                            <div className="col-sm-9 upcom2 p-0">
                              <div className="w-100 ps-0">
                                <h4 className="mt-2 mb-1 text-dark font-14 fw-bold ng-binding">
                                  {item.EventTitle}
                                </h4>
                                <p className="mb-1 mt-3 date-color font-12 mt-sm-0 ng-binding">
                                  <i
                                    data-feather="calendar"
                                    className="me-1 margintop"
                                  ></i>
                                  {`${day} ${month} ${year}`}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
              </div>
          </div> </div>
  );
};

export default UpcomingEvents;
