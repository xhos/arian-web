import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { AccountService } from "@/gen/arian/v1/account_services_pb";
import { TransactionService } from "@/gen/arian/v1/transaction_services_pb";
import { CategoryService } from "@/gen/arian/v1/category_services_pb";
import { RuleService } from "@/gen/arian/v1/rule_services_pb";
import { BackupService } from "@/gen/arian/v1/backup_services_pb";

const transport = createConnectTransport({
  baseUrl: "/api",
  useBinaryFormat: false,
  interceptors: [],
});

export const accountClient = createClient(AccountService, transport);
export const transactionClient = createClient(TransactionService, transport);
export const categoryClient = createClient(CategoryService, transport);
export const ruleClient = createClient(RuleService, transport);
export const backupClient = createClient(BackupService, transport);
