const mongoose = require("mongoose");

const Doc_scheduleSchema = new mongoose.Schema({
  Meeting_Maximum_Patient: { type: String, required: true },
  Available_methods: { type: String, required: true },
  AveWating_Time: { type: String, required: true },
  Start_Time: { type: String, required: true },
  Available_Days: { type: String, required: true },
  Upfront_fees: { type: String, required: true },
  Doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
});

module.exports = mongoose.model("Doc_schedule", Doc_scheduleSchema);
