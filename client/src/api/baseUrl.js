import axios from 'axios'

const API = axios.create({ baseURL: 'http://localhost:5000'})
// const API = axios.create({ baseURL: process.env.REACT_APP_API})

export const fetchInvoices =() => API.get('/invoices/getallinvoices')
export const createInvoice =( invoice ) => API.post('/invoices/createinvoice', invoice)
export const updateInvoice = (id, updatedInvoice) => API.put(`/invoices/${id}`, updatedInvoice)
export const deleteInvoice =(id) => API.delete(`/invoices/${id}`)

export const fetchUsers = () => API.get('/users/getallusers');
export const createUser =( user ) => API.post('/users/createuser', user)
export const updateUser = (id, updatedClient) => API.put(`/users/updateuserbyid/${id}`, updatedClient)
export const deleteUser =(id) => API.delete(`/users/deleteuserbyid/${id}`)