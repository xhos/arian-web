import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { NetWorthChart } from "@/components/dashboard/net-worth-chart";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { AccountBalancesCard } from "@/components/dashboard/account-balances-card";
import { CategoryBreakdownCard } from "@/components/dashboard/category-breakdown-card";
import { RecentTransactionsCard } from "@/components/dashboard/recent-transactions-card";

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const userId = session.user.id;

  return (
    <div className="w-full p-4 lg:p-6">
      <div className="mx-auto max-w-[1600px] space-y-4">
        <DashboardStats userId={userId} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start">
          {/* Left Column */}
          <div className="space-y-4 lg:col-span-3">
            <AccountBalancesCard userId={userId} />
            <CategoryBreakdownCard userId={userId} />
          </div>

          {/* Center - Chart */}
          <div className="lg:col-span-6">
            <NetWorthChart userId={userId} />
          </div>

          {/* Right Column - Recent Transactions */}
          <div className="lg:col-span-3">
            <RecentTransactionsCard userId={userId} />
          </div>
        </div>
      </div>
    </div>
  );
}
