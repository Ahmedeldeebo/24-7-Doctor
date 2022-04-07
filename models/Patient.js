const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    Pat_username: { type: String, required: true, unique: true },
    pat_FirstName: { type: String, required: true },
    pat_Lastname: { type: String, required: true },
    pat_Email: { type: String, required: true },
    pat_Gender: { type: String, require: true },
    pat_password: { type: String, require: true },
    pat_birthday: { type: String, require: true },
    pat_InsuranceNo: { type: String, require: false, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
