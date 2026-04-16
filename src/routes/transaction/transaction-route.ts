import express, { Request, Response } from "express";
import { TransactionController } from "../../controller/transaction/index";
import { TransferSchema } from "../../schema/index.ts";
import { validate } from "../../middleware/index.ts";

const TransactionRouter = express.Router();

TransactionRouter.post("/transfer", validate(TransferSchema), TransactionController.transferMoney);

TransactionRouter.use((req: Request, res: Response) => {
  console.log("404 not found", req.url);
  res.send("<h1>404</h1>");
});

export default TransactionRouter;   