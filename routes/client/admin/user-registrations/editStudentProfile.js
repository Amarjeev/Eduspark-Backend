const express = require("express");
const editStudentProfileRouter = express.Router();
const studentSchema = require("../../../../models/student");
const validateStudentForm = require("../../../../validators/validateStudentForm");
const {
  verifyTokenByRole,
} = require("../../../../middleware/verifyToken/verify_token");

// ============================================
// ✅ GET API => Fetch student list by class
// Endpoint: /admin/student-list/:selectedClass
// ============================================

editStudentProfileRouter.get(
  "/admin/student-list/:selectedClass",
  verifyTokenByRole("admin"), // ✅ Only admin role can access this route
  async (req, res,next) => {
    try {
      const { selectedClass } = req.params; // Class name from URL
      const { udisecode } = req.admin; // UDISE code from admin token

      // ✅ Find all students in the selected class belonging to the same UDISE school
      const response = await studentSchema.find({
        udisecode,
        className: selectedClass,
        status: { $ne: "deleted" }, // ✅ Exclude soft-deleted students
      });

      return res.status(200).send(response); // ✅ Send the list of students
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// ✅ POST API => Update student profile
// Endpoint: /admin/student-profile/edit
// ============================================

editStudentProfileRouter.post(
  "/admin/student-profile/edit",
  verifyTokenByRole("admin"), // ✅ Only admin can update student profile
  validateStudentForm, // ✅ Validate input data using custom validator
  async (req, res,next) => {
    try {
      const editedData = req.body; // ✅ Edited student data from frontend
      const id = editedData._id; // ✅ Student's MongoDB ID

      // ✅ Find student by ID and update relevant fields
      const response = await studentSchema.findByIdAndUpdate(
        { _id: id },
        {
          name: editedData.name,
          parentEmail: editedData.parentEmail,
          authorizedPersonName: editedData.authorizedPersonName,
          role: editedData.role,
          className: editedData.className,
          dob: editedData.dob,
          gender: editedData.gender,
          govIdType: editedData.govIdType,
          govIdNumber: editedData.govIdNumber,
          address: editedData.address,
          pincode: editedData.pincode,
          state: editedData.state,
          mobileNumber: editedData.mobileNumber,
          secondaryMobileNumber: editedData.secondaryMobileNumber,
        }
      );

      return res.status(200).send({ success: true }); // ✅ Send success response
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// ✅ DELETE API => Delete student by ID
// Endpoint: /admin/student/delete/:id
// ============================================

editStudentProfileRouter.delete(
  "/admin/student/:status/:id",
  verifyTokenByRole("admin"),
  async (req, res,next) => {
    try {
      const { id, status } = req.params;

      // ✅ Always mark isDeleted = true, status is for reference only
      const updatedStudent = await studentSchema.findByIdAndUpdate(
        id,
        {
          isDeleted: true, // ✅ Marks student as permanently soft-deleted
          status, // 👁️ Used for displaying status (e.g. "deleted", "inactive", etc.)
        },
        { new: true }
      );

      if (!updatedStudent) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Student soft-deleted successfully",
        data: updatedStudent,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = editStudentProfileRouter;
