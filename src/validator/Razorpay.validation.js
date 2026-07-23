import { z } from "zod";

export const OrderValidation = z.object({
  currency: z.string().min(3, "Currency contains 3 letters eg. INR").trim(),
  amount: z.number(),
});
