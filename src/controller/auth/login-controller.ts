import { Request, Response } from "express";
import { UserService } from "../../service/auth/index";

const LoginController = {
  login: async (req: Request, res: Response) => {
    const { username, password, mobileNumber } = req.body;

    try{
      const loginDetails = await UserService.login({
        username,
        password,
        mobileNumber,
      });

      res.status(200).json({ message: "User logged in successfully", data: loginDetails });
    } catch (error: any){
      console.error("Error during login:", error);
      res.status(500).json({ message: error.message });
    }
  },
};

export default LoginController;