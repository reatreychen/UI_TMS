"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  Code,
  Paperclip,
  Smile,
  AtSign,
  Send,
  FileText,
  Download,
} from "lucide-react";
import type { AgentTicketDetail } from "@/src/data/agentTicketDetail";

interface AgentTicketChatProps {
  messages: AgentTicketDetail["messages"];
}

export function AgentTicketChat({ messages }: AgentTicketChatProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom on load
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-1 flex-col border-r border-outline-variant bg-surface">
      {/* Chat Scroll Area */}
      <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-container-margin">
        {messages.map((msg) => {
          if (msg.type === "system") {
            return (
              <div key={msg.id} className="flex justify-center">
                <span className="rounded-full bg-surface-container px-4 py-1 text-label-md text-on-surface-variant">
                  {msg.text}
                </span>
              </div>
            );
          }

          const isAgent = msg.type === "agent";

          return (
            <div
              key={msg.id}
              className={`flex max-w-[85%] gap-4 ${
                isAgent ? "ml-auto flex-row-reverse" : ""
              }`}
            >
              {msg.avatarUrl && (
                <Image
                  src={msg.avatarUrl}
                  alt={msg.author || ""}
                  width={40}
                  height={40}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
              )}
              <div className={isAgent ? "text-right" : ""}>
                <div
                  className={`mb-1 flex items-center gap-2 ${
                    isAgent ? "justify-end" : ""
                  }`}
                >
                  {!isAgent && (
                    <span className="font-bold text-on-surface">
                      {msg.author}
                    </span>
                  )}
                  <span className="text-label-md text-on-surface-variant">
                    {msg.time}
                  </span>
                  {isAgent && (
                    <span className="font-bold text-primary">{msg.author}</span>
                  )}
                </div>
                <div
                  className={`text-body-md leading-relaxed ${
                    isAgent
                      ? "rounded-xl rounded-tr-none bg-primary-container p-4 text-left text-white shadow-sm"
                      : "rounded-xl rounded-tl-none border border-outline-variant bg-surface-container-low p-4"
                  }`}
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                />
                {msg.attachment && (
                  <div className="mt-3 flex cursor-pointer items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-3 transition-colors hover:bg-surface-container-low">
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-error-container text-error">
                      <FileText aria-hidden className="size-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-body-md font-semibold">
                        {msg.attachment.name}
                      </p>
                      <p className="text-label-md text-on-surface-variant">
                        {msg.attachment.size} • {msg.attachment.type}
                      </p>
                    </div>
                    <Download aria-hidden className="size-5 text-on-surface-variant" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input Area */}
      <div className="border-t border-outline-variant bg-surface-container-low p-container-margin">
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm ring-1 ring-transparent transition-all focus-within:border-primary focus-within:ring-primary">
          <div className="flex items-center gap-2 border-b border-outline-variant bg-surface-bright px-3 py-2">
            <button
              className="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container"
              title="Bold"
            >
              <Bold aria-hidden className="size-5" />
            </button>
            <button
              className="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container"
              title="Italic"
            >
              <Italic aria-hidden className="size-5" />
            </button>
            <button
              className="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container"
              title="Link"
            >
              <LinkIcon aria-hidden className="size-5" />
            </button>
            <div className="mx-1 h-4 w-[1px] bg-outline-variant"></div>
            <button
              className="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container"
              title="List"
            >
              <List aria-hidden className="size-5" />
            </button>
            <button
              className="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container"
              title="Code"
            >
              <Code aria-hidden className="size-5" />
            </button>
          </div>
          <textarea
            className="h-32 w-full resize-none border-none p-4 text-body-md placeholder:text-outline focus:ring-0"
            placeholder="Type your message here..."
          ></textarea>
          <div className="flex items-center justify-between bg-surface-bright px-4 py-3">
            <div className="flex items-center gap-2">
              <button className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container">
                <Paperclip aria-hidden className="size-5" />
              </button>
              <button className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container">
                <Smile aria-hidden className="size-5" />
              </button>
              <button className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container">
                <AtSign aria-hidden className="size-5" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-label-md text-on-surface-variant">
                <input
                  type="checkbox"
                  className="rounded border-outline-variant text-primary focus:ring-primary"
                />
                Email customer
              </label>
              <button className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-bold text-white shadow-md transition-all hover:opacity-90">
                Send Message
                <Send aria-hidden className="size-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
