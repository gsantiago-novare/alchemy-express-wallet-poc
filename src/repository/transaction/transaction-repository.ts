import { ServerError } from "../../errors/index.ts";

const TransactionRepository = {
    insertTransaction: async (senderWalletId: number, receiverWalletId: number,
        amount: number, referenceNo: string, status: string, dbConn: any) => {

        try {
            const insertQuery = "INSERT INTO transactions( sender_wallet_id, receiver_wallet_id, amount, reference_no, status) VALUES ($1, $2, $3, $4, $5) RETURNING *";
            const result = await dbConn.query(insertQuery, [
              senderWalletId,
              receiverWalletId,
              amount,
              referenceNo,
              status,
            ]);

            return result.rows[0];
        } catch (error) {
            console.error("Error inserting transaction:", error);
            throw new ServerError("Failed to insert transaction");
        }
    },
};

export default TransactionRepository;