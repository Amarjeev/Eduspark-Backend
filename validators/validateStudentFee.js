// 📁 middleware/validateStudentFee.js

module.exports = function validateStudentFee(req, res, next) {
  const { studentData, totalFee, currentPaying, balancePaying, payDate } = req.body;

  // ✅ 1. Validate required student fields
  if (
    !studentData ||
    !studentData.studentId ||
    !studentData.name ||
    !studentData.className ||
    !studentData.admissionDate
  ) {
    return res.status(400).json({ error: "❌ Incomplete studentData" });
  }

  // ✅ 2. Validate required fee fields
  if (!totalFee || !currentPaying || !balancePaying || !payDate) {
    return res.status(400).json({ error: "❌ All fee fields are required" });
  }

  // 💰 3. Validate totalFee: must be number, ≥ 100, and max 20 digits
  const totalFeeNum = Number(totalFee);
  if (isNaN(totalFeeNum)) {
    return res.status(400).json({ error: "❌ totalFee must be a valid number" });
  }
  if (String(totalFee).length > 20) {
    return res.status(400).json({ error: "❌ totalFee should not exceed 20 digits" });
  }
 

  // 💸 4. Validate currentPaying: must be number, ≥ 100, max 290 digits
  const currentNum = Number(currentPaying);
  if (isNaN(currentNum)) {
    return res.status(400).json({ error: "❌ currentPaying must be a valid number" });
  }
  if (currentNum < 1) {
    return res.status(400).json({ error: "❌ currentPaying must be at least ₹1" });
  }
  if (String(currentPaying).length > 20) {
    return res.status(400).json({ error: "❌ currentPaying should not exceed 20 digits" });
  }

  // 💵 5. Validate balancePaying: must be number, ≥ 0
  const balanceNum = Number(balancePaying);
  if (isNaN(balanceNum)) {
    return res.status(400).json({ error: "❌ balancePaying must be a valid number" });
  }
  if (balanceNum < 0) {
    return res.status(400).json({ error: "❌ balancePaying cannot be negative" });
  }

  // ✅ All validations passed
  next();
};
