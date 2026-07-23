import { Notification } from "../models/Notifications.model.js";
import { sendRealtimeNotification } from "../realtime/sendRealtimeNotification.js";

export const createAndSendNotification = async ({
  userId,
  title,
  body,
  channel,
  type,
  meta,
}) => {
  const notification = await Notification.create({
    userId,
    title,
    body,
    channel,
    type,
    meta,
  });

  // realtime emit
  sendRealtimeNotification(userId, {
    title,
    body,
    type,
    meta,
  });

  return notification;
};
