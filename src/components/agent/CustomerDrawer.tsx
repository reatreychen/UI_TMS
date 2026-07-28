import { X, Mail, Phone, MapPin } from "lucide-react";
import Image from "next/image";
import type { CustomerDetail } from "@/src/data/agentCustomers";
import { AgentCreateTicketTrigger } from "./AgentCreateTicketModal";

interface CustomerDrawerProps {
  isOpen: boolean;
  customer: CustomerDetail | null;
  onClose: () => void;
}

export function CustomerDrawer({ isOpen, customer, onClose }: CustomerDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-on-background/20 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Side Panel Drawer */}
      <div
        className={`fixed right-0 top-0 z-[60] h-full w-[400px] border-l border-outline-variant bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-outline-variant p-6">
            <h3 className="text-headline-md font-headline-md">
              Customer Profile
            </h3>
            <button
              onClick={onClose}
              className="rounded-full p-2 transition-colors hover:bg-surface-container-low"
            >
              <X aria-hidden className="size-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {customer && (
              <>
                <div className="mb-8 flex flex-col items-center">
                  <div className="relative">
                    <Image
                      src={customer.avatarUrl}
                      alt="Customer Avatar"
                      width={96}
                      height={96}
                      className="h-24 w-24 rounded-full object-cover ring-4 ring-primary-container"
                    />
                    <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-white bg-green-500"></span>
                  </div>
                  <h4 className="mt-4 text-headline-md font-headline-md text-on-surface">
                    {customer.name}
                  </h4>
                  <p className="font-body-md text-secondary">
                    {customer.company}
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="mb-2 font-label-md uppercase tracking-wider text-outline">
                      Contact Information
                    </p>
                    <div className="space-y-3 rounded-lg bg-surface-container-low p-4">
                      <div className="flex items-center gap-3">
                        <Mail aria-hidden className="size-5 text-primary" />
                        <span className="font-body-md text-on-surface">
                          {customer.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone aria-hidden className="size-5 text-primary" />
                        <span className="font-body-md text-on-surface">
                          {customer.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin aria-hidden className="size-5 text-primary" />
                        <span className="font-body-md text-on-surface">
                          {customer.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <p className="font-label-md uppercase tracking-wider text-outline">
                        Recent Tickets
                      </p>
                      <button className="font-label-md text-primary hover:underline">
                        View all
                      </button>
                    </div>
                    <div className="space-y-3">
                      {customer.recentTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="group cursor-pointer rounded-lg border border-outline-variant p-3 transition-colors hover:border-primary"
                        >
                          <div className="mb-1 flex justify-between">
                            <span className="font-body-md font-semibold text-on-surface">
                              #{ticket.id}
                            </span>
                            <span
                              className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                                ticket.status === "OPEN"
                                  ? "bg-blue-100 text-blue-700"
                                  : ticket.status === "RESOLVED"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {ticket.status}
                            </span>
                          </div>
                          <p className="line-clamp-1 text-[13px] text-on-surface-variant">
                            {ticket.subject}
                          </p>
                          <p className="mt-2 text-[11px] text-outline">
                            {ticket.date}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="grid grid-cols-2 gap-3 border-t border-outline-variant bg-surface-container-lowest p-6">
            <button className="rounded-lg border border-outline-variant py-2.5 font-label-md transition-colors hover:bg-surface-container-low">
              Edit Profile
            </button>
            <AgentCreateTicketTrigger className="rounded-lg bg-primary py-2.5 font-label-md text-on-primary transition-all hover:bg-primary-container">
              Create Ticket
            </AgentCreateTicketTrigger>
          </div>
        </div>
      </div>
    </>
  );
}
