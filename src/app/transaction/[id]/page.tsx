import React from "react";
import { notFound } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // TODO: Replace with real API call to get transaction by ID  
  const transaction = null;

  if (!transaction) {
    notFound();
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl">
        {/* transaction header */}
        <header className="mb-6 tui-border p-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg">{transaction.description}</h1>
            <span className="text-xs tui-muted">#{transaction.id}</span>
          </div>
          <div className={`text-xl ${transaction.amount >= 0 ? "tui-accent" : "text-red-500"}`}>
            ${transaction.amount.toFixed(2)}
          </div>
        </header>

        {/* transaction details */}
        <div className="space-y-6">
          {/* basic info */}
          <section>
            <h2 className="text-sm tui-muted mb-3 uppercase tracking-wider">basic info</h2>
            <div className="tui-border">
              <div className="grid grid-cols-2 text-sm">
                <div className="p-3 border-b border-r border-border">
                  <div className="tui-muted text-xs mb-1">date</div>
                  <div>{transaction.date}</div>
                </div>
                <div className="p-3 border-b border-border">
                  <div className="tui-muted text-xs mb-1">category</div>
                  <div>{transaction.category}</div>
                </div>
                <div className="p-3 border-r border-border">
                  <div className="tui-muted text-xs mb-1">status</div>
                  <div className="tui-accent">{transaction.status}</div>
                </div>
                <div className="p-3">
                  <div className="tui-muted text-xs mb-1">payment method</div>
                  <div>{transaction.paymentMethod}</div>
                </div>
              </div>
            </div>
          </section>

          {/* merchant info */}
          <section>
            <h2 className="text-sm tui-muted mb-3 uppercase tracking-wider">merchant</h2>
            <div className="tui-border p-4 text-sm space-y-2">
              <div>
                <span className="tui-muted">name:</span> {transaction.merchant}
              </div>
              <div>
                <span className="tui-muted">location:</span> {transaction.location}
              </div>
            </div>
          </section>

          {/* actions */}
          <section>
            <h2 className="text-sm tui-muted mb-3 uppercase tracking-wider">actions</h2>
            <div className="flex gap-2">
              <button className="tui-button text-sm">edit transaction</button>
              <button className="tui-button text-sm text-red-500 border-red-500/50 hover:bg-red-500/10">
                delete
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
