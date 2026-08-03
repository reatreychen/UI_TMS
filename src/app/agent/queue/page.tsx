"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { QueueFilterBar } from "@/src/components/agent/QueueFilterBar";
import { QueueTable } from "@/src/components/agent/QueueTable";
import { fetchQueueTickets, assignTicket } from "@/src/services/portalService";
import { useAppSelector } from "@/src/store/hooks";
import { selectUser } from "@/src/store/slices/authSlice";
import type { QueueChannel, QueuePriority, QueueTicketRow } from "@/src/constants/agentQueue";

function mapPriority(priority: string): QueuePriority {
  switch (priority.toUpperCase()) {
    case "CRITICAL":
      return "urgent";
    case "HIGH":
      return "high";
    case "LOW":
      return "low";
    default:
      return "normal";
  }
}

function mapChannel(channel?: string): QueueChannel {
  switch (channel?.toLowerCase()) {
    case "chat":
      return "chat";
    case "bolt":
    case "api":
      return "bolt";
    case "call":
    case "phone":
      return "call";
    case "mail":
    case "email":
    default:
      return "mail";
  }
}

function formatWaitTime(createdAt: string) {
  const created = new Date(createdAt).getTime();
  if (!Number.isFinite(created)) return "—";

  const minutes = Math.max(0, Math.floor((Date.now() - created) / 60000));
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes === 0 ? `${hours} hr` : `${hours}h ${remainingMinutes}m`;
}

export default function AgentQueuePage() {
  const currentUser = useAppSelector(selectUser);
  const currentUserId = currentUser?.id;
  const [tickets, setTickets] = useState<QueueTicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingTicketId, setClaimingTicketId] = useState<string | null>(null);

  const loadQueue = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);

    try {
      const response = await fetchQueueTickets({ status: "OPEN" });
      const unassignedTickets = response.items.filter((ticket) => !ticket.assignedAgentId);

      setTickets(
        unassignedTickets.map((ticket) => ({
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          subject: ticket.subject,
          requester: ticket.customer?.fullName || ticket.customer?.name || "Unknown customer",
          waitTime: formatWaitTime(ticket.createdAt),
          priority: mapPriority(ticket.priority),
          channel: mapChannel(ticket.channel),
        })),
      );
      setError(null);
    } catch (requestError) {
      console.error("Failed to load agent queue", requestError);
      setError("Unable to load the ticket queue. Please try again.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoadTimer = window.setTimeout(() => {
      void loadQueue(true);
    }, 0);

    return () => window.clearTimeout(initialLoadTimer);
  }, [loadQueue]);

  const handleClaim = useCallback(
    async (ticketId: string, event: React.MouseEvent) => {
      event.stopPropagation();

      if (!currentUserId) {
        toast.error("You must be signed in to claim a ticket.");
        return;
      }

      setClaimingTicketId(ticketId);
      try {
        await assignTicket(ticketId, currentUserId);
        setTickets((previous) => previous.filter((ticket) => ticket.id !== ticketId));
        toast.success("Ticket assigned to you.");
      } catch (requestError) {
        console.error("Failed to claim ticket", requestError);
        toast.error("Unable to claim this ticket. Please try again.");
      } finally {
        setClaimingTicketId(null);
      }
    },
    [currentUserId],
  );

  return (
    <>
      <main className="flex h-[calc(100vh-64px)] overflow-hidden">
        <section className="flex flex-1 flex-col gap-stack-md overflow-y-auto p-container-margin">
          <QueueFilterBar
            ticketCount={tickets.length}
            loading={loading}
            onRefresh={() => void loadQueue(true)}
          />
          <QueueTable
            tickets={tickets}
            loading={loading}
            error={error}
            claimingTicketId={claimingTicketId}
            onClaim={handleClaim}
          />
        </section>
      </main>
    </>
  );
}
