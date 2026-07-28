import { Ticket } from "lucide-react";

export function QueueInsights() {
  return (
    <aside className="flex w-[320px] flex-col gap-stack-lg border-l border-outline-variant bg-surface-container-lowest p-gutter">
      <div className="mb-stack-lg flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-on-primary">
          <Ticket aria-hidden className="size-6" fill="currentColor" />
        </div>
        <div>
          <h1 className="text-headline-md font-bold leading-tight text-primary-container">
            TMS Enterprise
          </h1>
          <p className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
            Agent Portal
          </p>
        </div>
      </div>
      
      {/* Urgent Alerts Section placeholder from the mockup */}
      <div className="flex flex-col gap-3">
        <h3 className="text-label-md font-bold uppercase tracking-wider text-on-surface-variant">
          Insights & Alerts
        </h3>
        <p className="text-body-md text-on-surface-variant italic">
          No urgent alerts at this time.
        </p>
      </div>
    </aside>
  );
}
