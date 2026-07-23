import nodemailer from "nodemailer";
import config from "../../config/config.js";

const transporter = nodemailer.createTransport({
  secure: true,
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: config.NODEMAILER_USER_EMAIL,
    pass: config.NODEMAILER_USER_PASSWORD,
  },
});

// 🔐 JustShare Care - Forgot Password OTP Email Template (Minimal Theme)
const forgotPasswordOtpTemplate = (name, email, otp) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>JustShare Care - Reset Password</title>
</head>

<body style="margin:0; padding:0; background-color:#f2f2f2; font-family: Arial, Helvetica, sans-serif; color:#333333;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2f2f2; padding:40px 0;">
    <tr>
      <td align="center">

        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; padding:40px 48px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:30px;">
              <div style="font-size:22px; font-weight:700; color:#222222;">
                JustShare Care
              </div>
              <div style="font-size:13px; color:#777777; margin-top:4px;">
                Your Safe Space for Mental Well-Being
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="border-top:1px solid #e5e5e5; padding-top:30px;"></td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding-top:10px;">

              <h1 style="font-size:20px; font-weight:700; margin-bottom:18px; color:#222222;">
                Reset Your Password
              </h1>

              <p style="font-size:15px; line-height:1.7; margin:14px 0;">
                Hello ${name},
              </p>

              <p style="font-size:15px; line-height:1.7; margin:14px 0;">
                We received a request to reset your <strong>JustShare Care</strong> account password.
                Please use the verification code below to continue:
              </p>

              <!-- OTP Box -->
              <div style="text-align:center; margin:32px 0;">
                <div style="
                  display:inline-block;
                  font-size:32px;
                  letter-spacing:10px;
                  font-weight:bold;
                  color:#222222;
                  background-color:#f7f7f7;
                  padding:16px 28px;
                  border:1px solid #dddddd;
                ">
                  ${otp}
                </div>
              </div>

              <!-- Expiry -->
              <p style="text-align:center; font-size:14px; margin-top:10px;">
                ⏳ This code will expire in <strong>5 minutes</strong>.
              </p>

              <!-- Notice Box -->
              <div style="
                background-color:#f7f7f7;
                padding:16px;
                margin:28px 0;
                font-size:14px;
                line-height:1.6;
              ">
                <strong>Important:</strong> If you did not request a password reset,
                please ignore this email. Your account is safe.
              </div>

              <p style="font-size:15px; line-height:1.7; margin:14px 0;">
                Taking care of your security is important to us.
                We're here whenever you need support.
              </p>

            </td>
          </tr>

          <!-- Footer Divider -->
          <tr>
            <td style="border-top:1px solid #e5e5e5; padding-top:30px;"></td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="font-size:12px; color:#888888; padding-top:20px; line-height:1.6;">
              <p style="margin:6px 0;">This email was sent to ${email}</p>
              <p style="margin:6px 0;">Need help? Contact us at <strong>support@safeharbor.com</strong></p>
              <p style="margin:6px 0;">© 2026 JustShare Care. All rights reserved.</p>
            </td>
          </tr>

        </table>
        <!-- End Container -->

      </td>
    </tr>
  </table>

</body>
</html>`;

// 🔐 Send OTP for Forgot Password
export const SendOtpForPassword = async (name, to, otp) => {
  try {
    const subject = "JustShare Care | Password Reset Code";

    const htmlContent = forgotPasswordOtpTemplate(name, to, otp);

    await transporter.sendMail({
      from: `JustShare Care <${config.NODEMAILER_USER_EMAIL}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log("Password reset OTP sent to:", to);
  } catch (error) {
    console.error("Error sending password reset OTP:", error);
    throw error;
  }
};
