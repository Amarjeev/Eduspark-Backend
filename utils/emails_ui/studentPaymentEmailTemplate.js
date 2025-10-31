const studentPaymentEmailTemplate = ({
  name,
  className,
  id,
  schoolname,
  totalFee,
  currentPaying,
  balanceAfter,
  payDate,
  websiteName = "🎓Eduspark",
}) => {
  return {
    html: `
      <div style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f9fafb; padding: 2px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 14px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;">
        
          <h2 style="color: #16a34a; text-align: center; margin-bottom: 20px;">✅ Payment Confirmation</h2>
          
          <p style="font-size: 16px; color: #333; text-align: center; word-break: break-word;">
            Hello <strong>${name}</strong>,
          </p>

          <p style="font-size: 16px; color: #444; text-align: center; margin-bottom: 30px;">
            Your payment has been successfully received by <strong>${schoolname}</strong>.
          </p>
          
          <div>
            <h3 style="color: #444; border-bottom: 1px solid #ddd; padding-bottom: 8px;">💳 Payment Details:</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 15px; table-layout: fixed;">
              <tbody>
                ${[
                  ["Student Name", name],
                  ["Student ID", id],
                  ["Class", className],
                  ["School", schoolname],
                  ["Total Amount", `₹${totalFee}`],
                  ["Paid Amount", `₹${currentPaying}`],
                  ["Balance Amount", `₹${balanceAfter}`],  // 🛠️ fixed here
                  ["Payment Date", new Date(payDate).toLocaleDateString()],
                ]
                  .map(
                    ([label, value]) => `
                    <tr>
                      <td style="padding: 10px; background-color: #f1f5f9; font-weight: 600; vertical-align: top; width: 40%; word-break: break-word;">${label}</td>
                      <td style="padding: 10px; word-break: break-word;">${value}</td>
                    </tr>
                  `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <div style="margin-top: 30px; text-align: center;">
            <a href="https://${websiteName
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "")}.com/login"
              target="_blank"
              style="background-color: #16a34a; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block; font-size: 16px;">
              View Account
            </a>
          </div>

          <p style="margin-top: 25px; font-size: 14px; color: #555; text-align: center;">If you have any questions, please contact your school administration.</p>

          <p style="margin-top: 20px; font-size: 12px; color: #999; text-align: center;">This is an automated email from ${websiteName}. Please do not reply.</p>
        
        </div>
      </div>
    `,
  };
};

module.exports = studentPaymentEmailTemplate;
