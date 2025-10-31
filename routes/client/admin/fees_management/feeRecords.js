const express = require("express");
const feeRecordsRouter = express.Router();
const studentFeeSchema = require("../../../../models/studentFee");
const {
  verifyTokenByRole,
} = require("../../../../middleware/verifyToken/verify_token");

feeRecordsRouter.get(
  "/admin/fees/records/:selectedClass",
  verifyTokenByRole("admin"),
  async (req, res,next) => {
    try {
      const { selectedClass } = req.params;
      const { udisecode } = req.admin;

      const response = await studentFeeSchema.find(
        {
          udisecode: udisecode,
          "studentData.className": selectedClass,
        },
        { paymentHistory: 0 }
      );

      return res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

feeRecordsRouter.get(
  "/admin/fees/history/:id",
  verifyTokenByRole("admin"),
  async (req, res,next) => {
    try {
      const { id } = req.params;
      const { udisecode } = req.admin;

      const response = await studentFeeSchema.findOne(
        { _id: id, udisecode: udisecode },
        { paymentHistory: 1, "studentData.name": 1 }
      );

      if (!response) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = feeRecordsRouter;
