// 🛡️ Middleware: Validate Fee Structure Inputs with Redis cache check
const redisClient = require("../config/redis/redisClient");

const validateFeeStructure = async (req, res, next) => {
  const { className, date, totalFee } = req.body;
 const { udisecode,employid } = req.admin; // 🎓 Extracted from auth token (middleware before this)

  // 🚫 Check for missing required fields
  if (!udisecode || !className || !date || !totalFee) {
    return res.status(400).json({
      message: "❗All fields (udisecode, className, date, totalFee) are required.",
    });
  }

  const amount = Number(totalFee);

  // 🚫 Check for invalid number input
  if (isNaN(amount)) {
    return res.status(400).json({
      message: "⚠️ Total fee must be a valid number.",
    });
  }

  // 💰 Minimum amount check
  if (amount < 100) {
    return res.status(400).json({
      message: "⚠️ Total fee must be at least ₹100.",
    });
  }

  // 🔢 Maximum digit check: 20-digit cap
  if (amount > 99999999999999999999) {
    return res.status(400).json({
      message: "⚠️ Total fee must not exceed 20 digits.",
    });
  }

  // 🧠 Validate className from Redis cache
  try {
    const cachedClassData = await redisClient.get(`eduspark_class-List:${udisecode}${employid}`);
    
    if (!cachedClassData) {
      return res.status(400).json({
        message: "⚠️ Class data not available in cache for this school.",
      });
    }

    if (!cachedClassData.includes(className)) {
      return res.status(400).json({
        message: `❌ Invalid class name. Must be one of`,
      });
    }
  } catch (error) {
   throw error;
  }

  next(); // ✅ All validations passed
};

module.exports = validateFeeStructure;
