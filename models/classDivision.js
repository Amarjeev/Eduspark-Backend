const mongoose = require("mongoose");

const ClassDivisionSchema = new mongoose.Schema(
  {
    udisecode: { type: String, required: true, unique: true ,index: true},
    schoolname: { type: String, required: true },
    className: [
      {
        value: { type: String, required: true },
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClassDivision", ClassDivisionSchema);
