const express = require("express");
const clientLogout = express.Router();
const redisClient = require("../../../config/redis/redisClient");
require("dotenv").config();
const {
  verifyTokenByRole,
} = require("../../../middleware/verifyToken/verify_token");

//common logout
clientLogout.post("/logout/:role", async (req, res,next) => {
  try {
    const { role } = req.params;

    const allowedRoles = ["teacher", "student", "admin", "parent"];
    if (!allowedRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ message: "❌ Invalid role" });
    }

    const middleware = verifyTokenByRole(role);

    // Call middleware and pass a custom callback to handle logout
    middleware(req, res, async () => {
      const { udisecode, employid } = req[role];

      const isProduction = process.env.NODE_ENV === "production";

      // ✅ Clear the auth cookie
      res.cookie(`${role}_token`, "", {
        expires: new Date(0),
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Lax",
      });

      // ✅ Clear Redis cache (NO need to stringify the keys to delete)
      await redisClient.del(`eduspark_eduspark_class-List:${udisecode}${employid}`);
      await redisClient.del(`eduspark_eduspark_subject-List:${udisecode}${employid}`);

      return res
        .status(200)
        .json({ success: true, message: `${role} logged out successfully.` });
    });
  } catch (error) {
    next(error);
  }
});

module.exports = clientLogout;
