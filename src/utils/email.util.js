import nodemailer from 'nodemailer';
import appConfig from '../config/app.config.js';

/**
 * Reusable utility to send emails.
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Text body or HTML template
 * @param {boolean} [options.isHtml=false] - Whether message is HTML formatted
 * @returns {Promise<void>}
 */
export const sendEmail = async (options) => {
  // Create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: appConfig.smtp.host,
    port: appConfig.smtp.port,
    secure: appConfig.smtp.port === 465, // true for 465, false for other ports
    auth: {
      user: appConfig.smtp.user,
      pass: appConfig.smtp.pass,
    },
  });

  const mailOptions = {
    from: `"${process.env.APP_NAME || 'E-Commerce Platform'}" <${appConfig.smtp.user}>`,
    to: options.email,
    subject: options.subject,
    [options.isHtml ? 'html' : 'text']: options.message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✉️ Email sent successfully to ${options.email}`);
  } catch (error) {
    console.error(`❌ Email sending failed to ${options.email}: ${error.message}`);
    // Do not throw the error in dev/test environment to prevent app crashes when SMTP keys are unconfigured
    if (appConfig.nodeEnv === 'production') {
      throw new Error(`Email could not be sent: ${error.message}`);
    }
  }
};
