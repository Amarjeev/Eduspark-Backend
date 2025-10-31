const express = require("express");
const sessionVerifyRoute = express.Router();
const { verifyTokenByRole } = require("../verifyToken/verify_token");

sessionVerifyRoute.get(
  "/verify-role-session/:role",
  verifyTokenByRole(),
  async (req, res,next) => {
    try {
      const { role } = req.params;

      const allowedRoles = ["teacher", "student", "admin", "parent"];
      if (!allowedRoles.includes(role.toLowerCase())) {
        return res.status(400).json({ message: "❌ Invalid role" });
      }
      return res.status(200).json({
        isAuthenticated: true,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = sessionVerifyRoute;
