import * as React from 'react'
import { SPFI } from "@pnp/sp";
import { getSP } from "../../loc/pnpjsConfig"
import CustomBreadcrumb from '../common/CustomBreadcrumb';
const QuickLinks = () => {
    const [quickLinks, setQuickLinks] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
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
                    .top(4999)();



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

                            } catch (error) {

                            }
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

    const Breadcrumb = [
        {
            MainComponent: "Home",

            MainComponentURl: "Home",
        },

        {
            MainComponent: "Quick Links",

            MainComponentURl: "QuickLinks",
        },
    ];
return (
  <>
    {loading ? (
     <div className="loadernewadd mt-10 text-center">
        <img
          src={require("../../assets/BAC_loader.gif")}
          className="alignrightl"
          alt="Loading..."
        />
        <span>Loading </span>
        <img
          src={require("../../assets/edcnew.gif")}
          className="alignrightl"
          alt="Loading..."
        />
      </div>
    ) :
     (
      <div className="row">
        <div className="col-xl-12 col-lg-12 tabview1">
          <CustomBreadcrumb Breadcrumb={Breadcrumb} />
          <div className="card">
            <div className="card-body">
              <h4 className="header-title font-16 text-dark fw-bold mb-0">
                Quick Links
              </h4>

              <div className="row mt-3">
                {quickLinks.length > 0 ? (
                  quickLinks.map((link: any, index: number) => (
                    <div className="col-sm-2 mb-3" key={index}>
                      <a
                        href={link.URL}
                        target={link.RedirectToNewTab ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                        title={link.Title}
                      >
                        <img
                          src={
                            link.ImageUrl && link.ImageUrl !== ""
                              ? link.ImageUrl
                              : "https://via.placeholder.com/150x150?text=No+Image"
                          }
                          className="img-fluid rounded shadow-sm"
                          alt={link.Title || "Quick Link"}
                        />
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-muted text-center">
                    No quick links found.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
     
    )}
  </>
);

}

export default QuickLinks
