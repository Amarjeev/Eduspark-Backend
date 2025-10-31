// 📩 OTP email template function for sending to teacher email addresses
function OtpEmailTemplate(userEmail, role) {
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
        <title>Eduspark OTP Verification</title>
        <style>
          body {
            margin: 0;
            font-family: 'Segoe UI', Roboto, sans-serif;
            background-color: #f4f6f9;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            padding: 32px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 25px;
          }
          .header h1 {
            margin: 0;
            color: #0d6efd;
            font-size: 28px;
          }
          .header p {
            color: #555;
            margin-top: 8px;
            font-size: 14px;
          }
          .message {
            color: #333;
            font-size: 15px;
            margin-bottom: 10px;
          }
          .otp-box {
            margin: 30px 0;
            text-align: center;
          }
          .otp-code {
            display: inline-block;
            background-color: #0d6efd;
            color: white;
            font-size: 32px;
            letter-spacing: 12px;
            padding: 16px 34px;
            border-radius: 10px;
            font-weight: bold;
          }
          .warning {
            color: #d93025;
            font-size: 14px;
            margin-top: 10px;
          }
          .footer {
            font-size: 12px;
            color: #888;
            text-align: center;
            margin-top: 30px;
          }
          @media screen and (max-width: 600px) {
            .otp-code {
              font-size: 26px;
              padding: 12px 24px;
              letter-spacing: 8px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Eduspark</h1>
            <p>${role} Login Verification</p>
          </div>

          <p class="message">Dear Teacher,</p>
          <p class="message">
            A login attempt was made using the email <strong>${userEmail}</strong> on <strong>${timestamp}</strong>.
            To proceed, please use the OTP below. This code is valid for <strong>3 minutes</strong>.
          </p>

          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>

          <p class="warning">
            ⚠️ If you did not initiate this login attempt, please change your password immediately or contact school administration.
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />

          <div class="footer">
            This OTP is confidential and valid for <strong>3 minutes</strong> only. Do not share it with anyone.<br/>
            &copy; ${new Date().getFullYear()} Eduspark School Management System
          </div>
        </div>
      </body>
      </html>
    `
  };
}

module.exports = OtpEmailTemplate;
