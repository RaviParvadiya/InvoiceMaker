// import React, { useCallback } from "react";
// import { useNavigate } from "react-router-dom";
import PageTitle from "../components/Common/PageTitle";
import DashboardWidgets from "../components/Dashboard/DashboardWidgets";
import ClientTable from "../components/Clients/ClientTable";
import InvoiceTable from "../components/Invoice/InvoiceTable";

function DashboardScreen() {
  // const navigate = useNavigate();

/*   const goToNewInvoice = useCallback(() => {
    navigate("/invoices/new");
  }, [navigate]); */

  return (
    <div>
      <div className="p-4">
        <PageTitle title="Dashboard" />
      </div>
      <div className="flex flex-wrap">
        <div className="w-full lg:w-4/6 pl-4 pr-4 sm:pl-4 sm:pr-0 mb-4 sm:mb-1">
          <DashboardWidgets />
          <div className="mt-1">
            <InvoiceTable />
          </div>
          <div className="mt-4">
            <ClientTable />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardScreen;
