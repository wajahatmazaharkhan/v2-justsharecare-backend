import config from "../../../config/config.js";
import { mailTransporter } from "./mailer.js";

export const sendMail = async ({ to, subject, html }) => {
  try {
    await mailTransporter.sendMail({
      from: `Just Share Care <${config.NODEMAILER_USER_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent to:", to);
  } catch (error) {
    console.error("Email error:", error.message);
    throw error;
  }
};
