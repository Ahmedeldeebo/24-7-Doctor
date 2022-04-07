const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema({
  Last_Remeinder: { type: Date, required: true },
  Pat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  Record_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PatientRecored",
    required: true,
  },
});

module.exports = mongoose.model("Survey", surveySchema);
