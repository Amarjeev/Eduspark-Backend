const express = require("express");
const teacherAccessServiceRouter = express.Router();
const teacherSchema = require("../../../../models/teacher");
const {
  verifyTokenByRole,
} = require("../../../../middleware/verifyToken/verify_token");

teacherAccessServiceRouter.post(
  "/admin/teacher-access/:status",
  verifyTokenByRole("admin"),
  async (req, res,next) => {
    try {
      const { status } = req.params;
      const { udisecode } = req.admin;
      if (status === "teacher-list") {
        const response = await teacherSchema
          .find({ udisecode: udisecode })
          .select("name employid assignedClasses");
        res.status(200).send(response);
      }
      if (status === "assigned-classes") {
        const { teacherId, assignedClasses } = req.body;
        // 🧠 Update assignedClasses for the selected teacher
        const updatedTeacher = await teacherSchema.findByIdAndUpdate(
          teacherId,
          { assignedClasses },
          { new: true } // return updated document
        );

        if (!updatedTeacher) {
          return res.status(404).send({ message: "Teacher not found" });
        }

        // ✅ Send success response
        return res.status(200).send({
          message: "Assigned classes updated successfully",
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

module.exports = teacherAccessServiceRouter;
