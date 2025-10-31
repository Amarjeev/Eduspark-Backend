// 📦 Load environment variables from .env file
require("dotenv").config();

// 🔐 Import required modules
const jwt = require("jsonwebtoken");

// 🧩 Import user role schemas
const teacherSchema = require("../../models/teacher");
const adminSchema = require("../../models/admin");
const studentSchema = require("../../models/student");
const parentSchema = require("../../models/parent");

// 🔑 Get JWT secret key from environment
const jwt_key = process.env.jwt_key;

/**
 * 🛠️ Function to generate JWT token based on user role
 * @param {Object} user - User info containing email and udisecode
 * @param {String} role - User role: "Parent", "student", "teacher", or "admin"
 * @returns {String} - Signed JWT token
 */
async function generateToken(user, role) {
  const options = { expiresIn: "1d" }; // ⏳ Token expires in 1 day
  let payload = {}; // 📦 Payload to be embedded in token

  switch (role) {
    case "parent":
      // 👨‍👩‍👧 Find parent basic info
      const parentData = await parentSchema
        .findOne({ udisecode: user.uidsecode, email: user.email })
        .select("name email udisecode mobileNumber profilePicUrl")
        .lean();

      if (!parentData) {
        throw new Error("❌ parent not found.");
      }

      // 🔍 Find student(s) related to parent by mobile number
      const parentstudentData = await studentSchema
        .find({
          udisecode: user.uidsecode,
          isDeleted: false,
          status: { $ne: "deleted" },
          $or: [
            { mobileNumber: parentData.mobileNumber },
            { secondaryMobileNumber: parentData.mobileNumber },
          ],
        })
        .select("studentId")
        .lean();

      if (!parentstudentData) {
        throw new Error("❌ parent student not found.");
      }
      // 🆔 Extract student IDs
      const studentIds = parentstudentData.map((doc) => doc.studentId);

      // 🎯 Prepare token payload for parent
      payload = {
        role,
        _id: parentData._id,
        email: parentData.email,
        udisecode:user.uidsecode,
        studentIds: studentIds,
      };
      break;

    case "student":
      // 🎓 Find student info
      const studentData = await studentSchema
        .findOne({ udisecode: user.uidsecode, email: user.email })
        .select("studentId className name email udisecode schoolname")
        .lean();

      if (!studentData) {
        throw new Error("❌ Student not found.");
      }

      // 🎯 Prepare token payload for student
      payload = {
        role,
        _id: studentData._id,
        employid: studentData.studentId,
        email: studentData.email,
        udisecode: studentData.udisecode,
        schoolname: studentData.schoolname,
        className: studentData.className,
      };
      break;

    case "teacher":
      // 👨‍🏫 Find teacher info
      const teacherData = await teacherSchema
        .findOne({ udisecode: user.uidsecode, email: user.email })
        .select("employId name email udisecode schoolname")
        .lean();

      if (!teacherData) {
        throw new Error("❌ Teacher not found.");
      }

      // 🎯 Prepare token payload for teacher
      payload = {
        role,
        _id: teacherData._id,
        email: teacherData.email,
        udisecode: teacherData.udisecode,
        employid: teacherData.employId || null,
        name: teacherData.name || null,
        schoolname: teacherData.schoolname,
      };
      break;

    case "admin":
      // 🧑‍💼 Find admin info
      const adminData = await adminSchema
        .findOne({ udisecode: user.uidsecode, email: user.email })
        .select("employId name email udisecode schoolname")
        .lean();

      if (!adminData) {
        throw new Error("❌ Admin not found.");
      }

      // 🎯 Prepare token payload for admin
      payload = {
        role,
        _id: adminData._id,
        employid: adminData._id,
        email: adminData.email,
        udisecode: adminData.udisecode,
        schoolname: adminData.schoolname,
      };
      break;

    default:
      // 🚫 Unsupported role error
      throw new Error(`❌ Unsupported role: ${role}`);
  }

  // 🔐 Sign and return JWT token
  return jwt.sign(payload, jwt_key, options);
}

module.exports = generateToken;
