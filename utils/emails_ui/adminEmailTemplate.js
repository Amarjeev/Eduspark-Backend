function adminWelcomeEmailTemplate(name, email, udisecode,idType) {
  const timestamp = new Date().toLocaleString();

  return {
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #28a745;">🎉 Congratulations, ${name}!</h2>
          <p>Welcome to <strong>EduSpark</strong> – your school’s digital partner in smarter management.</p>

          <p>Your admin account was successfully created on <strong>${timestamp}</strong>.</p>
          
          <h3 style="margin-top: 20px; color: #333;">🔐 Login Credentials:</h3>
          <ul style="list-style-type: none; padding: 0;">
            <li><strong>Username:</strong> ${name}</li>
            <li><strong>Login Email:</strong> ${email}</li>
            <li><strong>${idType} Code:</strong> ${udisecode}</li>
          </ul>

          <p style="margin-top: 20px;">
            You can now access the dashboard, configure your school setup, and explore EduSpark's powerful features such as:
          </p>
          <ul>
            <li>📚 Manage classes, staff, and student profiles</li>
            <li>📢 Send announcements and alerts</li>
            <li>🛡️ Ensure data security with cloud backup</li>
          </ul>

          <p style="margin-top: 20px;">Enjoy your journey with EduSpark. We're excited to have you onboard!</p>
          
          <p style="font-size: 12px; color: #888; margin-top: 30px;">If you did not request this account, please contact our support immediately.</p>
        </div>
      </div>
    `
  };
}

module.exports = adminWelcomeEmailTemplate;
