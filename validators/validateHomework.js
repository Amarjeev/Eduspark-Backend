const redisClient = require("../config/redis/redisClient");

const validateHomework = async (req, res, next) => {
  const data = req.body;
  const {udisecode,employid}=req.teacher
  const errors = {};


  
  const cachedSubjects = await redisClient.get(`eduspark_subject-List:${udisecode}${employid}`);
  const cachedClasses = await redisClient.get(`eduspark_class-List:${udisecode}${employid}`);


  // 🏫 Class validation
  if (!data.className?.trim()) {
    errors.class = "Class is required";
  } else if (!cachedClasses.includes(data.className.trim())) {
    errors.class = `Invalid class selected: ${data.className}`;
  }

  // 📚 Subject validation
  if (!data.subject?.trim()) {
    errors.subject = "Subject is required";
  } else if (!cachedSubjects.includes(data.subject.trim())) {
    errors.subject = `Invalid subject selected: ${data.subject}`;
  }

  // CreatedAt validation
  if (!data.createdAt || isNaN(Date.parse(data.createdAt))) {
    errors.createdAt = "Valid 'createdAt' datetime is required";
  }

  // Deadline validation
  if (!data.deadline || isNaN(Date.parse(data.deadline))) {
    errors.deadline = "Valid 'deadline' datetime is required";
  }

  // Compare createdAt and deadline only if both are valid
  if (!errors.createdAt && !errors.deadline) {
    const createdAt = new Date(data.createdAt);
    const deadline = new Date(data.deadline);

    if (createdAt.getTime() === deadline.getTime()) {
      errors.deadline = "Deadline must be different from Created Time";
    }
  }

// 📄 Homework content validation
if (!data.content?.trim()) {
  errors.content = "Homework content is required";
} else {
  const contentLength = data.content.trim().length;
  if (contentLength < 20) {
    errors.content = "Homework content is too short. Minimum 20 characters required.";
  } else if (contentLength > 1000) {
    errors.content = "Homework content is too long. Maximum 1000 characters allowed.";
  }
}

  // If any errors, return 400 response
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // ✅ All good
  next();
};

module.exports = validateHomework;
