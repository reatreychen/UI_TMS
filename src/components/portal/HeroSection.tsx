"use client";

import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";
import { useAppSelector } from "@/src/store/hooks";
import { selectUser } from "@/src/store/slices/authSlice";

export function HeroSection() {
  const currentUser = useAppSelector(selectUser);

  return (
    <section className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 soft-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-2 max-w-2xl">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden />
          Customer Support Portal
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {currentUser?.fullName
            ? `Welcome back, ${currentUser.fullName}`
            : "My Support Tickets"}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Track active ticket progress, reply to assigned specialists, and review resolved requests in one place.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 shrink-0">
        <Link
          href="/customer/create-ticket"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-2xs transition-colors"
        >
          <Plus className="size-4" aria-hidden />
          New Support Ticket
        </Link>

        <Link
          href="/customer/knowledge-base"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors"
        >
          <BookOpen className="size-4 text-slate-500" aria-hidden />
          Help Center
        </Link>
      </div>
    </section>
  );
}
