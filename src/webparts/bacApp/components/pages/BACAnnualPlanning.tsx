import * as React from 'react'
import CustomBreadcrumb from '../common/CustomBreadcrumb';
import "../../../../styles/global.scss";
import { useEffect, useState } from "react";
import { SPFI } from "@pnp/sp";
import { getSP } from "../../loc/pnpjsConfig";
import Select from "react-select";
import Swal from "sweetalert2";
import { MSGraphClientV3 } from "@microsoft/sp-http";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const BACAnnualPlanning = (props: any) => {
  const context = props.context;
  const Breadcrumb = [
    {
      MainComponent: "Home",

      MainComponentURl: "Home",
    },

    {
      MainComponent: "BAC Annual Planning",

      MainComponentURl: "BACAnnualPlanning",
    },
  ];

  const [activeScreen, setActiveScreen] = React.useState("dashboard");
  const [loading, setLoading] = React.useState(true);
  const [division, setDivision] = useState<any>(null);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [department, setDepartment] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [requestDate, setRequestDate] = React.useState<string>("");
  const [requestLogs, setRequestLogs] = React.useState<any[]>([]);
  const [statusChoices, setStatusChoices] = React.useState<string[]>([]);
  const currentYear = new Date().getFullYear();
  const [planningYear, setPlanningYear] = useState<string>("");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [submissionRows, setSubmissionRows] = useState<any[]>([]);
  const [users, setUsers] = React.useState<any[]>([]);
  const [isStrategyDept, setIsStrategyDept] = useState<boolean | null>(null);
  const [isDepartmentHead, setIsDepartmentHead] = useState<boolean | null>(null);
  const [userDepartmentId, setUserDepartmentId] = useState<number | null>(null);
  const [deletedItems, setDeletedItems] = useState<number[]>([]);
  const [consolidationRows, setConsolidationRows] = useState<any[]>([]);
  const [validatedRows, setValidatedRows] = useState<number[]>([]);
  const [submStatusChoices, setSubmStatusChoices] = useState<string[]>([]);
  const [apprStatusChoices, setApprStatusChoices] = useState<string[]>([]);
  const [approvalRows, setApprovalRows] = useState<any[]>([]);
  const [loadingApproval, setLoadingApproval] = useState<boolean>(false);
  const [strategyData, setStrategyData] = useState<any[]>([]);
  const [showConsolidation, setShowConsolidation] = useState(false);
  const [executiveData, setExecutiveData] = useState<any[]>([]);
  const [showExecConsolidation, setShowExecConsolidation] = useState(false);
  const [strategyComment, setStrategyComment] = useState("");
  const [executiveComment, setExecutiveComment] = useState("");
  const [isExecutiveDept, setIsExecutiveDept] = useState<boolean | null>(null);
  const [firstLoadForSubmissions, setFirstLoadForSubmissions] = useState(false);
  const [showFinalTable, setShowFinalTable] = useState<boolean>(true);
  const [showConsolidationTable, setShowConsolidationTable] = useState<boolean>(false);
  const [showFinalConsolidation, setShowFinalConsolidation] = useState(false);
  const [pendingRequestCount, setPendingRequestCount] = useState<number>(0);
  const [approvedRequestCount, setApprovedRequestCount] = useState<number>(0);
  const [pendingReviewCount, setPendingReviewCount] = useState<number>(0);
  const [submittedCount, setSubmittedCount] = useState<number>(0);
  const [allRequestCount, setAllRequestCount] = useState<number>(0);
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [strategyFilter, setStrategyFilter] = useState("Pending");
  const [executiveFilter, setExecutiveFilter] = useState("Pending");
  const [isReadOnly, setIsReadOnly] = React.useState<boolean>(false);



  const sp: SPFI = getSP();

  const validateSendRequestForm = () => {
    // Remove old error borders
    Array.from(document.getElementsByClassName("border-on-error")).forEach(
      (el: Element) => el.classList.remove("border-on-error")
    );

    let isValid = true;

    // Division
    const divisionField = document.getElementById("DivisionField");
    if (!division) {
      divisionField?.classList.add("border-on-error");
      isValid = false;
    }

    // Department
    const departmentField = document.getElementById("DepartmentField");
    if (!department) {
      departmentField?.classList.add("border-on-error");
      isValid = false;
    }

    // Planning Year
    const yearField = document.getElementById("PlanningYearField");
    if (!planningYear || planningYear.trim() === "") {
      yearField?.classList.add("border-on-error");
      isValid = false;
    }

    if (!isValid) {
      Swal.fire({
        title: "Please fill all the mandatory fields.",
        icon: "warning",
        confirmButtonText: "OK",
        backdrop: false,
        allowOutsideClick: false,
      });
      return false;
    }

    return true;
  };

  const validateDeptSubmissionForm = () => {

    // Remove old error borders
    Array.from(document.getElementsByClassName("border-on-error")).forEach(
      (el: Element) => el.classList.remove("border-on-error")
    );

    let isValid = true;

    submissionRows.forEach((row: any, pIdx: number) => {

      /* ========= PARENT VALIDATION ========= */

      const initiativeField = document.getElementById(`Initiative_${pIdx}`);
      if (!row.Initiative || row.Initiative.trim() === "") {
        initiativeField?.classList.add("border-on-error");
        isValid = false;
      }

      const justificationField = document.getElementById(`Justification_${pIdx}`);
      if (!row.Justification || row.Justification.trim() === "") {
        justificationField?.classList.add("border-on-error");
        isValid = false;
      }

      const deliverableField = document.getElementById(`Deliverable_${pIdx}`);
      if (!row.Deliverable || row.Deliverable.trim() === "") {
        deliverableField?.classList.add("border-on-error");
        isValid = false;
      }


      /* ========= CHILD VALIDATION ========= */

      row.children?.forEach((child: any, cIdx: number) => {

        if (child.__hidden) return; // skip hidden rows

        const hasAnyData =
          (child.Task && child.Task.trim() !== "") ||
          (child.BudgetItem && child.BudgetItem.trim() !== "") ||
          (child.Owner && child.Owner.trim() !== "") ||
          Number(child.BudgetAmount) > 0;

        // If completely blank row, skip it
        // if (!hasAnyData) return;


        const taskField = document.getElementById(`Task_${pIdx}_${cIdx}`);
        if (!child.Task || child.Task.trim() === "") {
          taskField?.classList.add("border-on-error");
          isValid = false;
        }

        const budgetItemField = document.getElementById(`BudgetItem_${pIdx}_${cIdx}`);
        if (!child.BudgetItem || child.BudgetItem.trim() === "") {
          budgetItemField?.classList.add("border-on-error");
          isValid = false;
        }

        const ownerField = document.getElementById(`Owner_${pIdx}_${cIdx}`);
        if (!child.Owner || child.Owner.trim() === "") {
          ownerField?.classList.add("border-on-error");
          isValid = false;
        }

        const amountField = document.getElementById(`BudgetAmount_${pIdx}_${cIdx}`);
        if (!child.BudgetAmount || Number(child.BudgetAmount) <= 0) {
          amountField?.classList.add("border-on-error");
          isValid = false;
        }




        // Check if ALL months are zero or empty
        /* ========= MONTH VALIDATION (Jan–Dec) ========= */
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // If ANY month is empty/zero → throw error
        const hasIncompleteMonth = months.some(m => !child[m] || Number(child[m]) === 0);

        if (hasIncompleteMonth) {
          months.forEach(m => {
            const monthField = document.getElementById(`${m}_${pIdx}_${cIdx}`);
            if (!child[m] || Number(child[m]) === 0) {
              monthField?.classList.add("border-on-error");
            }
          });

          isValid = false;
        }


      });

    });

    if (!isValid) {
      Swal.fire({
        title: "Please fill all the mandatory fields.",
        icon: "warning",
        confirmButtonText: "OK",
        backdrop: false,
        allowOutsideClick: false,
      });
      return false;
    }

    return true;
  };

  // Stop loader after initial page load
  useEffect(() => {
    const stopLoader = async () => {
      try {
        // Wait for initial async data (users + divisions) to load
        await Promise.all([
          sp.web.currentUser(),
          sp.web.lists.getByTitle("DivisionMasterList").items.top(1)()
        ]);
      } catch (e) {
       // console.error("Initial load error:", e);
      } finally {
        setLoading(false);   //  THIS STOPS LOADER ON PAGE OPEN
      }
    };

    stopLoader();
  }, []);

  //fetch division
  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const divItems = await sp.web.lists
          .getByTitle("DivisionMasterList")
          .items();

        const divOptions = divItems.map((d: any) => ({
          value: d.Id,
          label: d.Division //  Column name Division
        }));

        setDivisions(divOptions);
      } catch (error) {
      }
    };

    fetchDivisions();
  }, []);

  //fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!division) {
        setDepartments([]);
        return;
      }

      try {
        // setLoading(true);

        const divItem: any = await sp.web.lists
          .getByTitle("DivisionMasterList")
          .items
          .select("Id", "Department/Id", "Department/DepartmentName")
          .expand("Department")
          .filter(`Id eq ${division.value}`)();

        const deptData = divItem?.[0]?.Department;

        const deptLookup = Array.isArray(deptData)
          ? deptData
          : deptData
            ? [deptData]
            : [];

        const deptOptions = deptLookup.map((d: any) => ({
          value: d.Id,
          label: d.DepartmentName,
        }));

        setDepartments(deptOptions);

      } catch (err) {
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [division]);

  const visibleLogs = requestLogs.filter(item => {
    // Strategy users -> see all
    if (isStrategyDept) return true;

    // Department head -> see only own department records
    if (isDepartmentHead) {
      return item.Department?.Id === userDepartmentId;
    }

    // Others -> see nothing
    return false;
  });




  React.useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setRequestDate(today);
  }, []);


  useEffect(() => {
    const checkDepartmentHead = async () => {
      try {

        const currentUser = await sp.web.currentUser();

        //  Find department where this user is DepartmentHead
        const deptItems = await sp.web.lists
          .getByTitle("DepartmentMasterList")
          .items.select("Id", "DepartmentHead/Id")
          .expand("DepartmentHead")
          .filter(`DepartmentHeadId eq ${currentUser.Id}`)();

        if (deptItems.length > 0) {

          setIsDepartmentHead(true);
          setUserDepartmentId(deptItems[0].Id); // department ID
        } else {
          setIsDepartmentHead(false);
          setUserDepartmentId(null);
        }

      } catch (err) {
        setIsDepartmentHead(false);
        setUserDepartmentId(null);
      }
    };

    checkDepartmentHead();
  }, []);


  React.useEffect(() => {
    //  Don't load data until roles are loaded
    if (isStrategyDept === null || isDepartmentHead === null) {
      return;
    }

    if (isDepartmentHead && userDepartmentId === null) {
      return;
    }

    const loadData = async () => {
      try {

        const currentUser = await sp.web.currentUser();

        let filterQuery = "";

        //  Strategy department user
        if (isStrategyDept) {
          filterQuery = "";
        }

        //  Department head user
        else if (isDepartmentHead) {
          filterQuery = `DepartmentId eq ${userDepartmentId}`;
        }

        // ❌ Normal user
        else {
          filterQuery = "Id eq -1";
        }
        const items = await sp.web.lists
          .getByTitle("BACAnnualPlanningRequestList")
          .items.select(
            "Id",
            "Title",
            "Status",
            "RequestedDate",
            "RequestedBy/Id",
            "RequestedBy/Title",
            "Division/Id",
            "Division/Division",
            "Department/Id",
            "Department/DepartmentName",
            "BudgetPlanningYear"
          )
          .expand("RequestedBy", "Division", "Department")
          .filter(filterQuery)
          .orderBy("Created", false)();
        setRequestLogs(items);

        //  Status choices
        const field = await sp.web.lists
          .getByTitle("BACAnnualPlanningRequestList")
          .fields.getByInternalNameOrTitle("Status")
          .select("Choices")();

        setStatusChoices(field?.Choices ?? []);
      } catch (error) {
      }
    };

    loadData();
  }, [isStrategyDept, isDepartmentHead, userDepartmentId]);




  const handleSendRequest = async (e: any) => {
    e.preventDefault();

    const isValid = validateSendRequestForm();
    if (!isValid) {
      return;
    }


    try {
      setLoading(true);

      const currentUser = await sp.web.currentUser();

      // ✅ CHECK: Only one request per department per year
      const existing = await sp.web.lists
        .getByTitle("BACAnnualPlanningRequestList")
        .items.filter(
          `DepartmentId eq ${department.value} and BudgetPlanningYear eq '${planningYear}'`
        )();

      if (existing.length > 0) {
        Swal.fire({
          icon: "warning",
          title: "Duplicate Request",
          text: "This department has already submitted a request for the selected year."
        });

        setLoading(false);
        return;
      }

      //  Status choose dynamically — here default = first option OR pending if exists
      const defaultStatus =
        statusChoices.find((s: any) => s.toLowerCase() === "pending") ||
        statusChoices[0];

      //  Fetch DepartmentHead from DepartmentMasterList
      const deptHead = await sp.web.lists
        .getByTitle("DepartmentMasterList")
        .items.getById(department.value)
        .select("DepartmentHead/Id")
        .expand("DepartmentHead")();

      const departmentHeadId = deptHead?.DepartmentHead?.Id || null;

      //  Save request
      await sp.web.lists
        .getByTitle("BACAnnualPlanningRequestList")
        .items.add({
          Title: "",
          Status: "Pending",
          RequestedDate: requestDate,
          RequestedById: currentUser.Id,
          DivisionId: division.value,
          DepartmentId: department.value,
          BudgetPlanningYear: planningYear,
          DepartmentHeadId: departmentHeadId //  saving dept head
        });


      //  Reload list data
      const items = await sp.web.lists
        .getByTitle("BACAnnualPlanningRequestList")
        .items
        .select(
          "Id",
          "Title",
          "Status",
          "RequestedDate",
          "RequestedBy/Title",
          "Division/Id",
          "Division/Title",
          "Division/Division",
          "Department/DepartmentName",
          "BudgetPlanningYear"
        )
        .expand("RequestedBy", "Department", "Division")
        .orderBy("Created", false)();

      setRequestLogs(items);

      //  Reset Department dropdown only
      setDepartment(null);

    } catch (error) {

    }
    finally {
      setLoading(false);
    }
  };

  //check for sp StrategyDepartment group
  useEffect(() => {

    const checkGroups = async () => {
      try {
        // Get current user
        const currentUser = await sp.web.currentUser();

        // ======================================================
        // 🔹 CHECK StrategyDepartment GROUP
        // ======================================================
        let strategyUsers: any[] = [];
        try {
          strategyUsers = await sp.web.siteGroups
            .getByName("StrategyDepartment")
            .users();
        } catch (e) {
          // console.warn("⚠️ StrategyDepartment group missing?", e);
        }

        const isStrategy = strategyUsers.some(
          (u: any) => u.Id === currentUser.Id
        );
        setIsStrategyDept(isStrategy);

        // ======================================================
        // 🔹 CHECK ExecutiveDepartment GROUP
        // ======================================================
        let execUsers: any[] = [];
        try {
          execUsers = await sp.web.siteGroups
            .getByName("ExecutiveDepartment")
            .users();
        } catch (e) {
          // console.warn("⚠️ ExecutiveDepartment group missing?", e);
        }

        const isExecutive = execUsers.some(
          (u: any) => u.Id === currentUser.Id
        );
        setIsExecutiveDept(isExecutive);

       

      } catch (error) {
       // console.error("❌ Error checking groups:", error);
      }
    };

    checkGroups();

  }, []);

  const refreshSendRequestData = async () => {
    try {
      setLoading(true);

      const updatedRequests = await sp.web.lists
        .getByTitle("BACAnnualPlanningRequestList")
        .items
        .select(
          "Id",
          "Title",
          "Status",
          "RequestedDate",
          "RequestedBy/Id",
          "RequestedBy/Title",
          "Division/Id",
          "Division/Division",
          "Department/Id",
          "Department/DepartmentName",
          "BudgetPlanningYear"
        )
        .expand("RequestedBy", "Division", "Department")
        .orderBy("Created", false)();

      setRequestLogs(updatedRequests);   //  updates Send Request tab
    } catch (err) {
     // console.error("Error refreshing Send Request data:", err);
    } finally {
      setLoading(false);
    }
  };


  const formatDisplayDate = (isoDate?: string) => {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).replace(/,/g, "");
  };

  const setActive = (screen: string) => {
    setActiveScreen(screen);
  };

  const showScreen = (screen: string) => {
    setActiveScreen(screen);

    // Reset view states when navigating
    switch (screen) {
      case "dashboard":
        setShowConsolidation(false);
        setShowExecConsolidation(false);
        setShowFinalConsolidation(false);
        break;
      case "sendRequest":
        setShowConsolidation(false);
        setShowExecConsolidation(false);
        setShowFinalConsolidation(false);
        refreshSendRequestData();
        break;
      case "submissions":
        setShowConsolidation(false);
        setShowExecConsolidation(false);
        setShowFinalConsolidation(false);
        break;
      case "consolidation":
        setShowExecConsolidation(false);
        setShowFinalConsolidation(false);
        break;
      case "strategyReview":
        setShowFinalConsolidation(false);
        break;
      case "executiveReview":
        // Keep executive consolidation if already open
        break;
      case "finalReport":
        // Keep final consolidation if already open
        break;
    }
  };

  const confirmAndExecute = (
    action: (...args: any[]) => void | Promise<void>,
    message: string = "Are you sure you want to proceed?",
    ...args: any[]
  ) => {

    //  Check if this is Rework action
    const isRework = message.toLowerCase().includes("rework");

    Swal.fire({
      text: isRework ? "Do you want to rework this request?" : message,
      icon: isRework ? "question" : "success",
      showCancelButton: isRework,           // only for rework
      confirmButtonText: isRework ? "Yes" : "Ok",
      cancelButtonText: isRework ? "No" : "Cancel",
    }).then((result) => {

      if (result.isConfirmed) {

        setLoading(true);

        setTimeout(async () => {
          try {
            await action(...args);

            //  Show success ONLY for REWORK
            if (isRework) {
              Swal.fire({
                text: "Sent for Rework",
                icon: "success",
                timer: 2000,
                showConfirmButton: false
              }).then(() => {
                setLoading(false);   //  STOP LOADER FOR REWORK
              });
            }

          } catch (err) {
           // console.error("Action failed:", err);
          }
        }, 1000); // 1 second delay
      }

    });
  };


  // Unified navigation function
  const navigateToScreen = async (screen: string) => {
    setLoading(true);  //  START loader

    showScreen(screen);

    try {
      switch (screen) {
        case "strategyReview":
          if (isStrategyDept) {
            await loadApprovalRows("StrategyReview");
          }
          break;

        case "executiveReview":
          if (isExecutiveDept) {
            await loadApprovalRows("ExecutiveReview");
          }
          break;

        case "consolidation":
          if (selectedRequest?.Id) {
            await loadConsolidationRows(selectedRequest.Id);
          }
          break;

        case "submissions":
          // handled by useEffect
          break;

        case "dashboard":
          await loadDashboardRequestCounts();
          await loadPendingReviewCount();
          await loadSubmittedRequestCount();
          break;
      }
    } catch (err) {
     // console.error("Navigation error:", err);
    } finally {
      setTimeout(() => {
        setLoading(false);   //  STOP loader
      }, 300); // smooth UX
    }
  };




  // onclcik view
  // const handleViewClick = async (item: any) => {

  //   if (!item?.Id) {
  //    // console.error("Invalid request item", item);
  //     //alert("Unable to open request. Please reload.");
  //     return;
  //   }

  //   //  Always load fresh, fully expanded request
  //   const fullRecord = await sp.web.lists
  //     .getByTitle("BACAnnualPlanningRequestList")
  //     .items.getById(item.Id)
  //     .select(
  //       "Id",
  //       "BudgetPlanningYear",
  //       "Division/Division",
  //       "Department/DepartmentName",
  //       "RequestedDate",
  //       "Status",
  //       "RequestedBy/Title",
  //       "RequestedBy/Id"
  //     )
  //     .expand("Division", "Department", "RequestedBy")();

  //   setSelectedRequest(fullRecord);
  //   setShowConsolidation(false);  // or false/default
  //   setFirstLoadForSubmissions(true);
  //   setActiveScreen("submissions");
  // };

  const handleViewClick = async (item: any) => {

    if (!item?.Id) {
     // console.error("Invalid request item", item);
      return;
    }

    // Always load fresh data
    const fullRecord = await sp.web.lists
      .getByTitle("BACAnnualPlanningRequestList")
      .items.getById(item.Id)
      .select(
        "Id",
        "BudgetPlanningYear",
        "Division/Division",
        "Department/DepartmentName",
        "RequestedDate",
        "Status",
        "RequestedBy/Title",
        "RequestedBy/Id"
      )
      .expand("Division", "Department", "RequestedBy")();

    setSelectedRequest(fullRecord);

    // ✅ IF APPROVED → show CONSOLIDATION (read only)
    if (fullRecord?.Status === "Approved") {
      setIsReadOnly(true);
      setShowFinalTable(false);
      setShowFinalConsolidation(true);
      setActiveScreen("finalReport");

      await loadConsolidationRows(fullRecord.Id, { validatedOnly: false });

      return;
    }

    // ✅ ELSE (Pending OR Rework) → show DEPT SUBMISSIONS
    setIsReadOnly(false);
    setShowFinalConsolidation(false);
    setShowConsolidation(false);
    setFirstLoadForSubmissions(true);

    // ✅ THIS TRIGGERS your useEffect which loads UNVALIDATED rows
    setActiveScreen("submissions");
  };




  //department submission
  useEffect(() => {
    const loadSubmissions = async () => {
      if (activeScreen !== "submissions" || !selectedRequest?.Id) return;

      setLoading(true);
      try {
        const rawRows = await sp.web.lists
          .getByTitle("BACDepartmentSubmissions")
          .items
          .select(
            "*",
            "Id",
            "Initiative",
            "Justification",
            "Deliverable",
            "Task",
            "BudgetItem",
            "BudgetAmount",
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",

            "Timeline",

            // Owner fields
            "Owner/Id",
            "Owner/Title",
            "Owner/EMail",

            // Parent Annual Request Id
            "BACAnnualPlanningRequestListIDId",
            "BACAnnualPlanningRequestListID/Id",

            // Parent-child link Id
            "BACDepartmentSubmissionsIDId",
            "BACDepartmentSubmissionsID/Id"
          )
          .expand(
            "Owner",
            "BACAnnualPlanningRequestListID",
            "BACDepartmentSubmissionsID"
          )
          .filter(`BACAnnualPlanningRequestListIDId eq ${selectedRequest.Id} and (Validated eq 0 or Validated eq null)`)();
        // .filter(`
        //     BACAnnualPlanningRequestListIDId eq ${selectedRequest.Id}
        //     and (
        //          BACAnnualPlanningRequestListID/Status eq 'Draft'
        //       or BACAnnualPlanningRequestListID/Status eq 'Rework'
        //     )
        // `)
        // ();

        // --- Separate parent & child rows ---
        const parents = rawRows.filter(r => r.BACDepartmentSubmissionsIDId === null);
        const children = rawRows.filter(r => r.BACDepartmentSubmissionsIDId !== null);

        // Helper: returns email for a given user Id if Owner object missing
        const getEmailById = (id: any) => {
          if (!id) return "";
          const u = users.find(u => u.Id === id);
          return u?.Email || "";
        };

        // --- Build structured parent + child dataset ---
        const finalData = parents.map(parent => {
          // Get matching children
          const relatedChildren = children.filter(child =>
            child.BACDepartmentSubmissionsIDId === parent.Id ||
            child.BACDepartmentSubmissionsID?.Id === parent.Id
          );

          // Normalize children
          const mappedChildren = relatedChildren.map(child => ({
            ...child,
            Id: child.Id,
            // Owner normalization
            Owner: child.Owner?.EMail || child.Owner?.Title || "",


            // Timeline normalization
            Timeline: child.Timeline
              ? child.Timeline.split("T")[0]
              : "",
            BudgetAmount: Number(child.BudgetAmount) || 0,
            // Numeric normalization
            Jan: Number(child.Jan) || 0,
            Feb: Number(child.Feb) || 0,
            Mar: Number(child.Mar) || 0,
            Apr: Number(child.Apr) || 0,
            May: Number(child.May) || 0,
            Jun: Number(child.Jun) || 0,
            Jul: Number(child.Jul) || 0,
            Aug: Number(child.Aug) || 0,
            Sep: Number(child.Sep) || 0,
            Oct: Number(child.Oct) || 0,
            Nov: Number(child.Nov) || 0,
            Dec: Number(child.Dec) || 0,
          }));

          // Normalize parent
          return {
            ...parent,

            Owner: parent.Owner?.EMail || parent.Owner?.Title || "",


            Timeline: parent.Timeline
              ? parent.Timeline.split("T")[0]
              : "",
            BudgetAmount: Number(parent.BudgetAmount) || 0,
            Jan: Number(parent.Jan) || 0,
            Feb: Number(parent.Feb) || 0,
            Mar: Number(parent.Mar) || 0,
            Apr: Number(parent.Apr) || 0,
            May: Number(parent.May) || 0,
            Jun: Number(parent.Jun) || 0,
            Jul: Number(parent.Jul) || 0,
            Aug: Number(parent.Aug) || 0,
            Sep: Number(parent.Sep) || 0,
            Oct: Number(parent.Oct) || 0,
            Nov: Number(parent.Nov) || 0,
            Dec: Number(parent.Dec) || 0,

            // Attach children
            children: mappedChildren


          };
        });
        // If this is first open from VIEW and no records exist → create default rows
        //  ALWAYS ensure at least ONE default row when clicking VIEW
        if (finalData.length === 0) {

          const defaultParent = {
            BACAnnualPlanningRequestListIDId: selectedRequest.Id,
            Initiative: "",
            Justification: "",
            Deliverable: "",
            Owner: "",
            Timeline: "",
            Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
            Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0,

            children: [
              {
                BACAnnualPlanningRequestListIDId: selectedRequest.Id,
                BACDepartmentSubmissionsIDId: null,
                Task: "",
                BudgetItem: "",
                BudgetAmount: 0,
                Owner: "",
                Timeline: "",
                Jan: 0, Feb: 0, Mar: 0, Apr: 0,
                May: 0, Jun: 0, Jul: 0, Aug: 0,
                Sep: 0, Oct: 0, Nov: 0, Dec: 0,
              }
            ]
          };

          setSubmissionRows([defaultParent]);
          return;
        }


        // Update UI
        setSubmissionRows(finalData);

      } catch (err) {
       // console.error("Error loading submissions:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, [activeScreen, selectedRequest]);





  const updateField = (index: number, field: string, value: any) => {
    setSubmissionRows(prev =>
      prev.map((row, i) =>
        i === index
          ? { ...row, [field]: value }  //  new object
          : row
      )
    );
  };


  const handleSaveSubmissions = async () => {
    try {


      //  DELETE ITEMS from SharePoint
      if (deletedItems.length > 0) {
        for (const delId of deletedItems) {
          try {
            await sp.web.lists
              .getByTitle("BACDepartmentSubmissions")
              .items.getById(delId)
              .delete();

          } catch (err) {
          }
        }

        // Clear deleted list after sync
        setDeletedItems([]);
      }

      for (const row of submissionRows) {


        //  2) OPTIONAL: if you also want to skip saving a parent that ends up with no children AND is blank itself:
        // 🔍 Skip parent IF truly empty AND no children
        // ⚠️ FIX: detect truly blank parent + blank default children
        const parentHasContent =
          row.Initiative?.trim() !== "" ||
          row.Justification?.trim() !== "" ||
          row.Deliverable?.trim() !== "" ||
          row.Owner?.trim() !== "" ||
          months.some(m => Number(row[m] || 0) > 0);

        // Child has ANY content?
        const childHasContent = row.children.some((child: any) =>
          (child.Task && child.Task.trim() !== "") ||
          (child.BudgetItem && child.BudgetItem.trim() !== "") ||
          (child.Owner && child.Owner.trim() !== "") ||
          Number(child.BudgetAmount) > 0 ||
          months.some(m => Number(child[m] || 0) > 0)
        );

        const parentIsBlank = !parentHasContent && !childHasContent;

       

        if (parentIsBlank) {
        
          continue;
        }





        // Convert Owner Email --> Id
        const ownerUser = users.find((u: any) => u.Email === row.Owner);
        const ownerId = ownerUser ? ownerUser.Id : null;

        const parentPayload = {
          Initiative: row.Initiative,
          Justification: row.Justification,
          Deliverable: row.Deliverable,
          //         Task: row.Task,
          //         BudgetItem: row.BudgetItem,
          // BudgetAmount: row.BudgetAmount,

          Jan: row.Jan,
          Feb: row.Feb,
          Mar: row.Mar,
          Apr: row.Apr,
          May: row.May,
          Jun: row.Jun,
          Jul: row.Jul,
          Aug: row.Aug,
          Sep: row.Sep,
          Oct: row.Oct,
          Nov: row.Nov,
          Dec: row.Dec,

          Timeline: row.Timeline || null,
          OwnerId: ownerId,
          BACAnnualPlanningRequestListIDId: selectedRequest.Id,
        };



        //  SAVE PARENT
        let parentId = row.Id;
       

        if (!row.Id) {
          const result = await sp.web.lists
            .getByTitle("BACDepartmentSubmissions")
            .items.add(parentPayload);

          parentId = result.data.Id;
        } else {

          await sp.web.lists
            .getByTitle("BACDepartmentSubmissions")
            .items.getById(row.Id)
            .update(parentPayload);

          parentId = row.Id;
        }

      


        // NOW SAVE CHILDREN (Row.children)

        if (row.children && row.children.length > 0) {

          for (const child of row.children) {

            const childHasContent =
              (child.Task && child.Task.trim() !== "") ||
              (child.BudgetItem && child.BudgetItem.trim() !== "") ||
              (child.Owner && child.Owner.trim() !== "") ||
              Number(child.BudgetAmount) > 0 ||
              months.some(m => Number(child[m] || 0) > 0);

           

            if (!childHasContent) {
             
              continue; //  DO NOT SAVE THIS CHILD
            }

            const childOwner = users.find((u: any) => u.Email === child.Owner);
            const childOwnerId = childOwner ? childOwner.Id : null;

            const childPayload = {
              Task: child.Task,
              BudgetItem: child.BudgetItem,
              BudgetAmount: child.BudgetAmount,
              Timeline: child.Timeline || null,
              OwnerId: childOwnerId,
              Jan: child.Jan, Feb: child.Feb, Mar: child.Mar, Apr: child.Apr,
              May: child.May, Jun: child.Jun, Jul: child.Jul, Aug: child.Aug,
              Sep: child.Sep, Oct: child.Oct, Nov: child.Nov, Dec: child.Dec,

              //  Important
              BACAnnualPlanningRequestListIDId: selectedRequest.Id,
              BACDepartmentSubmissionsIDId: parentId
            };

            console.log("🟧 DEBUG: Attempting to save CHILD");
            console.log("Child data:", JSON.parse(JSON.stringify(child)));
            console.log("Child payload:", childPayload);
            console.log("Is default empty child:",
              !child.Task &&
              !child.BudgetItem &&
              (!child.BudgetAmount || child.BudgetAmount === 0) &&
              (!child.Owner || child.Owner === "") &&
              ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                .every(m => !child[m] || child[m] === 0)
            );

            if (child.Id) {
              const res = await sp.web.lists
                .getByTitle("BACDepartmentSubmissions")
                .items.getById(child.Id)
                .update(childPayload);
            } else {
              const res = await sp.web.lists
                .getByTitle("BACDepartmentSubmissions")
                .items.add(childPayload);
              child.Id = res.data.Id;
            }
          }
        }

      }

      // //alert("Parent + child submissions saved ");

    } catch (err) {
      //alert("Save failed ");
    }
  };




  const handleSubmitToConsolidation = async () => {
    if (!selectedRequest?.Id) {
      //alert("Open a request (click View) before submitting to consolidation.");
      return;
    }

    await handleSaveSubmissions();
    await sp.web.lists
      .getByTitle("BACAnnualPlanningRequestList")
      .items.getById(selectedRequest.Id)
      .update({ Status: "Pending" });

    // //alert("Submitted to Consolidation and status set to Pending.");
    setActiveScreen("consolidation");

    // call with the captured ID to avoid stale state
    const reqId = selectedRequest.Id;
    // optional small delay is fine but not required:
    // setTimeout(() => loadConsolidationRows(reqId), 0);
    loadConsolidationRows(reqId);
  };


  // const onlyValidated =
  //   activeScreen === "strategyReview" || activeScreen === "executiveReview";

  const loadConsolidationRows = async (requestId: number, options?: { validatedOnly?: boolean }) => {
    setValidatedRows([]);
    if (!requestId) {
      // console.warn("⚠️ loadConsolidationRows called with no requestId");
      return;
    }
    const validatedOnly = options?.validatedOnly ?? false
    const timerLabel = `⏱ Consolidation Load Time ${requestId}-${Date.now()}`;

    
    console.time(timerLabel);

    try {
      setLoading(true);
      const rawRows: any[] = await sp.web.lists
        .getByTitle("BACDepartmentSubmissions")
        .items.select(
          "Id",
          "Initiative",
          "Justification",
          "Deliverable",
          "Task",
          "BudgetItem",
          "BudgetAmount",
          "Owner/Id",
          "Owner/Title",
          "Owner/EMail",
          "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
          "BACAnnualPlanningRequestListIDId",
          "BACDepartmentSubmissionsIDId", "Validated"
        )
        .expand("Owner")
        .filter(
          validatedOnly
            ? `BACAnnualPlanningRequestListIDId eq ${requestId} and Validated eq 1`
            : `BACAnnualPlanningRequestListIDId eq ${requestId}`
        )();

      console.log("📦 Raw items fetched:", rawRows?.length || 0);

      if (!rawRows || rawRows.length === 0) {
        // console.warn("❌ No department submissions found for this Request ID");
        console.timeEnd(timerLabel);
        setConsolidationRows([]); // ensure UI clears
        return;
      }

      // parents: those records without BACDepartmentSubmissionsIDId (top-level)
      const parents = rawRows.filter(r => r.BACDepartmentSubmissionsIDId === null);
      console.log("👨‍👧 Total parent records found:", parents.length);

      // Build grouped structure: { parent: {...}, children: [...] }
      const grouped: any[] = [];

      parents.forEach((parent, pIndex) => {
        console.group(`🧩 Parent [${pIndex + 1}] — ${parent.Initiative || "Untitled"}`);
        console.log("➡️ Parent raw object:", parent);

        // children that reference this parent
        const relatedChildren = rawRows.filter(c => c.BACDepartmentSubmissionsIDId === parent.Id);
        console.log("   ↳ Raw children count:", relatedChildren.length);

        // filter out children with 0 total across months
        // const validChildren = relatedChildren.filter(child => {
        //   const months = [
        //     child.Jan, child.Feb, child.Mar, child.Apr, child.May, child.Jun,
        //     child.Jul, child.Aug, child.Sep, child.Oct, child.Nov, child.Dec
        //   ];
        //   const total = months.reduce((a, b) => a + (parseFloat(b) || 0), 0);
        //   console.log(`   • Child [${child.Id}] total:`, total);
        //   return total > 0;
        // });
        const validChildren = relatedChildren;


        console.log("    Valid (non-zero) children:", validChildren.length);

        // compute parent total (in case parent itself has month values)
        const parentTotal =
          (parseFloat(parent.Jan) || 0) +
          (parseFloat(parent.Feb) || 0) +
          (parseFloat(parent.Mar) || 0) +
          (parseFloat(parent.Apr) || 0) +
          (parseFloat(parent.May) || 0) +
          (parseFloat(parent.Jun) || 0) +
          (parseFloat(parent.Jul) || 0) +
          (parseFloat(parent.Aug) || 0) +
          (parseFloat(parent.Sep) || 0) +
          (parseFloat(parent.Oct) || 0) +
          (parseFloat(parent.Nov) || 0) +
          (parseFloat(parent.Dec) || 0);

        console.log("   📊 Parent total:", parentTotal);

        // If neither parent nor any child has values -> skip entirely
        //  Only skip if parent and all children are fully zero
        // Skip parent only if fully blank AND no children
        const parentIsBlank =
          (!parent.Initiative || parent.Initiative.trim() === "") &&
          (!parent.Justification || parent.Justification.trim() === "") &&
          (!parent.Deliverable || parent.Deliverable.trim() === "") &&
          (!parent.Owner || parent.Owner.trim() === "") &&
          ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            .every(m => Number(parent[m] || 0) === 0);

        if (parentIsBlank && relatedChildren.length === 0) {
          console.log("⏭️ Skipping empty parent row");
          return;
        }


        // if (parentTotal === 0 && allChildrenZero) {
        //   // console.warn("🚫 Skipping parent with 0 total and all children also 0");
        //   console.groupEnd();
        //   return;
        // }


        // Normalize parent object we'll store
        const normalizedParent = {
          Id: parent.Id,
          Initiative: parent.Initiative || "",
          Justification: parent.Justification || "",
          Deliverable: parent.Deliverable || "",
          Owner: parent.Owner ? (parent.Owner.Title || parent.Owner.EMail) : "",
          Jan: Number(parent.Jan) || 0,
          Feb: Number(parent.Feb) || 0,
          Mar: Number(parent.Mar) || 0,
          Apr: Number(parent.Apr) || 0,
          May: Number(parent.May) || 0,
          Jun: Number(parent.Jun) || 0,
          Jul: Number(parent.Jul) || 0,
          Aug: Number(parent.Aug) || 0,
          Sep: Number(parent.Sep) || 0,
          Oct: Number(parent.Oct) || 0,
          Nov: Number(parent.Nov) || 0,
          Dec: Number(parent.Dec) || 0,
          Total: parentTotal
        };

        // Normalize children
        const normalizedChildren = validChildren.map((child: any) => {
          const cTotal =
            (parseFloat(child.Jan) || 0) + (parseFloat(child.Feb) || 0) +
            (parseFloat(child.Mar) || 0) + (parseFloat(child.Apr) || 0) +
            (parseFloat(child.May) || 0) + (parseFloat(child.Jun) || 0) +
            (parseFloat(child.Jul) || 0) + (parseFloat(child.Aug) || 0) +
            (parseFloat(child.Sep) || 0) + (parseFloat(child.Oct) || 0) +
            (parseFloat(child.Nov) || 0) + (parseFloat(child.Dec) || 0);

          return {
            Id: child.Id,
            Task: child.Task || "",
            BudgetItem: child.BudgetItem || "",
            BudgetAmount: Number(child.BudgetAmount) || 0,
            Owner: child.Owner ? (child.Owner.Title || child.Owner.EMail) : "",
            Jan: Number(child.Jan) || 0,
            Feb: Number(child.Feb) || 0,
            Mar: Number(child.Mar) || 0,
            Apr: Number(child.Apr) || 0,
            May: Number(child.May) || 0,
            Jun: Number(child.Jun) || 0,
            Jul: Number(child.Jul) || 0,
            Aug: Number(child.Aug) || 0,
            Sep: Number(child.Sep) || 0,
            Oct: Number(child.Oct) || 0,
            Nov: Number(child.Nov) || 0,
            Dec: Number(child.Dec) || 0,
            Total: cTotal
          };
        });
        let childrenToShow = validChildren;

        // If no children saved → show ONE empty child row for UI
        if (childrenToShow.length === 0) {
          childrenToShow = [{
            Id: null,
            Task: "",
            BudgetItem: "",
            BudgetAmount: 0,
            Owner: "",
            Jan: "", Feb: "", Mar: "", Apr: "", May: "", Jun: "",
            Jul: "", Aug: "", Sep: "", Oct: "", Nov: "", Dec: 0,
            Total: 0
          }];
        }

        // Push grouped entry
        grouped.push({
          parent: normalizedParent,
          children: childrenToShow

        });

        console.groupEnd();
      });

      console.log("🧾 Grouped parents count:", grouped.length);
      console.log("📄 Sample grouped:", grouped.slice(0, 3));

      // set state to grouped structure
      setConsolidationRows(grouped);

      // final diagnostics: totals
      const totals = grouped.reduce((acc: any, entry: any) => {
        ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].forEach(m => {
          acc[m] += Number(entry.parent[m] || 0) + entry.children.reduce((s: number, c: any) => s + (Number(c[m] || 0)), 0);
        });
        acc.TotalAll += ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].reduce((s, m) => s + Number(entry.parent[m] || 0) + entry.children.reduce((ss: number, c: any) => ss + (Number(c[m] || 0)), 0), 0);
        return acc;
      }, {
        Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0, TotalAll: 0
      });

      console.log("📊 Consolidation totals calculated:", totals);

    } catch (err) {
     // console.error("❌ Error loading consolidation rows:", err);
      setConsolidationRows([]); // clear on error
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (activeScreen === "consolidation" && selectedRequest) {
      loadConsolidationRows(selectedRequest.Id);
    }
  }, [activeScreen, selectedRequest]);


  const calculateRowTotal = (row: any) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let total = 0;

    months.forEach((m) => {
      const raw = row[m];
      // Safe conversion
      const val = parseFloat(raw);
      if (!isNaN(val)) {
        total += val;
      } else {
      }
    });

    return total;
  };

  const calculateGrandTotals = () => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    //  Initialize totals object directly
    const totals: any = {
      TotalAll: 0,
      Jan: 0, Feb: 0, Mar: 0, Apr: 0,
      May: 0, Jun: 0, Jul: 0, Aug: 0,
      Sep: 0, Oct: 0, Nov: 0, Dec: 0,
    };

    //  Loop through parents
    submissionRows.forEach(row => {
      months.forEach(month => {
        totals[month] += Number(row[month]) || 0;
        totals.TotalAll += Number(row[month]) || 0;
      });

      //  Loop through child rows also
      if (row.children) {
        row.children.forEach((child: any) => {
          months.forEach(month => {
            totals[month] += Number(child[month]) || 0;
            totals.TotalAll += Number(child[month]) || 0;
          });
        });
      }
    });

    return totals;
  };


  const calculateGrandTotalsForConsolidation = () => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const totals: any = {
      TotalAll: 0,
      Jan: 0, Feb: 0, Mar: 0, Apr: 0,
      May: 0, Jun: 0, Jul: 0, Aug: 0,
      Sep: 0, Oct: 0, Nov: 0, Dec: 0,
    };

    consolidationRows.forEach(row => {
      months.forEach(month => {
        totals[month] += Number(row[month]) || 0;
        totals.TotalAll += Number(row[month]) || 0;
      });
    });

    return totals;
  };




  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const sp = getSP();
        const allUsers = await sp.web.siteUsers();

        const filtered = allUsers.filter(
          (u: any) => !u.IsHiddenInUI && u.Email
        );
        setUsers(filtered);
      } catch (err) {
      }
    };
    fetchUsers();
  }, []);

  // const addParentRow = () => {
  //   setSubmissionRows(prev => [
  //     ...prev,
  //     {
  //       BACAnnualPlanningRequestListIDId: selectedRequest.Id,
  //       Initiative: "",
  //       Justification: "",
  //       Deliverable: "",
  //       // parent doesn’t have Task/Budget — children have it
  //       Owner: "",
  //       Timeline: "",
  //       Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
  //       Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0,

  //       //  one default child row
  //       children: []

  //     }
  //   ]);
  // };

  // ADD PARENT + AUTO CHILD

  // CHILD ROW CREATOR
  const createChildRow = (parentId: number | null) => ({
    BACAnnualPlanningRequestListIDId: selectedRequest.Id,
    BACDepartmentSubmissionsIDId: parentId || null,
    Task: "",
    BudgetItem: "",
    BudgetAmount: 0,
    Owner: "",
    Timeline: "",
    Jan: 0, Feb: 0, Mar: 0, Apr: 0,
    May: 0, Jun: 0, Jul: 0, Aug: 0,
    Sep: 0, Oct: 0, Nov: 0, Dec: 0
  });


  const addParentRow = () => {
    if (!selectedRequest?.Id) return;

    setSubmissionRows(prev => [
      ...prev,
      {
        BACAnnualPlanningRequestListIDId: selectedRequest.Id,
        Initiative: "",
        Justification: "",
        Deliverable: "",
        Owner: "",
        Timeline: "",
        Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
        Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0,

        //  DIRECTLY ADD CHILD HERE
        children: [
          {
            BACAnnualPlanningRequestListIDId: selectedRequest.Id,
            BACDepartmentSubmissionsIDId: null,
            Task: "",
            BudgetItem: "",
            BudgetAmount: 0,
            Owner: "",
            Timeline: "",
            Jan: 0, Feb: 0, Mar: 0, Apr: 0,
            May: 0, Jun: 0, Jul: 0, Aug: 0,
            Sep: 0, Oct: 0, Nov: 0, Dec: 0,
          }
        ]
      }
    ]);
  };




  // const addChildRow = (parentIndex: number) => {
  //   setSubmissionRows(prev => {
  //     const updated = [...prev];

  //     //  remove UI-only child if exists


  //     //  now push real child row
  //     updated[parentIndex].children.push({
  //       BACAnnualPlanningRequestListIDId: selectedRequest.Id,
  //       BACDepartmentSubmissionsIDId: updated[parentIndex].Id || null,
  //       Task: "",
  //       BudgetItem: "",
  //       BudgetAmount: 0,
  //       Owner: "",
  //       Timeline: "",
  //       Jan: 0, Feb: 0, Mar: 0, Apr: 0,
  //       May: 0, Jun: 0, Jul: 0, Aug: 0,
  //       Sep: 0, Oct: 0, Nov: 0, Dec: 0,
  //          // REAL CHILD ROW
  //     });

  //     return updated;
  //   });
  // };

  // ADD CHILD TO EXISTING PARENT
  const addChildRow = (parentIndex: number) => {
    setSubmissionRows(prev => {
      const updated = [...prev];
      const parentId = updated[parentIndex].Id || null;

      // ✅ If first child is "noInput" (from delete) → REPLACE it
      if (
        updated[parentIndex].children.length === 1 &&
        updated[parentIndex].children[0].noInput === true
      ) {
        updated[parentIndex].children[0] = createChildRow(parentId);
        return updated;
      }

      // ✅ Otherwise → NORMAL ADD
      updated[parentIndex].children.push(createChildRow(parentId));
      return updated;
    });
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];



  const updateParent = (parentIndex: number, field: string, value: any) => {
    setSubmissionRows(prev => {
      const updated = [...prev];
      updated[parentIndex][field] = value;
      return updated;
    });
  };

  const updateChild = (parentIndex: number, childIndex: number, field: string, value: any) => {
    setSubmissionRows(prev => {
      const updated = [...prev];
      const child = { ...updated[parentIndex].children[childIndex], [field]: value };
      updated[parentIndex].children[childIndex] = child;

      return updated;
    });
  };




  const loadStatusChoices = async () => {
    try {
      // BACDepartmentSubmissions → Status choices
      const submField = await sp.web.lists
        .getByTitle("BACDepartmentSubmissions")
        .fields.getByInternalNameOrTitle("Status")
        .select("Choices")();
      setSubmStatusChoices(submField?.Choices || []);

      // BACAnnualPlanningApprovalList → Status choices
      const apprField = await sp.web.lists
        .getByTitle("BACAnnualPlanningApprovalList")
        .fields.getByInternalNameOrTitle("Status")
        .select("Choices")();
      setApprStatusChoices(apprField?.Choices || []);
    } catch (e) {
      setSubmStatusChoices([]);
      setApprStatusChoices([]);
    }
  };
  useEffect(() => {
    loadStatusChoices();
  }, []);

  const pickPending = (choices: string[]) =>
    choices.find(c => c.toLowerCase().includes("pending")) || choices[0] || "Pending";




  const handleForwardToStrategy = async () => {
    if (!selectedRequest?.Id) {
      //alert("Open a request (click View) before forwarding.");
      return;
    }
    if (validatedRows.length === 0) {
      Swal.fire({
        icon: "warning",
        text: "Please validate at least one parent row before proceeding"
      });
      return;
    }
    setLoading(true);
    try {
      const currentUser = await sp.web.currentUser();

      const pendingSubm =
        submStatusChoices.find(c => c.toLowerCase() === "pending") || "Pending";
      const pendingAppr =
        apprStatusChoices.find(c => c.toLowerCase() === "pending") || "Pending";

      // ------------------------------------------------------
      // 1) UPDATE VALIDATED PARENTS + THEIR CHILDREN
      // ------------------------------------------------------
      for (const parentId of validatedRows) {

        // Update parent
        await sp.web.lists
          .getByTitle("BACDepartmentSubmissions")
          .items.getById(parentId)
          .update({
            Validated: true,
            Status: pendingSubm
          });

        // Fetch + update children
        const children = await sp.web.lists
          .getByTitle("BACDepartmentSubmissions")
          .items.filter(`BACDepartmentSubmissionsIDId eq ${parentId}`)();

        for (const child of children) {
          await sp.web.lists
            .getByTitle("BACDepartmentSubmissions")
            .items.getById(child.Id)
            .update({
              Validated: true,
              Status: pendingSubm
            });
        }
      }

      // ------------------------------------------------------
      // 2) CREATE ONLY **ONE** APPROVAL ENTRY (Important)
      // ------------------------------------------------------
      await sp.web.lists
        .getByTitle("BACAnnualPlanningApprovalList")
        .items.add({
          BACAnnualPlanningRequestListIDId: selectedRequest.Id,
          Status: pendingAppr,
          ReviewStage: "StrategyReview",
          RequestedById: selectedRequest?.RequestedBy?.Id || currentUser.Id,
          RequestedOn: new Date(),
          AssignedToId: currentUser.Id,
          AssignedOn: new Date(),
          Division: selectedRequest?.Division?.Division || "",
          Department: selectedRequest?.Department?.DepartmentName || "",
          BudgetPlanningYear: selectedRequest?.BudgetPlanningYear || "",
          Comment: ""
        });


      // ------------------------------------------------------
      // 3) REFRESH CONSOLIDATION TABLE
      // ------------------------------------------------------
      await loadConsolidationRows(selectedRequest.Id, { validatedOnly: true });


      // //alert("Forwarded to Strategy successfully.");

    } catch (err) {
     // console.error("Forward Error:", err);
      //alert("Error while forwarding.");
    }

    finally {
      setLoading(false);   //  THIS WAS MISSING (VERY IMPORTANT)
    }
  };


  ////strategy review

  //  Unified loader for both StrategyReview and ExecutiveReview
  const loadApprovalRows = async (stage: string) => {
    setLoadingApproval(true);
    try {
      const currentFilter = stage === "StrategyReview" ? strategyFilter : executiveFilter;
      const items = await sp.web.lists
        .getByTitle("BACAnnualPlanningApprovalList")
        .items.select(
          "Id",
          "Title",
          "RequestedOn",
          "Status",
          "RequestedBy/Title",
          "RequestedBy/Id",
          "Division",
          "Department",
          "BudgetPlanningYear",
          "BACAnnualPlanningRequestListIDId",
          "ReviewStage"
        )
        .expand("RequestedBy")

        .filter(`Status eq '${currentFilter}' and ReviewStage eq '${stage}'`)

        .orderBy("Created", false)(); //  Dynamic stage
    

      const mapped = items.map((r: any) => ({
        Id: r.Id,
        Title: r.Title || "",
        Division: r.Division || "",
        Department: r.Department || "",
        Year: r.BudgetPlanningYear || "",
        RequestedBy: r.RequestedBy?.Title || "",
        RequestedDate: r.RequestedOn ? new Date(r.RequestedOn) : null,
        Status: r.Status || "",
        RequestId: r.BACAnnualPlanningRequestListIDId
      }));

      if (stage === "StrategyReview") {
        setStrategyData(mapped);
      } else if (stage === "ExecutiveReview") {
        setExecutiveData(mapped);
      }

    } catch (e) {
     // console.error("Error loading review rows:", e);
    }
    setLoadingApproval(false);
  };


  useEffect(() => {

    // STRATEGY REVIEW ACCESS
    if (activeScreen === "strategyReview") {
      if (!isStrategyDept) {
        // console.warn("No access to Strategy Review");
        setStrategyData([]);
        return;
      }
      loadApprovalRows("StrategyReview");
    }

    // EXECUTIVE REVIEW ACCESS
    if (activeScreen === "executiveReview") {
      if (!isExecutiveDept) {
        // console.warn("No access to Executive Review");
        setExecutiveData([]);
        return;
      }
      loadApprovalRows("ExecutiveReview");
    }

  }, [activeScreen, isStrategyDept, isExecutiveDept, strategyFilter, executiveFilter]);



  const handleReviewViewClick = (approvalItem: any) => {
   

    if (!approvalItem) {
     // console.error("❌ approvalItem is null or undefined!");
      //alert("No approval item passed to function.");
      return;
    }

    // Check if RequestId exists
    if (!approvalItem.RequestId) {
      // console.warn("⚠️ Missing RequestId. Here's the full object:", approvalItem);
      //alert("Cannot load details. Missing Request ID.");
      return;
    }

   
    setSelectedApproval(approvalItem);

   
    //  Store selected request for future use
    setSelectedRequest({
      Id: approvalItem.RequestId,
      Division: { Division: approvalItem.Division },
      Department: { DepartmentName: approvalItem.Department },
      BudgetPlanningYear: approvalItem.Year,
    });

   

    //  Load consolidation rows
    loadConsolidationRows(approvalItem.RequestId, { validatedOnly: true });

  };


  const handleExecutiveViewClick = (approvalItem: any) => {
  

    // if (!approvalItem.RequestId) {
    //   //alert("Cannot load details. Missing Request ID.");
    //   return;
    // }
    if (!approvalItem || !approvalItem.RequestId) return;

    // ✅ THIS WAS MISSING
    setSelectedApproval(approvalItem);
    setSelectedRequest({
      Id: approvalItem.RequestId,
      Division: { Division: approvalItem.Division },
      Department: { DepartmentName: approvalItem.Department },
      BudgetPlanningYear: approvalItem.Year,
    });

    loadConsolidationRows(approvalItem.RequestId, { validatedOnly: true });

  };


  const cell = { border: '1px solid #000', padding: '5px' };


  const deleteChildRow = (parentIdx: number, childIdx: number) => {
    setSubmissionRows(prev => {
      const updated = [...prev];

      // ✅ SPECIAL CASE: First parent (idx === 0) + only 1 child
      if (parentIdx === 0 && updated[parentIdx].children.length === 1) {
        updated[parentIdx].children = [{
          noInput: true,        // <-- important flag
          Task: "",
          BudgetItem: "",
          BudgetAmount: "",
          Owner: "",
          Jan: "", Feb: "", Mar: "", Apr: "",
          May: "", Jun: "", Jul: "", Aug: "",
          Sep: "", Oct: "", Nov: "", Dec: ""
        }];

        return updated;
      }

      // ✅ Normal delete for all other cases
      updated[parentIdx].children.splice(childIdx, 1);

      return updated;
    });
  };


  // const deleteChildRow = (parentIdx: number, childIdx: number) => {
  //   setSubmissionRows((prev: any[]) => {
  //     const updated = [...prev];

  //     const children = updated[parentIdx].children;

  //     const childRow = children[childIdx];

  //     // If saved child, push to delete list
  //     if (childRow?.Id) {
  //       setDeletedItems(del => [...del, childRow.Id]);
  //     }

  //     // 🔥 CASE 1: If FIRST CHILD → blank row only
  //     if (childIdx === 0) {
  //       updated[parentIdx].children[0] = {
  //         __hidden: true,
  //         Task: "",
  //         BudgetItem: "",
  //         BudgetAmount: 0,
  //         Owner: "",
  //         Jan: 0, Feb: 0, Mar: 0, Apr: 0,
  //         May: 0, Jun: 0, Jul: 0, Aug: 0,
  //         Sep: 0, Oct: 0, Nov: 0, Dec: 0,
  //       };
  //       return updated;
  //     }

  //     // 🔥 CASE 2: If childIdx > 0 → completely delete the row
  //     updated[parentIdx].children.splice(childIdx, 1);

  //     return updated;
  //   });
  // };

  const deleteParentRow = (index: number) => {
    setSubmissionRows(prev => {
      const updated = [...prev];

      const parentRow = updated[index];

      //  Delete parent from SP
      if (parentRow.Id) {
        setDeletedItems(del => [...del, parentRow.Id]);
      }

      //  Delete all children from SP
      parentRow.children.forEach((child: any) => {
        if (child.Id) setDeletedItems(del => [...del, child.Id]);
      });

      // Remove from UI
      updated.splice(index, 1);

      return updated;
    });
  };


  const handleSendToExecutive = async (action: "Approve" | "Rework") => {
    try {
      setLoading(true);
      const currentUser = await sp.web.currentUser();

      if (!selectedRequest?.Id) {
        //alert("No request selected.");
        return;
      }

      // 🔍 Comment validation for Rework
      if (action === "Rework" && !strategyComment.trim()) {
        //alert("Please enter a comment before sending back for Rework.");
        return;
      }

      const strategyRows = await sp.web.lists
        .getByTitle("BACAnnualPlanningApprovalList")
        .items.filter(
          `BACAnnualPlanningRequestListIDId eq ${selectedRequest.Id} and ReviewStage eq 'StrategyReview'`
        )
        .orderBy("Created", false)();

      if (!strategyRows || strategyRows.length === 0) {
        //alert("No Strategy Review entry found!");
        return;
      }

      const strategyRecord = strategyRows[0];

      const updateFields: any = {
        ApprovedById: currentUser.Id,
        ApprovedOn: new Date(),
        Status: action === "Approve" ? "Approved" : "Rework",
        Comment: strategyComment || "", // ✅ Save the comment
      };

      await sp.web.lists
        .getByTitle("BACAnnualPlanningApprovalList")
        .items.getById(strategyRecord.Id)
        .update(updateFields);

      if (action === "Approve") {
        // (same approve flow as before)
        await sp.web.lists
          .getByTitle("BACAnnualPlanningApprovalList")
          .items.add({
            BACAnnualPlanningRequestListIDId: selectedRequest.Id,
            Status: "Pending",
            ReviewStage: "ExecutiveReview",
            RequestedById: currentUser.Id,
            RequestedOn: new Date(),
            AssignedToId: currentUser.Id,
            AssignedOn: new Date(),
            Division: selectedRequest.Division.Division,
            Department: selectedRequest.Department.DepartmentName,
            BudgetPlanningYear: selectedRequest.BudgetPlanningYear,
          });

        await sp.web.lists
          .getByTitle("BACAnnualPlanningRequestList")
          .items.getById(selectedRequest.Id)
          .update({ Status: "Pending" });

        const subs = await sp.web.lists
          .getByTitle("BACDepartmentSubmissions")
          .items.filter(`BACAnnualPlanningRequestListIDId eq ${selectedRequest.Id}`)();

        for (const s of subs) {
          await sp.web.lists
            .getByTitle("BACDepartmentSubmissions")
            .items.getById(s.Id)
            .update({ Status: "Pending" });
        }

        // //alert("✅ Sent to Executive Review! Request approved.");
      } else {
        const allSubs = await sp.web.lists
          .getByTitle("BACDepartmentSubmissions")
          .items.filter(`BACAnnualPlanningRequestListIDId eq ${selectedRequest.Id}`)();

        for (const row of allSubs) {
          await sp.web.lists
            .getByTitle("BACDepartmentSubmissions")
            .items.getById(row.Id)
            .update({
              Validated: false,   // ← Unvalidate
              Status: "Rework"    // ← Mark as rework
            });
        }
        // (same rework flow)
        await sp.web.lists
          .getByTitle("BACAnnualPlanningRequestList")
          .items.getById(selectedRequest.Id)
          .update({ Status: "Rework" });

        const subs = await sp.web.lists
          .getByTitle("BACDepartmentSubmissions")
          .items.filter(`BACAnnualPlanningRequestListIDId eq ${selectedRequest.Id}`)();

        for (const s of subs) {
          await sp.web.lists
            .getByTitle("BACDepartmentSubmissions")
            .items.getById(s.Id)
            .update({ Status: "Rework" });
        }

        //alert("🔁 Request sent back for Rework with comment.");
      }

      // ✅ Reset after completion
      setStrategyComment("");
      setShowConsolidation(false);


      await loadApprovalRows("StrategyReview");

    } catch (err) {
     // console.error("Error in handleSendToExecutive:", err);
      //alert("❌ Something went wrong. Check console for details.");
    }
    finally {
      setLoading(false);
    }
  };



  const handleExecutiveDecision = async (approvalItem: any, action: "Approve" | "Rework") => {
    try {
      setLoading(false);
      const currentUser = await sp.web.currentUser();

      const requestId = approvalItem?.RequestId || approvalItem?.Id;
      if (!requestId) {
        //alert("Request ID missing for this record.");
        return;
      }

      // 🔍 Comment validation for Rework
      if (action === "Rework" && !executiveComment.trim()) {
        //alert("Please enter a comment before sending back for Rework.");
        return;
      }

      const approvalRows = await sp.web.lists
        .getByTitle("BACAnnualPlanningApprovalList")
        .items.filter(
          `BACAnnualPlanningRequestListIDId eq ${requestId} and ReviewStage eq 'ExecutiveReview'`
        )
        .orderBy("Created", false)();

      if (!approvalRows || approvalRows.length === 0) {
        //alert("No Executive Review record found!");
        return;
      }

      const approvalRecord = approvalRows[0];

      await sp.web.lists
        .getByTitle("BACAnnualPlanningApprovalList")
        .items.getById(approvalRecord.Id)
        .update({
          Status: action === "Approve" ? "Approved" : "Rework",
          ApprovedById: currentUser.Id,
          ApprovedOn: new Date(),
          Comment: executiveComment || "", // ✅ Save the comment
        });

      if (action === "Approve") {
        // (same approve logic)
        await sp.web.lists
          .getByTitle("BACAnnualPlanningRequestList")
          .items.getById(requestId)
          .update({ Status: "Approved" });

        const subs = await sp.web.lists
          .getByTitle("BACDepartmentSubmissions")
          .items.filter(`BACAnnualPlanningRequestListIDId eq ${requestId}`)();

        for (const s of subs) {
          await sp.web.lists
            .getByTitle("BACDepartmentSubmissions")
            .items.getById(s.Id)
            .update({ Status: "Approved" });
        }
        // ✅ Refresh request list for final report immediately
        const updatedRequests = await sp.web.lists
          .getByTitle("BACAnnualPlanningRequestList")
          .items
          .select(
            "Id",
            "Title",
            "Status",
            "RequestedDate",
            "Division/Division",
            "Department/DepartmentName",
            "BudgetPlanningYear",
            "RequestedBy/Title"
          )
          .expand("Division", "Department", "RequestedBy")
          .orderBy("Created", false)();

        setRequestLogs(updatedRequests);   // THIS updates visibleLogs → Final Report

        // //alert("✅ Request approved successfully!");
      } else {
        // 🔄 Unvalidate Executive approval on all department submissions
        const allSubs = await sp.web.lists
          .getByTitle("BACDepartmentSubmissions")
          .items.filter(`BACAnnualPlanningRequestListIDId eq ${requestId}`)();

        for (const row of allSubs) {
          await sp.web.lists
            .getByTitle("BACDepartmentSubmissions")
            .items.getById(row.Id)
            .update({
              Validated: false,  // ❌ unvalidate
              Status: "Rework",  // 🔁 mark as rework
            });
        }

        // 🔄 Update request main record
        await sp.web.lists
          .getByTitle("BACAnnualPlanningRequestList")
          .items.getById(requestId)
          .update({ Status: "Rework" });

        //alert("🔁 Request sent back for Rework with comment.");
      }


      setExecutiveComment("");
      await loadApprovalRows("ExecutiveReview");
      setShowExecConsolidation(false);
    } catch (err) {
     // console.error("Error in executive decision:", err);
      //alert("❌ Something went wrong. Check console for details.");
    } finally {
      setLoading(false);
    }
  };


  // 🧮 Calculates grand totals for Consolidation table
  const calculateConsolidationTotals = () => {
    const totals: any = {
      Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
      Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0,
      TotalAll: 0
    };

    // Loop through all grouped entries
    consolidationRows.forEach((entry: any) => {
      const parent = entry.parent;
      const children = entry.children || [];

      // Include parent's own months
      totals.Jan += parseFloat(parent.Jan) || 0;
      totals.Feb += parseFloat(parent.Feb) || 0;
      totals.Mar += parseFloat(parent.Mar) || 0;
      totals.Apr += parseFloat(parent.Apr) || 0;
      totals.May += parseFloat(parent.May) || 0;
      totals.Jun += parseFloat(parent.Jun) || 0;
      totals.Jul += parseFloat(parent.Jul) || 0;
      totals.Aug += parseFloat(parent.Aug) || 0;
      totals.Sep += parseFloat(parent.Sep) || 0;
      totals.Oct += parseFloat(parent.Oct) || 0;
      totals.Nov += parseFloat(parent.Nov) || 0;
      totals.Dec += parseFloat(parent.Dec) || 0;

      // Include children’s months
      children.forEach((child: any) => {
        totals.Jan += parseFloat(child.Jan) || 0;
        totals.Feb += parseFloat(child.Feb) || 0;
        totals.Mar += parseFloat(child.Mar) || 0;
        totals.Apr += parseFloat(child.Apr) || 0;
        totals.May += parseFloat(child.May) || 0;
        totals.Jun += parseFloat(child.Jun) || 0;
        totals.Jul += parseFloat(child.Jul) || 0;
        totals.Aug += parseFloat(child.Aug) || 0;
        totals.Sep += parseFloat(child.Sep) || 0;
        totals.Oct += parseFloat(child.Oct) || 0;
        totals.Nov += parseFloat(child.Nov) || 0;
        totals.Dec += parseFloat(child.Dec) || 0;
      });
    });

    // Calculate grand total
    totals.TotalAll =
      totals.Jan + totals.Feb + totals.Mar + totals.Apr + totals.May + totals.Jun +
      totals.Jul + totals.Aug + totals.Sep + totals.Oct + totals.Nov + totals.Dec;

    return totals;
  };

  const totals =
    activeScreen === "executiveReview"
      ? calculateConsolidationTotals()
      : activeScreen === "strategyReview"
        ? calculateConsolidationTotals()
        : calculateGrandTotals();

  // for final report 
  const approvedLogs = visibleLogs.filter(item => item.Status === "Approved");


  // 🔄 Unvalidate all department submissions for a Request ID
  const unvalidateAllForRequest = async (requestId: number) => {
    try {
     

      const items = await sp.web.lists
        .getByTitle("BACDepartmentSubmissions")
        .items.select("Id")
        .filter(`BACAnnualPlanningRequestListIDId eq ${requestId}`)();

      if (!items.length) {
      
        return;
      }

      for (const row of items) {
        await sp.web.lists
          .getByTitle("BACDepartmentSubmissions")
          .items.getById(row.Id)
          .update({
            Validated: false
          });
      }



    } catch (err) {

    }
  };



  const handleFinalViewClick = async (approvalItem: any) => {
    if (!approvalItem) return;

    const requestId =
      approvalItem.RequestId ||
      approvalItem.Id ||
      approvalItem.BACAnnualPlanningRequestListIDId;

    if (!requestId) return;

    setSelectedRequest({
      Id: requestId,
      Division: { Division: approvalItem?.Division?.Division || "" },
      Department: { DepartmentName: approvalItem?.Department?.DepartmentName || "" },
      BudgetPlanningYear: approvalItem?.BudgetPlanningYear || ""
    });

    // ❗ LOAD CONSOLIDATION ROWS DIRECTLY HERE
    await loadConsolidationRows(Number(requestId));

    // ❗ SHOW YOUR CUSTOM CONSOLIDATION TABLE
    setShowFinalTable(false);
    setShowFinalConsolidation(true);
  };

  const exportConsolidationToExcel = () => {
    if (!consolidationRows || consolidationRows.length === 0) {
      alert("No data to export");
      return;
    }

   

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    // ✅ Match table header exactly
    const header = [
      "S.No",
      "Initiative",
      "Justification",
      "Deliverable",
      "Task",
      "Budget Item",
      "Budget Amount",
      "Owner",
      ...months,
      "Total"
    ];

    const rows: any[] = [];
    const merges: any[] = [];

    // Excel row index (AFTER header row). Header is row 0.
    let rowIndex = 1;

    consolidationRows.forEach((entry: any, pIdx: number) => {
      const parent = entry.parent;
      const children = entry.children || [];

      const parentOwner =
        typeof parent.Owner === "string"
          ? parent.Owner
          : parent.Owner?.Title || parent.Owner?.EMail || "";

      const startRow = rowIndex; // for merges

      if (children.length === 0) {
        // ✅ Parent-only row (no children)
        const parentMonthValues = months.map(m => Number(parent[m]) || 0);
        const parentTotal = parentMonthValues.reduce((a, b) => a + b, 0);

        rows.push([
          pIdx + 1,                          // S.No
          parent.Initiative || "",           // Initiative
          parent.Justification || "",        // Justification
          parent.Deliverable || "",          // Deliverable
          "",                                // Task
          "",                                // Budget Item
          0,                                 // Budget Amount
          parentOwner,                       // Owner
          ...parentMonthValues,              // Jan–Dec
          parentTotal                        // Total
        ]);

        rowIndex++;
      } else {
        // ✅ Parent with children
        children.forEach((child: any) => {
          const owner =
            typeof child.Owner === "string"
              ? child.Owner
              : child.Owner?.Title || child.Owner?.EMail || "";

          const monthValues = months.map(m => Number(child[m]) || 0);
          const total = monthValues.reduce((a, b) => a + b, 0);

          rows.push([
            pIdx + 1,                          // S.No
            parent.Initiative || "",           // Initiative
            parent.Justification || "",        // Justification
            parent.Deliverable || "",          // Deliverable
            child.Task || "",                  // Task
            child.BudgetItem || "",            // Budget Item
            Number(child.BudgetAmount) || 0,   // Budget Amount
            owner,                             // Owner
            ...monthValues,                    // Jan–Dec
            total                              // Total
          ]);

          rowIndex++;
        });

        const endRow = rowIndex - 1;

        // ✅ Merge S.No, Initiative, Justification, Deliverable
        if (endRow > startRow) {
          // S.No (col 0)
          merges.push({ s: { r: startRow, c: 0 }, e: { r: endRow, c: 0 } });
          // Initiative (col 1)
          merges.push({ s: { r: startRow, c: 1 }, e: { r: endRow, c: 1 } });
          // Justification (col 2)
          merges.push({ s: { r: startRow, c: 2 }, e: { r: endRow, c: 2 } });
          // Deliverable (col 3)
          merges.push({ s: { r: startRow, c: 3 }, e: { r: endRow, c: 3 } });
        }
      }
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);

    // Apply merges
    ws["!merges"] = merges;

    // Column widths – aligned with table columns
    ws["!cols"] = [
      { wpx: 50 },   // S.No
      { wpx: 200 },  // Initiative
      { wpx: 220 },  // Justification
      { wpx: 220 },  // Deliverable
      { wpx: 200 },  // Task
      { wpx: 180 },  // Budget Item
      { wpx: 120 },  // Budget Amount
      { wpx: 220 },  // Owner
      ...Array(12).fill({ wpx: 90 }), // Jan–Dec
      { wpx: 120 }   // Total
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Consolidation");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), "Final_Consolidation_Report.xlsx");

   
  };





  //  DASHBOARD - Load ALL tile counts in minimum calls
  const loadDashboardRequestCounts = async () => {
    try {
      const requests = await sp.web.lists
        .getByTitle("BACAnnualPlanningRequestList")
        .items
        .select("Id", "Status")();
      const submissions = await sp.web.lists
        .getByTitle("BACDepartmentSubmissions")
        .items
        .select("BACAnnualPlanningRequestListIDId")();

      const approvals = await sp.web.lists
        .getByTitle("BACAnnualPlanningApprovalList")
        .items
        .select("BACAnnualPlanningRequestListIDId")();

      // Collect all submitted / processed request IDs
      const processedRequestIds = new Set<number>();

      submissions.forEach((s: any) => {
        if (s.BACAnnualPlanningRequestListIDId)
          processedRequestIds.add(s.BACAnnualPlanningRequestListIDId);
      });

      approvals.forEach((a: any) => {
        if (a.BACAnnualPlanningRequestListIDId)
          processedRequestIds.add(a.BACAnnualPlanningRequestListIDId);
      });
      let pending = 0;
      let approved = 0;

      requests.forEach((req: any) => {
        const status = req.Status?.toLowerCase();

        if (status === "pending" && !processedRequestIds.has(req.Id)) {
          pending++;
        }
        if (status === "approved") approved++;
      });


      setPendingRequestCount(pending);
      setApprovedRequestCount(approved);

    } catch (err) {
     // console.error("❌ Error loading dashboard counts:", err);
      setPendingRequestCount(0);
      setApprovedRequestCount(0);
    }
  };


  //  Pending Review Count – ONLY from Approval List
  const loadPendingReviewCount = async () => {
    try {
      const approvals = await sp.web.lists
        .getByTitle("BACAnnualPlanningApprovalList")
        .items
        .select("Id", "Status", "BACAnnualPlanningRequestListIDId")();

      const requestStatusMap: { [key: number]: Set<string> } = {};

      approvals.forEach((item: any) => {
        const reqId = item.BACAnnualPlanningRequestListIDId;
        const status = item.Status?.toLowerCase();

        if (!reqId || !status) return;

        if (!requestStatusMap[reqId]) {
          requestStatusMap[reqId] = new Set();
        }

        requestStatusMap[reqId].add(status);
      });

      let pendingReviewCount = 0;
      const pendingReviewIds: number[] = [];

      Object.keys(requestStatusMap).forEach((key) => {
        const statusSet = requestStatusMap[Number(key)];

        if (statusSet.has("approved")) return;

        if (statusSet.has("pending") || statusSet.has("rework")) {
          pendingReviewCount++;
          pendingReviewIds.push(Number(key));
        }
      });

    

      setPendingReviewCount(pendingReviewCount);

    } catch (err) {
     // console.error("Error loading Pending Review count:", err);
      setPendingReviewCount(0);
    }
  };


  const loadSubmittedRequestCount = async () => {
    try {
      const requests = await sp.web.lists
        .getByTitle("BACAnnualPlanningRequestList")
        .items
        .select("Id")();

      const submissions = await sp.web.lists
        .getByTitle("BACDepartmentSubmissions")
        .items
        .select("BACAnnualPlanningRequestListIDId")();

      const submittedRequestIds = new Set<number>();

      submissions.forEach((sub: any) => {
        if (sub.BACAnnualPlanningRequestListIDId) {
          submittedRequestIds.add(sub.BACAnnualPlanningRequestListIDId);
        }
      });

      let submittedCount = 0;
      const matchedRequestIds: number[] = [];

      requests.forEach((req: any) => {
        if (submittedRequestIds.has(req.Id)) {
          submittedCount++;
          matchedRequestIds.push(req.Id);
        }
      });

     
      setSubmittedCount(submittedCount);

    } catch (error) {
     // console.error("Error loading submitted count:", error);
      setSubmittedCount(0);
    }
  };


  useEffect(() => {
    const total =
      (pendingRequestCount || 0) +
      (approvedRequestCount || 0) +
      (submittedCount || 0);


    setAllRequestCount(total);

  }, [pendingRequestCount, approvedRequestCount, submittedCount]);

  useEffect(() => {
    if (activeScreen === "dashboard") {
      loadDashboardRequestCounts();
      loadPendingReviewCount();
      loadSubmittedRequestCount();
    }
  }, [activeScreen]);

  useEffect(() => {
    if (activeScreen === "finalReport") {
      loadApprovalRows("Approved");
    }
  }, [activeScreen]);

  // const isRequestFullyApproved = () => {
  //   return selectedRequest?.Status === "Approved"; 
  // };
  const status = (selectedApproval?.Status || "").toString().toLowerCase().trim();

  const hideButtons =
    status === "approved" ||
    status === "rework";



  return (
    <div className="row">
      <div className="col-xl-12 col-lg-12">
        <div className="row">
          <div className="col-lg-12">
            <CustomBreadcrumb Breadcrumb={Breadcrumb} />
          </div>




        </div>





      </div>


      {loading && (
        <div className="loadernewadd mt-10">
          <div>
            <img
              src={require("../../assets/BAC_loader.gif")}
              className="alignrightl"
              alt="Loading..."
            />
          </div>
          <span>Loading </span>{" "}
          <span>
            <img
              src={require("../../assets/edcnew.gif")}
              className="alignrightl"
              alt="Loading..."
            />
          </span>
        </div>
      )}
      <>
        {/* <!-- Modal --> */}
        {/* <!-- Modal --> */}
        {/* <div className="sidebar mt-3 mb-3">
        <a href="javascript:void(0)" onClick={(e) => { e.preventDefault(); setActive("dashboard"); showScreen("dashboard"); }} className={activeScreen === "dashboard" ? "active" : ""}><i className="fas fa-home me-2"></i>Dashboard</a>
        <a href="javascript:void(0)" onClick={(e) => { e.preventDefault(); setActive("sendRequest"); showScreen("sendRequest"); }} className={activeScreen === "sendRequest" ? "active" : ""}><i className="fas fa-envelope me-2"></i>Send Request</a>
        <a href="javascript:void(0)" onClick={(e) => { e.preventDefault(); setActive("submissions"); showScreen("submissions"); }} className={activeScreen === "submissions" ? "active" : ""}><i className="fas fa-table me-2"></i>Dept Submissions</a>
        <a href="javascript:void(0)" onClick={(e) => { e.preventDefault(); setActive("consolidation"); showScreen("consolidation"); }} className={activeScreen === "consolidation" ? "active" : ""}><i className="fas fa-layer-group me-2"></i>Consolidation</a>
        <a href="javascript:void(0)" onClick={(e) => { e.preventDefault(); setActive("strategyReview"); showScreen("strategyReview"); }} className={activeScreen === "strategyReview" ? "active" : ""}><i className="fas fa-search me-2"></i>Strategy Review</a>
        <a href="javascript:void(0)" onClick={(e) => { e.preventDefault(); setActive("executiveReview"); showScreen("executiveReview"); }} className={activeScreen === "executiveReview" ? "active" : ""}><i className="fas fa-user-tie me-2"></i>Executive Review</a>
        <a href="javascript:void(0)" onClick={(e) => { e.preventDefault(); setActive("finalReport"); showScreen("finalReport"); }} className={activeScreen === "finalReport" ? "active" : ""}><i className="fas fa-file-alt me-2"></i>Final Report</a>
      </div> */}

        <div className="sidebar mt-3 mb-3">
          <a href="javascript:void(0)" onClick={(e) => { e.preventDefault(); navigateToScreen("dashboard"); }} className={activeScreen === "dashboard" ? "active" : ""}><i className="fas fa-home me-2"></i>Dashboard</a>
          <a href="javascript:void(0)" onClick={(e) => { e.preventDefault(); navigateToScreen("sendRequest"); }} className={activeScreen === "sendRequest" ? "active" : ""}><i className="fas fa-envelope me-2"></i>Send Request</a>
          <a href="javascript:void(0)" onClick={(e) => { e.preventDefault(); navigateToScreen("submissions"); }} className={activeScreen === "submissions" ? "active" : ""}><i className="fas fa-table me-2"></i>Dept Submissions</a>
          <a href="javascript:void(0)" onClick={(e) => { e.preventDefault(); navigateToScreen("consolidation"); }} className={activeScreen === "consolidation" ? "active" : ""}><i className="fas fa-layer-group me-2"></i>Consolidation</a>
          <a href="javascript:void(0)" onClick={(e) => { e.preventDefault(); navigateToScreen("strategyReview"); }} className={activeScreen === "strategyReview" ? "active" : ""}><i className="fas fa-search me-2"></i>Strategy Review</a>
          <a href="javascript:void(0)" onClick={(e) => { e.preventDefault(); navigateToScreen("executiveReview"); }} className={activeScreen === "executiveReview" ? "active" : ""}><i className="fas fa-user-tie me-2"></i>Executive Review</a>
          <a href="javascript:void(0)" onClick={(e) => { e.preventDefault(); navigateToScreen("finalReport"); }} className={activeScreen === "finalReport" ? "active" : ""}><i className="fas fa-file-alt me-2"></i>Final Report</a>
        </div>

        {/* <!-- Dashboard --> */}
        <div id="dashboard" className={`screen ${activeScreen === "dashboard" ? "active-screen" : ""}`}>

          <div className="row">
            <div className="col-md-2"><div className="kpi-card bg-kpi3">All<br /><span style={{ fontSize: "28px" }}>{allRequestCount}</span></div></div>
            <div className="col-md-2"><div className="kpi-card bg-kpi1">Requests Sent<br /><span style={{ fontSize: "28px" }}>{pendingRequestCount}</span></div></div>
            <div className="col-md-2"><div className="kpi-card bg-kpi2">Submissions<br /><span style={{ fontSize: "28px" }}>{submittedCount}</span></div></div>
            <div className="col-md-2"><div className="kpi-card bg-kpi3">Pending Review<br /><span style={{ fontSize: "28px" }}>{pendingReviewCount}</span></div></div>
            <div className="col-md-2"><div className="kpi-card bg-kpi4">Approved<br /><span style={{ fontSize: "28px" }}>{approvedRequestCount}</span></div></div>
          </div>
          <div className="card p-2 mt-3">
            <h4 style={{ textAlign: "left" }} className="text-dark"><i className="fas fa-chart-bar me-2 text-primary"></i>Overview</h4>
            <p style={{ textAlign: "left" }}>2025 planning cycle in progress. Majority of departments have submitted budgets.</p>
          </div>
        </div>

        {/* <!-- Step 1: Send Request --> */}
        <div id="sendRequest" className={`screen ${activeScreen === "sendRequest" ? "active-screen" : ""}`}>

          <div className="card p-2">
            {/* <!-- <h3  style={{textAlign: "left"}} className="mb-3"><i className="fas fa-envelope-open-text me-2 text-success"></i>Step 1: Send Annual Reporting Request</h3> --> */}
            <h3 style={{ textAlign: "left" }} className="mb-3"><i className="fas fa-envelope-open-text me-2 text-success"></i>New Request</h3>
            <form id="requestForm" className="row g-3 mb-4">

              <div className="col-md-6">
                <label className="form-label text-dark" style={{ textAlign: "left", width: "100%" }}>
                  Division
                </label>
                <div id="DivisionField">
                  <Select
                    placeholder="Select Division"
                    options={divisions}
                    value={division}
                    onChange={(option: any) => {
                      setDivision(option);
                      setDepartment(null); //  Reset department
                    }}

                    className="border-0 p-0"
                    classNamePrefix="react-select"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label text-dark" style={{ textAlign: "left", width: "100%" }}>Department</label>
                <div id="DepartmentField">
                  <Select
                    // inputId="simpleinput"
                    // id="NewsDeptID" //  ID used for highlighting
                    className={`form-control p-0 border-0`}
                    classNamePrefix="react-select"
                    placeholder="Select Department"
                    options={departments}
                    value={department}
                    onChange={(option: any) => setDepartment(option)}
                    isDisabled={!division}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label text-dark" style={{ textAlign: "left", width: "100%" }}>Request Date</label>
                <input type="date" className="form-control" value={(requestDate)} disabled />
              </div>
              <div className="col-md-6">
                <label className="form-label text-dark" style={{ textAlign: "left", width: "100%" }}>
                  Planning Year
                </label>
                <div id="PlanningYearField">
                  <Select
                    options={Array.from({ length: 11 }, (_, i) => {
                      const year = (new Date().getFullYear() + i).toString();
                      return { value: year, label: year };
                    })}
                    value={
                      planningYear
                        ? { value: planningYear.toString(), label: planningYear.toString() }
                        : null
                    }
                    onChange={(selected:any) => {
                      if (selected) {
                        setPlanningYear(selected.value);
                      }
                    }}
                    placeholder="Select Year"
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
              </div>


              <div className="col-12">
                <button type="button" onClick={async (e) => {
                  const isValid = validateSendRequestForm();
                  if (!isValid) {
                    return;
                  }
                  const existing = await sp.web.lists.getByTitle("BACAnnualPlanningRequestList").items.filter(`DepartmentId eq ${department.value} and BudgetPlanningYear eq '${planningYear}'`)(); if (existing.length > 0) {
                    Swal.fire({
                      icon: "warning",
                      title: "Duplicate Request",
                      text: "This department has already submitted a request for the selected year."
                    });
                    setLoading(false);
                    return;   // 🚫 STOP HERE - confirmation won't appear
                  }


                  confirmAndExecute(handleSendRequest, "Submitted Successfully", e)
                }}
                  className="btn btn-primary btn-rounded" disabled={!isStrategyDept} ><i className="fas fa-paper-plane me-2"></i>Send Request</button>
              </div>
            </form>

            <h5 style={{ textAlign: "left", width: "100%" }} className="text-dark mb-2">Request Log</h5>
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Division</th>
                  <th>Department</th>

                  <th>Sent Date</th>
                  <th>Requested By</th>
                  <th>Planning Year</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="requestLog">
                {/* <tr><td>Finance</td><td><span className="badge bg-success">Sent</span></td><td>01-Jan-2025</td></tr>
            <tr><td>IT</td><td><span className="badge bg-success">Sent</span></td><td>01-Jan-2025</td></tr>
            <tr><td>Operations</td><td><span className="badge bg-warning">Pending</span></td><td>-</td></tr> */}
                {visibleLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center">No records found</td>
                  </tr>
                ) : (
                  visibleLogs.map((item: any, index: number) => (
                    <tr key={index}>
                      <td>{item?.Division?.Division || ""}</td>


                      <td>{item?.Department?.DepartmentName || ""}</td>

                      <td>
                        {formatDisplayDate(item?.RequestedDate)}

                      </td>
                      <td>{item?.RequestedBy?.Title || ""}</td>
                      <td>{item?.BudgetPlanningYear || ""}</td>
                      <td>{item?.Status || ""}</td>
                      <td>
                        {/* <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => handleViewClick(item)}>View</button> */}
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => {
                          handleViewClick(item);
                          navigateToScreen("submissions");
                        }}>View</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>
        </div>

        {/* <!-- Part 3 START --> */}
        {/* <!-- Step 2: Department Submissions (monthly breakdown, add/remove, inline editing, totals) --> */}
        {/* <div id="submissions" className="screen"> */}
        <div id="submissions" className={`screen ${activeScreen === "submissions" ? "active-screen" : ""}`}>

          <div className="card p-2">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3><i className="fas fa-table me-2 text-info"></i>Department Submissions</h3>
              <div>
                {/* Show message when user directly comes without clicking View */}


                {/* <button  type="button" className="btn btn-sm btn-success me-2" id="btnAddDeptRow" onClick={() =>
  setSubmissionRows([
  ...submissionRows,
  {
    BACAnnualPlanningRequestListIDId: selectedRequest.Id,

    //  Parent fields
    Initiative: "",
    Justification: "",
    Deliverable: "",

    //  children list (Task rows)
    children: [
      {
        Task: "",
        BudgetItem: "",
        Owner: "",
        Timeline: "",
        Jan: 0,
        Feb: 0,
        Mar: 0,
        Apr: 0,
        May: 0,
        Jun: 0,
        Jul: 0,
        Aug: 0,
        Sep: 0,
        Oct: 0,
        Nov: 0,
        Dec: 0,
         children: []
      }
    ]
  }
])


  }><i className="fas fa-plus"></i> Add Row</button> */}

                {activeScreen === "submissions" && selectedRequest?.Id && (
                  <button
                    type="button"
                    className="btn btn-sm btn-success me-2"
                    id="btnAddDeptRow"
                    onClick={addParentRow}
                  >
                    <i className="fas fa-plus"></i>Add New Initiative
                  </button>
                )}
                {/* <button type="button" className="btn btn-sm btn-danger" id="btnClearDeptRows"><i className="fas fa-trash-alt"></i> Clear All</button> */}
              </div>
            </div>

            {activeScreen === "submissions" && !selectedRequest?.Id && (
              <div className="alert alert-info mt-3">
                Please go to the <strong>Send Request</strong> tab and click <strong>View</strong> to initiate your request.
              </div>
            )}

            {/* {selectedRequest && (
            <div className="card mb-3 p-3">
              <h4 style={{ textAlign: "left" }} className="text-dark mb-1">
                Department Submissions
              </h4>
              <p style={{ textAlign: "left" }} className="mb-0">
                <strong>Division:</strong> {selectedRequest?.Division?.Division || ""}
              </p>
              <p style={{ textAlign: "left" }} className="mb-0">
                <strong>Department:</strong> {selectedRequest?.Department?.DepartmentName || ""}
              </p>
              <p style={{ textAlign: "left" }} className="mb-0">
                <strong>Planning Year:</strong> {selectedRequest?.BudgetPlanningYear || ""}
              </p>
            </div>
          )} */}

            {activeScreen === "submissions" && selectedRequest?.Id && (
              <>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>

                    <thead>

                      <tr style={{ backgroundColor: '#bfbfbf' }}>

                        <th rowSpan={2} style={{ border: '1px solid #000', padding: '5px' }}>Sno.</th>

                        <th rowSpan={2} style={{ border: '1px solid #000', padding: '5px' }}>Initiative</th>

                        <th rowSpan={2} style={{ border: '1px solid #000', padding: '5px' }}>Justification</th>

                        <th rowSpan={2} style={{ border: '1px solid #000', padding: '5px' }}>Deliverable</th>

                        <th rowSpan={2} style={{ border: '1px solid #000', padding: '5px' }}>Task</th>

                        <th colSpan={2} style={{ border: '1px solid #000', padding: '5px' }}>Budget</th>

                        <th rowSpan={2} style={{ border: '1px solid #000', padding: '5px' }}>Owner</th>

                        {/* Year header row */}
                        <th colSpan={14} style={{ border: '1px solid #000', padding: '5px' }}>
                          {selectedRequest?.BudgetPlanningYear || ""}
                        </th>
                        <th rowSpan={2} style={{ border: '1px solid #000', padding: '5px' }}>Action</th>

                      </tr>

                      <tr style={{ backgroundColor: '#bfbfbf' }}>

                        <th style={{ border: '1px solid #000', padding: '5px' }}>Item</th>

                        <th style={{ border: '1px solid #000', padding: '5px' }}>Amount</th>

                        {[

                          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',

                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'

                        ].map((m) => (

                          <th key={m} style={{ border: '1px solid #000', padding: '5px' }}>{m}</th>

                        ))}
                        <th style={{ border: '1px solid #000', padding: '5px' }}>Total</th>
                        <th style={{ border: '1px solid #000', padding: '5px' }}>Action</th>

                      </tr>

                    </thead>



                    <tbody>
                      {submissionRows.map((row, idx) => {
                        // let children = row.children || [];

                        //  ALWAYS ensure at least 1 child row (REAL editable)
                        if (!row.children || row.children.length === 0) {
                          row.children = [
                            {
                              BACAnnualPlanningRequestListIDId: row.BACAnnualPlanningRequestListIDId,
                              BACDepartmentSubmissionsIDId: row.Id || null,
                              Task: "",
                              BudgetItem: "",
                              BudgetAmount: 0,
                              Owner: "",
                              Timeline: "",
                              Jan: 0, Feb: 0, Mar: 0, Apr: 0,
                              May: 0, Jun: 0, Jul: 0, Aug: 0,
                              Sep: 0, Oct: 0, Nov: 0, Dec: 0,
                            }
                          ];
                        }

                        const children = row.children;

                        //  Render rows
                        return children.map((child: any, childIdx: number) => {
                          //  Calculate total across all months
                          const total =
                            (parseFloat(child.Jan) || 0) + (parseFloat(child.Feb) || 0) +
                            (parseFloat(child.Mar) || 0) + (parseFloat(child.Apr) || 0) +
                            (parseFloat(child.May) || 0) + (parseFloat(child.Jun) || 0) +
                            (parseFloat(child.Jul) || 0) + (parseFloat(child.Aug) || 0) +
                            (parseFloat(child.Sep) || 0) + (parseFloat(child.Oct) || 0) +
                            (parseFloat(child.Nov) || 0) + (parseFloat(child.Dec) || 0);

                          return (
                            <tr key={`${idx}-${childIdx}`}>

                              {/*  Parent columns (only on first child row) */}
                              {childIdx === 0 && (
                                <>
                                  <td rowSpan={children.length} style={cell}>{idx + 1}</td>

                                  <td rowSpan={children.length} style={cell}>
                                    <input
                                      id={`Initiative_${idx}`}
                                      className="form-control"
                                      value={row.Initiative || ""}
                                      onChange={(e) => updateParent(idx, "Initiative", e.target.value)}
                                    />
                                  </td>

                                  <td rowSpan={children.length} style={cell}>
                                    <input
                                      id={`Justification_${idx}`}
                                      className="form-control"
                                      value={row.Justification || ""}
                                      onChange={(e) => updateParent(idx, "Justification", e.target.value)}
                                    />
                                  </td>

                                  <td rowSpan={children.length} style={cell}>
                                    <input
                                      id={`Deliverable_${idx}`}
                                      className="form-control"
                                      value={row.Deliverable || ""}
                                      onChange={(e) => updateParent(idx, "Deliverable", e.target.value)}
                                    />
                                  </td>
                                </>
                              )}

                              {/*  Child columns */}
                              <td style={cell}>
                                {child.noInput ? (
                                  <span> </span>
                                ) : (
                                  <input
                                    id={`Task_${idx}_${childIdx}`}
                                    className="form-control"
                                    value={child.Task || ""}
                                    onChange={(e) => updateChild(idx, childIdx, "Task", e.target.value)}
                                  />
                                )}
                              </td>

                              <td style={cell}>
                                {child.noInput ? (
                                  <span></span>
                                ) : (
                                  <input
                                    id={`BudgetItem_${idx}_${childIdx}`}
                                    className="form-control"
                                    value={child.BudgetItem || ""}
                                    onChange={(e) => updateChild(idx, childIdx, "BudgetItem", e.target.value)}
                                  />
                                )}
                              </td>

                              <td style={cell}>
                                {child.noInput ? (
                                  <span> </span>
                                ) : (
                                  <input
                                    id={`BudgetAmount_${idx}_${childIdx}`}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    className="form-control"
                                    value={child.BudgetAmount || ""}
                                    onInput={(e: any) => {
                                      e.target.value = e.target.value.replace(/\D/g, "");
                                      updateChild(idx, childIdx, "BudgetAmount", Number(e.target.value));
                                    }}
                                  />
                                )}
                              </td>


                              <td style={{ ...cell, minWidth: "100px" }}>
                                {child.noInput ? (
                                  <span> </span>
                                ) : (
                                  <select

                                    id={`Owner_${idx}_${childIdx}`}
                                    className="form-control"
                                    value={child.Owner || ""}
                                    onChange={(e) => updateChild(idx, childIdx, "Owner", e.target.value)}
                                  >
                                    <option value="">-- Select Owner --</option>
                                    {users.map((u: any) => (
                                      <option key={u.Id} value={u.Email}>{u.Title}</option>
                                    ))}
                                  </select>
                                )}
                              </td>

                              {/*  Jan - Dec */}


                              {[
                                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                              ].map((m) => (
                                <td key={m} style={cell}>

                                  {child.noInput ? (
                                    <span></span>
                                  ) : (
                                    <input
                                      id={`${m}_${idx}_${childIdx}`}
                                      type="text"
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                      className="form-control"
                                      value={child[m] || ""}
                                      onInput={(e: any) => {
                                        e.target.value = e.target.value.replace(/\D/g, "");
                                        updateChild(idx, childIdx, m, Number(e.target.value));
                                      }}
                                    />
                                  )}

                                </td>
                              ))}



                              {/*  Total column */}
                              <td style={{ border: '1px solid #000', padding: '5px', backgroundColor: '#f8f9fa' }}>

                                {child.noInput ? "" : total}

                              </td>

                              {/*  Delete child button */}
                              <td style={cell}>
                                {!child.noInput && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-danger"
                                    onClick={() => deleteChildRow(idx, childIdx)}
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                )}
                              </td>

                              {/*  Parent action only (delete) — NO Add Task */}
                              {childIdx === 0 && (
                                <td rowSpan={children.length} style={cell}>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-danger"
                                    onClick={() => deleteParentRow(idx)}
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-primary"
                                    onClick={() => addChildRow(idx)}
                                  >
                                    + Add
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        });
                      })}
                    </tbody>

                    <tfoot>
                      <tr id="consolTotals" style={{ fontWeight: "bold", backgroundColor: "#f0f0f0" }}>
                        <td colSpan={8} className="text-end" style={{ border: '1px solid #000' }}>Monthly Totals →</td>

                        {/* Monthly totals */}
                        <td style={cell}>{totals.Jan}</td>
                        <td style={cell}>{totals.Feb}</td>
                        <td style={cell}>{totals.Mar}</td>
                        <td style={cell}>{totals.Apr}</td>
                        <td style={cell}>{totals.May}</td>
                        <td style={cell}>{totals.Jun}</td>
                        <td style={cell}>{totals.Jul}</td>
                        <td style={cell}>{totals.Aug}</td>
                        <td style={cell}>{totals.Sep}</td>
                        <td style={cell}>{totals.Oct}</td>
                        <td style={cell}>{totals.Nov}</td>
                        <td style={cell}>{totals.Dec}</td>

                        {/* Total of all */}
                        <td style={cell}>{totals.TotalAll}</td>

                        {/* Empty action cols */}
                        <td colSpan={2} style={{ border: '1px solid #000' }}></td>
                      </tr>
                    </tfoot>

                  </table>




                </div>

                <div className="mt-3 d-flex justify-content-between">
                  <div className="small-muted">Tip: Click any cell to edit. Totals update automatically.</div>
                  <div>

                    <button type="button" className="btn btn-primary" id="btnSubmitToConsolidation" onClick={() => {
                      const isValid = validateDeptSubmissionForm();
                      if (!isValid) return; confirmAndExecute
                        (handleSubmitToConsolidation, "Submitted Successfully")

                    }}><i className="fas fa-share-square me-1"></i>Submit to Consolidation</button>

                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* <!-- Step 3: Consolidation --> */}
        <div id="consolidation" className={`screen ${activeScreen === "consolidation" ? "active-screen" : ""}`}>

          <div className="card p-2">
            <h3 style={{ textAlign: "left" }}><i className="fas fa-layer-group me-2 text-warning"></i>Consolidation</h3>
            <p style={{ textAlign: "left" }} className="small-muted">Consolidated view of all department submissions. Strategy can validate and forward to Strategy Review.</p>

            <div className="table-responsive">

              <table className="table table-bordered table-striped align-middle" id="consolTable">
                <thead className="table-dark">
                  <tr>
                    <th>S.No</th>
                    <th>Initiative</th>
                    <th>Justification</th>
                    <th>Deliverable</th>
                    <th>Task</th>
                    <th>Budget Item</th>
                    <th>Budget Amount</th>
                    <th>Owner</th>
                    <th>Jan</th><th>Feb</th><th>Mar</th><th>Apr</th>
                    <th>May</th><th>Jun</th><th>Jul</th><th>Aug</th>
                    <th>Sep</th><th>Oct</th><th>Nov</th><th>Dec</th>
                    <th>Total</th>
                    <th>Validated</th>
                    {/* <th>Actions</th> */}
                  </tr>
                </thead>
                <tbody>
                  {consolidationRows.map((entry: any, idx: number) => {
                    const parent = entry.parent;
                    const children = entry.children || [];

                    // If no children → show just the parent
                    if (children.length === 0) {
                      return (
                        <tr key={`parent-${parent.Id}`}>
                          <td style={{ border: "1px solid #000" }}>{idx + 1}</td>
                          <td style={{ border: "1px solid #000", fontWeight: "500", textAlign: "left" }}>
                            {parent.Initiative}
                          </td>
                          {/* Empty cells for months */}
                          {[
                            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                          ].map((m) => (
                            <td key={m} style={{ border: "1px solid #000" }}></td>
                          ))}
                          <td style={{ border: "1px solid #000" }}>0</td>
                          <td style={{ border: "1px solid #000" }}>
                            <input
                              type="checkbox"
                              className="consol-validate"
                              checked={validatedRows.includes(parent.Id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setValidatedRows([...validatedRows, parent.Id]);
                                } else {
                                  setValidatedRows(validatedRows.filter((id: any) => id !== parent.Id));
                                }
                              }}
                            />
                          </td>
                        </tr>
                      );
                    }

                    //  Parent has one or more valid children
                    return children.map((child: any, cIdx: number) => {
                      const months = [
                        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                      ];
                      const total = months.reduce((sum, m) => sum + (parseFloat(child[m]) || 0), 0);

                      return (
                        <tr key={`${parent.Id}-${child.Id}`} style={cIdx > 0 ? { backgroundColor: "#f8f9fa" } : {}}>
                          {/* Parent info only on the first child row */}
                          {cIdx === 0 ? (
                            <>
                              <td rowSpan={children.length} style={{ border: "1px solid #000" }}>
                                {idx + 1}
                              </td>
                              <td
                                rowSpan={children.length}
                                style={{
                                  border: "1px solid #000",
                                  textAlign: "left",
                                  fontWeight: "500",
                                  verticalAlign: "middle"
                                }}
                              >
                                {parent.Initiative}
                              </td>
                              <td
                                rowSpan={children.length}
                                style={{
                                  border: "1px solid #000",
                                  textAlign: "left",
                                  fontWeight: "500",
                                  verticalAlign: "middle"
                                }}
                              >
                                {parent.Justification}
                              </td>
                              <td
                                rowSpan={children.length}
                                style={{
                                  border: "1px solid #000",
                                  textAlign: "left",
                                  fontWeight: "500",
                                  verticalAlign: "middle"
                                }}
                              >
                                {parent.Deliverable}
                              </td>
                            </>
                          ) : null}

                          {/* Child details */}
                          <td style={{ border: "1px solid #000" }}>{child.Task || ""}</td>
                          <td style={{ border: "1px solid #000" }}>{child.BudgetItem}</td>
                          <td style={{ border: "1px solid #000" }}>{child.BudgetAmount}</td>

                          <td style={{ border: "1px solid #000", }}> {typeof child.Owner === "string"
                            ? child.Owner
                            : child.Owner?.Title ||
                            child.Owner?.EMail ||
                            ""}</td>

                          {months.map((m) => (
                            <td key={m} style={{ border: "1px solid #000" }}>
                              {Number(child[m]) || 0}


                            </td>
                          ))}

                          <td style={{ border: "1px solid #000", backgroundColor: "#f0f0f0" }}>{total}</td>

                          {/* Checkbox — only once, beside parent (same row as first child) */}
                          {cIdx === 0 ? (
                            <td rowSpan={children.length} style={{ border: "1px solid #000" }}>
                              <input
                                type="checkbox"
                                className="consol-validate"
                                checked={validatedRows.includes(parent.Id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setValidatedRows([...validatedRows, parent.Id]);
                                  } else {
                                    setValidatedRows(validatedRows.filter((id: any) => id !== parent.Id));
                                  }
                                }}
                              />
                            </td>
                          ) : null}
                        </tr>
                      );
                    });
                  })}
                </tbody>


                <tfoot>
                  <tr id="consolTotals" style={{ backgroundColor: "#f1f1f1", fontWeight: "600" }}>
                    {/* Label column */}
                    <td colSpan={8} className="text-end" style={{ border: "1px solid #000" }}>
                      Monthly Totals →
                    </td>

                    {/* Monthly values */}
                    <td style={{ border: "1px solid #000" }}>{totals.Jan || 0}</td>
                    <td style={{ border: "1px solid #000" }}>{totals.Feb || 0}</td>
                    <td style={{ border: "1px solid #000" }}>{totals.Mar || 0}</td>
                    <td style={{ border: "1px solid #000" }}>{totals.Apr || 0}</td>
                    <td style={{ border: "1px solid #000" }}>{totals.May || 0}</td>
                    <td style={{ border: "1px solid #000" }}>{totals.Jun || 0}</td>
                    <td style={{ border: "1px solid #000" }}>{totals.Jul || 0}</td>
                    <td style={{ border: "1px solid #000" }}>{totals.Aug || 0}</td>
                    <td style={{ border: "1px solid #000" }}>{totals.Sep || 0}</td>
                    <td style={{ border: "1px solid #000" }}>{totals.Oct || 0}</td>
                    <td style={{ border: "1px solid #000" }}>{totals.Nov || 0}</td>
                    <td style={{ border: "1px solid #000" }}>{totals.Dec || 0}</td>

                    {/* Total of all months combined */}
                    <td style={{ border: "1px solid #000", backgroundColor: "#e9ecef" }}>
                      {totals.TotalAll || 0}
                    </td>

                    {/* Empty cell for validation column */}
                    <td style={{ border: "1px solid #000" }}></td>
                  </tr>
                </tfoot>

              </table>
            </div>

            <div className="mt-3 d-flex justify-content-between">
              <div>
                {/* <button type ="button" className="btn btn-outline-danger me-2" id="btnReturnToDepts"><i className="fas fa-undo me-1"  onClick={() => {setActiveScreen("submissions") ;showScreen("submissions")}}></i>Return to Departments</button> */}
                <button type="button" className="btn btn-outline-danger me-2" id="btnReturnToDepts" onClick={() => navigateToScreen("submissions")}><i className="fas fa-undo me-1"></i>Return to Departments</button>
                {/* <button className="btn btn-outline-secondary me-2" id="btnRefreshConsol"><i className="fas fa-sync-alt"></i> Refresh</button> */}
              </div>
              <div>
                <button
                  type="button"
                  className="btn btn-primary"
                  id="btnForwardToStrategy"
                  onClick={() => {

                    //  1. Validate FIRST (before SweetAlert, before loader, before switch)
                    if (validatedRows.length === 0) {
                      Swal.fire({
                        icon: "warning",
                        text: "Please validate at least one parent row before proceeding"
                      });
                      return;
                    }

                    //  2. Only after validation, ask confirmation
                    confirmAndExecute(
                      async () => {
                        await handleForwardToStrategy();   //  will work
                        showScreen("strategyReview");  
                           setSelectedRequest(null);
                      },
                      "Forward this request to Strategy Review"
                    );

                  }}
                >
                  <i className="fas fa-arrow-right me-1"></i>
                  Forward to Strategy Review
                </button>

              </div>
            </div>
          </div>
        </div>
        {/* <!-- Part 3 END --> */}

        {/* <!-- Part 4 START --> */}
        {/* <!-- Step 4: Strategy Review --> */}
        <div id="strategyReview" className={`screen ${activeScreen === "strategyReview" ? "active-screen" : ""}`}>

          <div className="card p-2">
            <h3 style={{ textAlign: "left" }}><i className="fas fa-search me-2 text-secondary"></i>Strategy Review</h3>
            <p style={{ textAlign: "left" }} className="small-muted">Strategy team validates consolidated items and decides to Approve or Return.</p>

            {/*  Permission Check for Strategy Review */}
            {!isStrategyDept && activeScreen === "strategyReview" && (
              <div className="alert alert-danger mt-3">
                You do not have permission to access Strategy Review.
              </div>
            )}
            {(!isStrategyDept && activeScreen === "strategyReview") ? null : (
              <>
                <div className="table-responsive">
                  {/* <table className="table table-bordered table-striped align-middle" id="strategyTable">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Initiative</th>
                <th>Total</th>
                <th>Jan</th><th>Feb</th><th>Mar</th><th>Apr</th>
                <th>May</th><th>Jun</th><th>Jul</th><th>Aug</th>
                <th>Sep</th><th>Oct</th><th>Nov</th><th>Dec</th>
                <th>Decision</th>
                <th>Actions</th>
              </tr>
            </thead>
          

          </table> */}



                  {!showConsolidation && (
                    <>
                      <div style={{ display: "flex", justifyContent: "flex-end",  }}>
                        <select
                          className="form-select w-25 mb-3"
                          value={strategyFilter}
                          onChange={(e) => setStrategyFilter(e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Rework">Rework</option>
                        </select>
                      </div>

                      <table className="mtbalenew mt-0 table-centered table-nowrap table-borderless mb-0">
                        <thead>
                          <tr>
                            <th >S.No.</th>
                            <th >Division</th>
                            <th > Department</th>
                            <th >Year</th>
                            <th>Requested By</th>
                            <th>Requested Date</th>
                            <th>Status</th>
                            <th >Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {(strategyData.length === 0) ? (
                            <tr>
                              <td colSpan={8} style={{ textAlign: "center" }}>No results found</td>
                            </tr>
                          ) : (
                            strategyData.map((item, idx) => {
                              const requestedDateStr = item.RequestedDate
                                ? new Date(item.RequestedDate).toLocaleDateString()
                                : "";

                              return (
                                <tr key={item.Id}>
                                  <td><div className="indexdesign">{idx + 1}</div></td>
                                  <td>{item.Division}</td>
                                  <td>{item.Department}</td>
                                  <td>{item.Year}</td>
                                  <td>{item.RequestedBy}</td>
                                  <td>{requestedDateStr}</td>
                                  <td>{item.Status}</td>
                                  <td style={{ textAlign: "center" }}>
                                    <a
                                      href="javascript:void(0);"
                                      className="action-icon text-primary"
                                      onClick={() => {
                                        setSelectedRequest(item);
                                        handleReviewViewClick(item);
                                        setShowConsolidation(true);
                                      }}


                                    >
                                      View
                                    </a>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </>
                  )}
                </div>

                {showConsolidation && (
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <h4 className="mb-0">Consolidated View</h4>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowConsolidation(false);
                        setConsolidationRows([]); // optional: clear data
                      }}
                    >
                      ← Back
                    </button>
                  </div>
                )}

                {showConsolidation && consolidationRows.length > 0 && (
                  <div className="mt-4">
                    {/* <h4>Consolidated Department Submissions</h4> */}

                    <table className="table table-bordered align-middle">
                      <thead className="table-dark">
                        <tr>
                          <th style={{ border: "1px solid #000" }}>S.No</th>
                          <th style={{ border: "1px solid #000" }}>Initiative</th>
                          <th style={{ border: "1px solid #000" }}>Justification</th>
                          <th style={{ border: "1px solid #000" }}>Deliverable</th>
                          <th style={{ border: "1px solid #000" }}>Task</th>
                          <th style={{ border: "1px solid #000" }}>Budget Item</th>
                          <th style={{ border: "1px solid #000" }}>Budget Amount</th>
                          <th style={{ border: "1px solid #000" }}>Owner</th>
                          <th style={{ border: "1px solid #000" }}>Jan</th>
                          <th style={{ border: "1px solid #000" }}>Feb</th>
                          <th style={{ border: "1px solid #000" }}>Mar</th>
                          <th style={{ border: "1px solid #000" }}>Apr</th>
                          <th style={{ border: "1px solid #000" }}>May</th>
                          <th style={{ border: "1px solid #000" }}>Jun</th>
                          <th style={{ border: "1px solid #000" }}>Jul</th>
                          <th style={{ border: "1px solid #000" }}>Aug</th>
                          <th style={{ border: "1px solid #000" }}>Sep</th>
                          <th style={{ border: "1px solid #000" }}>Oct</th>
                          <th style={{ border: "1px solid #000" }}>Nov</th>
                          <th style={{ border: "1px solid #000" }}>Dec</th>
                          <th style={{ border: "1px solid #000" }}>Total</th>
                        </tr>
                      </thead>

                      <tbody>
                        {consolidationRows.map((entry: any, idx: number) => {
                          const parent = entry.parent;
                          const children = entry.children || [];

                          // Case 1: Parent with no children
                          if (children.length === 0) {
                            const months = [
                              "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                            ];
                            const parentTotal = months.reduce((sum, m) => sum + (parseFloat(parent[m]) || 0), 0);

                            return (
                              <tr key={`parent-${parent.Id}`} style={{ background: "#fff" }}>
                                <td style={{ border: "1px solid #000" }}>{idx + 1}</td>
                                <td style={{ border: "1px solid #000", fontWeight: "600", textAlign: "left" }}>{parent.Initiative}</td>
                                <td style={{ border: "1px solid #000", fontWeight: "600", textAlign: "left" }}>{parent.Justification}</td>
                                <td style={{ border: "1px solid #000", fontWeight: "600", textAlign: "left" }}>{parent.Deliverable}</td>
                                <td style={{ border: "1px solid #000" }}>-</td>
                                <td style={{ border: "1px solid #000" }}>-</td>

                                <td style={{ border: "1px solid #000" }}>0</td>

                                <td style={{ border: "1px solid #000" }}>  {typeof parent.Owner === "string"
                                  ? parent.Owner
                                  : parent.Owner?.Title ||
                                  parent.Owner?.EMail ||
                                  ""}</td>
                                {months.map((m) => (
                                  <td key={m} style={{ border: "1px solid #000" }}>{parent[m] || 0}</td>
                                ))}
                                <td style={{ border: "1px solid #000", backgroundColor: "#f0f0f0" }}>{parentTotal}</td>
                              </tr>
                            );
                          }

                          // Case 2: Parent with children
                          return children.map((child: any, cIdx: number) => {
                            const months = [
                              "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                            ];
                            const total = months.reduce((sum, m) => sum + (parseFloat(child[m]) || 0), 0);

                            return (
                              <tr key={`${parent.Id}-${child.Id}`} style={cIdx > 0 ? { backgroundColor: "#f8f9fa" } : {}}>
                                {cIdx === 0 && (
                                  <>
                                    <td rowSpan={children.length} style={{ border: "1px solid #000" }}>{idx + 1}</td>
                                    <td rowSpan={children.length} style={{ border: "1px solid #000", fontWeight: "600", textAlign: "left" }}>
                                      {parent.Initiative}
                                    </td>
                                    <td rowSpan={children.length} style={{ border: "1px solid #000", fontWeight: "600", textAlign: "left" }}>
                                      {parent.Justification}
                                    </td>
                                    <td rowSpan={children.length} style={{ border: "1px solid #000", fontWeight: "600", textAlign: "left" }}>
                                      {parent.Deliverable}
                                    </td>
                                  </>
                                )}
                                <td style={{ border: "1px solid #000" }}>{child.Task || ""}</td>
                                <td style={{ border: "1px solid #000" }}>{child.BudgetItem || ""}</td>
                                <td style={{ border: "1px solid #000" }}>{child.BudgetAmount || ""}</td>

                                <td style={{ border: "1px solid #000" }}> {typeof child.Owner === "string"
                                  ? child.Owner
                                  : child.Owner?.Title ||
                                  child.Owner?.EMail ||
                                  ""}</td>
                                {months.map((m) => (
                                  <td key={m} style={{ border: "1px solid #000" }}>{child[m] || 0}</td>
                                ))}
                                <td style={{ border: "1px solid #000", backgroundColor: "#f0f0f0" }}>{total}</td>
                              </tr>
                            );
                          });
                        })}
                      </tbody>
                      <tfoot>
                        <tr style={{ backgroundColor: "#f1f1f1", fontWeight: "600" }}>
                          <td colSpan={8} className="text-end" style={{ border: "1px solid #000" }}>Monthly Totals →</td>
                          <td style={{ border: "1px solid #000" }}>{totals.Jan}</td>
                          <td style={{ border: "1px solid #000" }}>{totals.Feb}</td>
                          <td style={{ border: "1px solid #000" }}>{totals.Mar}</td>
                          <td style={{ border: "1px solid #000" }}>{totals.Apr}</td>
                          <td style={{ border: "1px solid #000" }}>{totals.May}</td>
                          <td style={{ border: "1px solid #000" }}>{totals.Jun}</td>
                          <td style={{ border: "1px solid #000" }}>{totals.Jul}</td>
                          <td style={{ border: "1px solid #000" }}>{totals.Aug}</td>
                          <td style={{ border: "1px solid #000" }}>{totals.Sep}</td>
                          <td style={{ border: "1px solid #000" }}>{totals.Oct}</td>
                          <td style={{ border: "1px solid #000" }}>{totals.Nov}</td>
                          <td style={{ border: "1px solid #000" }}>{totals.Dec}</td>
                          <td style={{ border: "1px solid #000", backgroundColor: "#e9ecef" }}>{totals.TotalAll}</td>
                        </tr>
                      </tfoot>

                    </table>
                  </div>
                )}

                {showConsolidation && !hideButtons && (
                  <div className="mt-3">
                    <label className="form-label fw-semibold">Comment</label>
                    <textarea
                      id="strategyComment"
                      className="form-control"
                      rows={3}
                      placeholder="Enter your comment."
                      value={strategyComment}
                      onChange={(e) => {
                        setStrategyComment(e.target.value);
                        if (e.target.value.trim()) {
                          e.target.classList.remove("border-on-error");
                        }
                      }}
                    />

                  </div>
                )}


                {showConsolidation && !hideButtons && (
                  <div className="mt-3 d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-success me-2"
                      onClick={() =>
                        confirmAndExecute(
                          async () => {
                            await handleSendToExecutive("Approve");   // your existing logic
                            showScreen("executiveReview");           // move after 3 sec
                          },
                          "Sent Successfully"
                        )
                      }
                    >
                      <i className="fas fa-arrow-right me-1"></i>
                      Send to Executive Review
                    </button>


                    <button
                      type="button"
                      className="btn btn-warning"
                      onClick={() => {
                        const commentBox = document.getElementById("strategyComment");

                        if (!strategyComment.trim()) {
                          commentBox?.classList.add("border-on-error");

                          Swal.fire({
                            icon: "warning",
                            // title: "",
                            title: "Please fill all the mandatory fields."
                          });

                          return;
                        }

                        commentBox?.classList.remove("border-on-error");

                        //  2. Only then show confirmation
                        confirmAndExecute(
                          async () => {
                            await handleSendToExecutive("Rework");
                            // showScreen("sendRequest");
                          },
                          "Rework"
                        );
                      }}
                    >
                      <i className="fas fa-undo me-1"></i>
                      Rework
                    </button>


                  </div>
                )}
              </>
            )}

          </div>
        </div>

        {/* <!-- Step 5: Executive Review --> */}
        {/* <!-- Step 5: Executive Review --> */}
        <div id="executiveReview" className={`screen ${activeScreen === "executiveReview" ? "active-screen" : ""}`}>
          <div className="card p-2">
            <h3 style={{ textAlign: "left" }}>
              <i className="fas fa-user-tie me-2 text-dark"></i>Executive Review
            </h3>
            <p style={{ textAlign: "left" }} className="small-muted">
              Executive Management reviews validated items and adds strategic comments before final approval.
            </p>
            {!isExecutiveDept && activeScreen === "executiveReview" && (
              <div className="alert alert-danger mt-3">
                You do not have permission to access Executive Review.
              </div>
            )}

            {/* EXECUTIVE LIST TABLE */}
            {(!isExecutiveDept && activeScreen === "executiveReview") ? null : (
              <>


                {!showExecConsolidation && (
                  <>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <select
                      className="form-select w-25 mb-3"
                      value={executiveFilter}
                      onChange={(e) => setExecutiveFilter(e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rework">Rework</option>
                    </select>
                    </div>
                    <div className="table-responsive">
                      <table className="mtbalenew mt-0 table-centered table-nowrap table-borderless mb-0">
                        <thead>
                          <tr>
                            <th>S.No.</th>
                            <th>Division</th>
                            <th>Department</th>
                            <th>Year</th>
                            <th>Requested By</th>
                            <th>Requested Date</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {executiveData.length === 0 ? (
                            <tr>
                              <td colSpan={8} style={{ textAlign: "center" }}>
                                No results found
                              </td>
                            </tr>
                          ) : (
                            executiveData.map((item, idx) => {
                              const requestedDateStr = item.RequestedDate
                                ? new Date(item.RequestedDate).toLocaleDateString()
                                : "";
                              return (
                                <tr key={item.Id}>
                                  <td><div className="indexdesign">{idx + 1}</div></td>
                                  <td>{item.Division}</td>
                                  <td>{item.Department}</td>
                                  <td>{item.Year}</td>
                                  <td>{item.RequestedBy}</td>
                                  <td>{requestedDateStr}</td>
                                  <td>{item.Status}</td>
                                  <td style={{ textAlign: "center" }}>
                                    <a
                                      href="javascript:void(0);"
                                      className="action-icon text-primary"
                                      onClick={() => {
                                        setSelectedRequest(item);
                                        handleExecutiveViewClick(item);
                                        setShowExecConsolidation(true);
                                      }}
                                    >
                                      View
                                    </a>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {/* CONSOLIDATED VIEW */}
                {showExecConsolidation && (
                  <>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <h4 className="mb-0">Consolidated View</h4>
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowExecConsolidation(false);
                          setConsolidationRows([]); // optional: clear
                        }}
                      >
                        ← Back
                      </button>
                    </div>

                    {showExecConsolidation && consolidationRows.length > 0 && (

                      <div className="mt-4">
                        <table className="table table-bordered align-middle">
                          <thead className="table-dark">
                            <tr>
                              <th style={{ border: "1px solid #000" }}>S.No</th>
                              <th style={{ border: "1px solid #000" }}>Initiative</th>
                              <th style={{ border: "1px solid #000" }}>Justification</th>
                              <th style={{ border: "1px solid #000" }}>Deliverable</th>
                              <th style={{ border: "1px solid #000" }}>Task</th>
                              <th style={{ border: "1px solid #000" }}>Budget Item</th>
                              <th style={{ border: "1px solid #000" }}>Budget Amount</th>
                              <th style={{ border: "1px solid #000" }}>Owner</th>
                              <th style={{ border: "1px solid #000" }}>Jan</th>
                              <th style={{ border: "1px solid #000" }}>Feb</th>
                              <th style={{ border: "1px solid #000" }}>Mar</th>
                              <th style={{ border: "1px solid #000" }}>Apr</th>
                              <th style={{ border: "1px solid #000" }}>May</th>
                              <th style={{ border: "1px solid #000" }}>Jun</th>
                              <th style={{ border: "1px solid #000" }}>Jul</th>
                              <th style={{ border: "1px solid #000" }}>Aug</th>
                              <th style={{ border: "1px solid #000" }}>Sep</th>
                              <th style={{ border: "1px solid #000" }}>Oct</th>
                              <th style={{ border: "1px solid #000" }}>Nov</th>
                              <th style={{ border: "1px solid #000" }}>Dec</th>
                              <th style={{ border: "1px solid #000" }}>Total</th>
                            </tr>
                          </thead>

                          <tbody>
                            {consolidationRows.map((entry: any, idx: number) => {
                              const parent = entry.parent;
                              const children = entry.children || [];

                              // Case 1: Parent has no children
                              if (children.length === 0) {
                                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                const parentTotal = months.reduce((sum, m) => sum + (parseFloat(parent[m]) || 0), 0);

                                return (
                                  <tr key={`parent-${parent.Id}`} style={{ backgroundColor: "#fff" }}>
                                    <td style={{ border: "1px solid #000" }}>{idx + 1}</td>
                                    <td style={{ border: "1px solid #000", fontWeight: "600", textAlign: "left" }}>{parent.Initiative}</td>
                                    <td style={{ border: "1px solid #000" }}>-</td>
                                    <td style={{ border: "1px solid #000" }}>  {typeof parent.Owner === "string"
                                      ? parent.Owner
                                      : parent.Owner?.Title ||
                                      parent.Owner?.EMail ||
                                      ""}</td>
                                    {months.map((m) => (
                                      <td key={m} style={{ border: "1px solid #000" }}>{parent[m] || 0}</td>
                                    ))}
                                    <td style={{ border: "1px solid #000", backgroundColor: "#f0f0f0" }}>{parentTotal}</td>
                                  </tr>
                                );
                              }

                              // Case 2: Parent with children
                              return children.map((child: any, cIdx: number) => {
                                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                const total = months.reduce((sum, m) => sum + (parseFloat(child[m]) || 0), 0);

                                return (
                                  <tr key={`${parent.Id}-${child.Id}`} style={cIdx > 0 ? { backgroundColor: "#f8f9fa" } : {}}>
                                    {cIdx === 0 && (
                                      <>
                                        <td rowSpan={children.length} style={{ border: "1px solid #000" }}>{idx + 1}</td>
                                        <td rowSpan={children.length} style={{ border: "1px solid #000", fontWeight: "600", textAlign: "left" }}>
                                          {parent.Initiative}
                                        </td>
                                        <td rowSpan={children.length} style={{ border: "1px solid #000", fontWeight: "600", textAlign: "left" }}>
                                          {parent.Justification}
                                        </td>
                                        <td rowSpan={children.length} style={{ border: "1px solid #000", fontWeight: "600", textAlign: "left" }}>
                                          {parent.Deliverable}
                                        </td>
                                      </>
                                    )}
                                    <td style={{ border: "1px solid #000" }}>{child.Task || ""}</td>
                                    <td style={{ border: "1px solid #000" }}>{child.BudgetItem || ""}</td>
                                    <td style={{ border: "1px solid #000" }}>{child.BudgetAmount || ""}</td>
                                    <td style={{ border: "1px solid #000" }}> {typeof child.Owner === "string"
                                      ? child.Owner
                                      : child.Owner?.Title ||
                                      child.Owner?.EMail ||
                                      ""}</td>
                                    {months.map((m) => (
                                      <td key={m} style={{ border: "1px solid #000" }}>{child[m] || 0}</td>
                                    ))}
                                    <td style={{ border: "1px solid #000", backgroundColor: "#f0f0f0" }}>{total}</td>
                                  </tr>
                                );
                              });
                            })}
                          </tbody>

                          {/*  Add totals footer (optional) */}
                          <tfoot>
                            <tr style={{ backgroundColor: "#f1f1f1", fontWeight: "600" }}>
                              <td colSpan={8} className="text-end" style={{ border: "1px solid #000" }}>Monthly Totals →</td>
                              <td style={{ border: "1px solid #000" }}>{totals.Jan}</td>
                              <td style={{ border: "1px solid #000" }}>{totals.Feb}</td>
                              <td style={{ border: "1px solid #000" }}>{totals.Mar}</td>
                              <td style={{ border: "1px solid #000" }}>{totals.Apr}</td>
                              <td style={{ border: "1px solid #000" }}>{totals.May}</td>
                              <td style={{ border: "1px solid #000" }}>{totals.Jun}</td>
                              <td style={{ border: "1px solid #000" }}>{totals.Jul}</td>
                              <td style={{ border: "1px solid #000" }}>{totals.Aug}</td>
                              <td style={{ border: "1px solid #000" }}>{totals.Sep}</td>
                              <td style={{ border: "1px solid #000" }}>{totals.Oct}</td>
                              <td style={{ border: "1px solid #000" }}>{totals.Nov}</td>
                              <td style={{ border: "1px solid #000" }}>{totals.Dec}</td>
                              <td style={{ border: "1px solid #000", backgroundColor: "#e9ecef" }}>{totals.TotalAll}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}



                    {showExecConsolidation && !hideButtons && (
                      <div className="mt-3">
                        <label className="form-label fw-semibold">Comment</label>
                        <textarea
                          id="executiveComment"
                          className="form-control"
                          rows={3}
                          placeholder="Enter your comment..."
                          value={executiveComment}
                          onChange={(e) => {
                            setExecutiveComment(e.target.value);
                            if (e.target.value.trim()) {
                              e.target.classList.remove("border-on-error");
                            }
                          }}
                        />
                      </div>
                    )}

                    {!hideButtons && (
                      <div className="mt-3 d-flex justify-content-end">
                        <button
                          type="button"
                          className="btn btn-success me-2"
                          onClick={() =>
                            confirmAndExecute(
                              async () => {

                               

                                await handleExecutiveDecision(selectedRequest, "Approve");

                               

                                //  CHANGE THIS LINE
                                await loadApprovalRows("Approved");

                               

                                showScreen("finalReport");
                              },
                              "Approved Successfully!"
                            )
                          }
                        >


                          <i className="fas fa-check me-1"></i>
                          Approve
                        </button>

                        <button
                          type="button"
                          className="btn btn-warning"
                          onClick={() => {
                            //  1. Mandatory comment check FIRST
                            const commentBox = document.getElementById("executiveComment");

                            if (!executiveComment.trim()) {
                              commentBox?.classList.add("border-on-error");

                              Swal.fire({
                                icon: "warning",
                                // title: "Comment is required",
                                title: "Please fill all the mandatory fields."
                              });

                              return;
                            }

                            commentBox?.classList.remove("border-on-error");

                            //  2. Only then show confirmation popup
                            confirmAndExecute(
                              async () => {
                                await handleExecutiveDecision(selectedRequest, "Rework");
                                // showScreen("sendRequest");
                              },
                              "Rework"
                            );
                          }}
                        >
                          <i className="fas fa-undo me-1"></i>
                          Rework
                        </button>



                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>


        {/* <!-- Final Report --> */}
        <div id="finalReport" className={`screen ${activeScreen === "finalReport" ? "active-screen" : ""}`}>

          <div className="card p-2">
            <h3 style={{ textAlign: "left" }}><i className="fas fa-file-alt me-2 text-primary"></i>Final Annual Budget Report</h3>
            <p style={{ textAlign: "left" }} className="small-muted">Approved initiatives with monthly breakdown and executive commentary.</p>
            <div>
              {showFinalConsolidation && (
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ float: "right", marginTop: "-15px" }}
                  onClick={() => {
                    setShowFinalTable(true);
                    setShowFinalConsolidation(false);
                    setConsolidationRows([]);
                  }}
                >
                  ← Back
                </button>
              )}
            </div>
            <div className="table-responsive">


              {showFinalTable && (
                <div>
                  <table className="table table-bordered table-striped align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>S.No</th>
                        <th>Division</th>
                        <th>Department</th>
                        <th>Year</th>
                        <th>Requested Date</th>
                        <th>Status</th>
                        <th>View</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedLogs && approvedLogs.length > 0 ? (
                        approvedLogs.map((approvalItem: any, idx: number) => (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>{approvalItem?.Division?.Division || ""}</td>
                            <td>{approvalItem?.Department?.DepartmentName || ""}</td>
                            <td>{approvalItem?.BudgetPlanningYear || approvalItem?.Year || ""}</td>
                            <td>{formatDisplayDate(approvalItem?.RequestedDate)}</td>
                            <td>{approvalItem?.Status}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleFinalViewClick(approvalItem)}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={7} className="text-center">No approved records</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {showFinalConsolidation && (
                <>
                  {/* <div className="mb-3">
                      <button
                       style={{ float: "right", marginTop: "-15px" }}
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowFinalTable(true);
                          setShowFinalConsolidation(false);
                          setConsolidationRows([]); // optional
                        }}
                      >
                        ← Back
                      </button>
                    </div> */}

                  <div className="card p-2">

                    {/* REUSE YOUR EXACT CONSOLIDATION TABLE */}
                    <table className="table table-bordered table-striped align-middle">
                      <thead className="table-dark">
                        <tr>
                          <th style={{ border: "1px solid #000" }}>S.No</th>
                          <th style={{ border: "1px solid #000" }}>Initiative</th>
                          <th style={{ border: "1px solid #000" }}>Justification</th>
                          <th style={{ border: "1px solid #000" }}>Deliverable</th>
                          <th style={{ border: "1px solid #000" }}>Task</th>
                          <th style={{ border: "1px solid #000" }}>Budget Item</th>
                          <th style={{ border: "1px solid #000" }}>Budget Amount</th>
                          <th style={{ border: "1px solid #000" }}>Owner</th>
                          <th style={{ border: "1px solid #000" }}>Jan</th>
                          <th style={{ border: "1px solid #000" }}>Feb</th>
                          <th style={{ border: "1px solid #000" }}>Mar</th>
                          <th style={{ border: "1px solid #000" }}>Apr</th>
                          <th style={{ border: "1px solid #000" }}>May</th>
                          <th style={{ border: "1px solid #000" }}>Jun</th>
                          <th style={{ border: "1px solid #000" }}>Jul</th>
                          <th style={{ border: "1px solid #000" }}>Aug</th>
                          <th style={{ border: "1px solid #000" }}>Sep</th>
                          <th style={{ border: "1px solid #000" }}>Oct</th>
                          <th style={{ border: "1px solid #000" }}>Nov</th>
                          <th style={{ border: "1px solid #000" }}>Dec</th>
                          <th style={{ border: "1px solid #000" }}>Total</th>
                        </tr>
                      </thead>

                      <tbody>
                        {consolidationRows.map((entry, idx) => {
                          const parent = entry.parent;
                          const children = entry.children || [];

                          if (children.length === 0) {
                            return (
                              <tr key={`p-${parent.Id}`}>
                                <td style={{ border: "1px solid #000" }}>{idx + 1}</td>
                                <td style={{ border: "1px solid #000" }}>{parent.Initiative}</td>
                                <td style={{ border: "1px solid #000" }}></td>
                                <td style={{ border: "1px solid #000" }}></td>
                                {[...Array(12)].map((_, i) => <td key={i} style={{ border: "1px solid #000" }}></td>)}
                                <td style={{ border: "1px solid #000" }}>0</td>
                              </tr>
                            );
                          }

                          return children.map((child: any, cIdx: number) => {
                            const months = [
                              "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                            ];

                            const total = months.reduce((sum, m) => sum + (Number(child[m]) || 0), 0);

                            return (
                              <tr key={`${parent.Id}-${child.Id}`}>
                                {cIdx === 0 && (
                                  <>
                                    <td rowSpan={children.length} style={{ border: "1px solid #000" }}>{idx + 1}</td>
                                    <td rowSpan={children.length} style={{ border: "1px solid #000" }}>{parent.Initiative}</td>
                                    <td rowSpan={children.length} style={{ border: "1px solid #000" }}>{parent.Justification}</td>
                                    <td rowSpan={children.length} style={{ border: "1px solid #000" }}>{parent.Deliverable}</td>
                                  </>
                                )}

                                <td style={{ border: "1px solid #000" }}>{child.Task}</td>
                                <td style={{ border: "1px solid #000" }}>{child.BudgetItem || ""}</td>
                                <td style={{ border: "1px solid #000" }}>{child.BudgetAmount || ""}</td>
                                <td style={{ border: "1px solid #000" }}> {typeof child.Owner === "string"
                                  ? child.Owner
                                  : child.Owner?.Title || child.Owner?.EMail || ""}</td>

                                {months.map((m) => (
                                  <td key={m} style={{ border: "1px solid #000" }}>{Number(child[m]) || 0}</td>
                                ))}

                                <td style={{ border: "1px solid #000" }}>{total}</td>
                              </tr>
                            );
                          });
                        })}
                      </tbody>
                      <tfoot>
                        <tr style={{ backgroundColor: "#f1f1f1", fontWeight: "600" }}>
                          <td colSpan={8} className="text-end" style={{ border: "1px solid #000" }}>Monthly Totals →</td>
                          <td style={{ border: "1px solid #000" }}>{totals.Jan}</td>
                          <td style={{ border: "1px solid #000" }}>{totals.Feb}</td>
                          <td style={{ border: "1px solid #000" }}>{totals.Mar}</td>
                          <td style={{ border: "1px solid #000" }}>{totals.Apr}</td>
                          <td style={{ border: "1px solid #000" }}>{totals.May}</td>
                          <td style={{ border: "1px solid #000" }}>{totals.Jun}</td>
                          <td style={{ border: "1px solid #000" }}>{totals.Jul}</td>
                          <td style={{ border: "1px solid #000" }}>{totals.Aug}</td>
                          <td style={{ border: "1px solid #000" }}>{totals.Sep}</td>
                          <td style={{ border: "1px solid #000" }}>{totals.Oct}</td>
                          <td style={{ border: "1px solid #000" }}>{totals.Nov}</td>
                          <td style={{ border: "1px solid #000" }}>{totals.Dec}</td>
                          <td style={{ border: "1px solid #000", backgroundColor: "#e9ecef" }}>{totals.TotalAll}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <div className="mt-3 d-flex justify-content-end">
                    <button type="button" className="btn btn-outline-secondary me-2" id="btnExportFinalCSV" onClick={() => { exportConsolidationToExcel() }} ><i className="fas fa-file-csv me-1" ></i>Export CSV</button>
                    <button type="button" className="btn btn-outline-secondary" id="btnExportFinalExcel" onClick={() => { exportConsolidationToExcel() }}><i className="fas fa-file-excel me-1" ></i>Export Excel</button>
                  </div>
                </>
              )}


            </div>


          </div>
        </div>
      </>

    </div>
  )
}

export default BACAnnualPlanning