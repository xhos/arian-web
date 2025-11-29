import { create, toJson, fromJson, type JsonValue } from "@bufbuild/protobuf";
import { backupClient } from "@/lib/grpc-client";
import {
  ExportBackupRequestSchema,
  ImportBackupRequestSchema,
} from "@/gen/arian/v1/backup_services_pb";
import { BackupSchema } from "@/gen/arian/v1/backup_pb";

export const backupApi = {
  async exportData() {
    const request = create(ExportBackupRequestSchema, {});
    const response = await backupClient.exportBackup(request);

    if (!response.backup) {
      throw new Error("No backup data received");
    }

    return toJson(BackupSchema, response.backup);
  },

  async importData(jsonData: unknown) {
    const backup = fromJson(BackupSchema, jsonData as JsonValue);
    const request = create(ImportBackupRequestSchema, { backup });
    const response = await backupClient.importBackup(request);

    return {
      categoriesImported: response.categoriesImported,
      accountsImported: response.accountsImported,
      transactionsImported: response.transactionsImported,
      rulesImported: response.rulesImported,
    };
  },
};
