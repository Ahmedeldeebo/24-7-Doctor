const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
  pres_Description: { type: String, required: true },
  Pres_Arrival_Date: {
    type: Date,
    required: true,
    immutable: true,
    default: () => Date.now(),
  },
  CheckUpDay: { type: Date, required: true },
  Appoinment_Id: {
    unique: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "Aappointment",
    required: true,
  },
  Pat_Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  Doc_Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  Phar_Id: {
    unique: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pharmacy",
    required: false,
  },
});

module.exports = mongoose.model("Prescription", prescriptionSchema);
