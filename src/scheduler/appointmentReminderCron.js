// ===============================================================
// ⏰ Appointment Reminder Cron Job
// ===============================================================
import cron from "node-cron";
import { Appointment } from "../models/Appointments.model.js";
import { Notification } from "../models/Notifications.model.js";
import { sendRealtimeNotification } from "../realtime/sendRealtimeNotification.js";
import { User } from "../models/User.models.js";
import { Counsellor } from "../models/Counsellor.models.js";

export const startAppointmentReminderCron = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const reminderTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes later

      // 2-minute window to avoid missing reminders
      const windowStart = new Date(reminderTime.getTime() - 1 * 60 * 1000);
      const windowEnd = new Date(reminderTime.getTime() + 1 * 60 * 1000);

      // Find appointments and populate user & counsellor names
      const appointments = await Appointment.find({
        scheduled_at: { $gte: windowStart, $lt: windowEnd },
        status: "scheduled",
        reminderSent: false,
      })
        .populate("user_id", "fullname")
        .populate("counsellor_id", "fullname");

      for (const appt of appointments) {
        const userName = appt.user_id.fullname;
        const counsellorName = appt.counsellor_id.fullname;

        // 1️⃣ Notification for user
        const userMessage = `Hi ${userName}, your appointment with ${counsellorName} starts at ${appt.scheduled_at.toLocaleString()}`;
        await Notification.create({
          userId: appt.user_id._id,
          title: "Appointment Reminder",
          body: userMessage,
          type: "reminder",
          channel: "in-app",
          meta: { appointmentId: appt._id },
        });
        sendRealtimeNotification(appt.user_id._id.toString(), {
          title: "Appointment Reminder",
          body: userMessage,
          type: "reminder",
          meta: { appointmentId: appt._id },
        });

        // 2️⃣ Notification for counsellor
        const counsellorMessage = `Hi ${counsellorName}, you have an appointment with ${userName} at ${appt.scheduled_at.toLocaleString()}`;
        await Notification.create({
          userId: appt.counsellor_id._id,
          title: "Upcoming Appointment",
          body: counsellorMessage,
          type: "reminder",
          channel: "in-app",
          meta: { appointmentId: appt._id },
        });
        sendRealtimeNotification(appt.counsellor_id._id.toString(), {
          title: "Upcoming Appointment",
          body: counsellorMessage,
          type: "reminder",
          meta: { appointmentId: appt._id },
        });

        // 3️⃣ Mark reminder sent
        appt.reminderSent = true;
        await appt.save();
      }

      if (appointments.length) {
        console.log(
          `⏰ Sent ${appointments.length} personalized appointment reminders`
        );
      }
    } catch (err) {
      console.error("❌ Appointment Reminder Cron Error:", err);
    }
  });
};
