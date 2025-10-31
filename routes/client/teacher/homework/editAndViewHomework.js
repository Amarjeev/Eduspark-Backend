const express = require("express");
const editAndViewHomeworkRouter = express.Router();
const HomeworkSchema = require("../../../../models/homework");
const {
  verifyTokenByRole,
} = require("../../../../middleware/verifyToken/verify_token");
const redisClient = require("../../../../config/redis/redisClient");
const validateHomework = require("../../../../validators/validateHomework");

// ✅ Route: Get all homework entries for a teacher with filtering and pagination
editAndViewHomeworkRouter.get(
  "/teacher/homework",
  verifyTokenByRole("teacher"),
  async (req, res,next) => {
    try {
      // 📥 Extract filters and pagination from query
      const classList = req.query.classList;
      const subjectList = req.query.subjectList;
      const skipvalue = req.query.skip;
      const { udisecode } = req.teacher;

      // 🧠 Build filter based on teacher's UDISE code, subject, and class
      const filter = {
        udisecode: udisecode,
        subject: { $in: subjectList },
        className: { $in: classList },
      };

      // 📊 Fetch total count and paginated homework entries in parallel
      const [totalCount, data] = await Promise.all([
        HomeworkSchema.countDocuments(filter),
        HomeworkSchema.find(filter)
          .select("className subject createdAt deadline") // ✂️ Select only required fields
          .skip(skipvalue) // ⏩ Skip documents for pagination
          .limit(5), // ⛔ Limit result to 5 entries per page
      ]);

      // 📤 Send the result
      res.send({
        totalCount,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ✅ Route: Get a single homework entry by ID
editAndViewHomeworkRouter.get(
  "/teacher/homework/update/:id",
  verifyTokenByRole("teacher"),
  async (req, res,next) => {
    const { id } = req.params;

    try {
      // 🔍 Find homework by ID
      const response = await HomeworkSchema.findOne({ _id: id });
      if (!response) {
        return res.status(404).json({ error: "Homework not found" });
      }

      // 📤 Return homework data
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// ✅ Route: Update a single homework entry by ID
editAndViewHomeworkRouter.put(
  "/teacher/homework/update/:id",
  verifyTokenByRole("teacher"),
  validateHomework, // 🛡️ Middleware: Validate homework data before updating
  async (req, res,next) => {
    const { id } = req.params;

    try {
      // 📥 Extract updated data from request body
      const data = req.body;

      const updatedData = {
        className: data.className,
        subject: data.subject,
        content: data.content,
        createdAt: data.createdAt,
        deadline: data.deadline,
      };

      // 🔄 Update homework entry in DB
      const response = await HomeworkSchema.findByIdAndUpdate(
        id,
        { $set: updatedData },
        { new: true } // ✅ Return the updated document
      );

      if (!response) {
        return res.status(404).json({ error: "Homework not found for update" });
      }

      // 📤 Send success response
      res.status(200).json({
        message: "✅ Homework updated successfully!",
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = editAndViewHomeworkRouter;
