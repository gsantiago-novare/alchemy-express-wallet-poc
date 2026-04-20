import type IUser from "../../interface/auth/IUser.ts";
import { WalletRepository } from "../../repository/wallet/index.ts";
import { UserRepository } from "../../repository/auth/index.ts";
import ClientError from "../../errors/ServerError.ts";
import type { WalletTransactionInterface } from "../../interface/wallet/IWallet.ts";

const WalletService = {
  registerUser: async (userData: IUser) => {
    const existingWallet = await WalletRepository.findWalletById(
      userData.userId || 0,
    );
    let existingUserResult;

    if (userData.userId) {
      existingUserResult = await UserRepository.findByUserId(userData.userId);
    } else {
      existingUserResult = await UserRepository.findByMobileNumber(
        userData.mobileNumber,
      );
    }

    if (!existingUserResult)
      throw new ClientError("User not found.", 404, userData as any);

    if (existingWallet)
      throw new ClientError(
        "Wallet already exists for this user.",
        400,
        userData as any,
      );

    if (!userData.userId || !userData.mobileNumber)
      throw new ClientError(
        "User ID and mobile number are required to register a wallet.",
        400,
        userData as any,
      );

    const newUser = await WalletRepository.registerWallet(userData.userId);

    if (!newUser)
      throw new ClientError("User registration failed", 500, userData as any);
  },
  transferMoney: async (walletTransaction: WalletTransactionInterface) => {
    try {
      return await WalletRepository.executeTransfer(walletTransaction);
    } catch (error: any) {
      throw new ClientError(
        error.message,
        error.statusCode,
        walletTransaction as any,
      );
    }
  },
};

export default WalletService;
