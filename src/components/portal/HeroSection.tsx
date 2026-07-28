import { Headphones } from "lucide-react";

import { CreateTicketTrigger } from "./CreateTicketModal";

export function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-xl bg-primary p-12 text-on-primary md:flex-row">
      <div className="z-10 max-w-2xl space-y-4">
        <h1 className="text-display font-bold">
          Need Help? Create a Support Ticket
        </h1>
        <p className="text-body-lg opacity-90">
          Our dedicated expert team is ready to assist you with any technical
          issues or service requests. Response times are currently under 15
          minutes.
        </p>
        <div className="pt-4">
          <CreateTicketTrigger className="bg-surface-container-lowest text-primary hover:bg-opacity-90 active:scale-95 px-8 py-3 rounded-lg text-body-lg font-bold transition-all">
            Create Ticket
          </CreateTicketTrigger>
        </div>
      </div>

      <div className="z-10 hidden w-72 h-72 lg:block">
        <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl border border-white/20 bg-primary-fixed-dim/20 p-6 text-center backdrop-blur-xl">
          <Headphones
            aria-hidden
            className="mb-4 size-16"
            strokeWidth={1.5}
          />
          <span className="text-headline-md font-semibold">
            24/7 Priority Support
          </span>
          <span className="text-body-md opacity-80">
            Connected to Global Nodes
          </span>
        </div>
      </div>

      {/* Decorative background gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-primary-container/30 to-transparent"
      />
    </section>
  );
}
