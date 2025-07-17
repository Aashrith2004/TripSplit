import React, { useState, useEffect } from "react";
import { getTrips, createTrip } from "../services/api";

export default function HomePage() {
  const [trips, setTrips] = useState([]);
  const [tripName, setTripName] = useState("");
  const [participants, setParticipants] = useState("");

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    const res = await getTrips();
    setTrips(res.data);
  };

  const handleCreateTrip = async () => {
    if (!tripName.trim()) return alert("Trip name is required");
    const participantList = participants
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p);
    const res = await createTrip({
      name: tripName,
      participants: participantList,
    });
    setTrips([...trips, res.data]);
    setTripName("");
    setParticipants("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-4xl font-bold mb-6 text-center text-indigo-700">
          Trip Splitter 💸
        </h1>

        <div className="space-y-4 mb-6">
          <input
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Trip name (e.g., Goa Trip)"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
          />
          <input
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Participants (comma-separated)"
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
          />
          <button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-all"
            onClick={handleCreateTrip}
          >
            ➕ Create Trip
          </button>
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Your Trips
        </h2>

        {trips.length === 0 ? (
          <p className="text-gray-500 italic">No trips found. Add one above!</p>
        ) : (
          <ul className="space-y-4">
            {trips.map((trip) => (
              <li
                key={trip._id}
                className="bg-gray-50 border border-gray-200 p-4 rounded-xl shadow-sm"
              >
                <h3 className="text-xl font-bold text-indigo-700">
                  {trip.name}
                </h3>
                <p className="text-gray-600 mt-1">
                  👥 Participants:{" "}
                  <span className="font-medium text-gray-800">
                    {trip.participants.join(", ")}
                  </span>
                </p>

                {/* View Details Link */}
                <a
                  href={`/trip/${trip._id}`}
                  className="text-indigo-600 underline hover:text-indigo-800 text-sm mt-2 inline-block"
                >
                  View Details →
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
