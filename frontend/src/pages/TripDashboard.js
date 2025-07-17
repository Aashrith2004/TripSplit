import React, { useEffect, useState } from "react";
import { MapPin, DollarSign, Users } from "lucide-react";
import axios from "axios"; // Axios for API calls

const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch trips from backend
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/trips"); // Change if hosted
        setTrips(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching trips:", error);
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  // Calculate totals dynamically
  const totalExpenses = trips.reduce((acc, trip) => acc + trip.amount, 0);
  const uniqueFriends = new Set(trips.flatMap((trip) => trip.participants));

  return (
    <div className="p-6 space-y-8 min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Trip Expense Splitter</h1>
        <p className="text-gray-500 text-sm">Split expenses with friends easily and fairly</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <StatCard icon={<MapPin />} label="Total Trips" value={trips.length} color="bg-blue-600" />
        <StatCard icon={<DollarSign />} label="Total Expenses" value={`₹${totalExpenses}`} color="bg-green-600" />
        <StatCard icon={<Users />} label="Active Friends" value={uniqueFriends.size} color="bg-purple-600" />
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Trips</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          + Create New Trip
        </button>
      </div>

      {loading ? (
        <p>Loading trips...</p>
      ) : (
        <div className="flex flex-wrap gap-4">
          {trips.map((trip, idx) => (
            <TripCard key={idx} {...trip} />
          ))}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className={`flex-1 p-4 rounded-xl text-white ${color}`}>
    <div className="flex items-center gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <h2 className="text-2xl font-bold">{value}</h2>
      </div>
    </div>
  </div>
);

const TripCard = ({ title, participants, amount }) => (
  <div className="border rounded-lg p-4 shadow-md w-full md:w-80 bg-white">
    <div className="flex justify-between items-center mb-2">
      <h3 className="font-semibold">{title}</h3>
      <span className="text-gray-500 cursor-pointer">→</span>
    </div>
    <p className="text-sm text-gray-500">{participants.length} participants</p>
    <p className="text-sm text-gray-700 font-medium mt-1">₹{amount} total spent</p>
    <div className="mt-3 flex flex-wrap gap-2">
      {participants.map((p, i) => (
        <span key={i} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
          {p}
        </span>
      ))}
    </div>
  </div>
);

export default Dashboard;
