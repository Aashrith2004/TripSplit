const express = require("express");
const router = express.Router();
const Trip = require("../models/Trip"); // <-- correct relative path to Trip.js

// Create new trip
router.post("/", async (req, res) => {
  try {
    const { name, participants } = req.body;
    
    // Input validation
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Trip name is required" });
    }
    
    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ error: "At least one participant is required" });
    }
    const validParticipants = participants.filter(p => p && p.trim() !== "");
    if (validParticipants.length === 0) {
      return res.status(400).json({ error: "At least one valid participant is required" });
    }
    
    const trip = new Trip({ 
      name: name.trim(), 
      participants: validParticipants 
    });
    await trip.save();
    res.status(201).json(trip);
  } catch (err) {
    console.error("Error creating trip:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all trips
router.get("/", async (req, res) => {
  try {
    const trips = await Trip.find();
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add an expense to a trip
router.post("/:tripId/expenses", async (req, res) => {
  try {
    const { tripId } = req.params;
    const { description, amount, paidBy } = req.body;

    // Input validation
    if (!description || description.trim() === "") {
      return res.status(400).json({ error: "Expense description is required" });
    }
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Valid expense amount is required" });
    }
    
    if (!paidBy || paidBy.trim() === "") {
      return res.status(400).json({ error: "Payer name is required" });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    // Check if payer is a participant
    if (!trip.participants.includes(paidBy.trim())) {
      return res.status(400).json({ error: "Payer must be a trip participant" });
    }

    trip.expenses.push({ 
      description: description.trim(), 
      amount: parseFloat(amount), 
      paidBy: paidBy.trim() 
    });
    await trip.save();

    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Calculate balance for a trip
// Calculate balances for a trip
router.get("/:id/balances", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const participants = trip.participants;
    const expenses = trip.expenses;

    // Calculate total spent per person
    const totalSpentBy = {};
    participants.forEach((p) => (totalSpentBy[p] = 0));
    expenses.forEach(({ amount, paidBy }) => {
      totalSpentBy[paidBy] = (totalSpentBy[paidBy] || 0) + amount;
    });

    // Calculate total spent overall
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const fairShare = totalSpent / participants.length;

    // Calculate balances: positive means gets back, negative means owes
    const balances = {};
    participants.forEach((p) => {
      balances[p] = totalSpentBy[p] - fairShare;
    });

    res.json({ totalSpent, fairShare, balances });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trip not found" });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Update a specific expense in a trip
router.put("/:tripId/expenses/:expenseIndex", async (req, res) => {
  try {
    const { tripId, expenseIndex } = req.params;
    const { description, amount, paidBy } = req.body;

    // Input validation
    if (!description || description.trim() === "") {
      return res.status(400).json({ error: "Expense description is required" });
    }
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Valid expense amount is required" });
    }
    
    if (!paidBy || paidBy.trim() === "") {
      return res.status(400).json({ error: "Payer name is required" });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    if (!trip.expenses[expenseIndex])
      return res.status(404).json({ error: "Expense not found" });

    // Check if payer is a participant
    if (!trip.participants.includes(paidBy.trim())) {
      return res.status(400).json({ error: "Payer must be a trip participant" });
    }

    trip.expenses[expenseIndex] = { 
      description: description.trim(), 
      amount: parseFloat(amount), 
      paidBy: paidBy.trim() 
    };
    await trip.save();

    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Delete a specific expense by index
router.delete("/:tripId/expenses/:expenseIndex", async (req, res) => {
  try {
    const { tripId, expenseIndex } = req.params;

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    if (!trip.expenses[expenseIndex])
      return res.status(404).json({ error: "Expense not found" });

    trip.expenses.splice(expenseIndex, 1); // Remove the expense
    await trip.save();

    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
