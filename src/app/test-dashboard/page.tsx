"use client";

import { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api/dashboard";
import { PeriodType } from "@/gen/arian/v1/enums_pb";
import type { GetCategorySpendingComparisonResponse } from "@/gen/arian/v1/dashboard_services_pb";
import { formatAmount } from "@/lib/utils/transaction";

export default function TestDashboardPage() {
  const [data, setData] = useState<GetCategorySpendingComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await dashboardApi.getCategorySpendingComparison({
        userId: "test-user-id",
        periodType: PeriodType.PERIOD_TYPE_90_DAYS,
        timezone: userTimezone,
      });
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <pre className="bg-red-50 p-4 rounded text-red-900">{error}</pre>
      </div>
    );
  }

  if (!data) {
    return <div className="p-6">No data</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Category Spending Comparison Test</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded">
          <h2 className="font-semibold mb-2">Current Period</h2>
          <p className="text-sm text-muted-foreground">{data.currentPeriod?.label}</p>
          <p className="text-xs text-muted-foreground">
            {data.currentPeriod?.startDate?.year}-{data.currentPeriod?.startDate?.month}-
            {data.currentPeriod?.startDate?.day} to {data.currentPeriod?.endDate?.year}-
            {data.currentPeriod?.endDate?.month}-{data.currentPeriod?.endDate?.day}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <h2 className="font-semibold mb-2">Previous Period</h2>
          <p className="text-sm text-muted-foreground">{data.previousPeriod?.label}</p>
          <p className="text-xs text-muted-foreground">
            {data.previousPeriod?.startDate?.year}-{data.previousPeriod?.startDate?.month}-
            {data.previousPeriod?.startDate?.day} to {data.previousPeriod?.endDate?.year}-
            {data.previousPeriod?.endDate?.month}-{data.previousPeriod?.endDate?.day}
          </p>
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded mb-8">
        <h2 className="font-semibold mb-2">Totals</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Period Total</p>
            <p className="text-2xl font-bold">
              ${formatAmount(data.totals?.currentPeriodTotal)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Previous Period Total</p>
            <p className="text-2xl font-bold">
              ${formatAmount(data.totals?.previousPeriodTotal)}
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Categories ({data.categories.length})</h2>
      <div className="space-y-4">
        {data.categories.map((item, idx) => {
          const currentAmount = formatAmount(item.spending?.currentPeriod?.amount);
          const previousAmount = formatAmount(item.spending?.previousPeriod?.amount);
          const change = currentAmount - previousAmount;
          const changePercent =
            previousAmount !== 0 ? ((change / previousAmount) * 100).toFixed(1) : "N/A";

          return (
            <div key={idx} className="border rounded p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: item.category?.color }}
                  />
                  <h3 className="font-semibold">{item.category?.slug}</h3>
                </div>
                <span className="text-xs text-muted-foreground">ID: {item.category?.id}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Current</p>
                  <p className="font-semibold">${currentAmount.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.spending?.currentPeriod?.transactionCount.toString()} txns
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Previous</p>
                  <p className="font-semibold">${previousAmount.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.spending?.previousPeriod?.transactionCount.toString()} txns
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Change</p>
                  <p
                    className={`font-semibold ${
                      change > 0 ? "text-red-600" : change < 0 ? "text-green-600" : ""
                    }`}
                  >
                    ${change.toFixed(2)} ({changePercent}%)
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {data.uncategorized && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Uncategorized</h2>
          <div className="border rounded p-4 bg-gray-50">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Current</p>
                <p className="font-semibold">
                  ${formatAmount(data.uncategorized.currentPeriod?.amount).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.uncategorized.currentPeriod?.transactionCount.toString()} txns
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Previous</p>
                <p className="font-semibold">
                  ${formatAmount(data.uncategorized.previousPeriod?.amount).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.uncategorized.previousPeriod?.transactionCount.toString()} txns
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Raw JSON</h2>
        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
          {JSON.stringify(
            data,
            (_, value) => (typeof value === "bigint" ? value.toString() : value),
            2
          )}
        </pre>
      </div>
    </div>
  );
}
