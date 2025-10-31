const mongoose = require("mongoose");

const clientAdminSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
      match: /^[A-Za-z\s]+$/, // letters and spaces only
    },

    email: {
      type: String,
      maxlength: 254,
      required: true,
      unique: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // basic email regex
    },

    password: {
      type: String,
      required: true,
    },

    phonenumber: {
      type: String,
      required: true,
      match: /^\d{10,15}$/, // 10–15 digits only
    },

    schoolType: {
      type: String,
      required: true,
      enum: ["Private", "Government"],
    },

    schoolname: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },

    state: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 150,
    },

    profilePicUrl: {
      type: String,
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

    udisecode: {
      type: String,
      required: true,
      index: true,
      match: /^\d{11}$/, // exactly 11 digits
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SchoolAdmin", clientAdminSchema);
