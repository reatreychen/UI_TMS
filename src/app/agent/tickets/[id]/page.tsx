import { AgentTicketsTopNav } from "@/src/components/agent/AgentTicketsTopNav";
import { AgentTicketHeader } from "@/src/components/agent/AgentTicketHeader";
import { AgentTicketChat } from "@/src/components/agent/AgentTicketChat";
import { AgentTicketSidebar } from "@/src/components/agent/AgentTicketSidebar";
import { MOCK_AGENT_TICKET_DETAIL } from "@/src/data/agentTicketDetail";

export const metadata = {
  title: "Ticket Detail | Kinetic Enterprise TMS",
  description: "Detailed view of a support ticket.",
};

export default function AgentTicketDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // In a real application, you would fetch the ticket using params.id
  // Here we just use the mock data for demonstration
  const ticket = MOCK_AGENT_TICKET_DETAIL;

  return (
    <>
      <AgentTicketsTopNav />

      {/* Ticket Workspace */}
      <main className="flex h-[calc(100vh-73px)] flex-1 flex-col overflow-hidden">
        <AgentTicketHeader ticket={ticket} />

        {/* Two Column Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Column: Chat Interface */}
          <AgentTicketChat messages={ticket.messages} />

          {/* Right Column: Ticket Details/Context Sidebar */}
          <AgentTicketSidebar ticket={ticket} />
        </div>
      </main>
    </>
  );
}
