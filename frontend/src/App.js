import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import TripPage from "./pages/TripPage"; // ⬅️ make sure this file exists

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/trip/:id" element={<TripPage />} /> {/* Dynamic Route */}
      </Routes>
    </Router>
  );
}

export default App;
