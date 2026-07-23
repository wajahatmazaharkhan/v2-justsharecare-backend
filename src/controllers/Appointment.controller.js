import { Appointment } from "../models/Appointments.model.js";
import { User } from "../models/User.models.js";
import { Counsellor } from "../models/Counsellor.models.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { sendAppointmentApprovedEmail } from "../services/sendAppointmentApprovedEmail.js";
import mongoose from "mongoose";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { createAndSendNotification } from "../services/Notification.service.js";

dayjs.extend(utc);
dayjs.extend(timezone);

// ........Get All Appointments.................
export const getAllAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ is_deleted: false })
    .populate("user_id", "name email")
    .populate("counsellor_id", "name");

  res.status(200).json(
    new ApiResponse(200, {
      result: appointments.length,
      data: appointments,
    })
  );
});

//............ Get Appointment details by Id..........
export const getAppointmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const appointment = await Appointment.findById(id)
    .populate("user_id", "fullname email")
    .populate("counsellor_id", "fullname email");

  if (!appointment) {
    return res.status(400).json(new ApiError(400, "No Appointment found"));
  }
  res.status(200).json(new ApiResponse(200, appointment, "ok"));
});

//.............. Create Appointment.....................
export const createAppointment = asyncHandler(async (req, res) => {
  const user_id = req.user.userId || req.user._id;

  const {
    counsellor_id,
    scheduled_at,
    duration_minutes,
    session_type,
    price,
    notes,
  } = req.body;

  // Validation
  if (!counsellor_id || !scheduled_at || !duration_minutes || !price) {
    return res
      .status(400)
      .json(new ApiError(400, "Required fields are missing"));
  }

  if (duration_minutes <= 0 || price <= 0) {
    return res.status(400).json(new ApiError(400, "Invalid duration or price"));
  }

  const counsellor = await Counsellor.findById(counsellor_id).select(
    "fullname documents.profile_picture"
  );

  if (!counsellor) {
    return res.status(404).json(new ApiError(404, "Counsellor not found"));
  }

  const user = await User.findById(user_id).select("fullname profilePic");

  if (!user) {
    return res.status(404).json(new ApiError(404, "User not found"));
  }

  console.log("Counsellor Pic:", counsellor.documents?.profile_picture);
  console.log("User Pic:", user.profilePic);

  const start = dayjs.utc(scheduled_at).toDate();

  if (start < new Date()) {
    return res
      .status(400)
      .json(new ApiError(400, "Appointment time must be in future"));
  }

  const end = new Date(start.getTime() + duration_minutes * 60000);

  const conflict = await Appointment.findOne({
    counsellor_id,
    status: "scheduled",
    scheduled_at: { $lt: end },
    $expr: {
      $gt: [
        {
          $add: ["$scheduled_at", { $multiply: ["$duration_minutes", 60000] }],
        },
        start,
      ],
    },
  });

  if (conflict) {
    return res
      .status(409)
      .json(new ApiError(409, "Counsellor already booked for this time"));
  }

  const appointment = await Appointment.create({
    user_id,
    counsellor_id,
    scheduled_at: start,
    counsellor_name: counsellor.fullname,
    user_name: user.fullname,
    counsellorpic: counsellor.documents?.profile_picture,
    userpic: user.profilePic || "https://i.ibb.co/MkrV0pJn/image.png",
    duration_minutes,
    session_type,
    price,
    notes,
    reminderSent: false,
  });

  // Notification for counsellor
  await createAndSendNotification({
    userId: counsellor_id,
    title: "New Appointment Booked",
    body: `${user.fullname} booked a ${session_type} session`,
    channel: "in-app",
    type: "booking",
    meta: {
      appointmentId: appointment._id,
    },
  });

  // Notification for user
  await createAndSendNotification({
    userId: user_id,
    title: "Appointment Confirmed",
    body: `Your ${session_type} session with ${counsellor.fullname} is scheduled`,
    channel: "in-app",
    type: "booking",
    meta: {
      appointmentId: appointment._id,
    },
  });

  res.status(201).json(new ApiResponse(201, appointment));
});

