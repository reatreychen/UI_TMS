"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAppDispatch } from "@/src/store/hooks";
import { registerThunk } from "@/src/store/slices/authSlice";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const triggerToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await dispatch(registerThunk({ fullName, email, password })).unwrap();
      triggerToast("Account created successfully! Redirecting to sign in...", "success");

      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (err: any) {
      triggerToast(typeof err === "string" ? err : err?.message || "Registration failed. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-body-md text-body-md text-on-surface min-h-screen flex flex-col bg-surface-dim">
      {/* Main Content: Registration Canvas */}
      <main className="flex-grow flex items-center justify-center px-container-margin py-stack-lg relative overflow-hidden">
        {/* Subtle Atmospheric Background Detail */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
          <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[500px] h-[500px] bg-secondary-container/10 rounded-full blur-[100px]" />
        </div>
        {/* Registration Card */}
        <div className="w-full max-w-[480px] bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl p-stack-lg z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-stack-lg">
            <h1 className="font-display text-headline-lg text-on-surface font-bold mb-2">
              Create your account
            </h1>
            <p className="text-secondary font-body-md">
              Join Kinetic Enterprise to manage tickets at velocity.
            </p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-stack-md">
            {/* Full Name */}
            <div>
              <label className="block text-label-md font-label-md font-semibold text-on-surface-variant mb-1" htmlFor="name">
                Full Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  person
                </span>
                <input
                  id="name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Johnson"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface placeholder:text-outline font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Work Email */}
            <div>
              <label className="block text-label-md font-label-md font-semibold text-on-surface-variant mb-1" htmlFor="email">
                Work Email
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
                  placeholder="alex@company.com"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface placeholder:text-outline font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-label-md font-label-md font-semibold text-on-surface-variant mb-1" htmlFor="company">
                Company Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  corporate_fare
                </span>
                <input
                  id="company"
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface placeholder:text-outline font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-label-md font-label-md font-semibold text-on-surface-variant mb-1" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface placeholder:text-outline font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              <p className="mt-2 text-[11px] text-secondary leading-tight">
                Must be at least 8 characters including a number and a symbol.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-stack-sm">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-container text-on-primary-container py-3 rounded-lg font-bold text-body-lg hover:bg-primary hover:text-on-primary transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading && <span className="material-symbols-outlined text-sm animate-spin">sync</span>}
                <span>{isLoading ? "Creating account..." : "Create Account"}</span>
              </button>
            </div>
          </form>

          <div className="mt-stack-lg pt-stack-lg border-t border-outline-variant text-center">
            <p className="text-secondary font-body-md">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant w-full">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-container-margin py-stack-lg max-w-[1440px] mx-auto gap-stack-md">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface text-xl">bolt</span>
            <span className="font-display text-body-lg font-bold text-on-surface">
              Kinetic Enterprise
            </span>
          </div>
          <div className="flex gap-stack-lg">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                triggerToast("Privacy Policy documentation");
              }}
              className="font-label-md text-label-md text-secondary hover:text-primary hover:underline transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                triggerToast("Terms of Service documentation");
              }}
              className="font-label-md text-label-md text-secondary hover:text-primary hover:underline transition-colors"
            >
              Terms of Service
            </a>
            <Link
              href="/customer/support"
              className="font-label-md text-label-md text-secondary hover:text-primary hover:underline transition-colors"
            >
              Contact Support
            </Link>
          </div>
          <p className="font-label-md text-label-md text-secondary">
            © 2026 Kinetic Enterprise. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Floating Toast Notification */}
      {showToast && (
        <div className={`fixed bottom-6 right-6 z-50 ${toastType === 'error' ? 'bg-error-container text-on-error-container border border-error/30' : 'bg-inverse-surface text-inverse-on-surface'} px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-200`}>
          <span className={`material-symbols-outlined ${toastType === 'error' ? 'text-error' : 'text-green-400'}`}>
            {toastType === 'error' ? 'error' : 'check_circle'}
          </span>
          <p className="text-body-md font-medium">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
