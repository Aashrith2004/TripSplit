const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, "Trip name is required"],
      trim: true,
      minlength: [1, "Trip name cannot be empty"]
    },
    participants: [{ 
      type: String, 
      required: true,
      trim: true,
      minlength: [1, "Participant name cannot be empty"]
    }],
    expenses: [
      {
        description: { 
          type: String, 
          required: [true, "Expense description is required"],
          trim: true,
          minlength: [1, "Expense description cannot be empty"]
        },
        amount: { 
          type: Number, 
          required: [true, "Expense amount is required"],
          min: [0.01, "Expense amount must be greater than 0"]
        },
        paidBy: { 
          type: String, 
          required: [true, "Payer name is required"],
          trim: true,
          minlength: [1, "Payer name cannot be empty"]
        },
      },
    ],
    contributions: [
      {
        name: { 
          type: String, 
          required: true,
          trim: true,
          minlength: [1, "Contributor name cannot be empty"]
        },
        amount: { 
          type: Number, 
          required: true,
          min: [0, "Contribution amount must be non-negative"]
        },
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("Trip", tripSchema); //
