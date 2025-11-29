import { create } from "@bufbuild/protobuf";
import { accountClient } from "@/lib/grpc-client";
import {
  ListAccountsRequestSchema,
  CreateAccountRequestSchema,
  UpdateAccountRequestSchema,
  DeleteAccountRequestSchema,
  SetAccountAnchorRequestSchema,
} from "@/gen/arian/v1/account_services_pb";
import { AccountType } from "@/gen/arian/v1/enums_pb";

export interface CreateAccountInput {
  userId: string;
  name: string;
  bank: string;
  type: AccountType;
  alias?: string;
  anchorBalance?: {
    currencyCode: string;
    units: string;
    nanos: number;
  };
  mainCurrency?: string;
  colors?: string[];
}

export interface UpdateAccountInput {
  userId: string;
  id: bigint;
  name: string;
  bank: string;
  accountType: AccountType;
  alias?: string;
  mainCurrency?: string;
  colors?: string[];
}

export interface SetAnchorBalanceInput {
  id: bigint;
  balance: {
    currencyCode: string;
    units: string;
    nanos: number;
  };
}

export const accountsApi = {
  async list(userId: string) {
    const request = create(ListAccountsRequestSchema, { userId });
    const response = await accountClient.listAccounts(request);
    return response.accounts;
  },

  async create(data: CreateAccountInput) {
    const request = create(CreateAccountRequestSchema, {
      userId: data.userId,
      name: data.name,
      bank: data.bank,
      type: data.type,
      alias: data.alias,
      anchorBalance: data.anchorBalance ? {
        currencyCode: data.anchorBalance.currencyCode,
        units: BigInt(data.anchorBalance.units),
        nanos: data.anchorBalance.nanos,
      } : undefined,
      mainCurrency: data.mainCurrency,
      colors: data.colors,
    });
    const response = await accountClient.createAccount(request);
    return response.account;
  },

  async update(data: UpdateAccountInput) {
    const request = create(UpdateAccountRequestSchema, {
      userId: data.userId,
      id: data.id,
      updateMask: { paths: ["name", "bank", "account_type", "alias", "main_currency", "colors"] },
      name: data.name,
      bank: data.bank,
      accountType: data.accountType,
      alias: data.alias,
      mainCurrency: data.mainCurrency,
      colors: data.colors,
    });
    const response = await accountClient.updateAccount(request);
    return response.account;
  },

  async delete(userId: string, id: bigint) {
    const request = create(DeleteAccountRequestSchema, {
      userId,
      id,
    });
    await accountClient.deleteAccount(request);
  },

  async setAnchorBalance(data: SetAnchorBalanceInput) {
    const request = create(SetAccountAnchorRequestSchema, {
      id: data.id,
      balance: data.balance ? {
        currencyCode: data.balance.currencyCode,
        units: BigInt(data.balance.units),
        nanos: data.balance.nanos,
      } : undefined,
    });
    const response = await accountClient.setAccountAnchor(request);
    return response;
  },
};
