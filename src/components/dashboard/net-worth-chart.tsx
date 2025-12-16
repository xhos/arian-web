"use client";

import { useQuery } from "@tanstack/react-query";
import { subMonths } from "date-fns";
import { create } from "@bufbuild/protobuf";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card } from "@/components/lib";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardApi } from "@/lib/api/dashboard";
import { Granularity } from "@/gen/arian/v1/enums_pb";
import { DateSchema } from "@/gen/google/type/date_pb";
import { formatAmount } from "@/lib/utils/transaction";

interface NetWorthChartProps {
  userId: string;
}

const chartConfig = {
  netWorth: {
    label: "Net Worth",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function NetWorthChart({ userId }: NetWorthChartProps) {
  const endDate = new Date();
  const startDate = subMonths(endDate, 12);

  const { data, isLoading, error } = useQuery({
    queryKey: ["net-worth-history", userId],
    queryFn: () =>
      dashboardApi.getNetWorthHistory({
        userId,
        startDate: create(DateSchema, {
          year: startDate.getFullYear(),
          month: startDate.getMonth() + 1,
          day: startDate.getDate(),
        }),
        endDate: create(DateSchema, {
          year: endDate.getFullYear(),
          month: endDate.getMonth() + 1,
          day: endDate.getDate(),
        }),
        granularity: Granularity.MONTH,
      }),
  });

  if (isLoading) {
    return (
      <Card title="net worth over time" description="Loading...">
        <Skeleton className="h-[300px] w-full" />
      </Card>
    );
  }

  if (error || !data || data.dataPoints.length === 0) {
    return (
      <Card title="net worth over time" description="No data available">
        <div className="flex h-[300px] items-center justify-center text-muted-foreground">
          {error ? "Failed to load net worth data" : "No net worth history found"}
        </div>
      </Card>
    );
  }

  const chartData = data.dataPoints.map((point) => ({
    date: `${point.date?.year}-${String(point.date?.month).padStart(2, "0")}`,
    netWorth: formatAmount(point.netWorth),
  }));

  const currentValue = chartData[chartData.length - 1]?.netWorth ?? 0;
  const previousValue = chartData[chartData.length - 2]?.netWorth ?? 0;
  const change = currentValue - previousValue;
  const changePercent = previousValue !== 0 ? ((change / previousValue) * 100).toFixed(1) : "0.0";

  return (
    <Card
      title="net worth over time"
      description={
        <>
          <span className="tabular-nums">
            ${currentValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`ml-2 text-xs ${change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {change >= 0 ? "↑" : "↓"} {change >= 0 ? "+" : ""}{changePercent}% from last month
          </span>
        </>
      }
    >
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", { month: "short" });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
                  }}
                  formatter={(value) => (
                    <span className="tabular-nums">
                      ${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  )}
                />
              }
            />
            <defs>
              <linearGradient id="fillNetWorth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-netWorth)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-netWorth)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              dataKey="netWorth"
              type="monotone"
              fill="url(#fillNetWorth)"
              fillOpacity={0.4}
              stroke="var(--color-netWorth)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
    </Card>
  );
}
