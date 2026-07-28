import Image from "next/image";
import Link from "next/link";
import { Search, Bell, HelpCircle } from "lucide-react";
import { AgentCreateTicketTrigger } from "./AgentCreateTicketModal";

export function AgentTicketsTopNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant bg-surface shadow-sm">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-container-margin py-3">
        <div className="flex items-center gap-8">
          <div className="relative hidden lg:block">
            <Search
              aria-hidden
              className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-outline"
            />
            <input
              type="text"
              placeholder="Search tickets, customers..."
              className="w-80 rounded-full border border-outline-variant bg-surface-container-low py-2 pl-10 pr-4 text-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <AgentCreateTicketTrigger className="rounded-lg z-50 bg-primary-container px-4 py-2 text-body-md font-bold text-white transition-all hover:opacity-90 active:scale-95">
            Create Ticket
          </AgentCreateTicketTrigger>
          
          <div className="flex items-center gap-2">
            <button className="relative rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low active:scale-95">
              <Bell aria-hidden className="size-6" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error"></span>
            </button>
            <button className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low active:scale-95">
              <HelpCircle aria-hidden className="size-6" />
            </button>
          </div>

          <div className="mx-2 h-8 w-[1px] bg-outline-variant"></div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-label-md font-bold text-on-surface">
                Alex Rivera
              </p>
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                Senior Agent
              </p>
            </div>
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0CI2i4aV08-2MOwbg5-9nHdpNKQyAH_ZwJUAj7vBvTbQN1NxrTjJIHcfuhZG7mjB2tPKO5kM5mReyv4h1W0ULLg_tRGKx2c_reRVEUYAILn5_2vITrReh9U4bwXDQl7cN67DpUGZgOO8KbldBuxisHSCosHNyeZ2XSMii3v5fJSpd-fQSRpXv8GEucTeV5Qk7yAqtNw-9nKy6jit6rwQV2DAQgRIYfez8UUpvHgq83YJ0VK-UodrRW3I7D0iXb0l8QgJeUjBqloDp"
              alt="User profile photo"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full border-2 border-primary-container object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
