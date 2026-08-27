"use client";

import { useState } from "react";
import { TopNav } from "@/src/components/portal/TopNav";
import { PortalFooter } from "@/src/components/portal/PortalFooter";
import { useAppSelector } from "@/src/store/hooks";
import { selectUser, selectRoleName } from "@/src/store/slices/authSlice";

export default function CustomerProfilePage() {
  const currentUser = useAppSelector(selectUser);
  const userRole = useAppSelector(selectRoleName);

  const [fullName, setFullName] = useState(currentUser?.fullName || "Chhun Makara");
  const [email, setEmail] = useState(currentUser?.email || "makarachhun59@gmail.com");
  const [phone, setPhone] = useState("+855 12 345 678");
  const [organization, setOrganization] = useState("Enterprise Customer");
  const [language, setLanguage] = useState("English (US)");
  const [timezone, setTimezone] = useState("Asia/Phnom_Penh (GMT+7)");
  
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
    <div className="min-h-screen bg-background text-on-surface font-body-md antialiased flex flex-col justify-between">
      <div>
        <TopNav activePage="settings" />

        <main className="max-w-4xl mx-auto px-container-margin py-12 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-6">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-on-surface">
                Customer Profile
              </h1>
              <p className="text-body-md text-on-surface-variant mt-1">
                Manage your personal contact details, security settings, and notification preferences.
              </p>
            </div>
            <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase tracking-wider self-start sm:self-auto">
              {userRole}
            </span>
          </div>

          {/* Profile Overview Card */}
          <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary text-white text-2xl font-bold flex items-center justify-center shadow-md overflow-hidden flex-shrink-0">
              {currentUser?.profileImage ? (
                <img src={currentUser.profileImage} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                fullName[0]?.toUpperCase() || "C"
              )}
            </div>
            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-xl font-bold text-on-surface">{fullName}</h2>
              <p className="text-sm text-on-surface-variant font-mono">{email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <span className="px-2.5 py-0.5 bg-surface-container-high rounded text-xs font-medium text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-primary">domain</span>
                  {organization}
                </span>
                <span className="px-2.5 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded text-xs font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                  Account Active
                </span>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSaveProfile} className="bg-white border border-outline-variant rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
            <h3 className="font-bold text-lg text-on-surface border-b border-outline-variant pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person</span>
              Personal &amp; Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-body-md bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-body-md bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-body-md bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">
                  Organization / Enterprise
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-body-md bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">
                  Preferred Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-body-md bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer"
                >
                  <option>English (US)</option>
                  <option>Khmer (Cambodia)</option>
                  <option>French (FR)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-body-md bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer"
                >
                  <option>Asia/Phnom_Penh (GMT+7)</option>
                  <option>UTC (GMT+0)</option>
                  <option>America/New_York (EST)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant flex items-center justify-end gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all cursor-pointer active:scale-95"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </main>
      </div>

      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-inverse-surface text-inverse-on-surface px-5 py-3 rounded-xl shadow-2xl animate-in slide-in-from-bottom duration-200">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <p className="text-body-md font-medium">{toastMsg}</p>
        </div>
      )}

      <PortalFooter />
    </div>
  );
}
