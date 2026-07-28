"use client";

import { useState } from "react";
import Link from "next/link";

type Step = "request" | "sent";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<Step>("request");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("sent");
    }, 900);
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-dim font-body-md text-on-background">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 w-full z-50 bg-surface border-b border-outline-variant shadow-xs">
        <div className="flex justify-between items-center w-full px-container-margin py-3.5 max-w-[1440px] mx-auto">
          <Link href="/login" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">bolt</span>
            <span className="font-display text-headline-md font-bold text-primary">
              Kinetic Enterprise
            </span>
          </Link>
          <div className="flex items-center gap-stack-md">
            <Link
              href="/login"
              className="font-body-md text-body-md text-primary font-semibold hover:bg-surface-container-low px-4 py-2 rounded-lg transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-container-margin pt-24 pb-12">
        {/* Atmospheric Background */}
        <div className="fixed top-0 right-0 -z-10 w-1/3 h-1/2 opacity-20 pointer-events-none">
          <div className="w-full h-full blur-[120px] bg-primary rounded-full translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="fixed bottom-0 left-0 -z-10 w-1/4 h-1/3 opacity-10 pointer-events-none">
          <div className="w-full h-full blur-[100px] bg-secondary rounded-full -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-500">
          {step === "request" ? (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-stack-lg shadow-xl">
              {/* Icon header */}
              <div className="flex justify-center mb-stack-lg">
                <div className="h-16 w-16 rounded-full bg-primary-container/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-4xl">lock_reset</span>
                </div>
              </div>

              <div className="text-center mb-stack-lg">
                <h1 className="font-display text-headline-lg text-on-surface font-bold mb-2">
                  Reset your password
                </h1>
                <p className="font-body-md text-body-md text-secondary leading-relaxed">
                  Enter your work email address and we'll send you a secure link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-stack-md">
                <div className="space-y-1">
                  <label className="block font-label-md text-label-md font-semibold text-on-surface-variant" htmlFor="email">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                      mail
                    </span>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface placeholder:text-outline font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-container hover:bg-primary text-on-primary font-bold py-3 rounded-lg transition-all duration-200 active:scale-[0.98] shadow-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading && (
                    <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                  )}
                  <span>{isLoading ? "Sending reset link..." : "Send Reset Link"}</span>
                </button>
              </form>

              <div className="mt-stack-lg text-center">
                <Link href="/login" className="font-body-md text-body-md text-primary font-semibold hover:underline flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            /* Success State */
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-stack-lg shadow-xl text-center">
              <div className="flex justify-center mb-stack-lg">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-600 text-4xl">mark_email_read</span>
                </div>
              </div>

              <h2 className="font-display text-headline-lg text-on-surface font-bold mb-2">
                Check your inbox
              </h2>
              <p className="font-body-md text-body-md text-secondary mb-2 leading-relaxed">
                We've sent a password reset link to
              </p>
              <p className="font-bold text-primary text-body-lg mb-stack-lg">{email}</p>
              <p className="font-body-md text-body-md text-secondary mb-stack-lg leading-relaxed">
                The link will expire in 15 minutes. Check your spam folder if you don't see it.
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => { setStep("request"); setEmail(""); }}
                  className="w-full bg-surface-container-low border border-outline-variant hover:bg-surface-container text-on-surface font-bold py-2.5 rounded-lg transition-all cursor-pointer"
                >
                  Try a different email
                </button>
                <Link
                  href="/login"
                  className="block w-full bg-primary-container hover:bg-primary text-on-primary font-bold py-2.5 rounded-lg transition-all text-center"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}

          {/* Security Badge */}
          <div className="mt-stack-md flex justify-center gap-stack-md opacity-70">
            <div className="flex items-center gap-1 text-secondary">
              <span className="material-symbols-outlined text-sm">lock</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">AES-256 Encrypted</span>
            </div>
            <div className="flex items-center gap-1 text-secondary">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">SOC2 Compliant</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-lowest border-t border-outline-variant">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-container-margin py-stack-lg max-w-[1440px] mx-auto gap-stack-md">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface text-xl">bolt</span>
            <span className="font-display text-body-lg font-bold text-on-surface">Kinetic Enterprise</span>
          </div>
          <div className="flex gap-stack-md">
            <Link href="/customer/support" className="font-label-md text-label-md text-secondary hover:text-primary hover:underline transition-colors">
              Contact Support
            </Link>
            <span className="font-label-md text-label-md text-secondary">·</span>
            <span className="font-label-md text-label-md text-secondary">
              © 2026 Kinetic Enterprise
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
