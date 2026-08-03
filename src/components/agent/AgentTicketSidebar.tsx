import Image from "next/image";
import type { AgentTicketDetail } from "@/src/constants/agentTicketDetail";

interface AgentTicketSidebarProps {
  ticket: AgentTicketDetail;
}

export function AgentTicketSidebar({ ticket }: AgentTicketSidebarProps) {
  return (
    <div className="custom-scrollbar flex w-[400px] flex-col overflow-y-auto bg-surface-container-lowest">
      {/* Customer Profile Section */}
      <section className="border-b border-outline-variant p-stack-lg">
        <h3 className="mb-4 text-label-md uppercase tracking-wider text-on-surface-variant">
          Customer Profile
        </h3>
        <div className="mb-4 flex items-center gap-4">
          <Image
            src={ticket.customerProfile.avatarUrl}
            alt={ticket.customerProfile.name}
            width={56}
            height={56}
            className="h-14 w-14 rounded-xl border border-outline-variant object-cover"
          />
          <div>
            <p className="font-bold text-on-surface">
              {ticket.customerProfile.name}
            </p>
            <p className="text-body-md text-on-surface-variant">
              {ticket.customerProfile.role}
            </p>
            <p className="mt-1 text-label-md text-primary">
              {ticket.customerProfile.plan}
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-body-md">
            <span className="text-on-surface-variant">Organization</span>
            <span className="font-medium">
              {ticket.customerProfile.organization}
            </span>
          </div>
          <div className="flex items-center justify-between text-body-md">
            <span className="text-on-surface-variant">Customer Health</span>
            <span className="flex items-center gap-1 font-medium text-green-600">
              <span className="h-2 w-2 rounded-full bg-green-600"></span>{" "}
              {ticket.customerProfile.health}
            </span>
          </div>
          <div className="flex items-center justify-between text-body-md">
            <span className="text-on-surface-variant">Last Active</span>
            <span className="font-medium">
              {ticket.customerProfile.lastActive}
            </span>
          </div>
        </div>
      </section>

      {/* Ticket Status Section */}
      <section className="border-b border-outline-variant p-stack-lg">
        <h3 className="mb-4 text-label-md uppercase tracking-wider text-on-surface-variant">
          Service Metrics
        </h3>
        <div className="space-y-4">
          <div>
            <div className="mb-1.5 flex justify-between text-label-md">
              <span className="text-on-surface-variant">Response SLA</span>
              <span
                className={`font-bold ${
                  ticket.serviceMetrics.responseSlaStatus === "overdue"
                    ? "text-error"
                    : "text-on-surface"
                }`}
              >
                {ticket.serviceMetrics.responseSlaMessage}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
              <div
                className={`h-full w-full rounded-full ${
                  ticket.serviceMetrics.responseSlaStatus === "overdue"
                    ? "bg-error"
                    : "bg-primary"
                }`}
              ></div>
            </div>
          </div>
          <div>
            <div className="mb-1.5 flex justify-between text-label-md">
              <span className="text-on-surface-variant">Resolution SLA</span>
              <span className="font-bold text-on-surface">
                {ticket.serviceMetrics.resolutionSlaTimeLeft}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
              <div className="h-full w-1/3 rounded-full bg-primary"></div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-outline-variant bg-surface-container-low p-3">
              <p className="text-label-md text-on-surface-variant">
                Assigned Team
              </p>
              <p className="mt-1 text-body-md font-bold">
                {ticket.serviceMetrics.assignedTeam}
              </p>
            </div>
            <div className="rounded-lg border border-outline-variant bg-surface-container-low p-3">
              <p className="text-label-md text-on-surface-variant">
                Escalations
              </p>
              <p className="mt-1 text-body-md font-bold">
                {ticket.serviceMetrics.escalations}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Internal Notes Section */}
      <section className="flex-1 p-stack-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-label-md uppercase tracking-wider text-on-surface-variant">
            Internal Notes
          </h3>
          <button className="text-label-md font-bold text-primary hover:underline">
            Add Note
          </button>
        </div>
        <div className="space-y-4">
          {ticket.internalNotes.map((note, index) => (
            <div
              key={index}
              className="relative rounded-lg border border-outline-variant bg-surface-container-high/50 p-4"
            >
              <div className="absolute -left-1 top-4 h-8 w-1 rounded-full bg-primary"></div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-body-md font-bold">{note.author}</span>
                <span className="text-label-md text-on-surface-variant">
                  {note.time}
                </span>
              </div>
              <p className="text-body-md italic text-on-surface-variant">
                {note.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
