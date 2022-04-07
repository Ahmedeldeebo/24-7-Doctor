const mongoose = require("mongoose");

const BillSchema = new mongoose.Schema({
  Bill_Date: { type: Date, required: true },
  Bill_Amount: { type: Number, required: true },
  Bill_status: { type: String, required: true },
  Pat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  Doc_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
});

module.exports = mongoose.model("Bill", BillSchema);
