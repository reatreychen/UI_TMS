import { Search, Bell, HelpCircle } from "lucide-react";

export function ReportsTopNav() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-outline-variant bg-surface px-container-margin shadow-sm">
      <div className="flex flex-1 items-center">
        <div className="relative w-full max-w-md rounded-lg transition-all focus-within:ring-2 focus-within:ring-primary">
          <Search
            aria-hidden
            className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            placeholder="Search analytics, agents, or tickets..."
            className="w-full rounded-lg border-none bg-surface-container-low py-2 pl-10 pr-4 text-body-md font-body-md focus:ring-0"
          />
        </div>
      </div>
      <div className="flex items-center gap-stack-md">
        <button className="p-2 text-on-surface-variant transition-colors hover:text-primary">
          <Bell aria-hidden className="size-6" />
        </button>
        <button className="p-2 text-on-surface-variant transition-colors hover:text-primary">
          <HelpCircle aria-hidden className="size-6" />
        </button>
        <div className="h-6 w-px bg-outline-variant"></div>
        <button className="font-label-md text-label-md font-bold text-primary hover:underline">
          Support
        </button>
      </div>
    </header>
  );
}
