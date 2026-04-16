interface WalletInterface {
  id: string;
  userId: string;
  balance: number; 
  currency: "PHP" | "USD";
  createdAt?: Date;
  updatedAt?: Date;
}

interface WalletTransactionInterface {
  senderWalletId: number;
  receiverWalletId: number;
  amount: number;
  referenceNo?: string;
  status?: string;
}

export {
  WalletInterface,
  WalletTransactionInterface,
}
