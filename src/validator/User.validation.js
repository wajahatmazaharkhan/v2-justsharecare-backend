import { z } from "zod";

export const SignupValidation = z.object({
  fullname: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(50, "Full name is too long")
    .trim(),

  email: z.email(),

  phone_number: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),

  Password: z.string().min(6, "Password must be at least 6 characters"),

  dob: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date of birth",
  }),

  gender: z.enum(["male", "female", "other"], {
    errorMap: () => ({ message: "Invalid gender value" }),
  }),

  timezone: z.string().min(2, "Timezone is required"),

  preferred_language: z.string().min(2, "Preferred language is required"),
});

export const LoginValidation = z.object({
  email: z.email(),
  Password: z.string(),
});

export const AdminLoginValidation = z.object({
  email: z.string(),
  Password: z.string(),
});

export const UpdateUserStatusValidation = z.object({
  status: z.enum(["active", "banned"]),
});

export const UpdateUserRoleValidation = z.object({
  role: z.enum(["user", "counsellor", "admin"]),
});
