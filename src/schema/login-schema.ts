import { z } from "zod";

const LoginSchema = z.object({
  body: z.object({
    username: z.string().min(3).optional(),
    mobileNumber: z
        .string()
        .regex(/^09\d{9}$/, "Invalid PH mobile number.")
        .optional(),
        password: z.string().min(8),
    })
    .refine((data) => data.username || data.mobileNumber, {
        message: "Either username or mobileNumber must be present.",
    }),
});

export default LoginSchema;
