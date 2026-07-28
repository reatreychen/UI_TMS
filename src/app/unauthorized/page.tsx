"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-surface-dim flex flex-col items-center justify-center px-container-margin font-body-md text-on-background">
      {/* Atmospheric Background */}
      <div className="fixed top-0 right-0 -z-10 w-1/3 h-1/2 opacity-10 pointer-events-none">
        <div className="w-full h-full blur-[120px] bg-error rounded-full translate-x-1/2 -translate-y-1/2" />
      </div>
      <div className="fixed bottom-0 left-0 -z-10 w-1/4 h-1/3 opacity-10 pointer-events-none">
        <div className="w-full h-full blur-[100px] bg-secondary rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="w-full max-w-[480px] bg-surface-container-lowest rounded-xl border border-outline-variant p-stack-lg shadow-xl text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Error Icon */}
        <div className="flex justify-center mb-stack-lg">
          <div className="h-20 w-20 rounded-full bg-error-container flex items-center justify-center">
            <span className="material-symbols-outlined text-error text-5xl">gpp_bad</span>
          </div>
        </div>

        {/* Error Code */}
        <p className="font-code text-label-md text-on-surface-variant font-semibold tracking-widest uppercase mb-2">
          Error 403 · Access Denied
        </p>

        <h1 className="font-display text-headline-lg font-bold text-on-surface mb-3">
          Unauthorized Access
        </h1>

        <p className="font-body-md text-body-md text-secondary leading-relaxed mb-stack-lg">
          You don't have the required permissions to view this resource.
          Please contact your administrator if you believe this is a mistake.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low hover:bg-surface-container text-on-surface font-bold transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Go Back
          </button>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-bold transition-all"
          >
            <span className="material-symbols-outlined text-sm">login</span>
            Sign In
          </Link>
        </div>

        {/* Divider */}
        <div className="mt-stack-lg pt-stack-md border-t border-outline-variant">
          <p className="font-body-md text-body-md text-secondary">
            Need help?{" "}
            <Link href="/customer/support" className="text-primary font-bold hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>

      {/* Brand Footer Mark */}
      <div className="mt-stack-lg flex items-center gap-2 opacity-60">
        <span className="material-symbols-outlined text-on-surface-variant text-lg">bolt</span>
        <span className="font-display text-body-md font-bold text-on-surface-variant">
          Kinetic Enterprise
        </span>
      </div>
    </div>
  );
}
