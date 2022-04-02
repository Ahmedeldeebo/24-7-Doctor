const mongoose = require("mongoose");

const QuerySchema = new mongoose.Schema({
  Qusstion: { type: String, required: true },
  Answer: { type: String, required: true },
  Doc_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  Pat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  
});

module.exports = mongoose.model("Query", QuerySchema);
