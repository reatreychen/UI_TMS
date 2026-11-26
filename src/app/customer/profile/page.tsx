"use client";

import { useState } from "react";
import Link from "next/link";
import { TopNav } from "@/src/components/portal/TopNav";
import { PortalFooter } from "@/src/components/portal/PortalFooter";
import { useAppSelector } from "@/src/store/hooks";
import { selectUser, selectRoleName } from "@/src/store/slices/authSlice";
import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute";

export default function CustomerProfilePage() {
  const currentUser = useAppSelector(selectUser);
  const userRole = useAppSelector(selectRoleName);

  const [fullNameDraft, setFullNameDraft] = useState<string | null>(null);
  const [emailDraft, setEmailDraft] = useState<string | null>(null);
  const [phone, setPhone] = useState("+855 12 345 678");
  const [organization, setOrganization] = useState("Enterprise Customer");
  const [language, setLanguage] = useState("English (US)");
  const [timezone, setTimezone] = useState("Asia/Phnom_Penh (GMT+7)");

  const fullName = fullNameDraft ?? currentUser?.fullName ?? "";
  const email = emailDraft ?? currentUser?.email ?? "";

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast("Profile details updated successfully!");
  };

  return (
    <ProtectedRoute allowedRoles={["customer", "agent", "admin"]}>
      <div className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col justify-between">
        <div>
          <TopNav activePage="settings" />

          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
              <div>
                <Link
                  href="/customer/my-ticket"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-3"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  Back to My Tickets
                </Link>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                  Account &amp; Profile
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Manage your contact details, regional settings, and support preferences.
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold uppercase tracking-wider self-start sm:self-auto">
                {userRole}
              </span>
            </div>

            {/* Profile Overview Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-blue-600 text-white text-2xl font-bold flex items-center justify-center shadow-xs overflow-hidden flex-shrink-0">
                {currentUser?.profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={currentUser.profileImage} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  fullName[0]?.toUpperCase() || "C"
                )}
              </div>
              <div className="text-center sm:text-left space-y-1.5 min-w-0">
                <h2 className="font-display text-xl font-bold text-slate-900 truncate">
                  {fullName || "Customer Account"}
                </h2>
                <p className="text-sm text-slate-500 font-mono truncate">{email}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-blue-600">domain</span>
                    {organization}
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    Account Active
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Form */}
            <form
              onSubmit={handleSaveProfile}
              className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-6"
            >
              <div className="border-b border-slate-200 pb-4 flex items-center gap-2.5">
                <span className="material-symbols-outlined text-blue-600 text-[22px]">person</span>
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Personal &amp; Contact Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullNameDraft(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmailDraft(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Organization / Enterprise
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Preferred Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none cursor-pointer"
                  >
                    <option>English (US)</option>
                    <option>Khmer (Cambodia)</option>
                    <option>French (FR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none cursor-pointer"
                  >
                    <option>Asia/Phnom_Penh (GMT+7)</option>
                    <option>UTC (GMT+0)</option>
                    <option>America/New_York (EST)</option>
                  </select>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </main>
        </div>

        {showToast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-lg border border-slate-800 text-sm font-medium">
            <span className="material-symbols-outlined text-emerald-400 text-[20px]">check_circle</span>
            <span>{toastMsg}</span>
          </div>
        )}

        <PortalFooter />
      </div>
    </ProtectedRoute>
  );
}
