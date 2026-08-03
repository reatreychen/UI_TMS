"use client";

import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Camera } from "lucide-react";
import { AGENT_PROFILE, JOB_ROLES } from "@/src/constants/agentSettings";

export function SettingsProfileForm() {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: AGENT_PROFILE.name,
    email: AGENT_PROFILE.email,
    role: AGENT_PROFILE.role,
    department: AGENT_PROFILE.department,
    bio: AGENT_PROFILE.bio,
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Profile saved successfully!");
    }, 1200);
  };

  return (
    <div className="flex-1 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
      {/* Card Header */}
      <div className="border-b border-outline-variant p-stack-lg">
        <h2 className="text-headline-md font-headline-md text-on-surface">
          Public Profile
        </h2>
        <p className="text-body-md text-on-surface-variant">
          How others see you across the platform.
        </p>
      </div>

      {/* Profile Form Body */}
      <div className="space-y-stack-lg p-stack-lg">
        {/* Avatar Section */}
        <div className="flex items-center gap-stack-lg">
          <div className="group relative">
            <Image
              src={AGENT_PROFILE.avatarUrl}
              alt="Profile Avatar"
              width={96}
              height={96}
              className="h-24 w-24 rounded-full object-cover ring-4 ring-surface-container-low"
            />
            <div className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera aria-hidden className="size-6 text-white" />
            </div>
          </div>
          <div className="flex gap-stack-md">
            <button className="rounded-lg bg-primary px-4 py-2 font-label-md text-on-primary transition-all hover:opacity-90 active:scale-95">
              Change Photo
            </button>
            <button className="rounded-lg border border-outline-variant px-4 py-2 font-label-md text-on-surface-variant transition-all hover:bg-surface-container-low active:scale-95">
              Remove
            </button>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 gap-stack-lg md:grid-cols-2">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="font-label-md font-semibold text-on-surface">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="font-label-md font-semibold text-on-surface">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Job Role */}
          <div className="space-y-1">
            <label className="font-label-md font-semibold text-on-surface">
              Job Role
            </label>
            <div className="relative">
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {JOB_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                expand_more
              </span>
            </div>
          </div>

          {/* Department */}
          <div className="space-y-1">
            <label className="font-label-md font-semibold text-on-surface">
              Department
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Short Bio — full width */}
          <div className="space-y-1 md:col-span-2">
            <label className="font-label-md font-semibold text-on-surface">
              Short Bio
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="Brief description for internal profile..."
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Form Actions Footer */}
      <div className="flex justify-end gap-stack-md bg-surface-container-low p-stack-lg">
        <button className="rounded-lg px-6 py-2.5 font-bold text-primary transition-all hover:bg-primary/5 active:scale-95">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-primary px-8 py-2.5 font-bold text-on-primary shadow-md shadow-primary/20 transition-all hover:bg-primary-fixed-dim hover:text-on-primary-fixed active:scale-95 disabled:opacity-70"
        >
          {isSaving ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[18px]">
                sync
              </span>
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
}
