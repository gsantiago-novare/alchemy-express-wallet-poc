import express, { Request, Response } from "express";
import { RegistrationController, LoginController } from "../../controller/auth/index.ts";
import { RegistrationSchema, LoginSchema } from "../../schema/index.ts";
import { validate } from "../../middleware/index.ts";

const AuthenticationRouter = express.Router();

AuthenticationRouter.post("/registration", validate(RegistrationSchema), RegistrationController.registerUser);
AuthenticationRouter.post("/login", validate(LoginSchema), LoginController.login);

AuthenticationRouter.use((req: Request, res: Response) => {
  console.log("404 not found", req.url);
  res.send("<h1>404</h1>");
});

export default AuthenticationRouter;
