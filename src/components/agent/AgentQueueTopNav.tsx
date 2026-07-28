import { Search, Bell, HelpCircle } from "lucide-react";

export function AgentQueueTopNav() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-container-margin shadow-sm">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md rounded-lg transition-all focus-within:ring-2 focus-within:ring-primary">
          <Search
            aria-hidden
            className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-outline"
          />
          <input
            type="text"
            placeholder="Search queue, IDs, or users..."
            className="w-full rounded-lg border-none bg-surface-container-low py-2 pl-10 pr-4 text-body-md focus:ring-0"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low">
          <Bell aria-hidden className="size-6" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error"></span>
        </button>
        <button className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low">
          <HelpCircle aria-hidden className="size-6" />
        </button>

        <div className="mx-2 h-8 w-[1px] bg-outline-variant"></div>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
          <span className="text-body-md font-medium text-on-surface">Online</span>
        </div>
      </div>
    </header>
  );
}
