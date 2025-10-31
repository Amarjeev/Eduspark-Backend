const indianStates = require("../referenceData/indianStates");

const validateAdminForm = async (req, res, next) => {
  const data = req.body;
  const errors = {};

  // Name
  if (!data.name?.trim()) {
    errors.name = "Name is required.";
  } else if (!/^[A-Za-z\s]+$/.test(data.name)) {
    errors.name = "Name must contain only letters and spaces.";
  } else if (data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  } else if (data.name.trim().length > 50) {
    errors.name = "Name must be less than 50 characters.";
  }

  // Email
  if (!data.email?.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Invalid email format.";
  }

  // Password
  if (!data.password) {
    errors.password = "Password is required.";
  } else if (!/^(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(data.password)) {
    errors.password = "Password must be at least 8 characters, include a lowercase letter and a number.";
  }

  // Confirm Password
  if (!data.confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  // Phone Number
  if (!data.phoneNumber) {
    errors.phoneNumber = "Phone number is required.";
  } else if (!/^\d{10,15}$/.test(data.phoneNumber)) {
    errors.phoneNumber = "Phone number must be 10 to 15 digits.";
  }

  // School Type
  if (!data.schoolType) {
    errors.schoolType = "Please select a school type.";
  }

  // UDISE Code
  if (!data.udisecode?.trim()) {
    errors.udisecode = "UDISE code is required.";
  } else if (!/^\d+$/.test(data.udisecode)) {
    errors.udisecode = "UDISE code must contain only numbers.";
  } else if (data.udisecode.length !== 11) {
    errors.udisecode = "UDISE Code must be exactly 11 digits.";
  }

  // School Name
  if (!data.schoolname?.trim()) {
    errors.schoolname = "School name is required.";
  } else if (data.schoolname.trim().length < 3) {
    errors.schoolname = "School name must be at least 3 characters.";
  } else if (data.schoolname.trim().length > 120) {
    errors.schoolname = "School name must be less than 100 characters.";
  }

  // Address
  if (!data.address?.trim()) {
    errors.address = "Address is required.";
  } else if (data.address.trim().length < 10) {
    errors.address = "Address must be at least 10 characters.";
  } else if (data.address.trim().length > 150) {
    errors.address = "Address must be less than 150 characters.";
  }

// State
if (!data.state) {
  errors.state = "Please select a state.";
} else if (!indianStates.includes(data.state)) {
  errors.state = "Selected state is not valid.";
}

  // Final error check
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next(); // Pass to next middleware if validation passes
};

module.exports = validateAdminForm;
