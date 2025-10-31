const sendUdiseCodeEmailTemplate = ({
  schoolname,
  udisecode,
  websiteName = "🎓Eduspark",
}) => {
  const cleanWebsiteURL = websiteName.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com";

  return {
    html: `
      <div style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f3f4f6; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">

          <h2 style="color: #f59e0b; text-align: center; font-size: 24px; margin-bottom: 10px;">
            🎓 UDISE Code Details
          </h2>

          <h3 style="font-size: 20px; text-align: center; color: #111827; margin-bottom: 20px;">
            <strong>${schoolname}</strong>
          </h3>

          <p style="font-size: 16px; color: #374151; text-align: center; margin-bottom: 12px;">
            Your registered institute code is:
          </p>

          <div style="margin: 0 auto 30px; text-align: center;">
            <span style="display: inline-block; background-color: #fef3c7; color: #1f2937; font-weight: bold; font-family: monospace; font-size: 20px; padding: 12px 24px; border-radius: 10px; border: 1px solid #facc15;">
              ${udisecode}
            </span>
          </div>

          <div style="text-align: center;">
            <a href="https://${cleanWebsiteURL}/login"
               target="_blank"
               style="background-color: #f59e0b; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; display: inline-block;">
              Login to EduSpark
            </a>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #6b7280; text-align: center;">
            If you have any questions, please contact your school administration.
          </p>

          <p style="margin-top: 18px; font-size: 12px; color: #9ca3af; text-align: center;">
            This is an automated email from ${websiteName}. Please do not reply.
          </p>

        </div>
      </div>
    `,
  };
};

module.exports = sendUdiseCodeEmailTemplate;
