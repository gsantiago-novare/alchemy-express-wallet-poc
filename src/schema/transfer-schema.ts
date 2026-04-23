import { z } from "zod";

const TransferSchema = z.object({
  body: z
    .object({
      senderWalletId: z
        .number()
        .int()
        .positive("Sender ID must be a positive integer"),
      receiverWalletId: z
        .number()
        .int()
        .positive("Receiver ID must be a positive integer"),
      amount: z.coerce
        .number()
        .positive("Amount must be greater than 0"),
    })
    .refine((data) => data.senderWalletId !== data.receiverWalletId, {
      message: "Sender and receiver cannot be the same wallet.",
    }),
});

export default TransferSchema;
