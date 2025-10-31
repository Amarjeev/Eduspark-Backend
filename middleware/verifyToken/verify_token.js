const jwt = require("jsonwebtoken");
require("dotenv").config();
// Retrieve the JWT secret key from environment variables
const jwt_key = process.env.jwt_key;

function verifyTokenByRole(role) {
  return async (req, res, next) => {
    try {
      const effectiveRole = role || req?.params?.role;

      if (!effectiveRole) {
        return res.status(400).json({ message: "Role not specified" });
      }

      const cookieName = `${effectiveRole.toLowerCase()}_token`;
      const token = req.cookies[cookieName];

      if (!token) {
         return //res.status(401).json({ message: "Unauthorized: No token" });
      }
      const decoded = jwt.verify(token, jwt_key);
      req[effectiveRole.toLowerCase()] = decoded;

      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { verifyTokenByRole };
