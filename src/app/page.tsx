export default function TransactionsPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl">
        <header className="mb-6">
          <h1 className="text-lg mb-1">arian // transactions</h1>
          <div className="flex items-center gap-4 text-sm tui-muted">
            <span>
              balance: <span className="tui-accent">$0.00</span>
            </span>
            <span>total: 0 transactions</span>
          </div>
        </header>

        <div className="tui-border p-8 text-center">
          <div className="text-sm tui-muted mb-2">No transactions yet</div>
          <div className="text-xs tui-muted">
            Connect your accounts to start tracking transactions
          </div>
        </div>
      </div>
    </div>
  );
}
