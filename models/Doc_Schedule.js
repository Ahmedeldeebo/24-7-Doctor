const mongoose = require("mongoose");

const Doc_scheduleSchema = new mongoose.Schema({
  Meeting_Maximum_Patient: { type: String, required: true },
  Available_methods: { type: String, requrid: true },
  AveWating_Time: { type: String, requrid: true },
  Start_Time: { type: String, requrid: true },
  Available_Days: { type: String, requrid: true },
  Upfront_fees: { type: String, require: true },
  Doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
});

module.exports = mongoose.model("Doc_schedule", Doc_scheduleSchema);
