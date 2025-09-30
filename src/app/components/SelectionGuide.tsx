"use client";

export default function SelectionGuide() {
  return (
    <div className="w-80 tui-border bg-background">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-medium tui-muted">Multi-Select Guide</h3>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-3 text-sm tui-muted">
          <div>
            <div className="font-medium mb-1">Individual Selection:</div>
            <div className="text-xs">
              <kbd className="px-1 py-0.5 text-xs font-mono bg-muted rounded border">Ctrl</kbd> +
              click transaction
            </div>
          </div>

          <div>
            <div className="font-medium mb-1">Range Selection:</div>
            <div className="text-xs">
              <kbd className="px-1 py-0.5 text-xs font-mono bg-muted rounded border">Shift</kbd> +
              click transaction
            </div>
          </div>

          <div>
            <div className="font-medium mb-1">Select Entire Day:</div>
            <div className="text-xs space-y-1">
              <div>
                <kbd className="px-1 py-0.5 text-xs font-mono bg-muted rounded border">Ctrl</kbd> +
                click day header
              </div>
              <div>
                <kbd className="px-1 py-0.5 text-xs font-mono bg-muted rounded border">Shift</kbd> +
                click day header
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-border">
          <div className="text-xs tui-muted">
            Selected transactions will show analysis here including income, expenses, and net
            totals.
          </div>
        </div>
      </div>
    </div>
  );
}
