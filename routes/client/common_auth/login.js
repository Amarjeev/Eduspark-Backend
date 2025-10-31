const express = require("express");
const LoginRouter = express.Router();
const teacherSchema = require("../../../models/teacher");
const adminSchema = require("../../../models/admin");
const studentSchema = require("../../../models/student");
const parentSchema = require("../../../models/parent");
const bcrypt = require("bcryptjs");
const redisClient = require("../../../config/redis/redisClient"); // 🧠 Redis client for temporary OTP storage
const { sendEmail } = require("../../../utils/email_Service/sendEmail"); // 📧 Utility to send email
const OtpEmailTemplate = require("../../../utils/emails_ui/login_OTPEmailTemplate"); // 📨 OTP email template for teachers

const roleSchemaMap = {
  admin: adminSchema,
  teacher: teacherSchema,
  student: studentSchema,
  parent: parentSchema,
};

// ✅ Route to login teacher (first step before OTP verification)
LoginRouter.post("/:role/auth/login", async (req, res,next) => {
  try {
    // 📨 Extract login credentials from request body
    const { email, password, uidsecode } = req.body;
    const { role } = req.params;
    if (
      !["teacher", "admin", "student", "parent"].includes(role.toLowerCase())
    ) {
      return res
        .status(400)
        .json({ error: "Unauthorized role or wrong user access." });
    }
    // ⚠️ Validate input fields
    if (!email || !password || !uidsecode) {
      return res
        .status(400)
        .json({ message: "Please provide email, password, and UDISE code." });
    }

    const UserSchema = roleSchemaMap[role];

    // 🔎 Find active teacher by email and UDISE code (for login or password check)
    const response = await UserSchema.findOne({
      udisecode: uidsecode,
      email: email,
      isDeleted: false, // 👈 ensure user is not soft-deleted
    })
      .select("password")
      .lean();

    // 🔐 Compare provided password with hashed password in DB
    const isMatch = await bcrypt.compare(password, response.password);

    if (!response || !isMatch) {
      return res.status(401).json({
        isAuth: false,
        message:
          "Invalid credentials: email, password, or UIDSE code is incorrect.",
      });
    }

    // 🔢 Generate OTP and HTML email template
    const { otp, html } = OtpEmailTemplate(email, role);

    // 🧠 Store OTP in Redis with 3-minute expiration
    await redisClient.set(`eduspark_${role}_OTP:${email}`, otp.toString(), {
      ex: 180,
    });

    // ✅ Respond with success (OTP sent)
    res.status(200).json({ message: "Login successful", isAuth: true });

    // 📧 Send OTP to teacher's email
    await sendEmail(
      email,
      `${role} Login OTP - Eduspark`,
      `Your Eduspark login OTP is: ${otp}`, // plain text version
      html // styled HTML version
    );
  } catch (error) {
    next(error);
  }
});

//checking entry page udise code  is valid or existe in db
LoginRouter.post("/check-udisecode", async (req, res,next) => {
  const { udisecode } = req.body;

  try {
    // Validate: must be 11 digits
    if (!/^\d{11}$/.test(udisecode)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid UDISE Code format." });
    }

    const cacheKey = `eduspark_udisecode:${udisecode}`;
    console.log('cacheKey',await redisClient.get(cacheKey));
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      return res.status(200).json({ success: true, schoolName: cached });
    }

    const school = await adminSchema
      .findOne({ udisecode, isDeleted: false })
      .select("schoolname")
      .lean();

    if (!school) {
      return res
        .status(200)
        .json({ success: false, message: "UDISE Code not found." });
    }

    if (redisClient.isOpen) {
      await redisClient.set(cacheKey, school.schoolname, { ex: 300 });
    }
    return res
      .status(200)
      .json({ success: true, schoolName: school.schoolname });
  } catch (error) {
    return res.status(500).json({
      message:
        error.message || "Something went wrong while fetching the school name",
    });
    next(error);
  }
});

module.exports = LoginRouter;
