const mongoose = require("mongoose");

const PharmacySchema = new mongoose.Schema({
  Phar_location: { type: String, required: true },
  Phar_name: { type: String, required: true },
  Phar_userName: { type: String, required: true },
  Phar_Email: { type: String, required: true },
  Phar_PhoneNumber: { type: Number, required: true },
  Phar_Password: { type: String, required: true },
  Pat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: false,
  },
  pres_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Prescription",
    required: false,
  },
});

module.exports = mongoose.model("Pharmacy", PharmacySchema);
