import { z } from "zod";

export const FormValidation = z.object({
  fullname: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(50, "Full name is too long")
    .trim(),

  number: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),
});