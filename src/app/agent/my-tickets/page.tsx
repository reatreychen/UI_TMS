import { AgentTicketsTopNav } from "@/src/components/agent/AgentTicketsTopNav";
import { TicketsFilter } from "@/src/components/agent/TicketsFilter";
import { TicketsTable } from "@/src/components/agent/TicketsTable";
import { AgentStats } from "@/src/components/agent/AgentStats";

export const metadata = {
  title: "My Tickets | Kinetic Enterprise TMS",
  description: "View and manage your assigned tickets.",
};

export default function MyTicketsPage() {
  return (
    <>
      <AgentTicketsTopNav />

      <div className="mx-auto w-full max-w-[1440px] space-y-stack-lg p-container-margin">
        <TicketsFilter />
        <TicketsTable />
        <AgentStats />
      </div>
      
      <footer className="mt-auto py-8 text-center text-label-md text-outline">
        <p>© 2024 Kinetic Enterprise TMS. Professional Ticket Management Suite.</p>
      </footer>
    </>
  );
}
