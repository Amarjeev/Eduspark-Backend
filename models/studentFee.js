const mongoose = require("mongoose");

// 🎓 Sub-schema for embedded student data (no _id, used for fast lookups)
const StudentInfoSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },
    name: { type: String, required: true },
    className: { type: String, required: true }, // ✅ Consistent naming
    admissionDate: { type: Date, required: true },
  },
  { _id: false }
);

// 💰 Main schema for student fee records
const StudentFeeSchema = new mongoose.Schema(
  {
    udisecode: {
      type: String,
      required: true,
      index: true, // ⚡ Faster filtering by school
    },
    studentData: {
      type: StudentInfoSchema,
      required: true,
    },
    totalFee: {
      type: Number,
      required: true,
      min: 0,
    },
    balancePaying: {
      type: Number,
      required: true,
      min: 0,
    },
    currentPaying: {
      type: Number,
      required: true,
      min: 0,
      max: 1e6,
    },
    payDate: {
      type: Date,
      required: function () {
        return !this.isDummy; // ⛔ Required only if it's not dummy
      },
    },
    isDummy: {
      type: Boolean,
      default: false,
    },
     paymentHistory: [
      {
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true, // 🕒 Adds createdAt and updatedAt fields
  }
);


// ✅ Export the Mongoose model
module.exports = mongoose.model("Studentfees", StudentFeeSchema);
