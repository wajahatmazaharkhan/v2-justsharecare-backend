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

// Minimal Clean UI (Matching Screenshot Style)
const welcomeEmailTemplate = (name, email) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Welcome to Just Share Care</title>
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
                Just Share Care
              </div>
              <div style="font-size:13px; color:#777777; margin-top:4px;">
                Your Safe Space for Healthy Well-Being
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
                Welcome to Just Share Care
              </h1>

              <p style="font-size:15px; line-height:1.7; margin:14px 0;">
                Hello ${name},
              </p>

              <p style="font-size:15px; line-height:1.7; margin:14px 0;">
                We’re really glad you’re here.
                <strong>Just Share Care</strong> is a trusted space where you can easily
                book appointments with qualified counsellors and receive support
                in a calm, respectful, and confidential environment.
              </p>

              <div style="background-color:#f7f7f7; padding:18px; margin:28px 0; font-size:15px; line-height:1.6;">
                🗓️ You can now browse counsellors, book appointments at your
                convenience, and manage your sessions — all from one secure place.
              </div>

              <p style="font-size:15px; line-height:1.7; margin:14px 0;">
                All appointments are handled with complete confidentiality,
                and you are always in control of your schedule and preferences.
              </p>

              <!-- CTA -->
              <div style="margin:32px 0;">
                <a href="#"
                   style="display:inline-block;
                          padding:12px 26px;
                          font-size:14px;
                          font-weight:bold;
                          color:#ffffff;
                          background-color:#333333;
                          text-decoration:none;">
                  Get Started
                </a>
              </div>

              <p style="font-size:15px; line-height:1.7; margin:14px 0;">
                If you need help at any point, feel free to reach out.
                Your well-being matters to us.
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
              <p style="margin:6px 0;">© 2026 Just Share Care. All rights reserved.</p>
            </td>
          </tr>

        </table>
        <!-- End Container -->

      </td>
    </tr>
  </table>

</body>
</html>`;

export const sendWelcomeEmail = async (name, to) => {
  try {
    const subject = "JustShare Care | Welcome!";

    const htmlContent = welcomeEmailTemplate(name, to);

    await transporter.sendMail({
      from: `Just Share Care <${config.NODEMAILER_USER_EMAIL}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log("Welcome email sent to:", to);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error;
  }
};
