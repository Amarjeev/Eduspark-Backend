const teacherRegistrationEmailTemplate = ({
  name,
  email,
  password,
  subject,
  department,
  idCode,
  udisecode,
  mobileNumber,
  schoolName,
  websiteName = "🎓Eduspark",
}) => {
  return {
    html: `
      <div style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f0f2f5; padding: 10px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 10px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;">
          <h2 style="color: #0d6efd; text-align: center; margin-bottom: 10px;">Welcome to ${websiteName}!</h2>
          <p style="font-size: 16px; color: #333; text-align: center;">Your teacher account at <strong>${schoolName}</strong> has been successfully created.</p>
          <div style="margin-top: 30px;">
            <h3 style="color: #444; border-bottom: 1px solid #ddd; padding-bottom: 8px;">Your Account Details:</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <tbody>
                <tr>
                  <td style="padding: 12px; border: 1px solid #e0e0e0; background-color: #fafafa;"><strong>Email:</strong></td>
                  <td style="padding: 12px; border: 1px solid #e0e0e0;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #e0e0e0; background-color: #fafafa;"><strong>Password:</strong></td>
                  <td style="padding: 12px; border: 1px solid #e0e0e0;">
                    <div style="font-weight: bold; color: #333;">${password}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #e0e0e0; background-color: #fafafa;"><strong>Subject:</strong></td>
                  <td style="padding: 12px; border: 1px solid #e0e0e0;">${subject}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #e0e0e0; background-color: #fafafa;"><strong>Department:</strong></td>
                  <td style="padding: 12px; border: 1px solid #e0e0e0;">${department}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #e0e0e0; background-color: #fafafa;"><strong>Employee ID:</strong></td>
                  <td style="padding: 12px; border: 1px solid #e0e0e0;">${idCode}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #e0e0e0; background-color: #fafafa;"><strong>School Code:</strong></td>
                  <td style="padding: 12px; border: 1px solid #e0e0e0;">${udisecode}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #e0e0e0; background-color: #fafafa;"><strong>Mobile Number:</strong></td>
                  <td style="padding: 12px; border: 1px solid #e0e0e0;">${mobileNumber}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="margin-top: 30px; text-align: center;">
            <a href="https://${websiteName.toLowerCase()}.com" target="_blank" style="background-color: #0d6efd; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block; font-size: 16px;">Login to your Account</a>
          </div>

          <p style="margin-top: 25px; font-size: 14px; color: #555;">If you have any questions or need help, please contact your school administration.</p>

          <p style="margin-top: 20px; font-size: 12px; color: #999; text-align: center;">This is an automated message from ${websiteName}. Please do not reply to this email.</p>
        
        </div>
      </div>
    `,
  };
};

module.exports = teacherRegistrationEmailTemplate;
