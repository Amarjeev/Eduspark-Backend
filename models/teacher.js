const mongoose = require("mongoose");
const schoolDepartments = require("../referenceData/schoolDepartments");

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: { type: String, required: true, select: false },
    phonenumber: { type: String, required: true },
    subject: { type: String, required: true },
    department: { type: String, required: true, enum: schoolDepartments },
    employId: { type: String, required: true, unique: true },
    profilePicUrl: { type: String },
    schoolname: { type: String, required: true },
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
      index: true ,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d{11}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid 11-digit School code!`,
      },
    },
    role: {
      type: String,
      enum: ["teacher"],
      default: "teacher",
    },
    govidtype: {
      type: String,
      enum: ["Aadhar", "License", "VoterId"],
      required: true,
    },
    govidnumber: {
      type: String,
      required: true,
    },
    assignedClasses: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TeacherProfile", teacherSchema);
