import { ApiError } from "./ApiError.js";

import { ZodError } from "zod";

export function asyncHandler(fn) {
  return async function (req, res, next) {
    try {
      const result = await fn(req, res, next);
      return result;
    } catch (error) {
      console.log(error);
      if (error instanceof ZodError) {
        return res
          .status(400)
          .json(new ApiError(400, "Validation Error", error.errors));
      }

      console.log("//========= [ERROR] ========//\n", error);
      return res
        .status(500)
        .json(new ApiError(500, "Internal Server Error", error, null));
    }
  };
}
