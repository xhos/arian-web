import { create } from "@bufbuild/protobuf";
import { dashboardClient } from "@/lib/grpc-client";
import {
  GetCategorySpendingComparisonRequestSchema,
  type GetCategorySpendingComparisonResponse,
  GetNetWorthHistoryRequestSchema,
  type GetNetWorthHistoryResponse,
  GetFinancialSummaryRequestSchema,
  type GetFinancialSummaryResponse,
  GetDashboardSummaryRequestSchema,
  type GetDashboardSummaryResponse,
} from "@/gen/arian/v1/dashboard_services_pb";
import { PeriodType, Granularity } from "@/gen/arian/v1/enums_pb";
import type { Date as ProtoDate } from "@/gen/google/type/date_pb";

export interface CategorySpendingComparisonParams {
  userId: string;
  periodType: PeriodType;
  customStartDate?: ProtoDate;
  customEndDate?: ProtoDate;
}

export interface NetWorthHistoryParams {
  userId: string;
  startDate: ProtoDate;
  endDate: ProtoDate;
  granularity: Granularity;
}

export interface DashboardSummaryParams {
  userId: string;
  startDate?: ProtoDate;
  endDate?: ProtoDate;
}

export const dashboardApi = {
  async getCategorySpendingComparison(
    params: CategorySpendingComparisonParams
  ): Promise<GetCategorySpendingComparisonResponse> {
    const request = create(GetCategorySpendingComparisonRequestSchema, {
      userId: params.userId,
      periodType: params.periodType,
      customStartDate: params.customStartDate,
      customEndDate: params.customEndDate,
    });
    return await dashboardClient.getCategorySpendingComparison(request);
  },

  async getNetWorthHistory(
    params: NetWorthHistoryParams
  ): Promise<GetNetWorthHistoryResponse> {
    const request = create(GetNetWorthHistoryRequestSchema, {
      userId: params.userId,
      startDate: params.startDate,
      endDate: params.endDate,
      granularity: params.granularity,
    });
    return await dashboardClient.getNetWorthHistory(request);
  },

  async getFinancialSummary(userId: string): Promise<GetFinancialSummaryResponse> {
    const request = create(GetFinancialSummaryRequestSchema, { userId });
    return await dashboardClient.getFinancialSummary(request);
  },

  async getDashboardSummary(
    params: DashboardSummaryParams
  ): Promise<GetDashboardSummaryResponse> {
    const request = create(GetDashboardSummaryRequestSchema, {
      userId: params.userId,
      startDate: params.startDate,
      endDate: params.endDate,
    });
    return await dashboardClient.getDashboardSummary(request);
  },
};
