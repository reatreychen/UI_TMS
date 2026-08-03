import Image from "next/image";
import { CheckCheck, Info } from "lucide-react";
import type { ChatMessage, TimelineEvent } from "@/src/constants/ticketDetail";
import { TIMELINE_ITEMS } from "@/src/constants/ticketDetail";

/* ── Individual bubble components ──────────────────────────────── */

function CustomerBubble({ msg }: { msg: ChatMessage }) {
  return (
    <div className="flex flex-col items-end">
      <div className="max-w-[85%] rounded-xl rounded-br-[4px] bg-primary-container p-4 text-on-primary-container shadow-sm">
        <p className="text-body-md">{msg.body}</p>
      </div>
      <div className="mt-1 flex items-center gap-1 px-1 text-label-md text-on-surface-variant">
        <span>{msg.timestamp}</span>
        <CheckCheck aria-hidden className="size-3.5" strokeWidth={2.5} />
      </div>
    </div>
  );
}

function AgentBubble({ msg }: { msg: ChatMessage }) {
  return (
    <div className="flex flex-col items-start">
      {/* Agent name + avatar */}
      <div className="mb-1 flex items-center gap-2 px-1">
        {msg.authorAvatarUrl && (
          <div className="h-6 w-6 overflow-hidden rounded-full border border-outline-variant bg-surface-container-high">
            <Image
              src={msg.authorAvatarUrl}
              alt={msg.authorName ?? "Agent"}
              width={24}
              height={24}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <span className="text-label-md font-bold text-on-surface">
          {msg.authorName}
        </span>
      </div>

      <div className="max-w-[85%] rounded-xl rounded-bl-[4px] border border-outline-variant bg-surface-container-high p-4 text-on-surface shadow-sm">
        <p className="text-body-md">{msg.body}</p>
      </div>
      <div className="mt-1 px-1 text-label-md text-on-surface-variant">
        {msg.timestamp}
      </div>
    </div>
  );
}

function EventPill({ event }: { event: TimelineEvent }) {
  return (
    <div className="flex justify-center my-2">
      <div className="flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-4 py-1">
        <Info aria-hidden className="size-3.5 text-on-surface-variant" strokeWidth={2} />
        <span
          className="text-label-md text-on-surface-variant"
          dangerouslySetInnerHTML={{ __html: event.description }}
        />
      </div>
    </div>
  );
}

/* ── Timeline ───────────────────────────────────────────────────── */

export function TicketTimeline() {
  return (
    <div className="flex flex-col gap-stack-md">
      {TIMELINE_ITEMS.map((item) => {
        if ("kind" in item && item.kind === "event") {
          return <EventPill key={item.id} event={item as TimelineEvent} />;
        }
        const msg = item as ChatMessage;
        return msg.sender === "customer" ? (
          <CustomerBubble key={msg.id} msg={msg} />
        ) : (
          <AgentBubble key={msg.id} msg={msg} />
        );
      })}
    </div>
  );
}
