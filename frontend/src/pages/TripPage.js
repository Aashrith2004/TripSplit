import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export default function TripPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [balances, setBalances] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    fetchTrip();
    fetchBalances();
  }, []);

  const fetchTrip = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/trips/${id}`
      );
      setTrip(res.data);
    } catch (err) {
      console.error("Error fetching trip:", err.message);
    }
  };

  const fetchBalances = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/trips/${id}/balances`
      );
      setBalances(res.data);
    } catch (err) {
      console.error("Error fetching balances:", err.message);
    }
  };
  const getChartData = () => {
    if (!trip) return [];

    const totals = {};
    trip.participants.forEach((p) => (totals[p] = 0));
    trip.expenses.forEach((e) => {
      totals[e.paidBy] = (totals[e.paidBy] || 0) + e.amount;
    });

    return Object.entries(totals).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const handleAddExpense = async () => {
    if (!description || !amount || !paidBy)
      return alert("All fields are required!");

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/trips/${id}/expenses`,
        {
          description,
          amount: parseFloat(amount),
          paidBy,
        }
      );
      fetchTrip();
      fetchBalances();
      setDescription("");
      setAmount("");
      setPaidBy("");
    } catch (err) {
      alert("Error adding expense");
      console.error(err);
    }
  };

  const handleUpdateExpense = async (index) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/trips/${id}/expenses/${index}`,
        {
          description,
          amount: parseFloat(amount),
          paidBy,
        }
      );
      setEditingIndex(null);
      fetchTrip();
      fetchBalances();
      setDescription("");
      setAmount("");
      setPaidBy("");
    } catch (err) {
      alert("Error updating expense");
      console.error(err);
    }
  };

  const handleDeleteExpense = async (index) => {
    if (!window.confirm("Are you sure you want to delete this expense?"))
      return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/trips/${id}/expenses/${index}`
      );
      fetchTrip();
      fetchBalances();
    } catch (err) {
      alert("Error deleting expense");
      console.error(err);
    }
  };
  const getSettlementSuggestions = (balances) => {
    if (!balances) return [];

    const debtors = [];
    const creditors = [];

    for (const [person, balance] of Object.entries(balances)) {
      if (balance < 0) debtors.push({ name: person, amount: -balance });
      else if (balance > 0) creditors.push({ name: person, amount: balance });
    }

    const settlements = [];
    let i = 0,
      j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const settleAmount = Math.min(debtor.amount, creditor.amount);

      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: settleAmount.toFixed(2),
      });

      debtor.amount -= settleAmount;
      creditor.amount -= settleAmount;

      if (debtor.amount === 0) i++;
      if (creditor.amount === 0) j++;
    }

    return settlements;
  };

  if (!trip)
    return (
      <p className="p-6 text-center text-gray-600">Loading trip details...</p>
    );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-indigo-700 mb-4">
        {trip.name} – Details
      </h1>
      <p className="mb-4 text-gray-700">
        👥 Participants: {trip.participants.join(", ")}
      </p>

      {/* Add Expense */}
      {editingIndex === null && (
        <>
          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-2">
            Add Expense
          </h2>
          <div className="space-y-2 mb-6">
            <input
              placeholder="Description"
              className="w-full p-2 border rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <input
              type="number"
              placeholder="Amount"
              className="w-full p-2 border rounded"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <select
              className="w-full p-2 border rounded"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
            >
              <option value="">Who paid?</option>
              {trip.participants.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddExpense}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              ➕ Add Expense
            </button>
          </div>
        </>
      )}

      {/* Expense List */}
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Expenses</h2>
      <ul className="space-y-2">
        {trip.expenses?.length === 0 ? (
          <p className="italic text-gray-500">No expenses yet.</p>
        ) : (
          trip.expenses.map((e, index) => (
            <li key={index} className="border rounded p-3 bg-white shadow">
              {editingIndex === index ? (
                <div className="space-y-2">
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-1 border rounded"
                  />
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="number"
                    className="w-full p-1 border rounded"
                  />
                  <select
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    className="w-full p-1 border rounded"
                  >
                    <option value="">Who paid?</option>
                    {trip.participants.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded"
                    onClick={() => handleUpdateExpense(index)}
                  >
                    ✅ Save
                  </button>
                  <button
                    className="ml-2 bg-gray-400 text-white px-2 py-1 rounded"
                    onClick={() => setEditingIndex(null)}
                  >
                    ❌ Cancel
                  </button>
                </div>
              ) : (
                <>
                  {e.paidBy} paid ₹{e.amount} for "{e.description}"
                  <button
                    className="ml-3 text-blue-500 underline"
                    onClick={() => {
                      setEditingIndex(index);
                      setDescription(e.description);
                      setAmount(e.amount);
                      setPaidBy(e.paidBy);
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="ml-3 text-red-500 underline"
                    onClick={() => handleDeleteExpense(index)}
                  >
                    🗑️ Delete
                  </button>
                </>
              )}
            </li>
          ))
        )}
      </ul>

      {/* Balances Section */}
      <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-2">
        💰 Balances
      </h2>
      {!balances ? (
        <p className="text-gray-500 italic">Calculating...</p>
      ) : (
        <div className="bg-gray-50 p-4 rounded shadow space-y-2 mt-4">
          <p>Total Spent: ₹{balances.totalSpent}</p>
          <p>Each should pay: ₹{balances.fairShare.toFixed(2)}</p>
          <ul>
            {Object.entries(balances.balances).map(([person, balance]) => (
              <li key={person} className="text-gray-700">
                {person}:{" "}
                {balance < 0
                  ? `owes ₹${Math.abs(balance).toFixed(2)}`
                  : `gets back ₹${balance.toFixed(2)}`}
              </li>
            ))}
          </ul>
        </div>
      )}
      <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-2">
        🤝 Suggested Settlements
      </h2>
      {balances && (
        <ul className="list-disc ml-6 text-gray-700">
          {getSettlementSuggestions(balances.balances).map((s, idx) => (
            <li key={idx}>
              {s.from} should pay ₹{s.amount} to {s.to}
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-2">
        📊 Expense Distribution
      </h2>
      <PieChart width={350} height={300}>
        <Pie
          data={getChartData()}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
          label
        >
          {getChartData().map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={["#8884d8", "#82ca9d", "#ffc658", "#ff8042"][index % 4]}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}
