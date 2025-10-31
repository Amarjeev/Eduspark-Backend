const express = require("express");
const uploadImageRouter = express.Router();
const {
  upload,
  uploadFileToS3,
} = require("../../middleware/aws_S3Uploader/upload_image");
let teacherSchema = require("../../models/teacher");
let adminSchema = require("../../models/admin");
let studentSchema = require("../../models/student");
let parentSchema = require("../../models/parent");
const {
  verifyTokenByRole,
} = require("../../middleware/verifyToken/verify_token");

uploadImageRouter.post(
  "/upload-image/:role",
  verifyTokenByRole(),
  upload.single("image"),
  async (req, res,next) => {
    try {
      const { role } = req.params;
      const { udisecode, _id } = req[role];

      const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB
      if (!req.file || req.file.size > maxSizeInBytes) {
        return res
          .status(400)
          .json({ message: "❌ Only images up to 10MB are allowed." });
      }

      const imageUrl = await uploadFileToS3(req.file);

      const schemaMap = {
        teacher: teacherSchema,
        admin: adminSchema,
        student: studentSchema,
        parent: parentSchema,
      };

      const Model = schemaMap[role];
      if (!Model) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const user = await Model.findByIdAndUpdate(
        _id,
        { profilePicUrl: imageUrl },
        { new: true }
      );

      res.status(200).json({
        message: "✅ Image uploaded successfully",
        profilePicUrl: imageUrl,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = uploadImageRouter;
