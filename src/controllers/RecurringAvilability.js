
import { Counsellor } from "../models/Counsellor.models.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const addAvailability = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  console.log(userId)
  const { dayOfWeek, startTime, endTime, isAvailable } = req.body;

  const counsellor = await Counsellor.findOne({ user_id: userId });

  if (!counsellor) {
    throw new ApiError(404, "Counsellor not found");
  }

  if (startTime >= endTime) {
    throw new ApiError(400, "endTime must be after startTime");
  }

  // Prevent duplicate
  const exists = counsellor.weeklyAvailability.some(
    (slot) =>
      slot.dayOfWeek === dayOfWeek &&
      slot.startTime === startTime &&
      slot.endTime === endTime
  );

  if (exists) {
    throw new ApiError(400, "Slot already exists");
  }

  counsellor.weeklyAvailability.push({
    dayOfWeek,
    startTime,
    endTime,
    isAvailable: isAvailable ?? true,
  });

  await counsellor.save();

  return res.status(201).json(
    new ApiResponse(201, counsellor.weeklyAvailability, "Slot added")
  );
});


export const getAvailability = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  console.log(userId);

  const counsellor = await Counsellor.findOne({ user_id: userId })
    .select("weeklyAvailability");

  if (!counsellor) {
    throw new ApiError(404, "Counsellor not found");
  }

  return res.status(200).json(
    new ApiResponse(200, counsellor.weeklyAvailability)
  );
});


export const updateAvailability = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const {
    dayOfWeek,
    startTime,
    endTime,
    newStartTime,
    newEndTime,
    isAvailable,
  } = req.body;

  const counsellor = await Counsellor.findOne({ user_id: userId });

  if (!counsellor) {
    throw new ApiError(404, "Counsellor not found");
  }

  const slot = counsellor.weeklyAvailability.find(
    (s) =>
      s.dayOfWeek === dayOfWeek &&
      s.startTime === startTime &&
      s.endTime === endTime
  );

  if (!slot) {
    throw new ApiError(404, "Slot not found");
  }

  if (newStartTime) slot.startTime = newStartTime;
  if (newEndTime) slot.endTime = newEndTime;
  if (isAvailable !== undefined) slot.isAvailable = isAvailable;

  await counsellor.save();

  res.status(200).json({
    success: true,
    data: counsellor.weeklyAvailability,
  });
});


export const deleteAvailability = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { dayOfWeek, startTime, endTime } = req.body;

  const counsellor = await Counsellor.findOne({ user_id: userId });

  if (!counsellor) {
    throw new ApiError(404, "Counsellor not found");
  }

  counsellor.weeklyAvailability =
    counsellor.weeklyAvailability.filter(
      (slot) =>
        !(
          slot.dayOfWeek === dayOfWeek &&
          slot.startTime === startTime &&
          slot.endTime === endTime
        )
    );

  await counsellor.save();

  res.status(200).json({
    success: true,
    message: "Slot deleted",
  });
});
