const mongosose = require("mongoose");

const Pat_DocTElNoSchema = new mongosose.Schema({
  Doc_Id: { type: mongoose.Schema.ObjectId, ref: "Doctor", required: true },
  Doc_WhatsAppNo: { type: Number, required: true },
  
});

module.exports = mongosose.model("Pat_DocTelNo", Pat_DocTElNoSchema);
