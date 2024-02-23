const mongoose = require('mongoose');
const validator = require("validator");

const UserAccountSchema = new mongoose.Schema({
  accountno: {
    type: Number,
  },
  name: {
    type: String,
    required: [true, "Required"],
  },
  mobileno: {
    type: String,
    required: [true, "Required"],
    trim: true,
    unique: true,
    min: [1, "not valid mobileno"],
    validate(val) {
      if (!validator.isMobilePhone(val)) {
        throw new Error("not valid mobileno");
      }
    },
  },
  createdAt: {
    type: String,
    default: new Date(),
  },
  updatedAt: {
    type: String,
    default: null,
  },
});

const UserAccountModel = mongoose.model("UserAccount", UserAccountSchema);
module.exports = UserAccountModel;
