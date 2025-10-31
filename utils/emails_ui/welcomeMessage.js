const welcomeMessageEmailTemplate = ({
  name,
  schoolName,
  websiteName = "Eduspark🎓",
}) => {
  return {
    html: `
      <div style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border: 1px solid #e0e0e0;">
          <div style="padding: 24px;">
            <h2 style="color: #0d6efd; text-align: center;">Welcome to ${websiteName}!</h2>
            <p style="font-size: 16px; color: #333333; text-align: center; line-height: 1.6;">
              Hello <strong>${name}</strong>,<br /><br />
              Your <strong>parent</strong> profile has been successfully created at <strong>${schoolName}</strong>.<br />
              We're happy to have you join us. You can now access your account to monitor and support your child's progress.
            </p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://${websiteName
                .toLowerCase()
                .replace(
                  /[^a-z]/g,
                  ""
                )}.com" style="background-color: #0d6efd; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px; display: inline-block;">
                Go to Dashboard
              </a>
            </div>
            <p style="font-size: 14px; color: #777; text-align: center; margin-top: 24px;">
              If you have any questions, please contact your school administration.
            </p>
            <p style="font-size: 12px; color: #999; text-align: center; margin-top: 16px;">
              This is an automated message from ${websiteName}. Please do not reply.
            </p>
          </div>
        </div>
      </div>
    `,
  };
};

module.exports = welcomeMessageEmailTemplate;
