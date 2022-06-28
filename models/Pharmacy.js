const mongoose = require("mongoose");

const PharmacySchema = new mongoose.Schema(
  {
    Phar_location: { type: String, required: true, lowercase: true },
    Phar_name: { type: String, required: true, lowercase: true },
    Phar_userName: { type: String, required: true, unique: true },
    Phar_Email: { type: String, required: true, unique: true, trim: true },
    Phar_PhoneNumber: { type: Number, required: true },
    Phar_WhatsappPhoneNumber: { type: Number, required: false },
    Phar_Password: { type: String, required: true },
    Pat_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: false,
    },
    pres_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      required: false,
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

module.exports = mongoose.model("Pharmacy", PharmacySchema);
