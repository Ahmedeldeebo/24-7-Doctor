const mongoose = require("mongoose");

const Meet_LinkSchema = new mongoose.Schema(
  {
    Meeting_link: { type: String, required: true },

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
    Appoinment_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Aappointment",
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meet_Link", Meet_LinkSchema);
