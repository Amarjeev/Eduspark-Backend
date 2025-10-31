// middleware/validateBasicExamFields.js

const validateBasicExamFields = (req, res, next) => {
  const { examMark } = req.body;
  const errors = {};

  // Validate studentId - must be 6 digits
  if (
    !examMark.studentId ||
    examMark.studentId.length !== 6 ||
    !/^\d+$/.test(examMark.studentId)
  ) {
    errors.studentId = "Student ID must be exactly 6 numeric digits.";
  }

  // Validate examName - required and max length
  if (!examMark.examName || !examMark.examName.trim()) {
    errors.examName = "Exam name is required.";
  } else if (examMark.examName.length > 50) {
    errors.examName = "Exam name must not exceed 50 characters.";
  }
  
// Validate examDate - required and not in future
if (!examMark.examDate) {
  errors.examDate = "Exam date is required.";
} else {
  const examDate = new Date(examMark.examDate);
  const today = new Date();

  // Set both to midnight to compare only the date
  examDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (examDate.getTime() > today.getTime()) {
    errors.examDate = "Future dates are not allowed.";
  }
}


  // Validate marks array
  if (!Array.isArray(examMark.marks) || examMark.marks.length === 0) {
    errors.marks = "At least one subject mark entry is required.";
  } else {
    const markErrors = [];
    const seenSubjects = new Set();

    examMark.marks.forEach((entry, index) => {
      const rowErrors = {};

      if (!entry.subject || !entry.subject.trim()) {
        rowErrors.subject = "Subject name is required.";
      } else if (seenSubjects.has(entry.subject)) {
        rowErrors.subject = "Duplicate subject entry is not allowed.";
      } else {
        seenSubjects.add(entry.subject);
      }

      if (entry.mark === undefined || entry.mark === "") {
        rowErrors.mark = "Mark is required.";
      } else if (isNaN(entry.mark) || entry.mark < 0) {
        rowErrors.mark = "Mark must be a non-negative number.";
      } else if (
        entry.totalMark &&
        parseFloat(entry.mark) > parseFloat(entry.totalMark)
      ) {
        rowErrors.mark = "Mark cannot exceed total mark.";
      }

      if (!entry.totalMark || isNaN(entry.totalMark) || entry.totalMark <= 0) {
        rowErrors.totalMark = "Total mark must be a positive number.";
      }

      if (!entry.grade || entry.grade.length > 6) {
        rowErrors.grade = "Grade must be provided and not exceed 6 characters.";
      }

      if (Object.keys(rowErrors).length > 0) {
        markErrors[index] = rowErrors;
      }
    });

    if (markErrors.length > 0) {
      errors.markEntries = markErrors;
    }
  }

  // Final decision
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed. Please check the highlighted fields.",
      errors,
    });
  }

  next();
};

module.exports = validateBasicExamFields;
