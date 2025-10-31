// OTP email template function for sending to parent email addresses
function clientEmailTemplate(userEmail) {
  const timestamp = new Date().toLocaleString(); // Get current timestamp
  const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP

  return {
    otp, // Return OTP so it can be verified later
    html: `
      <div style="font-family: 'Segoe UI', Roboto, sans-serif; background-color: #f2f4f8; padding: 10px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px; color: #0d6efd;">🎓 Eduspark</h1>
          </div>

          <!-- Info -->
          <p style="color: #333; font-size: 15px;">
            A login attempt was made using the email address <strong>${userEmail}</strong> on <strong>${timestamp}</strong>.
          </p>

          <!-- Instruction -->
          <p style="color: #333; font-size: 15px; margin-top: 20px;">
            Please use the One-Time Password (OTP) below to continue. It is valid for <strong>3 minutes</strong> only:
          </p>

          <!-- OTP Box -->
          <div style="text-align: center; margin: 30px 0;">
            <span style="
              display: inline-block;
              background-color: #0d6efd; 
              color: #ffffff;
              font-size: 26px;
              letter-spacing: 10px;
              padding: 14px 28px;
              border-radius: 10px;
              font-weight: 600;
            ">
              ${otp}
            </span>
          </div>

          <!-- Warning -->
          <p style="color: #d93025; font-size: 14px;">
            If you did not initiate this request, please secure your account immediately by changing your password or contacting support.
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />

          <!-- Footer -->
          <p style="font-size: 12px; color: #888; text-align: center;">
            This OTP is valid for <strong>3 minutes</strong>. Do not share it with anyone.<br />
            &copy; ${new Date().getFullYear()} Eduspark. All rights reserved.
          </p>
        </div>
      </div>
    `
  };
}

module.exports = clientEmailTemplate;
