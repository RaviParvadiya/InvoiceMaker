import { createSlice, nanoid } from "@reduxjs/toolkit";
import localforage from "localforage";
import {
  INVOICES_KEY,
  INVOICE_DETAILS,
  INVOICE_FORM_KEY,
} from "../constants/localKeys";

const initialState = {
  isConfirmModal: false,
  isConfirm: false,
  data: [],
  detailList: [],
  deletedID: null,
  currentEditedID: null,
  newForm: {
    invoiceName: "",
    statusIndex: "1",
    statusName: "Draft",
    totalAmount: "",
    createdDate: new Date(),
    products: [
      {
        amount: "",
        _id: nanoid(),
        date: "",
        quantity: "",
      },
    ],
  },
};

export const invoiceSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {
    setAllInvoice: (state, action) => {
      state.data = [...action.payload];
    },

    setAllInvoiceDetailList: (state, action) => {
      state.detailList = [...action.payload];
    },

    setNewInvoices: (state, action) => {
      const { payload } = action;

      // const id = nanoid();

      const {
        _id,
        invoiceName,
        statusIndex,
        statusName,
        totalAmount,
        createdDate,
      } = payload;

      const newInvoice = {
        _id,
        invoiceName,
        statusIndex,
        statusName,
        totalAmount,
        createdDate,
      };

      const updateState = [...state.data, newInvoice];
      state.data = updateState;

      localforage.setItem(INVOICES_KEY, updateState);

      const newDetailList = [...state.detailList, { ...payload }];
      state.detailList = newDetailList;

      localforage.setItem(INVOICE_DETAILS, newDetailList);
    },

    setDeleteId: (state, action) => {
      state.deletedID = action.payload;
    },

    setEditedId: (state, action) => {
      state.currentEditedID = action.payload;
    },

    onConfirmDeletedInvoice: (state, action) => {
      const newDatas = state.data.filter(
        (invoice) => invoice._id !== state.deletedID
      );

      state.data = newDatas;

      const newDetails = state.detailList.filter(
        (invoice) => invoice._id !== state.deletedID
      );
      state.detailList = newDetails;

      // Update Redux state immutably
      state.deletedID = null;

      // Handle localforage.setItem asynchronously if needed
      localforage
        .setItem(INVOICES_KEY, JSON.parse(JSON.stringify(newDatas)))
        .catch((error) =>
          console.error("Error storing data in IndexedDB:", error)
        );

      localforage
        .setItem(INVOICE_DETAILS, JSON.parse(JSON.stringify(newDetails)))
        .catch((error) =>
          console.error("Error storing data in IndexedDB:", error)
        );

      // lengthy method but work correctly
      /* const _ = require("lodash");

      // Convert Proxy objects to plain JavaScript objects
      const plainNewDatas = newDatas.map((invoice) => _.cloneDeep(invoice));
      const plainNewDetails = newDetails.map((invoice) => _.cloneDeep(invoice));

      console.log("plainNewData", plainNewDatas);
      console.log("Original INVOICE_DETAILS", state.detailList);
      console.log("Filtered INVOICE_DETAILS", newDetails);
      console.log("Plain INVOICE_DETAILS", plainNewDetails);

      localforage
        .setItem(INVOICES_KEY, plainNewDatas)
        .catch((error) =>
          console.error("Error storing data in IndexedDB:", error)
        );

      localforage
        .setItem(INVOICE_DETAILS, plainNewDetails)
        .catch((error) =>
          console.error("Error storing data in IndexedDB:", error)
        ); */
    },

    onConfirmEditInvoice: (state, action) => {
      const isFindIndex = state.data.findIndex(
        (product) => product._id === state.currentEditedID
      );
      if (isFindIndex !== -1) {
        state.data[isFindIndex] = { ...action.payload };
      }
      state.currentEditedID = null;
      localforage.setItem(INVOICES_KEY, [...state.data]);
    },

    updateNewInvoiceFormField: (state, action) => {
      state.newForm[action.payload.key] = action.payload.value;
      const newForm = { ...state.newForm };
      localforage.setItem(
        INVOICE_FORM_KEY,
        JSON.parse(JSON.stringify(newForm))
      );
    },

    updateNewInvoiceForm: (state, action) => {
      state.newForm = { ...action.payload };
      localforage.setItem(INVOICE_FORM_KEY, { ...state.newForm });
    },

    updateExisitingInvoiceForm: (state, action) => {
      const {
        _id,
        invoiceName,
        statusIndex,
        statusName,
        totalAmount,
        createdDate,
      } = action.payload;

      const findIndexOfList = state.data.findIndex(
        (product) => product._id === _id
      );

      const newInvoice = {
        // _id,
        invoiceName,
        statusIndex,
        statusName,
        totalAmount,
        createdDate,
      };

      if (findIndexOfList !== -1) {
        const newData = [...state.data];
        newData[findIndexOfList] = { ...newInvoice };

        // Update Redux state immutably
        // state.data = newData;
        return { ...state, data: newData };
      }

      const findIndexOfDetail = state.detailList.findIndex(
        (product) => product._id === _id
      );

      if (findIndexOfDetail !== -1) {
        const newDetailList = [...state.detailList];
        newDetailList[findIndexOfDetail] = { ...action.payload };

        // Update Redux state immutably
        // state.data = newDetailList;
        return { ...state, data: newDetailList };
      }

      // Handle localforage.setItem asynchronously if needed
      localforage
        .setItem(INVOICES_KEY, [...state.data])
        .catch((error) =>
          console.error("Error storing data in IndexedDB:", error)
        );

      localforage
        .setItem(INVOICE_DETAILS, [...state.detailList])
        .catch((error) =>
          console.error("Error storing data in IndexedDB:", error)
        );

      // If the client is not found, return the current state
      return state;
    },

    setConfirmModalOpen: (state, action) => {
      state.isConfirmModal = action.payload;
    },

    setIsConfirm: (state, action) => {
      state.isConfirm = action.payload;
    },
  },
});

export const {
  setAllInvoice,
  setAllInvoiceDetailList,
  setNewInvoices,
  setDefaultColor,
  setDefaultBackground,
  setDeleteId,
  setEditedId,
  setSettingModalOpen,
  setConfirmModalOpen,
  setIsConfirm,
  onConfirmDeletedInvoice,
  onConfirmEditInvoice,
  updateNewInvoiceForm,
  updateNewInvoiceFormField,
  updateExisitingInvoiceForm,
} = invoiceSlice.actions;

export const getAllInvoiceSelector = (state) => state.invoices.data;

export const getAllInvoiceDetailSelector = (state) => state.invoices.detailList;

export const getInvoiceDetailByID = (id) => (state) =>
  state.invoices.detailList.find((detail) => detail._id === id);

export const getDeletedInvoiceForm = (state) => state.invoices.deletedID;

export const getInvoiceNewForm = (state) => state.invoices.newForm;

export const getIsInvoiceConfirmModal = (state) =>
  state.invoices.isConfirmModal;

export const getIsConfirm = (state) => state.invoices.isConfirm;

export const getTotalBalance = (state) =>
  state.invoices.data.reduce((prev, next) => {
    return prev + (next.totalAmount || 0);
  }, 0);

export default invoiceSlice.reducer;
