const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
  pres_Description: { type: String, required: true },
  Pres_Arrival_Date: {
    type: Date,
    required: true,
    immutable: true,
    default: () => Date.now(),
  },
  Appoinment_Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Aappointment",
    required: true,
  },
  Pat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  Doc_Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
});

module.exports = mongoose.model("Prescription", prescriptionSchema);
