const redisClient = require("../config/redis/redisClient");
const indianStates=require('../referenceData/indianStates')

const validateStudentForm = async (req, res, next) => {
  const {
    name,
    parentEmail,
    authorizedPersonName,
    role,
    className,
    dob,
    gender,
    govIdType,
    govIdNumber,
    studentId,
    address,
    pincode,
    state,
    mobileNumber,
    secondaryMobileNumber,
    admissionDate,
  } = req.body;

   const {udisecode,employid} = req.admin;

  const errors = {};


  // 🌐 Check className against Redis
  try {
    const cachedClassData =  await redisClient.get(`eduspark_class-List:${udisecode}${employid}`);
    if (!cachedClassData) {
      errors.className = "Class data not available in cache.";
    } else {

      
      if (!cachedClassData.includes(className)) {
        errors.className = `Invalid class name. Must be one of: ${validClassNames.join(", ")}`;
      }
    }
  } catch (err) {
    errors.className = "Server error while validating class name.";
  }

  // Name
  if (!name || !/^[A-Za-z\s'-]{3,50}$/.test(name.trim())) {
    errors.name = "Name must be 3-50 characters and only contain letters and spaces.";
  }

  // Parent Email
  if (!parentEmail || !/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(parentEmail.trim())) {
    errors.parentEmail = "Invalid email address.";
  }

  // Authorized Person Name
  if (!authorizedPersonName || !/^[A-Za-z\s'-]{3,50}$/.test(authorizedPersonName.trim())) {
    errors.authorizedPersonName = "Authorized person name must be 3-50 letters only.";
  }

  // Role
  if (!role || role.trim() === "") {
    errors.role = "Role is required.";
  }

  // Gender
  if (!gender || gender.trim() === "") {
    errors.gender = "Gender is required.";
  }

  // Government ID Type
  if (!govIdType || govIdType.trim() === "") {
    errors.govIdType = "Government ID Type is required.";
  }

  // Government ID Number
  if (govIdType === "Aadhar" && (!govIdNumber || !/^\d{12}$/.test(govIdNumber.trim()))) {
    errors.govIdNumber = "Aadhar number must be 12 digits.";
  }

  if (govIdType === "Passport" && (!govIdNumber || !/^[A-PR-WYa-pr-wy][1-9]\d\s?\d{4}[1-9]$/.test(govIdNumber.trim()))) {
    errors.govIdNumber = "Invalid Passport number format.";
  }

  // Student ID
  if (!studentId || !/^\d{6}$/.test(studentId.trim())) {
    errors.studentId = "Student ID must be 6 digits.";
  }

  // Address
  if (!address || address.trim().length < 10 || address.trim().length > 200) {
    errors.address = "Address must be between 10 and 200 characters.";
  }

  // Pincode
  if (!pincode || !/^\d{6}$/.test(pincode.trim())) {
    errors.pincode = "Pincode must be 6 digits.";
  }

  // State
if (!state || !indianStates.includes(state)) {
  errors.state = "State must be a valid Indian state.";
}

  // Mobile Numbers
  if (!mobileNumber || !/^\d{10}$/.test(mobileNumber.trim())) {
    errors.mobileNumber = "Mobile number must be 10 digits.";
  }

  if (secondaryMobileNumber && !/^\d{10}$/.test(secondaryMobileNumber.trim())) {
    errors.secondaryMobileNumber = "Secondary mobile number must be 10 digits.";
  }

  // Date of Birth
  if (!dob) {
    errors.dob = "Date of birth is required.";
  } else {
    const today = new Date();
    const dobDate = new Date(dob);
    const age = today.getFullYear() - dobDate.getFullYear();
    if (dobDate > today || age < 3 || age > 100) {
      errors.dob = "DOB must be valid and age between 3 to 100.";
    }
  }

  // Admission Date
if (!admissionDate) {
  errors.admissionDate = "Admission date is required.";
} else {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set time to 00:00:00 for comparison

  const admission = new Date(admissionDate);
  admission.setHours(0, 0, 0, 0); // Set time to 00:00:00 for comparison

  if (admission > today) {
    errors.admissionDate = "Admission date cannot be in the future.";
  }
}


  // ❌ If there are any validation errors, send them
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed. Please check the following fields.",
      errors,
    });
  }

  // ✅ Continue if no errors
  next();
};

module.exports = validateStudentForm;
