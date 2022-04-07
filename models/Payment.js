const { default: mongoose } = require("mongoose");
const mongosose = require("mongoose");

const PatientSchema = new mongosose.Schema({
  status: { type: String, required: true },
  Web_Commission: { type: Number, required: true },
  Pay_Amount: { type: Number, required: true },
  Pay_type: { type: String, required: true },
  Pay_Date: { type: Date, required: true },
  Bill_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bill",
    required: true,
  },
});

module.exports = mongosose.model("Patient", PatientSchema);
