const mongoose=require("mongoose");

const patientRecoredSchema=new mongoose.Schema({
});

module.exports=mongoose.model("patientRecored",patientRecoredSchema);