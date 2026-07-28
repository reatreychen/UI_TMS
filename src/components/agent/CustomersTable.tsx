import { Filter, Download, ChevronRight, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { AGENT_CUSTOMERS, type CustomerDetail } from "@/src/data/agentCustomers";

interface CustomersTableProps {
  onRowClick: (customer: CustomerDetail) => void;
}

export function CustomersTable({ onRowClick }: CustomersTableProps) {
  return (
    <>
      {/* Directory Header */}
      <div className="mb-stack-md flex items-center justify-between">
        <div>
          <h2 className="text-headline-lg font-headline-lg text-on-surface">
            Customer Directory
          </h2>
          <p className="font-body-md text-on-surface-variant">
            Manage and view all associated customer accounts.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-outline-variant bg-white px-4 py-2 font-label-md transition-colors hover:bg-surface-container-low">
            <Filter aria-hidden className="size-5" />
            Filters
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-outline-variant bg-white px-4 py-2 font-label-md transition-colors hover:bg-surface-container-low">
            <Download aria-hidden className="size-5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="overflow-hidden rounded-lg border border-outline-variant bg-white shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-outline-variant bg-surface-container-lowest">
            <tr>
              <th className="px-6 py-4 font-label-md uppercase tracking-wider text-on-surface-variant">
                Customer Name
              </th>
              <th className="px-6 py-4 font-label-md uppercase tracking-wider text-on-surface-variant">
                Company
              </th>
              <th className="px-6 py-4 font-label-md uppercase tracking-wider text-on-surface-variant">
                Email
              </th>
              <th className="px-6 py-4 font-label-md uppercase tracking-wider text-on-surface-variant">
                Total Tickets
              </th>
              <th className="px-6 py-4 font-label-md uppercase tracking-wider text-on-surface-variant">
                Last Active
              </th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {AGENT_CUSTOMERS.map((customer) => (
              <tr
                key={customer.id}
                onClick={() => onRowClick(customer)}
                className="group cursor-pointer transition-colors hover:bg-surface-container-lowest"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src={customer.avatarUrl}
                      alt={customer.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full bg-surface-container object-cover"
                    />
                    <div className="font-body-md font-semibold text-on-surface">
                      {customer.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-body-md text-secondary">
                  {customer.company}
                </td>
                <td className="px-6 py-4 font-body-md text-secondary">
                  {customer.email}
                </td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-secondary-container px-2.5 py-0.5 font-label-md text-on-secondary-container">
                    {customer.totalTickets}
                  </span>
                </td>
                <td className="px-6 py-4 font-body-md text-secondary">
                  {customer.lastActive}
                </td>
                <td className="px-6 py-4 text-right">
                  <ChevronRight
                    aria-hidden
                    className="text-outline opacity-0 transition-opacity group-hover:opacity-100 ml-auto size-6"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-lowest px-6 py-4">
          <p className="font-label-md text-on-surface-variant">
            Showing 1 to {AGENT_CUSTOMERS.length} of 12,842 customers
          </p>
          <div className="flex gap-2">
            <button
              className="flex items-center justify-center rounded-lg border border-outline-variant p-2 transition-colors hover:bg-surface-container-low disabled:opacity-30"
              disabled
            >
              <ChevronLeft aria-hidden className="size-5" />
            </button>
            <button className="flex items-center justify-center rounded-lg border border-outline-variant p-2 transition-colors hover:bg-surface-container-low">
              <ChevronRight aria-hidden className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
