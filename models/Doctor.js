const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema(
  {
    Doc_username: { type: String, required: true, unique: true, trim: true },
    Doc_FirstName: { type: String, required: true, trim: true, lowercase: true },
    Doc_Lastname: { type: String, required: true, trim: true ,  lowercase: true},
    Doc_Email: { type: String, required: true, unique: true, trim: true },
    Doc_Gender: { type: String, required: true },
    Doc_password: { type: String, required: true },
    Specialization_Name: { type: String, required: true },
    Doc_birtday: { type: Date, required: true },
    Doc_TelNo: {
      type: String,
      required: false,
      trim: true,
      default: "Enter your Phone Number",
    },
    Doc_TelNoWhatsapp: {
      type: String,
      required: false,
      trim: true,
      default: "Enter your Phone Number",
    },
    city: {
      type: String,
      required: false,
      trim: true,
      default: "Enter your city",
    },
    addres_details: {
      type: String,
      required: false,
      trim: true,
      default: "Enter your Addres",
    },
    Pres_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", DoctorSchema);
