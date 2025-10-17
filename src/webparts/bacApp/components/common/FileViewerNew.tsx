// import React, { createRef, useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';


// Type the cancelAction prop more specifically
export interface IfileviewerProps {
    showfile: boolean;
    docurl?: string;
    cancelAction?: (refresh?: boolean) => void;  // Type the function more specifically
}

export interface IfileviewerState {
    isVisible: boolean;
}

const FileViewer: React.FC<IfileviewerProps> = (props:any) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isVisible, setIsVisible] = useState<boolean>(true); // Initially visible

    // Method to handle the close button click to hide the iframe
    const handleClose = () => {

        setIsVisible(false);
        // Call cancelAction from props when the iframe is closed
        if (props.cancelAction) {
            props.cancelAction();  // Trigger the parent's cancel action
        }
    };

    const hideButtonInPDF = () => {
        debugger
        if (iframeRef.current) {
            const iframeDocument = iframeRef.current.contentWindow?.document;
            //const iframeDocument = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
            if (iframeDocument) {
                // Example: Find the button by its ID (adjust according to the actual button selector)
                const closeButton = iframeDocument.getElementById('closeCommand'); // Use the correct ID or selector
                if (closeButton) {
                    closeButton.style.display = 'none'; // Hide the button
                    console.log('Button found and hidden.');
                } else {
                    console.log('Button not found within the iframe.');
                }
                const button = iframeDocument.getElementById("OneUpCommandBar") as HTMLElement;
                const excelToolbar = iframeDocument.getElementById("m_excelEmbedRenderer_m_ewaEmbedViewerBar") as HTMLElement;
                const wordToolbartop = iframeDocument.getElementById("ExternalHeaderViewerChromeTopBars") as HTMLElement;
                const wordToolbarbottm = iframeDocument.getElementById("WACRibbonPanel") as HTMLElement;

                if (excelToolbar) {
                    excelToolbar.style.display = "none"
                }
                if (wordToolbartop) {
                    wordToolbartop.style.display = "none"
                }
                if (wordToolbarbottm) {
                    wordToolbarbottm.style.display = "none"
                }
                if (button) {
                    console.log("Hiding the OneUpCommandBar element");
                    button.style.display = "none";

                    // Hide the spinner and show the iframe after the button is hidden
                    // spinner.style.display = "none";
                    // iframe.style.display = "block";

                    // Exit the loop once the button is found and hidden
                } else {
                    console.log("OneUpCommandBar not found, rechecking...");
                }

                const helpbutton = iframeDocument.getElementById("m_excelEmbedRenderer_m_ewaEmbedViewerBar") as HTMLElement;
                if (helpbutton) {
                    helpbutton.style.display = "none"
                }
            } else {
                console.log('Iframe document not accessible.');
            }
        }
    };


    // checkAndHideButton = () => {
    //     try {
    //         const iframeDocument = this.iframeRef.current.contentWindow?.document;
    //         const iframe = document.getElementById("filePreview") as HTMLIFrameElement;
    //         const spinner = document.getElementById("spinner") as HTMLElement;

    //         // Show the spinner and hide the iframe initially
    //         spinner.style.display = "block";
    //         iframe.style.display = "none";
    //         iframe.src = this.props.docurl;
    //         if (iframeDocument) {
    //             const button = iframeDocument.getElementById("OneUpCommandBar") as HTMLElement;
    //             const excelToolbar = iframeDocument.getElementById("m_excelEmbedRenderer_m_ewaEmbedViewerBar") as HTMLElement;
    //             if (excelToolbar) {
    //                 excelToolbar.style.display = "none"
    //             }
    //             if (button) {
    //                 console.log("Hiding the OneUpCommandBar element");
    //                 button.style.display = "none";

    //                 // Hide the spinner and show the iframe after the button is hidden
    //                 spinner.style.display = "none";
    //                 iframe.style.display = "block";

    //                 // Exit the loop once the button is found and hidden
    //             } else {
    //                 console.log("OneUpCommandBar not found, rechecking...");
    //             }

    //             const helpbutton = iframeDocument.getElementById("m_excelEmbedRenderer_m_ewaEmbedViewerBar") as HTMLElement;
    //             if (helpbutton) {
    //                 helpbutton.style.display = "none"
    //             }
    //         }
    //     } catch (error) {
    //         console.error("Error accessing iframe content:", error);
    //     }

    //     // Re-check after a short delay if the button wasn't found
    //     // setTimeout(checkAndHideButton, 100);
    // };

    // Start checking for the button


    // Component did mount lifecycle method to hide the button when the component is mounted
    useEffect(() => {
        debugger
        if (iframeRef.current) {
            iframeRef.current.onload = () => {
                // Wait a little bit to make sure the content is fully loaded
                // setTimeout(() => {
                //     this.hideButtonInPDF();
                //     //this.checkAndHideButton();
                // }, 1000); // Adjust the delay if needed
                const checkAndHideButton = () => {
                    try {
                        //const iframeDocument = this.iframeRef.current.contentWindow?.document;
                        const iframe = document.getElementById("myFileViewerIframe") as HTMLIFrameElement;
                        const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;

                        const toggle = document.getElementById("ToggleAccessibilityViewMode") as HTMLElement;
                        const togEditicongle = document.getElementById("EditDocumentFlyoutAnchor") as HTMLElement;
                        const print = document.getElementById("PrintDocumentDirect") as HTMLElement;
                        const fileshare = document.getElementById("FileSharing") as HTMLElement;
                        const moreview = document.getElementById("MoreViewerOptionsFlyoutAnchor") as HTMLElement;
                        const SettingButton = document.getElementById("SettingButton") as HTMLElement;
                        const ControlMenu = document.getElementById("ControlMenu-Small14") as HTMLElement;
                        const Fullscreen = document.getElementById("fseaFullScreen-Small14") as HTMLElement;
                        const feedbackanchor = document.getElementById("m_excelEmbedRenderer_m_feedbackAnchor") as HTMLElement;
                        const backstageanchor = document.getElementById("m_excelEmbedRenderer_m_backstageAnchor") as HTMLElement;
                        const refreshdataanchor = document.getElementById("m_excelEmbedRenderer_m_refreshDataAnchor") as HTMLElement;
                        const hostviewer = document.getElementById("m_excelEmbedRenderer_m_hostViewAnchor") as HTMLElement;
                        const excelToolbar1 = document.getElementById("m_excelEmbedRenderer_m_ewaEmbedViewerBar") as HTMLElement;
                        const rightbutton = document.getElementById('buttonDockRight');
                        if (rightbutton) {
                            rightbutton.style.display = "none"
                        }
                        if (excelToolbar1) {
                            excelToolbar1.style.display = "none"
                        }
                        if (feedbackanchor) {
                            feedbackanchor.style.display = "none"
                        }
                        if (backstageanchor) {
                            backstageanchor.style.display = "none"
                        }
                        if (refreshdataanchor) {
                            refreshdataanchor.style.display = "none"
                        }
                        if (hostviewer) {
                            hostviewer.style.display = "none"
                        }
                        if (toggle) {
                            toggle.style.display = "none"
                        }
                        if (togEditicongle) {
                            togEditicongle.style.display = "none"
                        }
                        if (print) {
                            print.style.display = "none"
                        }
                        if (fileshare) {
                            fileshare.style.display = "none"
                        }
                        if (moreview) {
                            moreview.style.display = "none"
                        }
                        if (SettingButton) {
                            SettingButton.style.display = "none"
                        }
                        if (ControlMenu) {
                            ControlMenu.style.display = "none"
                        }
                        if (Fullscreen) {
                            Fullscreen.style.display = "none"
                        }
                        if (iframeDocument) {
                            const button = iframeDocument.getElementById("OneUpCommandBar") as HTMLElement;
                            const excelToolbar = iframeDocument.getElementById("m_excelEmbedRenderer_m_ewaEmbedViewerBar") as HTMLElement;
                            const wordToolbartop = iframeDocument.getElementById("ExternalHeaderViewerChromeTopBars") as HTMLElement;
                            const wordToolbarbottm = iframeDocument.getElementById("rightStatusBarRegion-ControlsGroup") as HTMLElement;
                            const ControlMenu1 = iframeDocument.getElementById("ControlMenu-Small14") as HTMLElement;
                            const Fullscreen1 = iframeDocument.getElementById("fseaFullScreen-Small14") as HTMLElement;
                            const feedbackanchor1 = iframeDocument.getElementById("m_excelEmbedRenderer_m_feedbackAnchor") as HTMLElement;
                            const backstageanchor1 = iframeDocument.getElementById("m_excelEmbedRenderer_m_backstageAnchor") as HTMLElement;
                            const refreshdataanchor1 = iframeDocument.getElementById("m_excelEmbedRenderer_m_refreshDataAnchor") as HTMLElement;
                            const hostviewer1 = iframeDocument.getElementById("m_excelEmbedRenderer_m_hostViewAnchor") as HTMLElement;

                            if (ControlMenu1) {
                                ControlMenu1.style.display = "none"
                            }
                            if (Fullscreen1) {
                                Fullscreen1.style.display = "none"
                            }
                            if (excelToolbar) {
                                excelToolbar.style.display = "none"
                            }
                            if (wordToolbartop) {
                                wordToolbartop.style.display = "none"
                            }
                            if (wordToolbarbottm) {
                                wordToolbarbottm.style.display = "none"
                            }
                            if (feedbackanchor1) {
                                feedbackanchor1.style.display = "none"
                            }
                            if (backstageanchor1) {
                                backstageanchor1.style.display = "none"
                            }
                            if (refreshdataanchor1) {
                                refreshdataanchor1.style.display = "none"
                            }
                            if (hostviewer1) {
                                hostviewer1.style.display = "none"
                            }
                            if (button) {
                                console.log("Hiding the OneUpCommandBar element");
                                button.style.display = "block";
                                const commandBar1 = button.querySelectorAll("button");
                                commandBar1.forEach(button => {
                                    button.style.display = "none";
                                });
                                // Show only the "Open" button
                                const openButton = iframeDocument.getElementById("openCommandGroup");
                                const userProfile = iframeDocument.getElementById("presenceCommand");
                                if (userProfile) {
                                    userProfile.style.display = 'none'
                                }
                                if (openButton) {
                                    // console.log("openButton",openButton);
                                    if ((window as any).status === 'Auto Approved') {
                                        openButton.style.display = "block";
                                    }

                                }
                                if (iframeRef.current) iframeRef.current.style.display = "block";


                            } else {
                                console.log("OneUpCommandBar not found, rechecking...");
                            }
                            // if(openInAppButton){
                            //   openInAppButton.style.display='block'
                            // }
                            const helpbutton = iframeDocument.getElementById("m_excelEmbedRenderer_m_ewaEmbedViewerBar") as HTMLElement;
                            if (helpbutton) {
                                helpbutton.style.display = "none"
                            }
                        }
                    } catch (error) {
                        console.error("Error accessing iframe content:", error);
                    }

                    setTimeout(checkAndHideButton, 1000);
                };

                checkAndHideButton();
            };
        }
    }, [props.docurl]);

    const { docurl, showfile } = props;

    return (
        <>
            {console.log('this.props.docurl', docurl, showfile, isVisible)}
            {showfile && isVisible && (
                <div style={{ position: 'relative' }}>

                    <h6>View Document</h6>
                    <iframe
                        ref={iframeRef}
                        id="myFileViewerIframe"
                        //sandbox="allow-same-origin allow-forms allow-popups"
                        src={docurl}  // Dynamically load the URL from docurl prop
                        title="File Viewer"
                        width="100%"
                        height="600px"
                        style={{ border: 'none' }}
                    />

                    <button
                        onClick={handleClose}  // Close button to hide the iframe
                        style={{
                            position: 'absolute',
                            top: '-32px',
                            right: '0px',
                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            cursor: 'pointer',
                            borderRadius: '5px',
                            fontSize: '16px',
                        }}
                    >
                        Close Preview
                    </button>
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '0',
                            right: '0',
                            width: '100px',
                            height: '30px',
                            zIndex: 1000,
                            backgroundColor: 'rgba(0,0,0,0)', // semi-transparent black
                            pointerEvents: 'auto', // block interaction below
                            borderRadius: '4px',
                        }}
                    >

                    </div>

                </div>
            )}
        </>
    );
};

export default FileViewer;
