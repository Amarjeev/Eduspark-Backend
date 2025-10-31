const { sendEmail } = require("../email_Service/sendEmail");
const OtpEmailTemplate = require("./schoolAlertMessage");

const sendAnnouncementToRoles = async ({
  models,
  udisecode,
  savedAnnouncement,
}) => {
  try {
    // 1. Fetch emails from each model
    const emailLists = await Promise.all(
      models.map((Model) =>
        Model.find({ udisecode }).select("email -_id").lean()
      )
    );

    // 2. Merge and deduplicate emails
    const emails = Array.from(
      new Set(
        emailLists
          .flat() // flatten the array of arrays
          .map((user) => user.email)
          .filter(Boolean) // remove null/undefined/empty
      )
    );

    // 3. Generate HTML content
    const { html } = OtpEmailTemplate(savedAnnouncement);

    // 4. Send email to each unique email
    for (const email of emails) {
      await sendEmail(
        email,
        `📢 New School Announcement - EduSpark`,
        savedAnnouncement.message,
        html
      );
    }
  } catch (error) {
    throw error;
  }
};

module.exports = sendAnnouncementToRoles;
