import type IUser from "../../interface/auth/IUser.ts";
import { UserRepository } from "../../repository/auth/index.ts";
import { WalletRepository } from "../../repository/wallet/index.ts";
import ClientError from "../../errors/ServerError.ts";
import argon2 from "argon2";

const UserService = {
  registerUser: async (userData: IUser) => {
    const requestData = userData;

    userData.password = await argon2.hash(userData.password);
    userData.mobileNumber = userData.mobileNumber.trim();

    const existingUserResult = userData.userId
      ? await UserRepository.findByUserId(userData.userId)
      : await UserRepository.findByMobileNumber(userData.mobileNumber);

    if (existingUserResult)
      throw new ClientError(
        "User with this mobile number already exists.",
        400,
        requestData as any,
      );

    const newUser = await UserRepository.registerUser(userData);

    if (!newUser)
      throw new ClientError(
        "User registration failed. User already exists.",
        500,
        userData as any,
      );

    await WalletRepository.registerWallet(newUser.id);
  },
  login: async (userData: IUser) => {
    const requestData = userData;

    const existingUserResult = userData.userId
      ? await UserRepository.findByUserId(userData.userId)
      : await UserRepository.findByMobileNumber(userData.mobileNumber);

    if (!existingUserResult)
      throw new ClientError(
        "User with this mobile number/ID does not exist.",
        404,
        requestData as any,
      );

    console.log(`existingUserResult.password: ${existingUserResult.password}`);
    console.log(`userData.password: ${userData.password}`);

    const passwordMatch = await argon2.verify(
      existingUserResult.password,
      userData.password,
    );

    if (!passwordMatch)
      throw new ClientError("Invalid password.", 401, requestData as any);

    const walletDetails = await WalletRepository.findWalletById(
      existingUserResult.id,
    );

    if (!walletDetails)
      throw new ClientError(
        "Wallet not found for this user.",
        404,
        requestData as any,
      );

    delete existingUserResult.password;

    return { ...existingUserResult, wallet: walletDetails };
  },
};

export default UserService;
