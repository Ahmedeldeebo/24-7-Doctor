const mongoose = require("mongoose");

const AappointmentSchema = new mongoose.Schema({
  Zoom_address: { type: String, required: true },
  App_visit_date: { type: Date, required: true },
  App_visit_status: { type: String, required: true },
  App_RegVisit_time: { type: String, required: true },
  Dco_Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  Pat_Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
});

module.exports = mongoose.model("Aappointment", AappointmentSchema);
