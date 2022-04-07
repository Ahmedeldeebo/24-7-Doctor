const mongoose = require("mongoose");

const Doc_scheduleSchema = new mongoose.Schema({
  Meeting_Maximum_Patient: { type: Number, required: true },
  Meeting_lco: { type: String, requrid: true },
  End_Time: { type: Date, requrid: true },
  Start_Time: { type: Date, requrid: true },
  Doctor_Date: { type: String, required: true },
  Doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
});

module.exports = mongoose.model("Doc_schedule", Doc_scheduleSchema);
