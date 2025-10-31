const express = require("express");
const {
  verifyTokenByRole,
} = require("../../../../middleware/verifyToken/verify_token");
const SubjectConfigSchema = require("../../../../models/subjectConfig");

const SubjectsConfig = express.Router();

// ======================= 📚 CREATE SUBJECTS ROUTE =======================
// Route: POST /admin/subjects/create
// Purpose: Save a unique list of subjects for a particular school
SubjectsConfig.post(
  "/admin/subjects/create",
  verifyTokenByRole("admin"), // 🔐 Middleware to ensure the request is from an authenticated admin
  async (req, res,next) => {
    const { subjects, subjectId, status } = req.body; // 📨 Incoming subject list from frontend
    const { udisecode, schoolname } = req.admin; // 🏫 Extracting school details from token

    // 🧼 Utility function: Normalize subject name (trim + lowercase + remove all spaces)
    const normalizeName = (str) => str.trim().toLowerCase().replace(/\s+/g, "");

    try {
      // ======================= ❌ DELETE SUBJECT =======================
      if (status === "delete" && subjectId) {
        const result = await SubjectConfigSchema.updateOne(
          { udisecode },
          { $pull: { subjects: { _id: subjectId } } }
        );

        // ✅ Respond if subject successfully deleted
        return res
          .status(200)
          .json({ status: true, message: "Subject deleted" });
      }

      // ======================= 🧹 CLEAN & DEDUPLICATE SUBJECT INPUT =======================
      const uniqueSet = new Set(); // 🧺 Set to store unique normalized subject names
      for (const item of subjects) {
        const className = normalizeName(item); // ✂️ Trim & 🔡 normalize subject name
        uniqueSet.add(className); // ➕ Add to Set (duplicates auto removed)
      }

      // 📋 Convert Set to array like ['math', 'science']
      const subjectNamesArray = Array.from(uniqueSet);

      // 🧱 Convert normalized array to MongoDB-compatible format: [{ name: 'math' }, ...]
      const subjectArray = subjectNamesArray.map((subject) => ({
        name: normalizeName(subject),
      }));

      // ======================= 🕵️ CHECK FOR DUPLICATES =======================
      const duplicateRecord = await SubjectConfigSchema.findOne({
        udisecode,
        "subjects.name": { $in: subjectNamesArray }, // 🔍 Check existing names
      });

      // ======================= ✏️ EDIT SUBJECT =======================
      if (!duplicateRecord) {
        if (status === "edit" && subjectId) {
          const subjectNamesString = subjectNamesArray.join(""); // 🧵 Merge to single string (assumes one subject)

          const response = await SubjectConfigSchema.updateOne(
            { udisecode, "subjects._id": subjectId },
            {
              $set: {
                "subjects.$.name": subjectNamesString, // 🛠️ Update matched subject by ID
              },
            }
          );

          // ✅ Respond with success
          return res.status(200).json({
            status: true,
            message: "Subject updated successfully",
          });
        }

        // ======================= ➕ ADD NEW SUBJECTS TO EXISTING RECORD =======================
        const response = await SubjectConfigSchema.updateOne(
          { udisecode },
          {
            $addToSet: {
              subjects: { $each: subjectArray },
            },
          },
          { upsert: true }
        );

        // ✅ Respond with success
        return res.status(201).json({
          message: "✅ Subjects saved successfully.",
          status: true,
        });
      }

      // ======================= 🚫 HANDLE DUPLICATES =======================
      if (duplicateRecord) {
        // 📦 Get existing subject names (normalized)
        const existingNames = duplicateRecord.subjects.map((sub) =>
          sub.name.toLowerCase()
        );

        // ❗ Filter user input against existing names
        const duplicates = subjectNamesArray.filter((name) =>
          existingNames.includes(name)
        );

        // ❗ Return if duplicates found
        return res.status(409).json({
          message: "❌ One or more subjects already exist in the database.",
          status: false,
          duplicates: duplicates, // 📋 Return duplicate names
        });
      }

      // ======================= 🆕 CREATE NEW SUBJECT CONFIG DOC =======================
      const subjectData = new SubjectConfigSchema({
        udisecode: udisecode,
        schoolname: schoolname,
        subjects: subjectArray,
      });

      // 💾 Save to database
      await subjectData.save();

      // ✅ Respond with success
      res.status(201).json({
        message: "✅ Subjects saved successfully.",
        status: true,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ======================= FETCH SUBJECTS ROUTE =======================
// Route: GET /admin/subjects/get
// Purpose: Retrieve saved subjects for a logged-in school
SubjectsConfig.get(
  "/admin/subjects/get",
  verifyTokenByRole("admin"), // Middleware to validate admin login session
  async (req, res,next) => {
    try {
      const { udisecode } = req.admin; // Get school identity from token

      // Step 1: Search MongoDB for existing subject config using udisecode
      const existingSubjects = await SubjectConfigSchema.findOne({ udisecode });

      // Step 2: If no data found, return not found message
      if (!existingSubjects) {
        return res.status(404).json({
          message: "No subject configuration found.",
          status: false,
        });
      }

      // Step 3: Return subject list if found
      res.status(200).json({
        message: "✅ Subjects fetched successfully.",
        status: true,
        data: existingSubjects.subjects, // Send subject array to frontend
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = SubjectsConfig;
