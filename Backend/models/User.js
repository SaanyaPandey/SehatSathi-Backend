const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, enum: ["patient", "doctor"], required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Doctor-specific fields
  medicalDegree: String,
  specialization: String,
  registrationNumber: String,
  experience: String,
  idProof: String, // file name or path if you want to save

  // Patient-specific fields
  age: Number,
  gender: String,
  bloodGroup: String,
  medicalHistory: String,
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
