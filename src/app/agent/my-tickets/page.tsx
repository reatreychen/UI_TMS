"use client";

import { useState, useEffect, useMemo } from "react";
import { TicketsFilter, type FilterTab } from "@/src/components/agent/TicketsFilter";
import { TicketsTable } from "@/src/components/agent/TicketsTable";
import { fetchMyTickets } from "@/src/services/portalService";

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("Active");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  useEffect(() => {
    fetchMyTickets({ limit: 500 })
      .then((data) => setTickets(data))
      .catch((err) => console.error("Failed to load agent tickets", err))
      .finally(() => setLoading(false));
  }, []);

  const activeCount = useMemo(() => {
    return tickets.filter((t) => {
      const s = (t.status || "").toUpperCase();
      return s === "OPEN" || s === "ASSIGNED" || s === "IN_PROGRESS";
    }).length;
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const s = (t.status || "").toUpperCase();
      
      // Tab filter
      if (activeTab === "Active") {
        if (s !== "OPEN" && s !== "ASSIGNED" && s !== "IN_PROGRESS") return false;
      } else if (activeTab === "Pending") {
        if (s !== "PENDING") return false;
      } else if (activeTab === "Resolved") {
        if (s !== "RESOLVED" && s !== "CLOSED") return false;
      }

      // Priority filter
      if (priorityFilter !== "ALL") {
        if ((t.priority || "").toUpperCase() !== priorityFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const subjectMatch = (t.subject || "").toLowerCase().includes(q);
        const numMatch = (t.ticketNumber || "").toLowerCase().includes(q);
        const customerMatch = (t.customer?.fullName || t.customer?.name || "").toLowerCase().includes(q);
        if (!subjectMatch && !numMatch && !customerMatch) return false;
      }

      return true;
    });
  }, [tickets, activeTab, priorityFilter, searchQuery]);

  return (
    <>
      <div className="mx-auto w-full max-w-[1440px] space-y-stack-lg p-container-margin">
        <TicketsFilter
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeCount={activeCount}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
        />
        <TicketsTable tickets={filteredTickets} loading={loading} />
      </div>
      
      <footer className="mt-auto py-8 text-center text-label-md text-outline">
        <p>© 2026 Kinetic Enterprise TMS. Professional Ticket Management Suite.</p>
      </footer>
    </>
  );
}
