import { DatabaseConnection } from "../../utils/db-connection.ts";
import { ClientError, ServerError } from "../../errors/index.ts";
import { TransactionService } from "../../service/transaction/index.ts";
import { v4 as uuidv4 } from "uuid";
import { TransactionStatus } from "../../interface/transaction/ITransaction.ts";
import type { WalletTransactionInterface as IWalletTransactionInterface } from "../../interface/wallet/IWallet.ts";

const WalletRepository = {
  registerWallet: async (userId: number) => {
    let dbConn;

    try {
      dbConn = await DatabaseConnection.connect();

      const insertQuery =
        "INSERT INTO wallets (user_id, balance, currency) VALUES ($1, $2, $3) RETURNING *";
      const result = await dbConn.query(insertQuery, [userId, 1000, "PHP"]);

      return result.rows[0];
    } catch (error) {
      console.error("Error inserting wallet:", error);
      throw new ServerError("Failed to insert wallet");
    } finally {
      dbConn?.release();
    }
  },
  findWalletById: async (userId: number) => {
    let dbConn;

    try {
      dbConn = await DatabaseConnection.connect();

      const selectQuery = "SELECT * FROM wallets WHERE user_id = $1";
      const result = await dbConn.query(selectQuery, [userId]);

      return result.rows[0];
    } catch (error) {
      console.error("Error finding wallet:", error);
      throw new ServerError("Failed to find wallet.");
    } finally {
      dbConn?.release();
    }
  },
  executeTransfer: async (transaction: IWalletTransactionInterface) => {
    const { senderWalletId, receiverWalletId, amount } = transaction;

    const dbConn = await DatabaseConnection.connect();
    try {
      console.log("beginning transfer");
      await dbConn.query("BEGIN");

      console.log("setting up update constraints");

      const walletsCheck = await dbConn.query(
        "SELECT id FROM wallets WHERE id IN ($1, $2)",
        [senderWalletId, receiverWalletId],
      );

      if (walletsCheck.rows.length !== 2) {
        throw new ClientError("Sender or receiver wallet not found.", 404);
      }

      const [firstId, secondId] = [senderWalletId, receiverWalletId].sort(
        (a, b) => a - b,
      );

      await dbConn.query(
        "SELECT id FROM wallets WHERE id IN ($1, $2) FOR UPDATE",
        [firstId, secondId],
      );

      const senderCheck = await dbConn.query(
        "SELECT balance FROM wallets WHERE id = $1",
        [senderWalletId],
      );

      if (!senderCheck.rows[0]) {
        throw new ClientError("Sender wallet not found.", 404);
      }

      console.log("SENDER CHECK VALUES: ", senderCheck);

      const senderBalance = Number.parseFloat(senderCheck.rows[0].balance);
      if (senderBalance < amount) {
        throw new ClientError("Insufficient funds.", 422);
      }

      const senderResult = await dbConn.query(
        "UPDATE wallets SET balance = balance - $1 WHERE id = $2 RETURNING *",
        [amount, senderWalletId],
      );

      const receiverResult = await dbConn.query(
        "UPDATE wallets SET balance = balance + $1 WHERE id = $2 RETURNING *",
        [amount, receiverWalletId],
      );

      const referenceNo = uuidv4();

      await TransactionService.insertTransaction(
        senderWalletId,
        receiverWalletId,
        amount,
        referenceNo,
        TransactionStatus.SUCCESS,
        dbConn,
      );

      await dbConn.query("COMMIT");
      return {
        senderResult: senderResult.rows[0],
        receiverResult: receiverResult.rows[0],
      };
    } catch (error: any) {
      await dbConn.query("ROLLBACK");
      console.error("Error executing transfer:", error);
      if (error instanceof ClientError) {
        throw error;
      }
      throw new ServerError("Transaction error: " + error.message, 500);
    } finally {
      dbConn?.release();
    }
  },
};

export default WalletRepository;
