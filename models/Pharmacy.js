const mongoose = require("mongoose");

const PahrmacySchema = new mongoose.Schema({
  Phar_location: { type: String, required: true },
  Phar_name: { type: String, required: true },
  Pat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  pres_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Prescription",
    required: true,
  },
});

module.exports = mongoose.model("Pharmacy", PahrmacySchema);
