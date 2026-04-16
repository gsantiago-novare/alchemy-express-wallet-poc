import { z } from "zod";

const RegistrationSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(50),
    password: z.string().min(8),
    mobileNumber: z.string().regex(/^09\d{9}$/, "Invalid PH mobile number"),
  }),
});

export default RegistrationSchema;