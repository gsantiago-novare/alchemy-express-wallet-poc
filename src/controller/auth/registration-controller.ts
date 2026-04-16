import { Request, Response } from "express";
import { UserService } from "../../service/auth/index";

const RegistrationController = {
  registerUser: async (req: Request, res: Response) => {
    const { username, password, mobileNumber } = req.body;

    try{
      await UserService.registerUser({
        username,
        password,
        mobileNumber,
      });

      res.status(201).json({ message: "User registered successfully" });
    } catch (error: any){
      console.error("Error during registration:", error);
      res.status(500).json({ message: error.message });
    }
  },
};

export default RegistrationController;
