// middlewares/validateParentSignup.js

const validateParentSignup = (req, res, next) => {
  const formData = req.body;
  const errors = {};
 // 🧑‍💼 Name validation: Required, only letters/spaces, min 3, max 30
if (!formData.name?.trim()) {
  errors.name = "Please enter your name";
} else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) {
  errors.name = "Name can only contain letters and spaces";
} else if (formData.name.trim().length < 3) {
  errors.name = "Name must be at least 3 characters";
} else if (formData.name.trim().length > 30) {
  errors.name = "Name must not exceed 30 characters";
}

  // Email validation
  if (!formData.email?.trim()) {
    errors.email = "Please enter your email";
  }

  // UDISE Code validation
  if (!formData.udisecode?.trim()) {
    errors.udisecode = "UDISE code is required";
  } else if (!/^\d{11}$/.test(formData.udisecode)) {
    errors.udisecode = "UDISE code must be 11 digits";
  }

if (!formData.password) {
  errors.password = "Password is required.";
} else if (!/^(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
  errors.password = "Password must be at least 8 characters, include a lowercase letter and a number.";
}

  
   // Confirm Password
  if (!formData.confirmPassword?.trim()) {
    errors.confirmPassword = "Please confirm your password";
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

    // 📱 Mobile Number Validation: Required, must be 10 digits
  if (!formData.mobileNumber?.trim()) {
    errors.mobile = "Mobile number is required";
  } else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber.trim())) {
    errors.mobile = "Mobile number must be a valid 10-digit Indian number starting with 6-9";
  }


 

  // Send errors if any
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next(); // All good, go to next middleware or controller
};

module.exports = validateParentSignup;
