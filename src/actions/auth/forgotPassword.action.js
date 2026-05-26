import crypto from 'crypto';
import User from '../../models/user.model.js';
import { ApiError } from '../../utils/apiError.js';
import { sendEmail } from '../../utils/email.util.js';
import appConfig from '../../config/app.config.js';

/**
 * Action to handle forgot password requests.
 * Generates a crypto token, saves it, and sends reset email.
 * @param {string} email - User email address
 */
export const forgotPasswordAction = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'No account found with this email address.');
  }

  // 1. Generate random crypto token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // 2. Hash and set on user schema with 1 hour expiry
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  // 3. Email message
  const resetUrl = `${appConfig.frontendUrl}/reset-password/${resetToken}`;
  const message = `
    <h1>Password Reset Request</h1>
    <p>You are receiving this email because you (or someone else) requested a password reset for your account.</p>
    <p>Please click on the following link or copy and paste it into your browser to reset your password:</p>
    <a href="${resetUrl}" target="_blank">${resetUrl}</a>
    <p>This link is valid for 1 hour. If you did not request this, please ignore this email.</p>
  `;

  // 4. Send email
  await sendEmail({
    email: user.email,
    subject: 'Password Reset Request',
    message,
    isHtml: true,
  });
};

/**
 * Action to handle reset password using the token.
 * @param {string} token - The reset token received by email
 * @param {string} newPassword - The new password to set
 */
export const resetPasswordAction = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired password reset token.');
  }

  // Set new password (bcrypt hook handles hashing)
  user.password = newPassword;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;
  await user.save();
};
