"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { selectUser } from "@/src/store/slices/authSlice";
import {
  fetchAgentTicketThunk,
  assignAgentTicketThunk,
  resolveAgentTicketThunk,
  updateAgentTicketStatusThunk,
  clearAgentTicket,
} from "@/src/store/slices/agentTicketSlice";

import { AgentTicketHeader } from "@/src/components/agent/AgentTicketHeader";
import { AgentTicketChat } from "@/src/components/agent/AgentTicketChat";
import { AgentTicketSidebar } from "@/src/components/agent/AgentTicketSidebar";
import type { AgentTicketDetail } from "@/src/constants/agentTicketDetail";

function getActionErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== "string") return fallback;

  const normalized = error.trim().toLowerCase();
  if (!normalized || normalized === "internal server error") return fallback;
  return error;
}

export default function AgentTicketDetailPage() {
  const { id } = useParams() as { id: string };
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectUser);

  const { rawTicket, loading, isAssigning, isResolving, error } =
    useAppSelector((state) => state.agentTicket);

  // Load ticket on mount / id change
  useEffect(() => {
    if (!id) return;
    dispatch(fetchAgentTicketThunk(id));
    return () => {
      dispatch(clearAgentTicket());
    };
  }, [id, dispatch]);

  // Map raw backend data → UI model
  const ticketData = useMemo<AgentTicketDetail | null>(() => {
    if (!rawTicket) return null;
    const t = rawTicket;
    return {
      id: t.ticketNumber || t.id?.slice(0, 8) || "—",
      status: t.status?.replace(/_/g, " ") ?? "OPEN",
      priority: t.priority ?? "MEDIUM",
      title: t.subject ?? "—",
      createdAt: t.createdAt ? format(new Date(t.createdAt), "MMM d, yyyy") : "—",
      requester: t.customer?.fullName || t.customer?.name || "Unknown Customer",
      category: t.category?.name || "Uncategorized",
      messages: [],
      customerProfile: {
        name: t.customer?.fullName || t.customer?.name || "Unknown",
        avatarUrl: t.customer?.avatarUrl || "https://i.pravatar.cc/150?u=customer",
        role: "Customer",
        plan: "Standard",
        organization: "Acme Corp",
        health: "Good",
        lastActive: t.updatedAt || t.createdAt
          ? formatDistanceToNow(new Date(t.updatedAt || t.createdAt), { addSuffix: true })
          : "—",
      },
      serviceMetrics: {
        responseSlaStatus: "on_track",
        responseSlaMessage: "SLA OK",
        resolutionSlaTimeLeft: "4h 12m",
        assignedTeam: t.category?.department?.name || "Support",
        escalations: 0,
      },
      internalNotes: [],
      attachments: t.attachments || [],
    };
  }, [rawTicket]);

  const handleAssign = async () => {
    if (!id || !currentUser?.id || isAssigning || isResolving) return;

    try {
      await dispatch(assignAgentTicketThunk({ ticketId: id, agentId: currentUser.id })).unwrap();
      toast.success("Ticket assigned successfully.", { id: `assign-${id}` });
    } catch (actionError) {
      toast.error(getActionErrorMessage(actionError, "Unable to assign ticket. Please try again."), {
        id: `assign-${id}`,
      });
    }
  };

  const handleResolve = async () => {
    if (!id || isResolving || isAssigning) return;

    try {
      await dispatch(resolveAgentTicketThunk({ ticketId: id })).unwrap();
      toast.success("Ticket resolved successfully.", { id: `resolve-${id}` });
    } catch (actionError) {
      toast.error(getActionErrorMessage(actionError, "Unable to resolve ticket. Please try again."), {
        id: `resolve-${id}`,
      });
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id || isResolving || isAssigning) return;

    try {
      await dispatch(updateAgentTicketStatusThunk({ ticketId: id, status: newStatus })).unwrap();
      toast.success(`Status updated to ${newStatus.replace(/_/g, " ")}.`, { id: `status-${id}` });
    } catch (actionError) {
      toast.error(getActionErrorMessage(actionError, "Failed to update ticket status."), {
        id: `status-${id}`,
      });
    }
  };

  // Loading state (first load only)
  if (loading && !ticketData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="ml-2 text-on-surface-variant">Loading ticket...</p>
      </div>
    );
  }

  if (!ticketData) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-on-surface-variant">
          {error || "Ticket not found."}
        </p>
        <Link href="/agent/my-tickets" className="text-primary hover:underline">
          Return to My Tickets
        </Link>
      </div>
    );
  }

  return (
    <>
      <main className="flex h-[calc(100vh-73px)] flex-1 flex-col overflow-hidden">
        <AgentTicketHeader
          ticket={ticketData}
          onAssign={handleAssign}
          onResolve={handleResolve}
          onStatusChange={handleStatusChange}
          isAssigning={isAssigning}
          isResolving={isResolving}
        />

        <div className="flex flex-1 overflow-hidden">
          <AgentTicketChat
            ticketId={id}
            ticketDesc={rawTicket.description}
            ticketCreatedAt={rawTicket.createdAt}
            customerId={rawTicket.customer?.id}
            customerName={ticketData.requester}
            customerAvatarUrl={ticketData.customerProfile.avatarUrl}
            attachments={ticketData.attachments}
          />
          <AgentTicketSidebar ticket={ticketData} />
        </div>
      </main>
    </>
  );
}
