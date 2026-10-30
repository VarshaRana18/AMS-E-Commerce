import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  email: z
    .string({ error: "Email is required" })
    .trim()
    .email("Invalid email address format"),
  password: z
    .string({ error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
  mobile: z
    .string()
    .regex(/^[0-9+ -]{7,15}$/, "Invalid mobile phone format")
    .optional(),
});

export const loginSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .trim()
    .email("Invalid email address format"),
  password: z
    .string({ error: "Password is required" })
    .min(1, "Password cannot be empty"),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
  mobile: z.string().regex(/^[0-9+ -]{7,15}$/, "Invalid mobile phone format").optional(),
  profileImage: z.string().url("Invalid profile image URL").optional(),
});
