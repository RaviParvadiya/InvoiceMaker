import { createSlice } from "@reduxjs/toolkit";
import localforage from "localforage";
// import { nanoid } from "nanoid";
import { CLIENTS_KEY, CLIENT_FORM_KEY } from "../constants/localKeys";

const initialState = {
  data: [],
  newForm: {
    accountno: "",
    name: "",
    mobileno: "",
  },
  editedID: null,
  deletedID: null,
};

export const clientsSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    addNewClient: (state, action) => {
      const newDatas = [...state.data, action.payload];
      state.data = newDatas;
      localforage.setItem(CLIENTS_KEY, newDatas);

      const reNewForm = {
        accountno: "",
        name: "",
        mobileno: "",
      };

      state.newForm = { ...reNewForm };
      localforage.setItem(CLIENT_FORM_KEY, reNewForm);
    },

    updateNewClientForm: (state, action) => {
      state.newForm = { ...action.payload };
      localforage.setItem(CLIENT_FORM_KEY, { ...state.newForm });
    },

    updateNewClientFormField: (state, action) => {
      state.newForm[action.payload.key] = action.payload.value;
      localforage.setItem(CLIENT_FORM_KEY, { ...state.newForm });
    },

    setAllClients: (state, action) => {
      state.data = action.payload;
    },

    setDeleteId: (state, action) => {
      state.deletedID = action.payload;
    },

    setEditedId: (state, action) => {
      state.editedID = action.payload;
    },

    onConfirmDeletedClient: (state, action) => {
      const newDatas = state.data.filter(
        (client) => client._id !== state.deletedID
      );
      state.data = newDatas;
      state.deletedID = null;
      localforage
        .setItem(CLIENTS_KEY, JSON.parse(JSON.stringify(newDatas)))
        .catch((error) =>
          console.error("Error storing data in IndexedDB:", error)
        );
    },

        onConfirmEditClient: (state, action) => {
      const isFindIndex = state.data.findIndex(
        (client) => client._id === state.editedID
      );
      if (isFindIndex !== -1) {
        state.data[isFindIndex] = JSON.parse(JSON.stringify(action.payload));
      }
      state.editedID = null;
      localforage.setItem(CLIENTS_KEY, JSON.parse(JSON.stringify(state.data)));
    },
  },
});

export const {
  addNewClient,
  updateNewClientForm,
  updateNewClientFormField,
  setAllClients,
  setDeleteId,
  setEditedId,
  onConfirmDeletedClient,
  onConfirmEditClient,
} = clientsSlice.actions;

export const getAllClientsSelector = (state) => state.clients.data;

export const getClientNewForm = (state) => state.clients.newForm;

export const getDeletedClientForm = (state) => state.clients.deletedID;

export const getEditedIdForm = (state) => state.clients.editedID;

export default clientsSlice.reducer;
