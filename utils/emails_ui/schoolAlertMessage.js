const schoolAlertMessage = (data) => {
  return {
    html: `
      <div style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI', Roboto, Arial, sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:8px;">
          <div style="background:#ffffff;border-radius:10px;padding:16px 16px 12px;border:1px solid #e2e8f0;box-shadow:0 4px 12px rgba(0,0,0,0.04);">

            <div style="text-align:center;margin-bottom:12px;">
              <h2 style="color:#1d4ed8;font-size:20px;margin:0;">📣 School Announcement</h2>
            </div>

            <p style="font-size:15px;color:#334155;text-align:center;margin-bottom:16px;">
              Message from <strong>${data.schoolname}</strong>
            </p>

            <div style="background-color:#f8fafc;border-left:4px solid #2563eb;padding:12px 14px;margin-bottom:16px;border-radius:6px;">
              <p style="margin:0;font-size:14px;color:#1e293b;line-height:1.5;white-space:pre-line;">
                ${data.message}
              </p>
            </div>

            <div style="margin-bottom:16px;">
              <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <tr>
                  <td style="padding:8px 10px;background-color:#f1f5f9;font-weight:600;width:40%;border-radius:4px 0 0 4px;">📅 Sent On</td>
                  <td style="padding:8px 10px;border-left:1px solid #e2e8f0;border-radius:0 4px 4px 0;">${data.date}</td>
                </tr>
              </table>
            </div>

            <div style="text-align:center;margin:24px 0 12px;">
              <a href="https://eduspark.com/login" target="_blank" style="display:inline-block;background-color:#2563eb;color:#ffffff;text-decoration:none;padding:10px 20px;font-size:14px;border-radius:5px;font-weight:600;">
                🔐 Go to Student Portal
              </a>
            </div>

            <p style="font-size:13px;color:#64748b;text-align:center;margin-bottom:6px;">
              For help, contact your school administration.
            </p>
            <p style="font-size:11px;color:#94a3b8;text-align:center;margin:0;">
              Automated email from 🎓 Eduspark. Please do not reply.
            </p>
          </div>
        </div>
      </div>
    `
  };
};

module.exports = schoolAlertMessage;
