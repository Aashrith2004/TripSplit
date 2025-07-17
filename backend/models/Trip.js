const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    participants: [{ type: String }],
    expenses: [
      {
        description: String,
        amount: Number,
        paidBy: String,
      },
    ],
    contributions: [
      {
        name: String,
        amount: Number,
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("Trip", tripSchema); //
