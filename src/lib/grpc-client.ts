import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { AccountService } from "@/gen/arian/v1/account_services_pb";
import { TransactionService } from "@/gen/arian/v1/transaction_services_pb";

const transport = createConnectTransport({
  baseUrl: "/api",
  useBinaryFormat: false,
  interceptors: [],
});

export const accountClient = createClient(AccountService, transport);
export const transactionClient = createClient(TransactionService, transport);

