const express = require("express");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Serve Frontend
app.use(express.static(path.join(__dirname, "../Frontend")));

// ✅ API Routes
app.use("/api/auth", require("./routes/authRoutes")); // login/register
app.use("/api/user", require("./routes/authRoutes")); // user list, profile
app.use("/api/messages", require("./routes/authRoutes")); // message send/get
app.use("/api/contact", require("./routes/authRoutes")); //contacts me hi user bhi save hoyege


// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
