import { z } from "zod";

/**
 * Accepts:
 * - string values from form / JSON
 * - optional nulls
 * - lat/lng numbers or null
 */
export const eventBaseSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),

  description: z.string().trim().max(5000).nullable().optional(),
  location: z.string().trim().max(500).nullable().optional(),

  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),

  imageUrl: z.string().url("Invalid imageUrl").nullable().optional(),
  imageId: z.string().max(500).nullable().optional(),

  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),

  // We accept ISO string then convert to Date in route
    eventDate: z.string().datetime("Invalid eventDate (must be ISO datetime)"),
    endDate: z.string().datetime("Invalid endDate (must be ISO datetime)").nullable().optional(),
  }).superRefine((val, ctx) => {
    // If endDate exists, must be >= eventDate
    if (val.endDate && val.eventDate) {
      const start = new Date(val.eventDate).getTime();
      const end = new Date(val.endDate).getTime();

      if (!Number.isFinite(start) || !Number.isFinite(end)) return;

      // 🔽 DITO YON
      if (end <= start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "End date must be after start date",
        });
      }
    }

  // If one of lat/lng is set, require both
  const hasLat = val.latitude !== null && val.latitude !== undefined;
  const hasLng = val.longitude !== null && val.longitude !== undefined;
  if (hasLat !== hasLng) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["latitude"],
      message: "Latitude and Longitude must be provided together",
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["longitude"],
      message: "Latitude and Longitude must be provided together",
    });
  }
});

export const eventCreateSchema = eventBaseSchema;

export const eventUpdateSchema = eventBaseSchema
  .partial()
  .extend({
    eventDate: z.string().datetime().optional(),
    endDate: z.string().datetime().nullable().optional(),
  });

