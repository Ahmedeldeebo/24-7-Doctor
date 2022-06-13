const mongoose = require("mongoose");

const BillSchema = new mongoose.Schema({
  Bill_Date: {
    type: Date,
    required: true,
    immutable: true,
    default: () => Date.now(),
  },
  Bill_Amount: { type: Number, required: true },
  Bill_status: { type: String, required: false, default: "Not Paid" },
  Pat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  Appoinment_Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Aappointment",
    required: true,
    unique: true,
  },
  Doc_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
});

module.exports = mongoose.model("Bill", BillSchema);
