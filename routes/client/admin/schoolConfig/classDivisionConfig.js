const express = require("express");
const classDivisionConfig = express.Router();
const ClassDivisionSchema = require("../../../../models/classDivision");
const {
  verifyTokenByRole,
} = require("../../../../middleware/verifyToken/verify_token");

// Route: Create or update class and division configuration for a school
classDivisionConfig.post(
  "/admin/create-class-division",
  verifyTokenByRole("admin"),
  async (req, res,next) => {
    const { udisecode, schoolname } = req.admin; // Extract school info from verified token
    const submittedClassDivisionList = req.body; // Get submitted class-division array from request

    const uniqueSet = new Set(); // To track unique class-division values like "1st-A"
    const normalizedList = []; // To store final list with unique IDs and values

    for (const item of submittedClassDivisionList) {
      const className = item.className.toLowerCase().trim(); // Normalize class name
      const division = item.division.toUpperCase().trim(); // Normalize division name
      const value = `${className} - ${division}`; // Create combined value

      if (
        className.length < 1 ||
        className.length > 20 ||
        division.length < 1 ||
        division.length > 15
      ) {
        return res.status(400).json({
          message: `❌ Class name must be 1–20 characters and division must be 1–15 characters.`,
          status: false,
        });
      }

      if (!uniqueSet.has(value)) {
        uniqueSet.add(value); // Prevent duplicates
        normalizedList.push({ value }); // Add with unique ID
      }
    }

    try {
      const existing = await ClassDivisionSchema.findOne({ udisecode }).lean(); // Check if school exists

      if (existing) {
        const existingValues = existing.className.map((entry) => entry.value); // Get existing values
        const duplicate = normalizedList.filter((cd) =>
          existingValues.includes(cd.value)
        ); // Find duplicates

        if (duplicate.length > 0) {
          return res.status(409).json({
            message: "Some class-division pairs already exist for this school.",
            status: false,
            duplicate: duplicate.map((d) => d.value), // Send only duplicate values
          });
        }

        // Add new unique entries to existing document
        await ClassDivisionSchema.updateOne(
          { udisecode },
          { $addToSet: { className: { $each: normalizedList } } }
        );

        return res.status(201).json({
          message: `New class/division entries added successfully for "${schoolname}".`,
          status: true,
        });
      }

      // If no existing document found, create new one
      const newClassDivisionDocument = new ClassDivisionSchema({
        udisecode,
        schoolname,
        className: normalizedList,
      });

      await newClassDivisionDocument.save(); // Save to DB

      return res.status(201).json({
        message: `Class and division setup for "${schoolname}" saved successfully.`,
        status: true,
      });
    } catch (error) {
      next(error);
    }
  }
);

//fentching data
classDivisionConfig.get(
  "/admin/get-class-divisions",
  verifyTokenByRole("admin"),
  async (req, res,next) => {
    try {
      const { udisecode } = req.admin;
      const response = await ClassDivisionSchema.findOne(
        { udisecode: udisecode },
        { className: 1, _id: 0 }
      );

      return res.status(201).json(response); // ✅ Send full data to frontend
    } catch (error) {
      next(error);
    }
  }
);

classDivisionConfig.put(
  "/admin/edit-class-division",
  verifyTokenByRole("admin"),
  async (req, res,next) => {
    const { udisecode } = req.admin; // Extract school info from verified token
    const { action, newData, currentID } = req.body;
    if (action === "delete") {
      try {
        const result = await ClassDivisionSchema.updateOne(
          { udisecode },
          {
            $pull: {
              className: { _id: currentID },
            },
          }
        );
        if (result.modifiedCount === 0) {
          return res.status(404).json({
            message: `❌ No class-division found with the given ID.`,
            status: false,
          });
        }

        res.status(200).send({ status: true });
      } catch (error) {
        next(error);
      }
    }

    if (action === "edit") {
      try {
        for (const item of newData) {
          const { newClassName, newDivisionName, currentID } = item;
          if (
            newClassName.length < 1 ||
            newClassName.length > 20 ||
            newDivisionName.length < 1 ||
            newDivisionName.length > 15
          ) {
            return res.status(400).json({
              message: `❌ Class name must be 1–20 characters and division must be 1–15 characters.`,
              status: false,
            });
          }

          const newValue = `${newClassName
            .trim()
            .toLowerCase()} - ${newDivisionName.trim().toUpperCase()}`;

          // 🔍 Duplicate checking in DB for same value
          const duplicateExists = await ClassDivisionSchema.findOne({
            udisecode,
            className: {
              $elemMatch: {
                value: newValue,
              },
            },
          });

          if (duplicateExists) {
            return res.status(409).send({
              message: `❌ Duplicate "${newValue}" already exists.`,
              status: false,
            });
          }

          // ✅ Update if no duplicate found
          response = await ClassDivisionSchema.updateOne(
            { udisecode, "className._id": currentID },
            { $set: { "className.$.value": newValue } }
          );

          // ✅ Send success response
          res.status(200).send({
            message: `Class-Division "${newValue}" updated successfully.`,
            status: true,
          });
        }
      } catch (error) {
        next(error);
      }
    }
  }
);

module.exports = classDivisionConfig;
