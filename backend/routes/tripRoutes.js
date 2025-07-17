const express = require("express");
const router = express.Router();
const Trip = require("../models/Trip"); // <-- correct relative path to Trip.js

// Create new trip
router.post("/", async (req, res) => {
  try {
    const { name, participants } = req.body;
    if (!name || !participants) {
      return res
        .status(400)
        .json({ error: "Name and participants are required" });
    }
    const trip = new Trip({ name, participants });
    await trip.save();
    res.status(201).json(trip);
  } catch (err) {
    console.error("Error creating trip:", err); // Add this line
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

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    trip.expenses.push({ description, amount, paidBy });
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

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    if (!trip.expenses[expenseIndex])
      return res.status(404).json({ error: "Expense not found" });

    trip.expenses[expenseIndex] = { description, amount, paidBy };
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
router.put("/:tripId/expenses/:expenseIndex", async (req, res) => {
  try {
    const { tripId, expenseIndex } = req.params;
    const { description, amount, paidBy } = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    if (!trip.expenses[expenseIndex])
      return res.status(404).json({ error: "Expense not found" });

    trip.expenses[expenseIndex] = { description, amount, paidBy };
    await trip.save();

    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
