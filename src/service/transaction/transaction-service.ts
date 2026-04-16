import { ServerError } from "../../errors";
import { TransactionRepository } from "../../repository/transaction";

const TransactionService = {
    insertTransaction: async (senderWalletId: number, receiverWalletId: number,
     amount: number, referenceNo: string, status: string, dbConn: any) => {
        try {
        await TransactionRepository.insertTransaction(
            senderWalletId,
            receiverWalletId,
            amount,
            referenceNo,
            status,
            dbConn
        );

        } catch (error: any) {
            console.error("Error in TransactionService.insertTransaction:", error);
            throw new ServerError("Failed to insert transaction: " + error.message, 500);   
        }
    },
};

export default TransactionService;