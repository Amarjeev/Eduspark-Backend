// 🧪 Middleware to validate timetable entries
const redisClient = require("../config/redis/redisClient");

const validateTimetableEntry = async (req, res, next) => {
  const { udisecode ,employid} = req.admin;

  // ✅ Declare entries for loop usage
  const entries = req.body.entries;

  const validDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

const classNames = await redisClient.get(`eduspark_class-List:${udisecode}${employid}`);
const subjectNames = await redisClient.get(`eduspark_subject-List:${udisecode}${employid}`);


  if (classNames.length === 0 || subjectNames === 0) {
    return res.status(400).json({
      error:
        "Class or subject list is missing or empty. Please configure them first.",
    });
  }

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const { teacherName, teacherId, className, subject, day, time } = entry;

    const errors = {};

    // ✅ Teacher Name
    const name = teacherName?.trim();
    if (!name || !/^[A-Za-z\s]+$/.test(name)) {
      errors.teacherName = "Teacher name must contain only letters and spaces.";
    } else if (name.length < 3 || name.length > 25) {
      errors.teacherName = "Teacher name must be between 3 and 25 characters.";
    }

    // 🆔 Teacher ID
    if (!/^\d{8}$/.test(teacherId)) {
      errors.teacherId = "Teacher ID must be exactly 8 digits.";
    }

    // 🏫 Class Name Validation
    if (!className.trim()) {
      errors.className = "❌ Class name is required.";
    } else if (!classNames.includes(className.trim())) {
      errors.className = "❌ Invalid class name. Please select a valid class.";
    }

    if (!subject.trim()) {
      errors.subject = "❌ Subject is required.";
    } else if (
      !subjectNames
        .map((s) =>
          typeof s === "string"
            ? s.toLowerCase()
            : typeof s?.name === "string"
            ? s.name.toLowerCase()
            : ""
        )
        .includes(subject.trim().toLowerCase())
    ) {
      errors.subject = "❌ Invalid subject. Please choose a valid subject.";
    }

    // 📅 Day
    if (!validDays.includes(day)) {
      errors.day = "Day must be a valid weekday.";
    }

    // 🕒 Time Format Check
    const timePattern =
      /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM) to (0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;
    if (!time || !timePattern.test(time.trim())) {
      errors.time = "❌ Time must be in format: HH:MM AM/PM to HH:MM AM/PM.";
    }

    // ❌ If any errors found
    if (Object.keys(errors).length > 0) {
      return res.status(422).json({
        error: `Validation failed for entry at index ${i}`,
        details: errors,
      });
    }
  }

  // ✅ All entries valid, proceed
  next();
};

module.exports = validateTimetableEntry;
