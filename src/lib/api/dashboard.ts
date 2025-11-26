import { create } from "@bufbuild/protobuf";
import { dashboardClient } from "@/lib/grpc-client";
import {
  GetCategorySpendingComparisonRequestSchema,
  type GetCategorySpendingComparisonResponse,
  GetNetWorthHistoryRequestSchema,
  type GetNetWorthHistoryResponse,
  GetAccountBalancesRequestSchema,
  type GetAccountBalancesResponse,
  GetNetBalanceRequestSchema,
  type GetNetBalanceResponse,
  GetTotalBalanceRequestSchema,
  type GetTotalBalanceResponse,
  GetTotalDebtRequestSchema,
  type GetTotalDebtResponse,
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

  async getAccountBalances(userId: string): Promise<GetAccountBalancesResponse> {
    const request = create(GetAccountBalancesRequestSchema, { userId });
    return await dashboardClient.getAccountBalances(request);
  },

  async getNetBalance(userId: string): Promise<GetNetBalanceResponse> {
    const request = create(GetNetBalanceRequestSchema, { userId });
    return await dashboardClient.getNetBalance(request);
  },

  async getTotalBalance(userId: string): Promise<GetTotalBalanceResponse> {
    const request = create(GetTotalBalanceRequestSchema, { userId });
    return await dashboardClient.getTotalBalance(request);
  },

  async getTotalDebt(userId: string): Promise<GetTotalDebtResponse> {
    const request = create(GetTotalDebtRequestSchema, { userId });
    return await dashboardClient.getTotalDebt(request);
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
