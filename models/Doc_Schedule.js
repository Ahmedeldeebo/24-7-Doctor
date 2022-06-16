const mongoose = require("mongoose");

const Doc_scheduleSchema = new mongoose.Schema({
  Meeting_Maximum_Patient: { type: String, required: false, default: "" },
  Available_methods: [{ type: String, required: false, default: "" }],
  AveWating_Time: { type: String, required: false, default: "" },
  Start_Time: { type: String, required: false, default: "" },
  Available_Days: [{ type: String, required: false, default: "" }],
  Upfront_fees: { type: String, required: false, default: "" },
  Doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    unique: true,
    required: true,
  },
});

module.exports = mongoose.model("Doc_schedule", Doc_scheduleSchema);
