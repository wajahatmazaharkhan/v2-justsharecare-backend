import Assessment from "../models/assessment.model.js";
import { User } from "../models/User.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { assessmentSchema } from "../validator/assessment.schema.js";

export const createAssessment = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res
        .status(401)
        .json(new ApiError(401, "User authentication is required"));
    }
    const payload = req.body.data ?? req.body;
    const validationResult = assessmentSchema.safeParse(payload);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      });
    }

    const assessmentData = validationResult.data;

    const assessment = await Assessment.create(assessmentData);
    const userFound = await User.findById(userId);
    if (!userFound) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }
    userFound.bookingAssessment.push({
      assessmentId: assessment._id,
      takenAt: new Date(),
    });
    await userFound.save();
    return res
      .status(201)
      .json(new ApiResponse(201, assessment, "assessment recorded"));
  } catch (error) {
    console.error("Create Assessment Error:", error);
    return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
};
