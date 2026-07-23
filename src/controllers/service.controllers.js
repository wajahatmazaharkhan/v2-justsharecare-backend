import { Service } from "../models/service.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/async-handler.js";

export const addService = asyncHandler(async (req, res) => {
  const { title, description, slug } = req.body;

  if (!title || !description || !slug) {
    return res.status(400).json(new ApiError(400, "all fields are required"));
  }

  const ExistedTitle = await Service.findOne({ title });

  if (ExistedTitle) {
    return res.status(400).json(new ApiError(400, "Title already exists"));
  }

  const newService = await Service.create({
    title,
    description,
    slug,
  });

  if (!newService) {
    return res.status(402).json(new ApiError(402, "service not created"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, newService, "new service created"));
});

export const getAllService = asyncHandler(async (req, res) => {
  const allservice = await Service.find();

  if (!allservice) {
    return res.status(404).json(new ApiError(404, "no service found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, allservice, "all services fetched"));
});

export const getServiceBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  if (!slug) {
    return res.status(404).json(new ApiError(404, "Slug not found"));
  }

  const service = await Service.find({ slug: slug });

  if (!service) {
    return res.status(404).json(new ApiError(404, "slug not found"));
  }

  return res.status(200).json(new ApiResponse(200, service, "services found"));
});

export const removeService = asyncHandler(async (req, res) => {
  const { title } = req.params;

  if (!title) {
    return res.status(400).json(new ApiError(400, "slug is required"));
  }

  const service = await Service.findOne({ title });

  if (!service) {
    return res.status(404).json(new ApiError(404, "service not found"));
  }

  await Service.deleteOne({ title });

  return res.status(200).json(new ApiResponse(200, null, "service deleted"));
});

export const updateServiceByTitle = asyncHandler(async (req, res) => {
  const { oldTitle } = req.params;
  const { title, description, category } = req.body;

  if (!oldTitle || !title || !description || !category) {
    return res.status(400).json(new ApiError("missing required fields..."));
  }

  const updateData = {};
  if (title) updateData.title = title;
  if (description) updateData.description = description;
  if (category) updateData.category = category;

  const updatedService = await Service.findOneAndUpdate(
    { title: oldTitle },
    updateData,
    { new: true, runValidators: true }
  );

  if (!updatedService) {
    return res.status(404).json(new ApiError(404, "service not found"));
  }

  res.status(200).json(new ApiResponse(200, updatedService, "service updated"));
});
