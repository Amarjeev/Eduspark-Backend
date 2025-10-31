const mongoose = require("mongoose");

// Schema to store subjects for a specific school (identified by udisecode or similar)
const SubjectConfigSchema = new mongoose.Schema(
  {
    udisecode: { type: String, required: true, unique: true },
    schoolname: { type: String, required: true },
    subjects: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // auto-generate ID
        name: { type: String, required: true, trim: true,maxlength: 30},
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SubjectConfig", SubjectConfigSchema);
