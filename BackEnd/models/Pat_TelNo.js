const mongoose = require("mongoose");

const pat_TelNoSchema = new mongoose.Schema({
  Pat_TelNo: { type: Number, required: true },
  Pat_WhatsAppNo: { type: Number, required: true },
  Pat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
});

module.exports = mongoose.model("patientRecored", pat_TelNoSchema);
