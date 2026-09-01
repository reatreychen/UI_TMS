import { CalendarDays, Download, ChevronDown, RefreshCw, Radio } from "lucide-react";

interface ReportsHeaderProps {
  lastUpdated: Date | null;
  isRefreshing: boolean;
  autoRefreshEnabled: boolean;
  onToggleAutoRefresh: () => void;
  onManualRefresh: () => void;
  pollIntervalSec?: number;
}

export function ReportsHeader({
  lastUpdated,
  isRefreshing,
  autoRefreshEnabled,
  onToggleAutoRefresh,
  onManualRefresh,
  pollIntervalSec = 15,
}: ReportsHeaderProps) {
  function formatLastUpdated() {
    if (!lastUpdated) return "Never";
    const secondsAgo = Math.max(0, Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    if (secondsAgo < 5) return "Just now";
    if (secondsAgo < 60) return `${secondsAgo}s ago`;
    const minutesAgo = Math.floor(secondsAgo / 60);
    return `${minutesAgo}m ago`;
  }

  return (
    <div className="mb-stack-lg flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-headline-lg font-headline-lg text-on-background">
            Reports &amp; Analytics
          </h2>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 shadow-xs">
            <span className="relative flex h-2.5 w-2.5">
              {autoRefreshEnabled && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                  autoRefreshEnabled ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
            </span>
            <span className="text-xs font-semibold text-slate-700">
              {autoRefreshEnabled ? `LIVE (${pollIntervalSec}s)` : "PAUSED"}
            </span>
          </div>
        </div>
        <p className="font-body-md text-body-md text-secondary">
          Performance insights and ticket trends overview • Updated {formatLastUpdated()}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-stack-md">
        {/* Auto Refresh Toggle & Manual Refresh Button */}
        <div className="flex items-center gap-1.5 rounded-lg border border-outline-variant bg-white p-1 shadow-xs">
          <button
            type="button"
            onClick={onManualRefresh}
            disabled={isRefreshing}
            title="Refresh real-time data now"
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw
              className={`size-3.5 text-primary ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          <div className="h-4 w-px bg-slate-200" />

          <button
            type="button"
            onClick={onToggleAutoRefresh}
            title={autoRefreshEnabled ? "Pause auto-refreshing" : "Resume auto-refreshing"}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              autoRefreshEnabled
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Radio className={`size-3.5 ${autoRefreshEnabled ? "animate-pulse text-emerald-600" : "text-slate-400"}`} />
            <span>Auto Live</span>
          </button>
        </div>

        <div className="flex cursor-pointer items-center rounded-lg border border-outline-variant bg-white px-4 py-2 shadow-xs transition-colors hover:border-primary">
          <CalendarDays aria-hidden className="mr-2 size-5" />
          <span className="font-label-md text-label-md">Last 30 Days</span>
          <ChevronDown aria-hidden className="ml-2 size-5" />
        </div>

        <button className="flex items-center rounded-lg bg-primary px-5 py-2.5 font-label-md text-label-md font-bold text-white shadow-md transition-all hover:bg-primary-container active:scale-95">
          <Download aria-hidden className="mr-2 size-5" />
          Export
        </button>
      </div>
    </div>
  );
}

