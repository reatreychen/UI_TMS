import { Timer, CheckCircle, Zap } from "lucide-react";
import { AGENT_STATS } from "@/src/constants/agentMyTickets";

export function AgentStats() {
  return (
    <div className="grid grid-cols-1 gap-stack-md md:grid-cols-3">
      {/* Avg Response Time */}
      <div className="flex items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-highest p-stack-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFDAD6] text-[#93000A]">
          <Timer aria-hidden className="size-6" fill="currentColor" />
        </div>
        <div>
          <p className="text-label-md text-on-surface-variant">
            Avg. Response Time
          </p>
          <p className="text-headline-md font-black text-on-surface">
            {AGENT_STATS.avgResponseTime}
          </p>
        </div>
      </div>

      {/* Resolved Today */}
      <div className="flex items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-highest p-stack-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
          <CheckCircle aria-hidden className="size-6" fill="currentColor" />
        </div>
        <div>
          <p className="text-label-md text-on-surface-variant">
            Resolved Today
          </p>
          <p className="text-headline-md font-black text-on-surface">
            {AGENT_STATS.resolvedToday}
          </p>
        </div>
      </div>

      {/* SLA */}
      <div className="flex items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-highest p-stack-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary">
          <Zap aria-hidden className="size-6" fill="currentColor" />
        </div>
        <div>
          <p className="text-label-md text-on-surface-variant">
            Service Level (SLA)
          </p>
          <p className="text-headline-md font-black text-on-surface">
            {AGENT_STATS.sla}
          </p>
        </div>
      </div>
    </div>
  );
}
