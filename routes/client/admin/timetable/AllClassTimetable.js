const express = require("express");
const getAlltimetableRouter = express.Router();
const timetableSchema = require("../../../../models/timetable");
const {
  verifyTokenByRole,
} = require("../../../../middleware/verifyToken/verify_token");
const validateTimetableEntry = require("../../../../validators/validateTimetableEntry");
const teacherSchema = require("../../../../models/teacher");

// 📦 GET all timetable data
getAlltimetableRouter.get(
  "/admin/timetable/all/:role/:classname",
  verifyTokenByRole(),
  async (req, res,next) => {
    const { classname, role } = req.params;
    try {
      const { udisecode, className } = req[role];
      let selectedclass = classname;
      if (className) {
        selectedclass = className;
      }

      const allTimetables = await timetableSchema.find({
        udisecode: udisecode,
        className: selectedclass,
      });
      if (!allTimetables.length) {
        return res.status(200).json([]); // No data for this class
      }
      res.status(200).json(allTimetables[0].entries);
    } catch (error) {
      next(error);
    }
  }
);

getAlltimetableRouter.put(
  "/admin/timetable/edit",
  verifyTokenByRole("admin"),
  validateTimetableEntry,
  async (req, res,next) => {
    try {
      const { status } = req.params;
      const { day, time, subject, teacherName, teacherId, _id, className } =
        req.body.entries[0];
      const { udisecode } = req.admin;

      const response = await teacherSchema.findOne({
        udisecode,
        employid: teacherId,
      });

      if (!response) {
        return res.status(404).json({
          error: "❌ Teacher not found for the given Teacher ID.",
        });
      }

      const Name = response.name;

      const updated = await timetableSchema.updateOne(
        {
          udiseCode: udisecode,
          className,
          "entries._id": _id,
        },
        {
          $set: {
            "entries.$.day": day,
            "entries.$.time": time,
            "entries.$.subject": subject,
            "entries.$.teacherName": Name,
            "entries.$.teacherId": teacherId,
          },
        }
      );

      if (updated.modifiedCount === 0) {
        return res.status(404).json({
          error: "❌ Timetable entry not found or not updated.",
        });
      }

      return res
        .status(200)
        .json({ message: "✅ Timetable entry updated successfully." });
    } catch (error) {
      next(error);
    }
  }
);

getAlltimetableRouter.delete(
  "/admin/timetable/delete/:id",
  verifyTokenByRole("admin"),
  async (req, res,next) => {
    try {
      const { id } = req.params;
      const { udisecode } = req.admin;

      const updated = await timetableSchema.updateOne(
        { udisecode: udisecode, "entries._id": id },
        { $pull: { entries: { _id: id } } }
      );

      if (updated.modifiedCount === 0) {
        return res
          .status(404)
          .json({ error: "❌ Entry not found or already deleted." });
      }
      res
        .status(200)
        .json({ message: "✅ Timetable entry deleted successfully!" });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = getAlltimetableRouter;
