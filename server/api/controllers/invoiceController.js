const InvoiceModel = require("../models/invoiceModel");

const invoiceController = {
  createInvoice: async (req, res) => {
    try {
      const invoiceData = req.body;
      const newInvoice = new InvoiceModel(invoiceData);
      const savedInvoice = await newInvoice.save();
      res.status(201).json(savedInvoice);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getAllInvoices: async (req, res) => {
    try {
      const allInvoices = await InvoiceModel.find();
      res.status(200).json(allInvoices);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updateInvoiceById: async (req, res) => {
    const { id } = req.params;
    try {
      const updatedInvoice = await InvoiceModel.findByIdAndUpdate(id, req.body, { new: true });
      if (!updatedInvoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      res.status(200).json(updatedInvoice);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  deleteInvoiceById: async (req, res) => {
    const { id } = req.params;
    try {
      const deletedInvoice = await InvoiceModel.findByIdAndDelete(id);
      if (!deletedInvoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = invoiceController;
