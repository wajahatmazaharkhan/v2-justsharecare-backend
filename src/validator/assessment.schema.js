import { z } from "zod";

export const assessmentSchema = z.object({
  feeling: z
    .number({
      required_error: "Feeling is required",
      invalid_type_error: "Feeling must be a number",
    })
    .int()
    .min(0)
    .max(4),

  duration: z.enum(["Just Started", "Few weeks", "Few months", "Long time"]),

  spokenBefore: z.enum(["Yes", "No", "Prefer not to say"]),

  supportType: z.enum(["chat", "voice", "video"]),

  matchingPref: z.enum(["auto", "manual"]),
});
