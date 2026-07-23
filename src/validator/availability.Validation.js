import { z } from 'zod'

export const availabilitySchema = z.object({
  day: z.string(),
  startTime: z.string(),
  endTime: z.string()
})
