import Image from "next/image";
import Link from "next/link";
import { AlertCircle, FileText } from "lucide-react";
import {
  TICKET_DETAIL,
  ATTACHMENTS,
  ACTIVITY_LOG,
} from "@/src/constants/ticketDetail";

function TicketDetailsCard() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Ticket Details
      </h2>

      <div className="space-y-3.5 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Assignee</span>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
              <Image
                src={TICKET_DETAIL.assignee.avatarUrl}
                alt={TICKET_DETAIL.assignee.name}
                width={24}
                height={24}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="font-medium text-slate-900">
              {TICKET_DETAIL.assignee.name}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500">Priority</span>
          <div className="flex items-center gap-1.5 text-red-600">
            <AlertCircle aria-hidden className="size-4" strokeWidth={2.25} />
            <span className="font-semibold">{TICKET_DETAIL.priority}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500">Category</span>
          <span className="text-slate-900 font-medium">
            {TICKET_DETAIL.category}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500">SLA Due</span>
          <span className="font-semibold text-slate-900">
            {TICKET_DETAIL.slaDue}
          </span>
        </div>
      </div>
    </section>
  );
}

function AttachmentsCard() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Attachments ({ATTACHMENTS.length})
        </h2>
        <Link
          href="#attachments"
          className="text-xs font-semibold text-blue-600 hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {ATTACHMENTS.map((att) => (
          <div
            key={att.id}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
          >
            {att.type === "image" && att.thumbnailUrl ? (
              <Image
                src={att.thumbnailUrl}
                alt={att.filename}
                fill
                className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <FileText
                  aria-hidden
                  className="size-7 text-slate-400"
                  strokeWidth={1.5}
                />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 truncate bg-slate-900/70 px-2 py-1 text-[10px] text-white backdrop-blur-xs">
              {att.filename}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ActivityLogCard() {
  return (
    <section className="flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Activity Log
      </h2>

      <div className="relative space-y-5 pl-6 before:absolute before:bottom-2 before:left-2 before:top-2 before:w-px before:bg-slate-200">
        {ACTIVITY_LOG.map((entry) => (
          <div key={entry.id} className="relative">
            <div
              className={`absolute -left-[22px] top-1 h-3 w-3 rounded-full border-2 border-white ${
                entry.isLatest ? "bg-blue-600" : "bg-slate-300"
              }`}
            />
            <p
              className="text-sm text-slate-900"
              dangerouslySetInnerHTML={{ __html: entry.description }}
            />
            <p className="text-xs text-slate-500 mt-0.5">
              {entry.timestamp}
              {entry.actor ? ` by ${entry.actor}` : ""}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TicketDetailSidebar() {
  return (
    <aside className="flex w-full flex-col gap-5 md:w-[340px]">
      <TicketDetailsCard />
      <AttachmentsCard />
      <ActivityLogCard />
    </aside>
  );
}
