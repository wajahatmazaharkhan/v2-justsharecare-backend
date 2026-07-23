import nodemailer from "nodemailer";
import config from "../../../config/config.js";

export const mailTransporter = nodemailer.createTransport({
  secure: true,
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: config.NODEMAILER_USER_EMAIL,
    pass: config.NODEMAILER_USER_PASSWORD,
  },
});
