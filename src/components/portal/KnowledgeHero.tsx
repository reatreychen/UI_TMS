import { MessageSquare, Ticket } from "lucide-react";

export function KnowledgeHero() {
  return (
    <section className="relative overflow-hidden px-container-margin py-24">
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h1 className="mb-stack-md text-display font-bold text-on-background">
          How can we support you?
        </h1>
        <p className="mx-auto mb-stack-lg max-w-2xl text-body-lg text-on-surface-variant">
          Get instant help from our global support team, browse through technical
          documentation, or engage with our expert community.
        </p>
        <div className="flex flex-col justify-center gap-gutter sm:flex-row">
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-lg bg-primary-container px-stack-lg py-3 font-bold text-on-primary shadow-sm transition-all hover:opacity-90 active:scale-95"
          >
            <MessageSquare aria-hidden className="size-5" />
            Live Chat
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-stack-lg py-3 font-bold text-primary shadow-sm transition-all hover:bg-surface-container-low active:scale-95"
          >
            <Ticket aria-hidden className="size-5" />
            Create Ticket
          </button>
        </div>
      </div>
    </section>
  );
}
