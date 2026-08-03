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

  const handleCopy = () => {
    // In a real app, copy to clipboard here
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-8 shadow-sm lg:w-2/3">
      <article className="article-content">
        <h1 className="mb-4 text-headline-lg font-bold text-on-background">
          {ARTICLE_DETAIL.title}
        </h1>

        {/* Article Meta */}
        <div className="mb-8 flex flex-wrap items-center gap-6 border-b border-outline-variant pb-6 text-label-md text-secondary">
          <div className="flex items-center gap-2">
            <Calendar aria-hidden className="size-4.5" strokeWidth={2} />
            <span>Last updated: {ARTICLE_DETAIL.lastUpdated}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock aria-hidden className="size-4.5" strokeWidth={2} />
            <span>{ARTICLE_DETAIL.readTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 overflow-hidden rounded-full bg-surface-dim">
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
        <p className="text-body-lg text-on-surface-variant">
          Automated escalation ensures that high-priority tickets are handled by
          the appropriate personnel within your defined Service Level Agreements
          (SLAs). This guide covers the end-to-end setup of escalation triggers
          and action sequences in Kinetic TMS.
        </p>

        <h2 id="understanding-workflow-triggers">
          Understanding Workflow Triggers
        </h2>
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
        <div className="mb-8 overflow-hidden rounded-lg bg-on-background p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-code text-label-md text-surface-container-highest">
              workflow.json
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-label-md text-outline-variant transition-colors hover:text-white"
            >
              {copied ? (
                <>
                  <Check aria-hidden className="size-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy aria-hidden className="size-4" />
                  Copy Code
                </>
              )}
            </button>
          </div>
          <pre className="overflow-x-auto font-code text-code text-primary-fixed">
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
          synchronize permissions will result in an "Access Denied" error for
          the escalated agents.
        </p>

        {/* Helpful Section */}
        <div className="mt-12 flex flex-col items-center gap-4 border-t border-outline-variant pt-8">
          <p className="text-headline-md font-semibold text-on-background">
            Was this article helpful?
          </p>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 rounded-full border border-outline px-6 py-2 transition-all hover:bg-surface-container-low">
              <ThumbsUp aria-hidden className="size-5 text-primary" />
              <span className="text-body-md font-semibold text-secondary">
                Yes
              </span>
            </button>
            <button className="flex items-center gap-2 rounded-full border border-outline px-6 py-2 transition-all hover:bg-surface-container-low">
              <ThumbsDown aria-hidden className="size-5 text-error" />
              <span className="text-body-md font-semibold text-secondary">
                No
              </span>
            </button>
          </div>
          <p className="mt-2 text-label-md text-outline">
            {ARTICLE_DETAIL.helpfulCount} people found this helpful
          </p>
        </div>
      </article>
    </div>
  );
}
