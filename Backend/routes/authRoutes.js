const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");
const Contact = require("../models/contact");

// Register Route
router.post("/register", async (req, res) => {
  const {
    role, name, email, password,
    medicalDegree, specialization, registrationNumber, experience, idProof,
    age, gender, bloodGroup, medicalHistory
  } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name, email, role, password: hashedPassword,
    };

    if (role === "doctor") {
      Object.assign(userData, {
        medicalDegree, specialization, registrationNumber, experience, idProof
      });
    } else if (role === "patient") {
      Object.assign(userData, {
        age, gender, bloodGroup, medicalHistory
      });
    }

    const newUser = new User(userData);
    await newUser.save();

    const contactEntry = new Contact({ name, email });
    await contactEntry.save();


    res.status(201).json({ message: "✅ Registered successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "❌ Server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "2h" });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "❌ Server error" });
  }
});


// Protected Profile Route
router.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization token missing or malformed" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });

  } catch (err) {
    console.error("❌ Profile Route Error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});



// Delete Account Route
router.delete("/delete/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
//message sendingroute 
router.post("/message/send", async (req, res) => {
  const { senderId, receiverId, message } = req.body;

  try {
    const newMsg = new Message({ senderId, receiverId, message });
    await newMsg.save();
    res.status(200).json({ success: true, message: "Message sent!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
});
//message receive route 
router.get("/message/:userId/:doctorId", async (req, res) => {
  const { userId, doctorId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: doctorId },
        { senderId: doctorId, receiverId: userId },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});
// GET all users except the logged-in one
router.get("/contacts", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const loggedInUserId = decoded.id;

    const users = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching contacts:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});




module.exports = router;
