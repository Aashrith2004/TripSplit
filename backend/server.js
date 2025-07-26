const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const tripRoutes = require("./routes/tripRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "TripSplit API is running" });
});

app.use("/api/trips", tripRoutes);

// Connect to database and start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
