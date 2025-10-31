const express = require("express");
const addStudentFeeRouter = express.Router();
const studentFeeSchema = require("../../../../models/studentFee");
const feeStructureSchema = require("../../../../models/feeStructure");
const studentSchema = require("../../../../models/student");
const validateStudentFee = require("../../../../validators/validateStudentFee");
const {
  verifyTokenByRole,
} = require("../../../../middleware/verifyToken/verify_token");
const studentPaymentEmailTemplate = require("../../../../utils/emails_ui/studentPaymentEmailTemplate");
const { sendEmail } = require("../../../../utils/email_Service/sendEmail");
const redisClient = require("../../../../config/redis/redisClient");
///////////////////////////////////////////////////////////////////////////////////////////////////////
// 🔍 GET: Student Profile + Fee Structure + Paid Fee Records
///////////////////////////////////////////////////////////////////////////////////////////////////////
addStudentFeeRouter.get(
  "/admin/student-profile/:studentId",
  verifyTokenByRole("admin"),
  async (req, res,next) => {
    try {
      const { studentId } = req.params;
      const { udisecode } = req.admin;

      // 🧠 Fetch student profile based on UDISE code and student ID
      const studentProfile = await studentSchema
        .findOne({
          udisecode: udisecode,
          studentId: studentId,
        })
        .select("studentId name className admissionDate parentEmail");

      // ❌ Return 404 if student not found
      if (!studentProfile) {
        return res.status(404).json({ error: "❌ Student not found" });
      }

      // 📅 Extract className and admission year for fee structure match
      const { className, admissionDate } = studentProfile;
      const selectedYear = new Date(admissionDate).getFullYear();

      // 🔎 Match the correct fee structure based on class and year
      const result = await feeStructureSchema.aggregate([
        {
          $match: {
            udisecode: udisecode,
          },
        },
        {
          $project: {
            feeStructures: {
              $filter: {
                input: "$feeStructures",
                as: "fee",
                cond: {
                  $and: [
                    { $eq: ["$$fee.className", className] },
                    { $eq: [{ $year: "$$fee.date" }, selectedYear] },
                  ],
                },
              },
            },
          },
        },
        {
          $match: {
            "feeStructures.0": { $exists: true },
          },
        },
      ]);

      // 💰 Fetch total fees from matched structure
      const totalFees = result[0].feeStructures[0].totalFee;

      // 🏷️ Attach total fee to the student object
      const studentData = studentProfile.toObject();
      studentData.totalFee = totalFees;

      // 🔍 Check if a fee account already exists
      const hasFeeAccount = await studentFeeSchema
        .find({
          udiseCode: udisecode,
          "studentData.studentId": studentId,
          "studentData.className": className,
        })
        .select("balancePaying");

      // ✅ Return existing balance if already present
      if (hasFeeAccount.length > 0) {
        const BalanceAmount = hasFeeAccount[0].balancePaying;
        studentData.balanceAmount = BalanceAmount;
        res.status(200).json(studentData);
        return;
      }

      // 🧾 Create a dummy fee account if not present
      const response = new studentFeeSchema({
        udiseCode: udisecode,
        studentData: studentData,
        totalFee: Number(totalFees),
        currentPaying: 0,
        balancePaying: Number(totalFees),
        payDate: null,
        isDummy: true,
      });

      // 💾 Save new dummy fee record
      const saved = await response.save();
      studentData.balanceAmount = totalFees;

      // 📤 Return student data with fee info
      res.status(200).json(studentData);
    } catch (error) {
      // 🛑 Catch any server-side errors
      next(error);
    }
  }
);

///////////////////////////////////////////////////////////////////////////////////////////////////////
// 💰 POST: Add a New Student Fee Payment
///////////////////////////////////////////////////////////////////////////////////////////////////////
addStudentFeeRouter.post(
  "/admin/student-fees",
  verifyTokenByRole("admin"),
  validateStudentFee,
  async (req, res,next) => {
    try {
      const { udisecode, schoolname } = req.admin;

      // 📥 Destructure request body values
      const { studentData, totalFee, currentPaying, balancePaying, payDate } =
        req.body;

      const id = studentData.studentId;

      // 🔍 Confirm student exists
      const studentProfile = await studentSchema.findOne({
        udisecode: udisecode,
        studentId: id,
      });

      // ❌ Student not found
      if (!studentProfile) {
        return res.status(404).json({
          error: "❌ Student not found with the given ID and UDISE code",
        });
      }

      // ⚠️ Validate required fields
      if (
        !studentData ||
        !totalFee ||
        !currentPaying ||
        !balancePaying ||
        !payDate
      ) {
        return res.status(400).json({ error: "❌ All fields are required" });
      }

      // 💸 Payment Processing Section
      const className = studentData.className;
      // 🔄 Find existing student fee record
      const updateFee = await studentFeeSchema.findOne({
        udisecode: udisecode,
        "studentData.studentId": id,
        "studentData.className": className,
      });

      if (updateFee) {
        const currentPayment = Number(currentPaying);
        const balanceBefore = Number(updateFee.balancePaying);
        const totalAmount = Number(updateFee.totalFee);
        const balanceAfter = balanceBefore - currentPayment;

        // 🚫 Invalid: payment more than total fee
        if (currentPayment > totalAmount) {
          return res.status(400).send({
            status: "warning",
            message: "❌ Invalid payment amount. Cannot exceed total fee.",
          });
        }

        // 🚫 Invalid: payment more than remaining balance
        if (currentPayment > balanceBefore) {
          return res.status(400).send({
            status: "warning",
            message: `❌ Invalid payment amount. Cannot exceed remaining balance of ₹${balanceBefore}.`,
          });
        }

        // 🔒 No payment due
        if (balanceBefore === 0) {
          return res.status(200).send({
            status: "info",
            message: "✅ Payment already completed. No pending balance.",
          });
        }

        // 🎯 Final payment clears balance
        if (balanceAfter <= 0) {
          res.status(200).send({
            status: "success",
            message: "🎉 Payment completed with this transaction!",
          });
        }

        // 💾 Update fee document
        updateFee.totalFee = Number(totalFee);
        updateFee.currentPaying = Number(currentPaying);
        updateFee.balancePaying = Number(balanceAfter);
        updateFee.payDate = new Date(payDate);
        updateFee.isDummy = false;

        // 🧾 Add entry to payment history
        updateFee.paymentHistory.push({
          amount: currentPayment,
          date: new Date(),
        });
        // 📩 Prepare email content first
        const studentEmail = studentProfile.parentEmail;
        const name = studentProfile.name;

        const { html } = studentPaymentEmailTemplate({
          name,
          className,
          id,
          schoolname,
          totalFee,
          currentPaying,
          balanceAfter,
          payDate,
        });

        // ⚡ Parallel execution: Save fee + Send email
        await Promise.all([
          updateFee.save(), // 💾 Save to DB
          sendEmail(
            studentEmail,
            "✅ Eduspark Payment Confirmation",
            `Hello ${name},\n\nYour payment has been successfully received by ${schoolname}.\n\nTotal Amount: ₹${totalFee}\nPaid Amount: ₹${currentPaying}\nBalance: ₹${balanceAfter}\nDate: ${new Date(
              payDate
            ).toLocaleDateString()}\n\nThank you,\n${schoolname}`,
            html
          ),
        ]);

        // 🥳 Respond with success
        return res.status(201).json({
          message: "✅ Student fee added successfully",
        });
      }

      // ❌ Fee record not found
      return res.status(400).json({
        message: "Data is empty",
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = addStudentFeeRouter;
