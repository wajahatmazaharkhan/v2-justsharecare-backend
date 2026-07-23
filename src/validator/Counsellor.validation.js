import { z } from "zod";

export const CounsellorValidation = z.object({
  // Step 1: Personal Information
  fullname: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name is too long")
    .trim(),

  email: z.string().email("Invalid email address"),

  Password: z.string().min(8, "Password must be at least 8 characters"),

  contact_number: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),

  dob: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date of birth",
  }),

  gender: z.enum(["Male", "Female", "Prefer Not To Say"], {
    errorMap: () => ({ message: "Invalid gender value" }),
  }),

  languages: z.string().min(1, "Preferred language is required"),

  timezone: z.string().min(2, "Timezone is required"),

  // Step 2: Professional Details
  counselling_type: z.string().min(1, "Counselling type is required"),

  specialties: z.string().min(1, "Specialty is required"),

  bio: z.string().min(10, "Bio must be at least 10 characters"),

  years_experience: z.coerce
    .number()
    .min(0, "Years of experience must be 0 or greater"),

  slug: z.enum(
    ["mental-health", "wellness-therapy", "sexual-health", "womens-health"],
    {
      errorMap: () => ({ message: "Invalid service category" }),
    }
  ),

  // Step 3: Availability & Pricing
  hourly_rate: z.coerce.number().positive("Hourly rate must be greater than 0"),

  displayLabel: z.string().optional(),

  availabilityType: z.enum(["fixed", "recurring", "always"], {
    errorMap: () => ({ message: "Invalid availability type" }),
  }),

  weeklyAvailability: z
    .string()
    .transform((str, ctx) => {
      try {
        return JSON.parse(str);
      } catch (e) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid JSON format for weeklyAvailability",
        });
        return z.NEVER;
      }
    })
    .pipe(
      z
        .array(
          z.object({
            dayOfWeek: z.coerce.number().min(0).max(6),
            startTime: z
              .string()
              .regex(
                /^([01]\d|2[0-3]):([0-5]\d)$/,
                "Invalid time format (HH:mm)"
              ),
            endTime: z
              .string()
              .regex(
                /^([01]\d|2[0-3]):([0-5]\d)$/,
                "Invalid time format (HH:mm)"
              ),
            isAvailable: z.boolean().default(true),
          })
        )
        .min(1, "At least one day of availability is required")
    ),

  // Step 4: Session Preferences
  session_type: z.enum(["Video Session", "Voice Session", "Chat Session"], {
    errorMap: () => ({ message: "Invalid session type" }),
  }),
});

export const CounsellorLoginValidation = z.object({
  email: z.string().email("Invalid email address"),
  Password: z.string().min(1, "Password is required"),
});