// ..........................................................

export const getUserAppointments = asyncHandler(async (req, res) => {
  const {
    scope,
    status,
    from,
    to,
    page = 1,
    limit = 10,
    sort = "asc",
  } = req.query;

  const userId = req.user.userId || req.user._id;

  const query = {
    user_id: userId,
  };

  const now = new Date();

  if (scope === "upcoming") {
    query.scheduled_at = { $gte: now };
  } else if (scope === "past") {
    query.scheduled_at = { $lt: now };
  }

  if (status) {
    query.status = status;
  }

  if (from || to) {
    query.scheduled_at = {
      ...(query.scheduled_at || {}),
      ...(from && { $gte: new Date(from) }),
      ...(to && { $lte: new Date(to) }),
    };
  }

  const skip = (page - 1) * limit;

  const appointments = await Appointment.find(query)
    .populate("counsellor_id", "name")
    .sort({ scheduled_at: sort === "desc" ? -1 : 1 })
    .skip(skip)
    .limit(Number(limit));

  if (appointments.length == 0) {
    return res.status(200).json({
      success: true,
      message: "No Appointments",
    });
  }

  res.status(200).json(
    new ApiResponse(200, {
      page: Number(page),
      limit: Number(limit),
      count: appointments.length,
      data: appointments,
    })
  );
});

export const getCounsellorAppointments = asyncHandler(async (req, res) => {
  const {
    scope,
    status,
    from,
    to,
    page = 1,
    limit = 10,
    sort = "asc",
  } = req.query;

  // Find counsellor document using logged-in user
  const counsellor = await Counsellor.findOne({
    user_id: req.user.userId || req.user.id,
  });

  if (!counsellor) {
    return res.status(404).json({ message: "Counsellor profile not found" });
  }

  //Use counsellor._id for appointment query
  const query = { counsellor_id: counsellor._id };

  const now = new Date();

  if (scope === "upcoming") {
    query.scheduled_at = { $gte: now };
  } else if (scope === "past") {
    query.scheduled_at = { $lt: now };
  }

  if (status) query.status = status;

  if (from || to) {
    query.scheduled_at = {
      ...(query.scheduled_at || {}),
      ...(from && { $gte: new Date(from) }),
      ...(to && { $lte: new Date(to) }),
    };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const appointments = await Appointment.find(query)
    .populate("user_id", "fullname email profilePic")
    .sort({ scheduled_at: sort === "desc" ? -1 : 1 })
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json(
    new ApiResponse(200, {
      page: Number(page),
      limit: Number(limit),
      count: appointments.length,
      data: appointments,
    })
  );
});

// ..........update Appointment.....................
export const updateAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent updating delete flag & timestamps manually
  const forbiddenFields = ["is_deleted", "createdAt", "updatedAt", "status"];
  forbiddenFields.forEach((field) => delete req.body[field]);

  const appointment = await Appointment.findByIdAndUpdate(
    { _id: id, is_deleted: false },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!appointment) {
    return res.status(404).json(new ApiError(404, "Appointment not found"));
  }

  res.status(200).json(
    new ApiResponse(200, {
      message: "Appointment updated sucessfully",
      data: appointment,
    })
  );
});

// update the status of appointment
export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const appointment = await Appointment.findByIdAndUpdate(
    { _id: id, is_deleted: false },
    { status: status },
    { new: true, runValidators: true }
  );

  if (!appointment) {
    return res.status(404).json({
      message: "Appointment not found or already deleted",
    });
  }

  res.status(200).json(new ApiResponse(200, appointment));
});

