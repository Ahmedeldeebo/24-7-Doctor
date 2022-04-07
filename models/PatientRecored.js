const mongoose = require("mongoose");

const patientRecoredSchema = new mongoose.Schema({
  Last_bills: { typeKey: Number, required: true },
  DateAndTime: { type: Date, required: true },
  Patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  Last_Appointmenst: { type: DateAndTime, required: true },
  Prescriptions: { type: String, required: true },
});

module.exports = mongoose.model("patientRecored", patientRecoredSchema);
