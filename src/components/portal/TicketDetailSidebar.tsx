import Image from "next/image";
import { AlertCircle, FileText } from "lucide-react";
import {
  TICKET_DETAIL,
  ATTACHMENTS,
  ACTIVITY_LOG,
} from "@/src/data/ticketDetail";

/* ── Ticket Details Card ────────────────────────────────────────── */

function TicketDetailsCard() {
  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-md shadow-sm">
      <h2 className="mb-4 text-label-md font-bold uppercase tracking-wider text-on-surface-variant">
        Ticket Details
      </h2>

      <div className="space-y-4">
        {/* Assignee */}
        <div className="flex items-center justify-between">
          <span className="text-body-md text-on-surface-variant">Assignee</span>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 overflow-hidden rounded-full bg-surface-container-high">
              <Image
                src={TICKET_DETAIL.assignee.avatarUrl}
                alt={TICKET_DETAIL.assignee.name}
                width={20}
                height={20}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-body-md font-medium text-on-surface">
              {TICKET_DETAIL.assignee.name}
            </span>
          </div>
        </div>

        {/* Priority */}
        <div className="flex items-center justify-between">
          <span className="text-body-md text-on-surface-variant">Priority</span>
          <div className="flex items-center gap-1.5 text-error">
            <AlertCircle
              aria-hidden
              className="size-4"
              strokeWidth={2.5}
            />
            <span className="text-body-md font-bold">{TICKET_DETAIL.priority}</span>
          </div>
        </div>

        {/* Category */}
        <div className="flex items-center justify-between">
          <span className="text-body-md text-on-surface-variant">Category</span>
          <span className="text-body-md text-on-surface">{TICKET_DETAIL.category}</span>
        </div>

        {/* SLA Due */}
        <div className="flex items-center justify-between">
          <span className="text-body-md text-on-surface-variant">SLA Due</span>
          <span className="text-body-md font-semibold text-on-surface">
            {TICKET_DETAIL.slaDue}
          </span>
        </div>
      </div>
    </section>
  );
}

/* ── Attachments Card ───────────────────────────────────────────── */

function AttachmentsCard() {
  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-md shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-label-md font-bold uppercase tracking-wider text-on-surface-variant">
          Attachments ({ATTACHMENTS.length})
        </h2>
        <button
          type="button"
          className="text-label-md font-bold text-primary hover:underline"
        >
          View All
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {ATTACHMENTS.map((att) => (
          <div
            key={att.id}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low"
          >
            {att.type === "image" && att.thumbnailUrl ? (
              <Image
                src={att.thumbnailUrl}
                alt={att.filename}
                fill
                className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <FileText
                  aria-hidden
                  className="size-8 text-on-surface-variant"
                  strokeWidth={1.5}
                />
              </div>
            )}
            {/* Filename overlay */}
            <div className="absolute inset-x-0 bottom-0 truncate bg-black/40 px-2 py-1.5 text-[10px] text-white backdrop-blur-sm">
              {att.filename}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Activity Log Card ──────────────────────────────────────────── */

function ActivityLogCard() {
  return (
    <section className="flex-1 rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-md shadow-sm">
      <h2 className="mb-4 text-label-md font-bold uppercase tracking-wider text-on-surface-variant">
        Activity Log
      </h2>

      {/* Vertical timeline */}
      <div className="relative space-y-6 pl-6 before:absolute before:bottom-2 before:left-2 before:top-2 before:w-px before:bg-outline-variant">
        {ACTIVITY_LOG.map((entry) => (
          <div key={entry.id} className="relative">
            {/* Timeline dot */}
            <div
              className={`absolute -left-[22px] top-1 h-3 w-3 rounded-full border-2 border-surface-container-lowest ${
                entry.isLatest ? "bg-primary" : "bg-outline-variant"
              }`}
            />
            <p
              className="text-body-md text-on-surface"
              dangerouslySetInnerHTML={{ __html: entry.description }}
            />
            <p className="text-label-md text-on-surface-variant">
              {entry.timestamp}
              {entry.actor ? ` by ${entry.actor}` : ""}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Composed Sidebar ───────────────────────────────────────────── */

export function TicketDetailSidebar() {
  return (
    <aside className="flex w-full flex-col gap-stack-md md:w-[340px]">
      <TicketDetailsCard />
      <AttachmentsCard />
      <ActivityLogCard />
    </aside>
  );
}
