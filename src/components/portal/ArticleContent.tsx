"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Calendar,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
} from "lucide-react";
import { ARTICLE_DETAIL } from "@/src/constants/articleDetail";

export function ArticleContent() {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`{
  "escalation_rule": {
    "id": "esc_tier2_001",
    "trigger": "sla_breach_warning",
    "threshold_percent": 85,
    "actions": [
      { "type": "reassign", "target": "tier_2_support" },
      { "type": "notify", "channel": "slack", "priority": "high" }
    ],
    "logging": "verbose"
  }
}`).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs lg:w-2/3">
      <article className="article-content">
        <h1 className="font-display mb-4 text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
          {ARTICLE_DETAIL.title}
        </h1>

        {/* Article Meta */}
        <div className="mb-7 flex flex-wrap items-center gap-5 border-b border-slate-200 pb-5 text-xs sm:text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <Calendar aria-hidden className="size-4 text-slate-400" strokeWidth={2} />
            <span>Last updated: {ARTICLE_DETAIL.lastUpdated}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock aria-hidden className="size-4 text-slate-400" strokeWidth={2} />
            <span>{ARTICLE_DETAIL.readTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
              <Image
                src={ARTICLE_DETAIL.author.avatarUrl}
                alt={ARTICLE_DETAIL.author.name}
                width={20}
                height={20}
                className="h-full w-full object-cover"
              />
            </div>
            <span>By {ARTICLE_DETAIL.author.name}</span>
          </div>
        </div>

        {/* Main Content */}
        <p className="text-base text-slate-700 leading-relaxed">
          Automated escalation ensures that high-priority tickets are handled by
          the appropriate personnel within your defined Service Level Agreements
          (SLAs). This guide covers the end-to-end setup of escalation triggers
          and action sequences in Kinetic TMS.
        </p>

        <h2 id="understanding-workflow-triggers">Understanding Workflow Triggers</h2>
        <p>
          Escalations in Kinetic TMS are event-driven. You can configure
          triggers based on ticket properties, time-based thresholds, or manual
          intervention indicators. Most enterprises prioritize time-based
          escalations to prevent SLA breaches.
        </p>

        <h3 id="common-trigger-types">Common Trigger Types</h3>
        <ul>
          <li>
            <strong>Unassigned Duration:</strong> Trigger when a ticket remains
            unassigned for more than 15 minutes.
          </li>
          <li>
            <strong>Idle Customer Response:</strong> Trigger when a high-priority
            customer has not received a reply within 2 hours.
          </li>
          <li>
            <strong>SLA Criticality:</strong> Auto-escalate to Tier 3 when 80%
            of the resolution time has elapsed.
          </li>
        </ul>

        <h2 id="technical-implementation">Technical Implementation</h2>
        <p>
          To implement a custom escalation logic using the Kinetic API or CLI,
          use the following configuration structure in your <code>workflow.json</code>{" "}
          definition:
        </p>

        {/* Code Block */}
        <div className="mb-8 overflow-hidden rounded-xl bg-slate-900 p-5 border border-slate-800">
          <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="font-mono text-xs text-slate-300">workflow.json</span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-300 transition-colors hover:text-white cursor-pointer"
            >
              {copied ? (
                <>
                  <Check aria-hidden className="size-3.5 text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy aria-hidden className="size-3.5" />
                  Copy Code
                </>
              )}
            </button>
          </div>
          <pre className="overflow-x-auto font-mono text-xs sm:text-sm text-blue-200 leading-relaxed">
            <code>{`{
  "escalation_rule": {
    "id": "esc_tier2_001",
    "trigger": "sla_breach_warning",
    "threshold_percent": 85,
    "actions": [
      { "type": "reassign", "target": "tier_2_support" },
      { "type": "notify", "channel": "slack", "priority": "high" }
    ],
    "logging": "verbose"
  }
}`}</code>
          </pre>
        </div>

        <p>
          Ensure that the <code>target</code> group has the appropriate
          permissions to view and modify tickets in the new queue. Failure to
          synchronize permissions will result in an &ldquo;Access Denied&rdquo; error for
          the escalated agents.
        </p>

        {/* Helpful Section */}
        <div className="mt-10 flex flex-col items-center gap-3 border-t border-slate-200 pt-7">
          <p className="font-display text-base font-bold text-slate-900">
            Was this article helpful?
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFeedback("yes")}
              className={`flex items-center gap-2 rounded-xl border px-5 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                feedback === "yes"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <ThumbsUp aria-hidden className="size-4 text-blue-600" />
              <span>Yes</span>
            </button>
            <button
              type="button"
              onClick={() => setFeedback("no")}
              className={`flex items-center gap-2 rounded-xl border px-5 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                feedback === "no"
                  ? "border-red-300 bg-red-50 text-red-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <ThumbsDown aria-hidden className="size-4 text-slate-500" />
              <span>No</span>
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {feedback === "yes"
              ? "Thanks for your feedback!"
              : `${ARTICLE_DETAIL.helpfulCount} people found this helpful`}
          </p>
        </div>
      </article>
    </div>
  );
}
