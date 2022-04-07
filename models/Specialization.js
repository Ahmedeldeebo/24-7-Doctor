const mongoose = require("mongoose");

const specializationSchema = new mongoose.Schema({

    Specialization_Name: { type: String, required: true },
    
});


module.exports = mongoose.model("Specialization", specializationSchema);