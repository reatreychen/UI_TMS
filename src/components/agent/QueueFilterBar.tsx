"use client";

import { Download, Loader2, RefreshCcw } from "lucide-react";

interface QueueFilterBarProps {
  ticketCount: number;
  loading: boolean;
  onRefresh: () => void;
}

export function QueueFilterBar({ ticketCount, loading, onRefresh }: QueueFilterBarProps) {
  return (
    <div className="flex flex-col gap-stack-md">
      {/* Header Section */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-headline-lg font-headline-lg text-on-surface">
            Ticket Queue
          </h2>
          <p className="font-body-md text-secondary">
            {ticketCount} unassigned {ticketCount === 1 ? "ticket" : "tickets"} in the pool
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-body-md font-medium transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 aria-hidden className="size-5 animate-spin" /> : <RefreshCcw aria-hidden className="size-5" />}
            {loading ? "Loading" : "Refresh"}
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-body-md font-medium transition-colors hover:bg-surface-container-low">
            <Download aria-hidden className="size-5" />
            Export
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-stack-sm rounded-lg bg-surface-container-low p-base">
        <div className="flex items-center gap-2 rounded border border-outline-variant bg-surface-container-lowest px-3 py-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-outline">
            Priority:
          </span>
          <select className="border-none bg-transparent p-0 font-body-md font-medium focus:ring-0">
            <option>All Priorities</option>
            <option>Urgent</option>
            <option>High</option>
            <option>Normal</option>
            <option>Low</option>
          </select>
        </div>
        <div className="flex items-center gap-2 rounded border border-outline-variant bg-surface-container-lowest px-3 py-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-outline">
            Channel:
          </span>
          <select className="border-none bg-transparent p-0 font-body-md font-medium focus:ring-0">
            <option>All Channels</option>
            <option>Email</option>
            <option>Chat</option>
            <option>Phone</option>
          </select>
        </div>
        <div className="flex items-center gap-2 rounded border border-outline-variant bg-surface-container-lowest px-3 py-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-outline">
            SLA:
          </span>
          <select className="border-none bg-transparent p-0 font-body-md font-medium focus:ring-0">
            <option>Any Status</option>
            <option>Warning</option>
            <option>Breached</option>
            <option>Healthy</option>
          </select>
        </div>
        <div className="flex-1"></div>
        <button className="px-4 font-body-md font-semibold text-primary hover:underline">
          Clear all filters
        </button>
      </div>
    </div>
  );
}
