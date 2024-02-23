const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRouter = require("./api/routes/userRouter");
const invoiceRouter = require("./api/routes/invoiceRouter");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const DATABASE_URL = process.env.DATABASE_URL;

// Enable CORS for all routes
app.use(cors());

// Connect to MongoDB
mongoose.connect(DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use("/users", userRouter);
app.use("/invoices", invoiceRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
