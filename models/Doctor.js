const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema(
  {
    Doc_username: { type: String, required: true, unique: true },
    Doc_FirstName: { type: String, required: true },
    Doc_Lastname: { type: String, required: true },
    Doc_Email: { type: String, required: true },
    Doc_Gender: { type: String, require: true },
    Doc_password: { type: String, require: true },
    Doc_birtday: { type: Date, require: true },
    Pres_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      required: true,
    },
    Upfornt_fees: { type: Number, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", DoctorSchema);
