const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    udisecode: {
      type: String,
      required: true,
      maxlength: 50,
      index: true
    },
    date: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
      minlength: [10, "Message must be at least 10 characters long."],
      maxlength: [1000, "Message must be less than or equal to 1000 characters."],
    },
    schoolname: {
      type: String,
      required: true,
      maxlength: 100,
    },
  },
  {
    timestamps: true,
  }
);

announcementSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Announcement", announcementSchema);
