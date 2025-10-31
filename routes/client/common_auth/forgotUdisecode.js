const express = require("express");
const forgotUdisecodeRouter = express.Router();
const adminSchema = require("../../../models/admin");
const teacherSchema = require("../../../models/teacher");
const studentSchema = require("../../../models/student");
const parentSchema = require("../../../models/parent");
const redisClient = require("../../../config/redis/redisClient");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../../../utils/email_Service/sendEmail"); // 📧 Utility to send email
const OtpEmailTemplate = require("../../../utils/emails_ui/sendUdiseCodeEmailTemplate");

forgotUdisecodeRouter.post("/forgot-udisecode", async (req, res,next) => {
  try {
    const { email, password, id, role } = req.body;
    let storedEmail;
    let userRole = role;

    // If password is present, get email from Redis using id
    if (password) {
      storedData = await redisClient.get(`eduspark_client_email_${id}`);
      if (!storedData) {
        return res
          .status(400)
          .json({ success: false, message: "Session expired" });
      }

      storedEmail = storedData?.email;
      userRole = storedData?.role;
    }

    // If neither email nor password is present
    if (!password && !email) {
      return res.status(400).json({ success: false, message: "email" });
    }

    // Choose email from request or Redis
    const newEmail = email || storedEmail;

    const roleSchemaMap = {
      admin: adminSchema,
      teacher: teacherSchema,
      student: studentSchema,
      parent: parentSchema,
    };

    const normalizedRole = userRole?.toLowerCase() || "";

    // 3. Get correct schema based on role
    const SelectedSchema = roleSchemaMap[normalizedRole];

    // 4. If schema doesn't exist for role
    if (!SelectedSchema) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    // Fetch admin using the email
    const response = await SelectedSchema.findOne({ email: newEmail })
      .select("email password udisecode schoolname")
      .lean();

    // If admin exists and user is verifying password
    if (response && password) {
      const isMatch = await bcrypt.compare(password, response.password);
      if (!isMatch) {
        return res.json({ success: false, message: "password" });
      }

      const { schoolname, udisecode, email } = response;

      const { html } = OtpEmailTemplate({ schoolname, udisecode });

      await sendEmail(
        email,
        `Your UDISE Code & School Info - Eduspark`,
        `Your school name is: ${schoolname}\nYour UDISE Code is: ${udisecode}\nPlease keep this for future logins.`,
        html
      );

      await redisClient.del(`eduspark_client_email_${response._id}`);

      return res.json({ success: true, message: "password" });
    }

    // If email found (either for registration or to store in Redis)
    if (response) {
      if (email) {
        await redisClient.set(
          `eduspark_client_email_${response._id}`,
          JSON.stringify({ email, role }),
          { ex: 300 }
        );
      }

      return res.json({
        success: true,
        message: "email",
        id: response._id,
      });
    }

    // If email not found in DB
    return res.status(404).json({ success: false, message: "email" });
  } catch (error) {
    next(error);
  }
});

module.exports = forgotUdisecodeRouter;
