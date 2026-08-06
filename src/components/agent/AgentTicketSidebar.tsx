"use client";

import { useState } from "react";
import Image from "next/image";
import type { AgentTicketDetail } from "@/src/constants/agentTicketDetail";
import { isImageAttachment, formatBytes } from "./AgentTicketChat";
import { FileText, Download, ExternalLink, ZoomIn, X } from "lucide-react";

interface AgentTicketSidebarProps {
  ticket: AgentTicketDetail;
}

export function AgentTicketSidebar({ ticket }: AgentTicketSidebarProps) {
  const [activeImageModal, setActiveImageModal] = useState<{ url: string; name: string } | null>(null);
  const attachments = ticket.attachments || [];

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

      {/* Attachments Section */}
      <section className="border-b border-outline-variant p-stack-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-label-md uppercase tracking-wider text-on-surface-variant">
            Attachments ({attachments.length})
          </h3>
        </div>

        {attachments.length === 0 ? (
          <p className="text-xs text-on-surface-variant italic">No files attached to this ticket.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {attachments.map((att, idx) => {
              const isImg = isImageAttachment(att);
              const fileName = att.fileName || att.name || "Attachment";
              const fileUrl = att.fileUrl || "#";
              const fileSizeFormatted = att.fileSize ? formatBytes(att.fileSize) : att.size || "";

              if (isImg && fileUrl !== "#") {
                return (
                  <div
                    key={att.id || idx}
                    className="group relative cursor-pointer overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low transition-all hover:border-primary hover:shadow-md"
                    onClick={() => setActiveImageModal({ url: fileUrl, name: fileName })}
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-black/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={fileUrl}
                        alt={fileName}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-gray-900 shadow">
                          <ZoomIn className="size-3" />
                          View
                        </div>
                      </div>
                    </div>
                    <div className="p-2 text-[11px]">
                      <p className="truncate font-medium text-on-surface" title={fileName}>
                        {fileName}
                      </p>
                      {fileSizeFormatted && (
                        <p className="text-[10px] text-on-surface-variant">{fileSizeFormatted}</p>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <a
                  key={att.id || idx}
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col justify-between rounded-lg border border-outline-variant bg-surface-container-low p-2.5 text-[11px] text-on-surface transition-colors hover:bg-surface-container-high"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-primary shrink-0" />
                    <span className="truncate font-medium" title={fileName}>{fileName}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-on-surface-variant">
                    <span>{fileSizeFormatted}</span>
                    <ExternalLink className="size-3" />
                  </div>
                </a>
              );
            })}
          </div>
        )}
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

      {/* Lightbox Image Modal */}
      {activeImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setActiveImageModal(null)}
        >
          <div
            className="relative flex max-h-[90vh] max-w-[90vw] flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-5 py-3">
              <h3 className="truncate font-semibold text-on-surface text-sm">{activeImageModal.name}</h3>
              <div className="flex items-center gap-2">
                <a
                  href={activeImageModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex items-center gap-1 rounded-lg bg-surface-container-high px-3 py-1.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-variant"
                >
                  <Download className="size-3.5" />
                  Download
                </a>
                <button
                  type="button"
                  onClick={() => setActiveImageModal(null)}
                  className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>
            <div className="flex max-h-[80vh] items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImageModal.url}
                alt={activeImageModal.name}
                className="max-h-[75vh] max-w-[85vw] object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
