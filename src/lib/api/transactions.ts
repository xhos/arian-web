import { create } from "@bufbuild/protobuf";
import { transactionClient } from "@/lib/grpc-client";
import {
  ListTransactionsRequestSchema,
  CreateTransactionRequestSchema,
  BulkDeleteTransactionsRequestSchema,
} from "@/gen/arian/v1/transaction_services_pb";
import type { Cursor } from "@/gen/arian/v1/common_pb";
import { TransactionDirection } from "@/gen/arian/v1/enums_pb";

export interface ListTransactionsInput {
  userId: string;
  limit?: number;
  accountId?: bigint;
  cursor?: Cursor;
}

export interface CreateTransactionInput {
  userId: string;
  accountId: bigint;
  txDate: Date;
  txAmount: {
    currencyCode: string;
    units: string;
    nanos: number;
  };
  direction: TransactionDirection;
  description?: string;
  merchant?: string;
  userNotes?: string;
  categoryId?: bigint;
}

export const transactionsApi = {
  async list(data: ListTransactionsInput) {
    const request = create(ListTransactionsRequestSchema, {
      userId: data.userId,
      limit: data.limit || 50,
      accountId: data.accountId,
      cursor: data.cursor,
    });
    const response = await transactionClient.listTransactions(request);
    return {
      transactions: response.transactions,
      nextCursor: response.nextCursor,
      hasMore: !!response.nextCursor && response.transactions.length > 0,
    };
  },

  async create(data: CreateTransactionInput) {
    const request = create(CreateTransactionRequestSchema, {
      userId: data.userId,
      accountId: data.accountId,
      txDate: data.txDate.toISOString(),
      txAmount: data.txAmount,
      direction: data.direction,
      description: data.description,
      merchant: data.merchant,
      userNotes: data.userNotes,
      categoryId: data.categoryId,
    });
    const response = await transactionClient.createTransaction(request);
    return response.transaction;
  },

  async bulkDelete(userId: string, transactionIds: bigint[]) {
    const request = create(BulkDeleteTransactionsRequestSchema, {
      userId,
      transactionIds,
    });
    await transactionClient.bulkDeleteTransactions(request);
  },
};
