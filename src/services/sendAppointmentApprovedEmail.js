import { sendMail } from "./email/sendMail.js";
import { appointmentApprovedTemplate } from "./template/appointmentApprovedTemplate.js";

export const sendAppointmentApprovedEmail = async (
  userName,
  userEmail,
  counsellorName,
  scheduledAt
) => {
  const date = new Date(scheduledAt).toLocaleDateString();
  const time = new Date(scheduledAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  await sendMail({
    to: userEmail,
    subject: "JustShare Care | Appointment Update",
    html: appointmentApprovedTemplate(
      userName,
      userEmail,
      counsellorName,
      date,
      time
    ),
  });
};
