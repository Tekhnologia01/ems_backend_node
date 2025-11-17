import { z } from "zod";

// Reusable mobile number schema
const emailSchema = z.string({ required_error: "Email is required" }).email("Invalid email");
const mobileNumberSchema = z
  .string({ required_error: "Mobile number is required" })
  .regex(/^[0-9]{10}$/, "Mobile number must be 10 digits");

export const userSchema = {
  updateUser: z.object({
    body: z.object({
      userName: z
        .string({ required_error: "Name is required" })
        .min(1, "Name is required")
        .max(250, "Name is too long")
        .optional(),
      userMobileNo: mobileNumberSchema.optional(),
    }),
  }),

  updateUserPassword: z.object({
    body: z
      .object({
        oldPassword: z
          .string({ required_error: "Old password is required" })
          .min(6, "Old password must be at least 6 characters"),
        newPassword: z
          .string({ required_error: "New password is required" })
          .min(6, "New password must be at least 6 characters")
          .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
            "New password must contain at least one uppercase letter, one lowercase letter, and one number"
          ),
        confirmPassword: z
          .string({ required_error: "Confirm password is required" })
          .min(6, "Confirm password must be at least 6 characters"),
      })
      .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      }),
  }),

  sendOtp: z.object({
    body: z.object({
      userEmail: emailSchema.optional(),
      userMobileNo: mobileNumberSchema.optional(),
    }),
  }),

  mobileNumber: z.object({
    query: z.object({
      mobile: mobileNumberSchema,
    }),
  }),
};
