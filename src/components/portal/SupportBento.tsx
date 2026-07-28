import { ArrowRight, BookOpen, Headphones, Users } from "lucide-react";
import { supportCards as cards } from "@/src/data/knowledgeBase";

export function SupportBento() {
  return (
    <section className="mx-auto max-w-[1440px] px-container-margin py-stack-lg">
      <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="group cursor-pointer rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg shadow-sm transition-shadow hover:shadow-md"
            >
              <div
                className={`mb-stack-md flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${card.iconBg}`}
              >
                <Icon aria-hidden className="size-6" strokeWidth={2} />
              </div>
              <h3 className="mb-stack-sm text-headline-md font-bold">
                {card.title}
              </h3>
              <p className="mb-stack-md text-body-md text-on-surface-variant">
                {card.description}
              </p>
              <div className="flex items-center gap-1 font-bold text-primary text-label-md">
                <span>{card.linkText}</span>
                <ArrowRight
                  aria-hidden
                  className="size-4"
                  strokeWidth={2.5}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
