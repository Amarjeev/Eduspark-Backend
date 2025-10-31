// ==========================
//        DEPENDENCIES
// ==========================
const express = require("express");
require("dotenv").config();
const connectDB = require("./config/db/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const logger = require("./utils/winston/logger");

// ==========================
//         ROUTES IMPORTS
// ==========================

const searchSchool = require("./get_SchoolName_api/schoolController");

// Admin Routes
const clientLogout = require("./routes/client/logout/logout");
const forgotUdisecodeRouter = require("./routes/client/common_auth/forgotUdisecode");
const forgotPasswordRouter = require("./routes/client/common_auth/forgotPassword");
const adminSignup = require("./routes/client/admin/user-registrations/adminSignup");
const teacherSignup = require("./routes/client/admin/user-registrations/teacherSignup");
const editTeacherProfile = require("./routes/client/admin/user-registrations/editTeacherProfile");
const classDivisionConfig = require("./routes/client/admin/schoolConfig/classDivisionConfig");
const SubjectsConfig = require("./routes/client/admin/schoolConfig/SubjectsConfig");
const studentSignupRoute = require("./routes/client/admin/user-registrations/studentSignup");
const addExamMarkRoute = require("./routes/client/admin/addMark/addExamMark");
const schoolFeeStructureRouter = require("./routes/client/admin/fees_management/schoolFeeStructure");
const feeRecordsRouter = require("./routes/client/admin/fees_management/feeRecords");
const addStudentFeeRouter = require("./routes/client/admin/fees_management/addStudentFee");
const timetableConfig = require("./routes/client/admin/timetable/timeTableCreate");
const AllClassTimetableRouter = require("./routes/client/admin/timetable/AllClassTimetable");
const teacherAccessServiceRouter = require("./routes/client/admin/user_Roles_Permission/teacherAccessService");
const announcementsRouter = require("./routes/client/admin/announcements/announcements");
const editStudentProfileRouter = require("./routes/client/admin/user-registrations/editStudentProfile");
const adminProfileRouter = require("./routes/client/admin/profile_View/adminProfile");
// Common Auth
const teacherLoginRouter = require("./routes/client/common_auth/login");
const otpVerificationRouter = require("./routes/client/common_auth/otpVerification");
const resendOtpRouter = require("./routes/client/common_auth/resendOtp");

// Teacher Routes
const teacherDutyScheduleRouter = require("./routes/client/teacher/todayDuty_Schedule/TeacherTodaySchedule");
const getStudentsByClassRouter = require("./routes/client/teacher/attendance/getStudentsByClass");
const updateStudentAttendanceRouter = require("./routes/client/teacher/attendance/updateStudentAttendance");
const attendanceHistoryRouter = require("./routes/client/teacher/attendance/attendanceHistory");
const getClassStudentsRouter = require("./routes/client/teacher/students_List/getClassStudents");
const studentControllerRouter = require("./routes/client/teacher/students_List/StudentDetails");
const ClassWiseTTTeacherRouter = require("./routes/client/teacher/timetable/ClassWiseTimetableForTeacher");
const assignHomeworkRouter = require("./routes/client/teacher/homework/assignHomework");
const editAndViewHomeworkRouter = require("./routes/client/teacher/homework/editAndViewHomework");
const verifyHomeworkRouter = require("./routes/client/teacher/HomeworkArchive/verifyHomework");
// Student/Parent Routes
const studentProfileRouter = require("./routes/client/student/studentProfile");
const updateProfileDataRouter = require("./routes/client/student/updateProfileData");
const studentHomeworkRouter = require("./routes/client/student/studentHomework");
const studentFeesHistoryRouter = require("./routes/client/student/studentFeesHistory");
const parentSignupRouter = require("./routes/client/parents/user-registrations/parentSignup");
const fetchChildrenListRouter = require("./routes/client/parents/students/fetchChildrenList");
const verifiedSubmittedHomeworkRouter = require("./routes/client/student/verifiedSubmittedHomework");
// Middleware Routes
const getSchoolConfigDataRoute = require("./middleware/class&subject_dowload/getSchoolConfigData");
const sessionVerifyRoute = require("./middleware/tokenCheck/sessionVerifyRoute");
const userProfileRouter = require("./middleware/User_profile_download/User_profile");
const uploadImageRouter = require("./config/upload_images/upload");
const errorHandler = require("./utils/winston/errorHandler");

// ==========================
//      INITIAL SETUP
// ==========================
const app = express();
const PORT = 5000;
// ==========================
//        MIDDLEWARES
// ==========================
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173",       // Local dev
      "https://www.eduspark.space",  // Main frontend
      "https://eduspark.space"       // Without www
    ],
     allowedHeaders: ['Authorization', 'Content-Type'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);



// ==========================
//        ROUTES MOUNTING
// ==========================

// -- Admin --
app.use("/", clientLogout);
app.use("/", adminSignup);
app.use("/", forgotUdisecodeRouter);
app.use("/", forgotPasswordRouter);
app.use("/", searchSchool);
app.use("/", teacherSignup);
app.use("/", editTeacherProfile);
app.use("/", classDivisionConfig);
app.use("/", SubjectsConfig);
app.use("/", studentSignupRoute);
app.use("/", addExamMarkRoute);
app.use("/", schoolFeeStructureRouter);
app.use("/", feeRecordsRouter);
app.use("/", addStudentFeeRouter);
app.use("/", timetableConfig);
app.use("/", AllClassTimetableRouter);
app.use("/", teacherAccessServiceRouter);
app.use("/", announcementsRouter);
app.use("/", editStudentProfileRouter);
app.use("/", adminProfileRouter);

// -- Teacher --
app.use("/", teacherDutyScheduleRouter);
app.use("/", getStudentsByClassRouter);
app.use("/", updateStudentAttendanceRouter);
app.use("/", attendanceHistoryRouter);
app.use("/", getClassStudentsRouter);
app.use("/", studentControllerRouter);
app.use("/", ClassWiseTTTeacherRouter);
app.use("/", assignHomeworkRouter);
app.use("/", editAndViewHomeworkRouter);
app.use("/", verifyHomeworkRouter);

// -- Common Auth --
app.use("/", teacherLoginRouter);
app.use("/", otpVerificationRouter);
app.use("/", resendOtpRouter);

// -- Student/Parent --
app.use("/", studentProfileRouter);
app.use("/", updateProfileDataRouter);
app.use("/", studentHomeworkRouter);
app.use("/", studentFeesHistoryRouter);
app.use("/", parentSignupRouter);
app.use("/", fetchChildrenListRouter);
app.use("/", verifiedSubmittedHomeworkRouter);

// -- Middleware --
app.use("/", getSchoolConfigDataRoute);
app.use("/", sessionVerifyRoute);
app.use("/", userProfileRouter);
app.use("/", uploadImageRouter);

// ==========================
//     HEALTH CHECK ROUTE
// ==========================
app.get("/health", (_, res) => {
  res.status(200).json({ status: "✅ OK", message: "Server is running fine." });
});

// ==========================
//     404 NOT FOUND HANDLER
// ==========================
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    message: "Route not found 🚫",
  });
});

// ✅ GLOBAL ERROR HANDLER LAST
app.use(errorHandler);
// ==========================
//      START SERVER
// ==========================
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server running at http://:${PORT}`);
    });
  } catch (error) {
    logger.error("❌ Failed to connect to MongoDB", error);
    process.exit(1);
  }
};

startServer();
