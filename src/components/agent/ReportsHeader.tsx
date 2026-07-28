import { CalendarDays, Download, ChevronDown } from "lucide-react";

export function ReportsHeader() {
  return (
    <div className="mb-stack-lg flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h2 className="text-headline-lg font-headline-lg text-on-background">
          Reports &amp; Analytics
        </h2>
        <p className="font-body-md text-body-md text-secondary">
          Performance insights and ticket trends overview
        </p>
      </div>
      <div className="flex items-center gap-stack-md">
        <div className="flex cursor-pointer items-center rounded-lg border border-outline-variant bg-white px-4 py-2 shadow-sm transition-colors hover:border-primary">
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
