import { PageAnalytics } from "../models/PageAnalytics.model.js";
import { User } from "../models/User.models.js";
import { Appointment } from "../models/Appointments.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const analyticsDashboard = asyncHandler(async (req, res) => {
  /* ------------------ DATE RANGES ------------------ */
  const now = new Date();

  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - 7);

  const startOfLastWeek = new Date(now);
  startOfLastWeek.setDate(now.getDate() - 14);

  /* ------------------ PAGE ANALYTICS ------------------ */
  const pages = await PageAnalytics.aggregate([
    {
      $group: {
        _id: "$page",
        views: { $sum: 1 },
      },
    },
    { $sort: { views: -1 } },
  ]);

  const daily = await PageAnalytics.aggregate([
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        visits: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const totalVisits = await PageAnalytics.countDocuments();

  /* ------------------ USERS ------------------ */
  const totalUsers = await User.countDocuments();

  const usersThisWeek = await User.countDocuments({
    createdAt: { $gte: startOfThisWeek },
  });

  const usersLastWeek = await User.countDocuments({
    createdAt: {
      $gte: startOfLastWeek,
      $lt: startOfThisWeek,
    },
  });

  const userGrowthPercentage =
    usersLastWeek === 0
      ? usersThisWeek > 0
        ? 100
        : 0
      : ((usersThisWeek - usersLastWeek) / usersLastWeek) * 100;

  /* ------------------ APPOINTMENTS (ORDERS) ------------------ */
  const totalAppointments = await Appointment.countDocuments();

  const appointmentsThisWeek = await Appointment.countDocuments({
    created_at: { $gte: startOfThisWeek },
  });

  const appointmentsLastWeek = await Appointment.countDocuments({
    created_at: {
      $gte: startOfLastWeek,
      $lt: startOfThisWeek,
    },
  });

  const appointmentGrowthPercentage =
    appointmentsLastWeek === 0
      ? appointmentsThisWeek > 0
        ? 100
        : 0
      : ((appointmentsThisWeek - appointmentsLastWeek) / appointmentsLastWeek) *
        100;

  /* ------------------ RESPONSE ------------------ */
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        analytics: {
          traffic: {
            totalVisits,
            pages,
            daily,
          },
          users: {
            totalUsers,
            usersThisWeek,
            usersLastWeek,
            growthPercentage: Number(userGrowthPercentage.toFixed(2)),
          },
          appointments: {
            totalAppointments,
            appointmentsThisWeek,
            appointmentsLastWeek,
            growthPercentage: Number(appointmentGrowthPercentage.toFixed(2)),
          },
        },
      },
      "ok"
    )
  );
});
