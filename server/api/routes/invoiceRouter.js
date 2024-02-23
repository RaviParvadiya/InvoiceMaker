const express = require("express");
const invoiceController = require("../controllers/invoiceController");

const invoiceRouter = express.Router();

invoiceRouter.get("/getallinvoices", invoiceController.getAllInvoices);
invoiceRouter.post("/createinvoice", invoiceController.createInvoice);
/* invoiceRouter.post('/createinvoice', ((req, res) => {
    console.log("requested data", req.body);
    invoiceController.getAllInvoices(res);
})); */
invoiceRouter.put("/:id", invoiceController.updateInvoiceById);
invoiceRouter.delete("/:id", invoiceController.deleteInvoiceById);

module.exports = invoiceRouter;
