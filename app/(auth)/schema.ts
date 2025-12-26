import { z } from "zod";

// Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

// Signup Step 1 Schema
export const signupStep1Schema = z.object({
  role: z.enum(["citizen", "authority"] as const, { message: "Please select a role" }),
  fullName: z
    .string()
    .min(1, "Full name is required")
    .min(3, "Full name must be at least 3 characters")
    .max(50, "Full name must not exceed 50 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
});

// Signup Step 2 Schema
export const signupStep2Schema = z.object({
  wardNumber: z
    .string()
    .min(1, "Ward number is required"),
  municipality: z
    .string()
    .min(1, "Municipality/City is required"),
});

// Signup Step 3 Schema
export const signupStep3Schema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and numbers"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Complete Signup Schema (all steps combined)
export const signupSchema = signupStep1Schema
  .merge(signupStep2Schema)
  .merge(signupStep3Schema);

// Type inference
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupStep1Data = z.infer<typeof signupStep1Schema>;
export type SignupStep2Data = z.infer<typeof signupStep2Schema>;
export type SignupStep3Data = z.infer<typeof signupStep3Schema>;
export type SignupFormData = z.infer<typeof signupSchema>;