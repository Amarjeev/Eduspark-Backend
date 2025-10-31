const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    mobileNumber: {
      type: String,
      required: true,
      match: /^[6-9]\d{9}$/,
      trim: true,
    },
    role: {
      type: String,
      default: "parent",
    },
    udisecode: {
      type: String,
      required: true,
      index: true 
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 100,
    },
    schoolname: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
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
    profilePicUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);



module.exports = mongoose.models.Parent || mongoose.model("ParentProfile", parentSchema);

