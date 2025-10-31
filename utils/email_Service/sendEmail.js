const SibApiV3Sdk = require("sib-api-v3-sdk");

const sendEmail = async (to, subject, text, html, toName) => {
  const client = SibApiV3Sdk.ApiClient.instance;
  client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

  const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

  const sendSmtpEmail = {
    sender: { 
      email: process.env.BREVO_SENDER_EMAIL,
      name: "EduSpark" 
    },
    to: toName ? [{ email: to, name: toName }] : [{ email: to }],
    subject,
    textContent: text,
    htmlContent: html
  };

  try {
    await tranEmailApi.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    throw new Error("Email delivery failed in production");
  }
};

module.exports = { sendEmail };
