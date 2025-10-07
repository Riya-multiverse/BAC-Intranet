import * as React from "react";
import { useEffect, useState } from "react";
import { SPFI, spfi, SPFx } from "@pnp/sp";
import { IItem } from "@pnp/sp/items";
import { WebPartContext } from "@microsoft/sp-webpart-base";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../../../../styles/global.scss";

import * as feather from "feather-icons";
import { getSP } from "../../loc/pnpjsConfig";
import CustomBreadcrumb from "../common/CustomBreadcrumb";


interface IEventItem {
  EventTitle: string;
  EventDate: string;
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
      .items.select("EventTitle", "EventDate")
      .filter(`EventDate ge datetime'${startIso}'`)
      .orderBy("EventDate", true)
      .top(4)()
      .then((data: any[]) => {
        const sorted = (data as IEventItem[]).sort(
          (a, b) =>
            new Date(a.EventDate).getTime() - new Date(b.EventDate).getTime()
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
    <div className="content">
      {/* Start Content */}
      <div className="container-fluid paddb">
        {/* start page title */}
        <div className="row">
          <div className="col-xl-12 col-lg-12">
            <div className="row">
              <div className="col-lg-12">
                {/* <h4 className="page-title fw-bold mb-1 font-20">
                  Upcoming Events
                </h4>
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <a href="dashboard.html">Home</a>
                  </li>
                  <li className="breadcrumb-item">
                    <span className="fe-chevron-right"></span>
                  </li>
                  <li className="breadcrumb-item active">Upcoming Events</li>
                </ol> */}
                 <CustomBreadcrumb Breadcrumb={Breadcrumb} />
              </div>
            </div>

            <main>
              <div className="card mt-3">
                <div className="card-body pb-1">
                  <div>
                    {events.length === 0 ? (
                      <p>No upcoming events found.</p>
                    ) : (
                      events.map((item, index) => {
                        const date = new Date(item.EventDate);
                        const day = date.getDate();
                        const month = date.toLocaleString("default", {
                          month: "short",
                        });
                        const year = date.getFullYear();

                        return (
                          <div
                            key={index}
                            className="row align-items-start border-bottom mb-0 ng-scope"
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

                            <div className="col-sm-9 upcom2">
                              <div className="w-100 ps-0">
                                <h4 className="mt-2 mb-1 text-dark font-14 fw-bold ng-binding">
                                  {item.EventTitle}
                                </h4>
                                <p className="mb-1 mt-3 font-12 mt-sm-0 ng-binding">
                                  <i
                                    data-feather="calendar"
                                    className="me-1"
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
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingEvents;
