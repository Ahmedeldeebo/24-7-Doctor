const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    ticket_Name: { type: String, required: true },
    ticket_Email: { type: String, required: true },
    ticket_details: { type: String, required: true },
    pat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
