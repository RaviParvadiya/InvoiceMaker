import localforage from "localforage";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  CLIENTS_KEY,
  CLIENT_FORM_KEY,
  INVOICE_DETAILS,
  INVOICES_KEY,
  INVOICE_FORM_KEY,
} from "../constants/localKeys";
import { useAppContext } from "../context/AppContext";
import { setAllClients, updateNewClientForm } from "../store/clientSlice";
import {
  setAllInvoice,
  setAllInvoiceDetailList,
  updateNewInvoiceForm,
} from "../store/invoiceSlice";

const useInitApp = () => {
  const dispatch = useDispatch();
  const { setInitLoading } = useAppContext();

  const initialSetData = useCallback(async () => {
    try {
      const [
        clientNewForm,
        clients,
        invoices,
        invoiceDetailList,
        invoiceNewForm,
      ] = await Promise.all([
        localforage.getItem(CLIENT_FORM_KEY),
        localforage.getItem(CLIENTS_KEY),
        localforage.getItem(INVOICES_KEY),
        localforage.getItem(INVOICE_DETAILS),
        localforage.getItem(INVOICE_FORM_KEY),
      ]);

      if (clientNewForm) {
        dispatch(updateNewClientForm(clientNewForm));
      }

      if (clients) {
        dispatch(setAllClients(JSON.parse(JSON.stringify(clients))));
      }

      if (invoiceNewForm) {
        dispatch(updateNewInvoiceForm(invoiceNewForm));
      }

      if (invoices) {
        dispatch(setAllInvoice(JSON.parse(JSON.stringify(invoices))));
      }

      if (invoiceDetailList) {
        dispatch(setAllInvoiceDetailList(JSON.parse(JSON.stringify(invoiceDetailList))));
      }

    } catch (e) {
      console.log(e);
    } finally {
      setInitLoading(false);
    }
  }, [dispatch, setInitLoading]);

  return {
    initialSetData,
  };
};

export default useInitApp;
