// models/schoolFeeStructure.model.js
const mongoose = require("mongoose");

const singleFeeSchema = new mongoose.Schema({
  className: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  totalFee: { type: Number, required: true, min: 100, max: 99999999999999999999 }
});
singleFeeSchema.index({ className: 1, date: 1 });

const schoolFeeSchema = new mongoose.Schema({
  udisecode: { type: String, required: true,unique: true},
  feeStructures: [singleFeeSchema]
}, { timestamps: true });




module.exports = mongoose.model("SchoolFeeStructure", schoolFeeSchema);
