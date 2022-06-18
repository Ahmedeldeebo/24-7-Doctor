const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    Pat_username: { type: String, required: true, unique: true },
    pat_FirstName: { type: String, required: true },
    pat_Lastname: { type: String, required: true },
    pat_Email: { type: String, required: true, unique: true },
    pat_Gender: { type: String, required: true },
    pat_password: { type: String, required: true },
    pat_birthday: { type: String, required: true },
    pat_InsuranceNo: {
      type: String,
      required: false,
      unique: true,
      default: "N/A",
    },
    Pat_TelNo: {
      type: String,
      required: false,
      default: "Enter your Phone Number",
    },
    city: { type: String, required: false, default: "Enter your city" },
    addres_details: {
      type: String,
      required: false,
      default: "Enter your Addres",
    },
    area: {
      type: String,
      required: false,
      default: "Enter your Area",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
