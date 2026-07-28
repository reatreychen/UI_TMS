"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { popularSearches } from "@/src/data/knowledgeBase";

export function KnowledgeHeroSearch() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  return (
    <section className="relative w-full overflow-hidden rounded-xl bg-primary-container text-on-primary-container mb-stack-lg">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/30 blur-3xl" />
        <div className="absolute -bottom-10 -right-10 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-[320px] flex-col items-center justify-center p-8 text-center">
        <div className="w-full max-w-2xl">
          <h1 className="mb-stack-sm text-display font-bold leading-tight">
            How can we help you today?
          </h1>
          <p className="mb-stack-lg text-body-lg opacity-90">
            Search our comprehensive library of documentation, tutorials, and
            community-driven solutions.
          </p>

          {/* Search Bar */}
          <div
            className={`flex gap-2 rounded-lg border bg-white p-1.5 shadow-lg transition-all duration-200 ${
              focused
                ? "border-white ring-4 ring-white/20"
                : "border-white/20"
            }`}
          >
            <div className="flex flex-1 items-center px-4">
              <Search
                aria-hidden
                className="mr-3 size-5 shrink-0 text-outline"
                strokeWidth={2}
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Search for articles, guides, and FAQs..."
                className="w-full border-none bg-transparent py-3 text-body-lg text-on-surface focus:outline-none focus:ring-0"
              />
            </div>
            <button
              type="button"
              className="rounded-lg bg-primary px-8 py-3 text-label-md font-bold text-on-primary shadow-md transition-all hover:brightness-110 active:scale-95"
            >
              Search
            </button>
          </div>

          {/* Popular Searches */}
          <div className="mt-stack-md flex flex-wrap items-center justify-center gap-stack-sm">
            <span className="text-label-md opacity-70">Popular:</span>
            {popularSearches.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setQuery(term)}
                className="text-label-md underline underline-offset-4 opacity-90 transition-opacity hover:opacity-100"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
