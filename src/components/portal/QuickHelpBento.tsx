import Image from "next/image";
import { ArrowRight } from "lucide-react";

const KB_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDnhbEWUmrhkUaHHffAR4bJLqtroVCC2OySGIBgu0lnr7-7V7hNg5KnMk1gi5_2hqNA7QEyrBH5gbOhAoinfsb324Y8r56O2-inOxwPM1xhpn8L8QYuevsu2s0gz_KgQBAykIco6OwN6dE__sgm5TXiL-VIJvzDucbRBNphz6znIF1hdNuicjsv-sZUnAjTdT23XMK8tOWdfVNA8gZFpd12JT2OEJgi3HMqotvP1TgZ5oK_ur2OMqPraGC66jo938OVYrLW3sNhsZpZ";

export function QuickHelpBento() {
  return (
    <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
      {/* Knowledge base card — spans 2/3 */}
      <div className="flex flex-col items-center gap-8 rounded-xl border border-outline-variant bg-surface-container-lowest p-8 sm:flex-row md:col-span-2">
        <div className="flex-shrink-0">
          <Image
            src={KB_IMAGE}
            alt="A 3D illustration of a digital shield and lightbulbs representing security and bright ideas"
            width={128}
            height={128}
            className="h-32 w-32 object-contain"
          />
        </div>
        <div className="space-y-4">
          <h3 className="text-headline-md font-semibold text-on-surface">
            Self-Service Knowledge Base
          </h3>
          <p className="text-body-md text-on-surface-variant">
            Find answers instantly. Our library contains over 500 articles
            covering troubleshooting, account settings, and API documentation.
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 font-bold text-primary"
          >
            <span>Browse Articles</span>
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform group-hover:translate-x-1"
              strokeWidth={2.5}
            />
          </a>
        </div>
      </div>

      {/* Live chat card */}
      <div className="flex flex-col justify-between rounded-xl bg-primary-container p-8 text-on-primary">
        <div>
          <h3 className="mb-2 text-headline-md font-semibold">
            Need a Live Agent?
          </h3>
          <p className="text-body-md opacity-90">
            Instant chat is available for Enterprise Tier customers during
            business hours.
          </p>
        </div>
        <button
          type="button"
          className="mt-6 w-full rounded-lg bg-on-primary py-3 font-bold text-primary transition-all hover:bg-opacity-90 active:scale-95"
        >
          Start Live Chat
        </button>
      </div>
    </div>
  );
}
