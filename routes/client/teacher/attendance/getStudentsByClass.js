const express = require("express");
const getStudentsByClassRouter = express.Router();
const studentSchema = require("../../../../models/student");
const {
  verifyTokenByRole,
} = require("../../../../middleware/verifyToken/verify_token");

getStudentsByClassRouter.get(
  "/students/by-class/:className",
  verifyTokenByRole("teacher"),
  async (req, res,next) => {
    try {
      const { className } = req.params;
      const { udisecode } = req.teacher;

      const response = await studentSchema
        .find({
          udisecode: udisecode,
          className: className,
        })
        .select("name studentId className -_id")
        .lean();

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = getStudentsByClassRouter;
