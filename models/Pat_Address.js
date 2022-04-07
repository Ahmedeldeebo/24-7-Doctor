const mongoose = require("mongoose");

const pat_AddressSchema = new mongoose.Schema({
  Pat_Address: { type: String, required: true },
  pat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  city: { type: String, required: true },
  district: { type: String, required: true },
  addres_details: { type: String, required: true },
});

module.exports = mongoose.model("Pat_Address", pat_AddressSchema);
