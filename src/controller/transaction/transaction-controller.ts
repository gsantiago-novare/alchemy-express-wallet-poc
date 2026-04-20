import { Request, Response } from "express";
import { WalletService } from "../../service/wallet/index";

const TransactionController = {
  transferMoney: async (req: Request, res: Response) => {
    const { senderWalletId, receiverWalletId, amount } = req.body;

    try {
      const result = await WalletService.transferMoney({
        senderWalletId,
        receiverWalletId,
        amount,
      });

      res.status(201).json({ message: "Transfer completed successfully", data: result });
    } catch (error: any) {
      console.error("Error during money transfer:", error);
      res.status(error.statusCode).json({ message: error.message });
    }
  },
};

export default TransactionController;