//................. Delete Appointment..............
export const deleteAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const appointment = await Appointment.findByIdAndUpdate(
    { _id: id, is_deleted: false },
    { is_deleted: true },
    { new: true }
  );

  if (!appointment) {
    return res
      .status(404)
      .json(new ApiError(404, "appointment not found or deleted"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, null, "appointment deletion successful (soft)"));
});

export const approveAppointmentByCounsellor = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    return res.status(400).json({ message: "Invalid appointment ID" });
  }
  console.log(req.user);
  const targetId = req.user.userId || req.user.user._id;
  // Step 1: Get counsellor profile from logged-in user
  const counsellor = await Counsellor.findOne({
    user_id: targetId,
  });

  if (!counsellor) {
    return res.status(403).json({ message: "Counsellor profile not found" });
  }

  // Step 2: Find appointment
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  // Step 3: Security — only owner counsellor can approve
  if (!appointment.counsellor_id.equals(counsellor._id)) {
    return res.status(403).json({ message: "Not authorized" });
  }

  // Step 4: Cannot approve past session
  if (appointment.scheduled_at < new Date()) {
    return res.status(400).json({ message: "Cannot approve past session" });
  }

  // Step 5: Prevent invalid state changes
  if (
    appointment.status === "cancelled" ||
    appointment.status === "completed"
  ) {
    return res.status(400).json({ message: "Cannot approve this session" });
  }

  if (appointment.counsellor_approved) {
    return res.status(400).json({ message: "Already approved" });
  }

  // Step 6: Approve booking
  appointment.counsellor_approved = true;

  await appointment.save();

  try {
    const user = await User.findById(appointment.user_id.toString());
    console.log(user);

    const counsellorUser = await Counsellor.findById(
      appointment.counsellor_id.toString()
    );

    if (user?.fullname && user?.email && counsellorUser?.fullname) {
      await sendAppointmentApprovedEmail(
        user.fullname,
        user.email,
        counsellorUser.fullname,
        appointment.scheduled_at
      );
    }
  } catch (err) {
    console.error("Email failed but approval succeeded:", err.message);
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, appointment, "Appointment approved successfully")
    );
});

export const rescheduleAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { scheduled_at } = req.body;

  if (!scheduled_at) {
    return res.status(400).json(new ApiError(400, "New date/time required"));
  }

  // 🌍 Convert same as create controller
  // const newStart = dayjs.utc(scheduled_at).toDate();
  const newStart = dayjs.tz(scheduled_at, "Asia/Kolkata").utc().toDate();

  if (newStart < new Date()) {
    return res
      .status(400)
      .json(new ApiError(400, "Cannot reschedule to past time"));
  }

  const appointment = await Appointment.findOne({
    _id: id,
    is_deleted: false,
  });

  if (!appointment) {
    return res.status(404).json(new ApiError(404, "Appointment not found"));
  }

  if (["completed", "cancelled", "no-show"].includes(appointment.status)) {
    return res
      .status(400)
      .json(new ApiError(400, "This appointment cannot be rescheduled"));
  }

  const duration = appointment.duration_minutes;
  const newEnd = new Date(newStart.getTime() + duration * 60000);

  // 🔒 Same overlap logic as create
  const conflict = await Appointment.findOne({
    counsellor_id: appointment.counsellor_id,
    status: "scheduled",
    _id: { $ne: appointment._id },
    scheduled_at: { $lt: newEnd },
    $expr: {
      $gt: [
        {
          $add: ["$scheduled_at", { $multiply: ["$duration_minutes", 60000] }],
        },
        newStart,
      ],
    },
  });

  if (conflict) {
    return res
      .status(409)
      .json(
        new ApiError(409, "Counsellor already has another session at that time")
      );
  }

  appointment.scheduled_at = newStart;
  appointment.reminderSent = false; // allow reminder to be re-sent

  await appointment.save();

  res.status(200).json(
    new ApiResponse(200, {
      message: "Appointment rescheduled successfully",
      data: appointment,
    })
  );
});
