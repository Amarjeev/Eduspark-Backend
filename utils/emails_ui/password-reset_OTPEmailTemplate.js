function passwordResetOtpEmailTemplate(userEmail, role) {
  const timestamp = new Date().toLocaleString();
  const otp = Math.floor(100000 + Math.random() * 900000);

  return {
    otp,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Eduspark Password Reset OTP</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Roboto, sans-serif;
            background: #f1f5f9;
          }
          .container {
            max-width: 560px;
            margin: 30px auto;
            background: #ffffff;
            padding: 30px 24px;
            border-radius: 14px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
          }
          .logo {
            text-align: center;
            font-size: 26px;
            font-weight: bold;
            color: #0ea5e9;
            margin-bottom: 8px;
          }
          .subtitle {
            text-align: center;
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 28px;
          }
          .message {
            font-size: 15px;
            color: #1f2937;
            margin-bottom: 16px;
          }
          .otp-wrapper {
            text-align: center;
            margin: 32px 0;
          }
          .otp {
            display: inline-block;
            background: #0ea5e9;
            color: #ffffff;
            font-size: 28px;
            font-weight: 600;
            letter-spacing: 10px;
            padding: 14px 30px;
            border-radius: 12px;
          }
          .warning {
            font-size: 14px;
            color: #ef4444;
            margin-top: 16px;
            text-align: center;
          }
          .footer {
            font-size: 12px;
            color: #94a3b8;
            text-align: center;
            margin-top: 40px;
          }
          @media only screen and (max-width: 600px) {
            .otp {
              font-size: 24px;
              padding: 12px 20px;
              letter-spacing: 6px;
            }
            .container {
              padding: 24px 16px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">🎓 Eduspark</div>
          <div class="subtitle">Password Reset Verification - ${role}</div>

          <p class="message">Dear User,</p>
          <p class="message">
            You recently requested a password reset using the email address <strong>${userEmail}</strong> on <strong>${timestamp}</strong>.
            Please use the OTP below to verify your identity. This OTP is valid for <strong>2 minutes</strong>.
          </p>

          <div class="otp-wrapper">
            <div class="otp">${otp}</div>
          </div>

          <div class="warning">
            ⚠️ If you did not request a password reset, please ignore this email or contact your school administrator immediately.
          </div>

          <div class="footer">
            This OTP is private. Do not share it with anyone.<br />
            &copy; ${new Date().getFullYear()} Eduspark School Management System
          </div>
        </div>
      </body>
      </html>
    `
  };
}

module.exports = passwordResetOtpEmailTemplate;
