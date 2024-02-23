const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
  createdDate: {
    type: Date,
    default: Date.now,
  },
  invoiceName: {
    type: String,
    required: true,
  },
  products: [
    {
      _id: {
        type: String,
        // default: () => mongoose.Types.ObjectId().toString(),
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      date: {
        type: String,
        required: true,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  statusName: {
    type: String,
    required: true,
    default: "Draft"
  },
  statusIndex: {
    type: Number,
    required: true,
    default: 1,
  }
});

const InvoiceModel = mongoose.model("invoice", InvoiceSchema);
module.exports = InvoiceModel;
