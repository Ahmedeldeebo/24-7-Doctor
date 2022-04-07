const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
  pres_Description: { type: String, required: true },
  Pres_Arrival_Date: { type: Date, required: true },
  Appoinment: { type: Date, required: true },
  Phar_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pharmacy",
    require: true,
  },
  Pat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  
});

module.exports = mongoose.model("Prescription", prescriptionSchema);
