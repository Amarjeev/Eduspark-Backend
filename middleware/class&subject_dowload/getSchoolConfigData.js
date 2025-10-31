const express = require("express");
const getSchoolConfigDataRoute = express.Router();

const classConfigSchema = require("../../models/classDivision");
const subjectConfigSchema = require("../../models/subjectConfig");
const redisClient = require("../../config/redis/redisClient");
const { verifyTokenByRole } = require("../verifyToken/verify_token");

// 📌 GET /school/config-data/:role - Fetch both class names and subject names
getSchoolConfigDataRoute.get(
  "/school/config-data/:role",
  verifyTokenByRole(),
  async (req, res, next) => {
    try {
      const { role } = req.params;
      const userData = req[role];

      if (!userData || !userData.udisecode || !userData.employid) {
        return res
          .status(400)
          .json({ message: "Missing UDISE code or employee ID in request." });
      }

      const { udisecode, employid } = userData;

      // 🧠 Run MongoDB queries in parallel
      const [subjectResponse, classResponse] = await Promise.all([
        subjectConfigSchema.find({ udisecode }, { subjects: 1, _id: 0 }),
        classConfigSchema.find({ udisecode }, { className: 1, _id: 0 }).lean(),
      ]);

      // 🟡 Build subject list safely
      const subjectList =
        subjectResponse.length && subjectResponse[0]?.subjects?.length
          ? subjectResponse[0].subjects.map((subject) => {
              const rawName = subject?.name ?? "";
              const prettyName =
                typeof rawName === "string"
                  ? rawName
                      .split(" ")
                      .map(
                        (word) =>
                          word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")
                  : "";
              return prettyName;
            })
          : [];

      // Save subject list to Redis
      await redisClient.set(
        `eduspark_subject-List:${udisecode}${employid}`,
        JSON.stringify(subjectList)
      );

      // 🟡 Build class list safely
      const classList =
        classResponse.length && classResponse[0]?.className?.length
          ? classResponse[0].className
              .map((item) => item.value)
              .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
          : [];

      // Save class list to Redis
      await redisClient.set(
        `eduspark_class-List:${udisecode}${employid}`,
        JSON.stringify(classList)
      );

      // 🟢 Final response
      if (!subjectList.length && !classList.length) {
        return res.status(200).json({
          subjects: ["No subjects available"],
          classes: ["No classes available"],
          message: "No subject or class data found for this UDISE code.",
        });
      }

      return res.status(200).json({
        subjects: subjectList,
        classes: classList,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = getSchoolConfigDataRoute;
