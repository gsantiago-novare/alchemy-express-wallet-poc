export enum TransactionStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}

export default interface TransactionInterface {
  id: string;
  senderWalletId: string;
  receiverWalletId: string;
  amount: number;
  status: TransactionStatus;
  referenceNo: string;
  createdAt?: Date;
}
