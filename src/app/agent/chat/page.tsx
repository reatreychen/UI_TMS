"use client";

import { useEffect, useState } from "react";
import { fetchActiveChatSessions, ChatSession } from "@/src/services/chatService";
import { LiveAgentChat } from "@/src/components/agent/LiveAgentChat";
import { Loader2 } from "lucide-react";

export default function AgentChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveChatSessions()
      .then((data) => {
        setSessions(data);
        if (data.length > 0) {
          setSelectedSession(data[0]);
        }
      })
      .catch((err) => console.error("Failed to load active chat sessions", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="grid min-h-[calc(100vh-72px)] grid-cols-1 gap-6 px-6 py-5 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-[30px] border border-outline-variant bg-surface p-5 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-headline-md font-bold text-on-surface">Live Agent Chat</h1>
            <p className="text-body-md text-on-surface-variant">Chat with customers without refreshing.</p>
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-outline-variant bg-surface-container-low p-6 text-center text-on-surface-variant">
              No active sessions available.
            </div>
          ) : (
            sessions.map((session) => {
              const isSelected = selectedSession?.id === session.id;
              return (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={`w-full rounded-3xl border px-4 py-4 text-left transition ${isSelected ? "border-primary bg-primary/10" : "border-outline-variant bg-surface"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-on-surface">{session.customer?.fullName || session.customerId}</p>
                      <p className="text-sm text-on-surface-variant">{new Date(session.startedAt).toLocaleString()}</p>
                    </div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isSelected ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant"}`}>
                      Active
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <section className="flex min-h-[640px] flex-col">
        {selectedSession ? (
          <LiveAgentChat sessionId={selectedSession.id} session={selectedSession} />
        ) : (
          <div className="flex h-full min-h-[560px] items-center justify-center rounded-[30px] border border-outline-variant bg-surface p-8 text-on-surface-variant">
            Select an active session to join the live chat.
          </div>
        )}
      </section>
    </div>
  );
}
