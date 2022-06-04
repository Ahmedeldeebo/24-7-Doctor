const mongoose = require("mongoose");

const AappointmentSchema = new mongoose.Schema(
  {
    Methed_of_comm: { type: String, required: true },
    App_visit_day: { type: String, required: true },
    App_visit_status: { type: String, required: false, default: "N/A" },
    App_RegVisit_time: { type: String, required: true },
    Doc_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    Pat_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Aappointment", AappointmentSchema);
