import { Search, Bell, HelpCircle, LayoutGrid } from "lucide-react";
import Image from "next/image";
import { AGENT_PROFILE } from "@/src/constants/agentSettings";

export function SettingsTopNav() {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-container-margin shadow-sm">
      <div className="flex flex-1 items-center">
        <div className="relative w-full max-w-md">
          <Search
            aria-hidden
            className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            placeholder="Search tickets, customers, or settings..."
            className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-10 pr-4 text-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-stack-md">
        <button className="cursor-pointer rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low active:opacity-80">
          <Bell aria-hidden className="size-6" />
        </button>
        <button className="cursor-pointer rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low active:opacity-80">
          <HelpCircle aria-hidden className="size-6" />
        </button>
        <button className="cursor-pointer rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low active:opacity-80">
          <LayoutGrid aria-hidden className="size-6" />
        </button>

        <div className="mx-2 h-8 w-[1px] bg-outline-variant"></div>

        <div className="flex cursor-pointer items-center gap-3 rounded-lg p-1 pr-3 transition-colors hover:bg-surface-container-low">
          <Image
            src={AGENT_PROFILE.avatarUrl}
            alt="Agent Profile"
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
          />
          <div className="hidden text-left lg:block">
            <p className="font-label-md font-bold leading-tight text-on-surface">
              {AGENT_PROFILE.name}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">
              Sr. Tech Agent
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
