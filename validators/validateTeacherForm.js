const schoolDepartments = require("../referenceData/schoolDepartments");
const redisClient = require("../config/redis/redisClient");

const validateTeacherForm = (mode) => {
  return async (req, res, next) => {
    const {
      name,
      email,
      password,
      phonenumber,
      subject,
      department,
      employId,
      govidtype,
      govidnumber,
    } = req.body;

    const { udisecode, employid } = req.admin;
    const errors = {};

    const cachedSubjects = await redisClient.get(`eduspark_subject-List:${udisecode}${employid}`);

    // Name
    if (!name || !/^[A-Za-z\s]+$/.test(name.trim())) {
      errors.name = "Name must contain only letters and spaces.";
    } else if (name.length < 3 || name.length > 25) {
      errors.name = "Name must be between 3 and 25 characters long.";
    }

    // Email
    if (!email) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Invalid email format.";
    }

    // ✅ Password validation only if mode is "create"
    if (mode === "create") {
      if (!password) {
        errors.password = "Password is required.";
      } else if (password.length < 5 || password.length > 10) {
        errors.password = "Password must be between 5 and 10 characters long.";
      }
    }

    // Phone
    if (!phonenumber || !/^\d{7,15}$/.test(phonenumber)) {
      errors.phonenumber = "Phone number must be 7 to 15 digits only.";
    }

    // Subject
    if (!subject) {
      errors.subject = "Subject is required.";
    } else if (!cachedSubjects.includes(subject)) {
      errors.subject = "Invalid subject. Please select a valid subject.";
    }

    // Department
    if (!department || !schoolDepartments.includes(department)) {
      errors.department = "Invalid department. Please select a valid department.";
    }

    // Employee ID
    if (!employId || employId.toString().length !== 8) {
      errors.employid = "Employment ID must be exactly 8 digits.";
    }

    // Gov ID
    if (govidtype && govidnumber) {
      switch (govidtype) {
        case "Aadhar":
          if (!/^\d{12}$/.test(govidnumber)) {
            errors.govidnumber = "Aadhar number must be exactly 12 digits.";
          }
          break;
        case "License":
          if (!/^[A-Z]{2}\d{2}[0-9A-Z]{11,13}$/.test(govidnumber)) {
            errors.govidnumber = "License must be 2 letters + 2 digits + 11-13 characters.";
          }
          break;
        case "VoterId":
          if (!/^[A-Z]{3}\d{7}$/.test(govidnumber)) {
            errors.govidnumber = "Voter ID must be 3 letters followed by 7 digits.";
          }
          break;
        default:
          errors.govidtype = "Gov ID Type must be Aadhar, License, or VoterId.";
      }
    } else if (govidtype || govidnumber) {
      errors.govidnumber = "Both Government ID type and number are required.";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed. Please correct the errors.",
        errors,
      });
    }

    next();
  };
};

module.exports = validateTeacherForm;
