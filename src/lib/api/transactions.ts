import { create } from "@bufbuild/protobuf";
import { transactionClient } from "@/lib/grpc-client";
import {
  ListTransactionsRequestSchema,
  CreateTransactionRequestSchema,
  DeleteTransactionRequestSchema,
} from "@/gen/arian/v1/transaction_services_pb";
import type { Cursor } from "@/gen/arian/v1/common_pb";
import { TransactionDirection } from "@/gen/arian/v1/enums_pb";

export interface ListTransactionsInput {
  userId: string;
  limit?: number;
  accountId?: bigint;
  cursor?: Cursor;
  startDate?: Date;
  endDate?: Date;
  categories?: string[];
  categoryId?: bigint;
  includeUncategorized?: boolean;
  uncategorized?: boolean;
  direction?: TransactionDirection;
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
      startDate: data.startDate ? { seconds: BigInt(Math.floor(data.startDate.getTime() / 1000)) } : undefined,
      endDate: data.endDate ? { seconds: BigInt(Math.floor(data.endDate.getTime() / 1000)) } : undefined,
      categories: data.categories,
      uncategorized: data.uncategorized,
      direction: data.direction,
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
      txDate: { seconds: BigInt(Math.floor(data.txDate.getTime() / 1000)) },
      txAmount: {
        currencyCode: data.txAmount.currencyCode,
        units: BigInt(data.txAmount.units),
        nanos: data.txAmount.nanos,
      },
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
    const request = create(DeleteTransactionRequestSchema, {
      userId,
      ids: transactionIds,
    });
    await transactionClient.deleteTransaction(request);
  },
};
