const { default: mongoose } = require("mongoose");
const mongosose = require("mongoose");

const PaymentSchema = new mongosose.Schema({
  status: { type: String, required: true, default: "Successfully" },
  Web_Commission: { type: Number, required: false },
  Pay_Amount: { type: String, required: true },
  Pay_type: { type: String, required: true },
  Pay_Card_Holder: { type: String, required: false },
  Pay_Card_Number: { type: Number, required: false },
  Pay_Card_expDate: { type: String, required: false },
  Pay_PayPal_Email: { type: String, required: false },
  Pay_VodCash_Number: { type: Number, required: false },
  Pay_Date: {
    type: Date,
    required: true,
    immutable: true,
    default: () => Date.now(),
  },
  Bill_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bill",
    required: true,
  },
  Pat_Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  Appoinment_Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Aappointment",
    required: true,
    unique: true,
  },
  Doc_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
});

module.exports = mongosose.model("Payment", PaymentSchema);
