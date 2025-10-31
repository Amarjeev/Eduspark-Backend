// models/Student.js
const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    udisecode: {
      type: String,
      required: true,
      index: true,
    },
    schoolname: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    authorizedPersonName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "student",
    },
    className: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    govIdType: {
      type: String,
      enum: ["Aadhar", "Passport"],
      required: true,
    },
    govIdNumber: {
      type: String,
      required: true,
      unique: true,
    },
    studentId: {
      type: String,
      unique: true,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      match: [/^\d{6}$/, "Please enter a valid 6-digit pincode"],
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      match: [/^\d{10}$/, "Please enter a valid 10-digit mobile number"],
      required: true,
    },
    secondaryMobileNumber: {
      type: String,
      match: [/^\d{10}$/, "Please enter a valid 10-digit mobile number"],
    },
    admissionDate: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "deleted", "blocked"],
      default: "active",
    },
    profilePicUrl: { type: String },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);


module.exports = mongoose.model("StudentProfile", StudentSchema);
