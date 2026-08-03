import Link from "next/link";
import { BookOpen, ShieldCheck, HelpCircle } from "lucide-react";
import { resources } from "@/src/constants/knowledgeBase";

export function CreateTicketSidebar() {
  return (
    <aside className="lg:col-span-4 flex flex-col gap-stack-lg">
      {/* Helpful Resources Card */}
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low">
        {/* Card Header */}
        <div className="flex items-center gap-2 border-b border-outline-variant bg-surface-container-high px-stack-md py-stack-sm">
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <span
            className="material-symbols-outlined text-primary"
            aria-hidden="true"
          >
            auto_stories
          </span>
          <h3 className="text-headline-md font-semibold">Helpful Resources</h3>
        </div>

        {/* Resource Links */}
        <div className="space-y-stack-sm p-stack-md">
          {resources.map(({ icon: Icon, title, description, href }) => (
            <Link
              key={title}
              href={href}
              className="group flex items-start gap-stack-sm rounded-lg p-stack-sm transition-all hover:bg-surface-container-lowest"
            >
              <Icon
                className="mt-0.5 size-5 shrink-0 text-on-surface-variant transition-colors group-hover:text-primary"
                aria-hidden
                strokeWidth={2}
              />
              <div className="space-y-base">
                <p className="text-body-md font-bold text-on-surface">
                  {title}
                </p>
                <p className="text-label-md text-on-surface-variant">
                  {description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="border-t border-outline-variant bg-surface-container-lowest px-stack-md py-stack-sm">
          <Link
            href="/customer/knowledge-base"
            className="block w-full text-center text-body-md font-bold text-primary hover:underline"
          >
            View Full Knowledge Base
          </Link>
        </div>
      </div>

      {/* Pro-Tip Banner Card */}
      <div className="group relative h-48 cursor-pointer overflow-hidden rounded-xl shadow-sm">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkMTJxVjr6-58BjRKhtxQKOnBmh2r5040ofE_PIppH94X2DfHC11PD4-TeQMzUD5uS8sK07ong_8H3DMGw0xC4Q306eV_vrkmffwKEdzuhLu8lVH3jiBwcC-bD4uFbOYHbDxluFlCj8jl8n35aIg12crSizjczYOcIn2-DbYM9kyi3Ad9rgTL5cr0Wu3ov2Gg6Slay09bbuMMXyodjiODWwuMw2uEhf2Xwk-Fq7F8l60K5h8LNWeOKzloVkrql9P-jcThJObUNTtwY"
          alt="Professional support workspace showing keyboard and dashboard"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
        <div className="absolute bottom-0 left-0 p-stack-md text-white">
          <p className="text-label-md font-bold uppercase tracking-wider opacity-80">
            PRO TIP
          </p>
          <h4 className="text-headline-md font-semibold">
            Attach logs for faster resolution
          </h4>
        </div>
      </div>
    </aside>
  );
}
