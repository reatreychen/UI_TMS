import { AgentQueueTopNav } from "@/src/components/agent/AgentQueueTopNav";
import { QueueFilterBar } from "@/src/components/agent/QueueFilterBar";
import { QueueTable } from "@/src/components/agent/QueueTable";

export const metadata = {
  title: "Queue - TMS Enterprise Agent Portal",
  description: "View and manage unassigned support tickets.",
};

export default function AgentQueuePage() {
  return (
    <>
      <AgentQueueTopNav />

      {/* Main Content Canvas */}
      <main className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* Center Content: Ticket Queue */}
        <section className="flex flex-1 flex-col gap-stack-md overflow-y-auto p-container-margin">
          <QueueFilterBar />
          <QueueTable />
        </section>
      </main>
    </>
  );
}
