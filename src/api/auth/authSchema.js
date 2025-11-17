import { z } from "zod";

export const loginSchema = {
  body: z.object({
    identifier: z.string({ required_error: 'Email/Mobile number is required' }).min(3, 'Email/Mobile number must be at least 3 characters'),
    password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
  }),
};

export const registerSchema = {
  body: z.object({
    name: z
      .string({ required_error: "Name is required" })
      .min(2, "Name must be at least 2 characters"),
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid e-mail address"),
    mobileNo: z
      .string({ required_error: "Mobile number is required" })
      .regex(/^\d{10}$/, "Mobile number must be 10 digits"),
    photo: z.any().optional(),
    password: z
      .string()
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?])[A-Za-z\d!@#$%^&*()_\-+=<>?]{8,}$/,
        "Password must be at least 8 characters long and include at least one letter, one number, and one special character"
      ),
  }),

  query: z.object({ ref: z.string().optional() }),
};

const headerSchema = z.object({
  "x-client-type": z.enum(["web", "mobile"]),
});

export const refreshTokenSchema = {
  headers: headerSchema,
};

const logoutBodySchema = z.object({
  logoutAll: z.union([z.literal(0), z.literal(1)]).optional(),
});

export const logoutSchema = {
  body: logoutBodySchema,
};
