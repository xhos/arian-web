import Link from "next/link";

// mock transaction data for demo
const transactions = [
  { id: "001", date: "2024-01-15", amount: -24.99, description: "grocery store", category: "food" },
  { id: "002", date: "2024-01-14", amount: -120.00, description: "gas station", category: "transport" },
  { id: "003", date: "2024-01-14", amount: 2500.00, description: "salary", category: "income" },
  { id: "004", date: "2024-01-13", amount: -45.00, description: "restaurant", category: "food" },
  { id: "005", date: "2024-01-12", amount: -8.50, description: "coffee", category: "food" },
];

export default function TransactionsPage() {
  const balance = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl">
        
        {/* header */}
        <header className="mb-6">
          <h1 className="text-lg mb-1">arian // transactions</h1>
          <div className="flex items-center gap-4 text-sm tui-muted">
            <span>balance: <span className={balance >= 0 ? "tui-accent" : "text-red-500"}>${balance.toFixed(2)}</span></span>
            <span>total: {transactions.length} transactions</span>
          </div>
        </header>

        {/* transactions list */}
        <div className="space-y-2">
          {transactions.map((transaction) => (
            <Link
              key={transaction.id}
              href={`/transaction/${transaction.id}`}
              className="block hover:bg-border/20 transition-colors"
            >
              <div className="tui-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs tui-muted">#{transaction.id}</span>
                    <span className="text-sm">{transaction.description}</span>
                  </div>
                  <div className={`text-sm font-mono ${transaction.amount >= 0 ? "tui-accent" : "text-red-500"}`}>
                    ${transaction.amount.toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs tui-muted">
                  <span>{transaction.date}</span>
                  <span>{transaction.category}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* footer info */}
        <div className="mt-4 text-xs tui-muted">
          <p>press enter to view transaction details</p>
        </div>

      </div>
    </div>
  );
}
