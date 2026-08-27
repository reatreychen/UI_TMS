"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { selectUser, setUser } from "@/src/store/slices/authSlice";
import { api } from "@/src/lib/api";
import {
  User as UserIcon,
  Mail,
  Briefcase,
  Key,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Award,
  Clock,
  CheckSquare,
  Sparkles,
  RefreshCw,
  Save,
  Lock,
  Camera,
} from "lucide-react";
import toast from "react-hot-toast";

interface UserProfileData {
  id: string;
  fullName: string;
  email: string;
  profileImage?: string;
  bio?: string;
  jobTitle?: string;
  departmentId?: string;
  roleId?: string;
  role?: { id: string; name: string } | string;
  isActive?: boolean;
  createdAt?: string;
}

export default function AgentProfilePage() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectUser);

  const [activeTab, setActiveTab] = useState<"info" | "security" | "stats">("info");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Profile Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [bio, setBio] = useState("");

function compressImage(file: File, maxWidth = 500, maxHeight = 500, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

  // Image Upload State & Handler
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error("Image file size must be less than 15MB.");
      return;
    }

    setUploadingImage(true);

    try {
      // Compress image client-side to keep payload light (< 50KB) and fast
      const compressedDataUrl = await compressImage(file);
      setProfileImage(compressedDataUrl);

      // Attempt to upload file attachment to backend if available
      try {
        const formData = new FormData();
        formData.append("file", file);
        if (currentUser?.id) {
          const uploadRes = await api.post(
            `/ticket-attachments/upload?uploadedById=${currentUser.id}`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            },
          );
          const uploadedUrl = uploadRes.data?.data?.fileUrl || uploadRes.data?.fileUrl;
          if (uploadedUrl) {
            setProfileImage(uploadedUrl);
          }
        }
      } catch {
        // Keeps compressed data URL if attachment service requires ticketId
      }

      toast.success("Photo selected! Click 'Save Changes' to update your profile.");
    } catch (err) {
      console.error("Failed to process image file", err);
      toast.error("Failed to process image file.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Password Change State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Fetch fresh user profile from API
  const loadProfile = useCallback(async () => {
    if (!currentUser?.id) return;
    setFetching(true);
    try {
      const res = await api.get(`/users/${currentUser.id}`);
      const data: UserProfileData = res.data?.data ?? res.data;

      setFullName(data.fullName || "");
      setEmail(data.email || "");
      setJobTitle(data.jobTitle || "Support Specialist");
      setProfileImage(data.profileImage || "");
      setBio(data.bio || "");
    } catch (err) {
      console.warn("Could not fetch user profile fresh from server, using cached user state.", err);
      if (currentUser) {
        setFullName(currentUser.fullName || "");
        setEmail(currentUser.email || "");
        setJobTitle((currentUser as any).jobTitle || "Support Specialist");
        setProfileImage(currentUser.profileImage || "");
        setBio((currentUser as any).bio || "");
      }
    } finally {
      setFetching(false);
    }
  }, [currentUser]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  // Submit Profile Information Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) {
      toast.error("User session expired. Please log in again.");
      return;
    }

    if (!fullName.trim()) {
      toast.error("Full Name cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        jobTitle: jobTitle.trim() || undefined,
        profileImage: profileImage.trim() || undefined,
        bio: bio.trim() || undefined,
      };

      const res = await api.patch(`/users/${currentUser.id}`, payload);
      const updatedUser = res.data?.data ?? res.data;

      // Update Redux state and localStorage
      const newAuthUser = {
        ...currentUser,
        fullName: updatedUser.fullName || fullName,
        email: updatedUser.email || email,
        profileImage: updatedUser.profileImage || profileImage,
      };
      dispatch(setUser(newAuthUser));

      toast.success("Profile details updated successfully!");
    } catch (err: any) {
      console.error("Failed to update profile", err);
      const msg = err.response?.data?.message || err.message || "Failed to update profile details.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Submit Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;

    if (!oldPassword) {
      toast.error("Please enter your current password.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      await api.patch(`/users/${currentUser.id}/change-password`, {
        oldPassword,
        newPassword,
      });

      toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Failed to change password", err);
      const msg = err.response?.data?.message || err.message || "Failed to change password.";
      toast.error(msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const roleName = typeof currentUser?.role === "object"
    ? (currentUser.role as any)?.name || "Agent"
    : currentUser?.role || "Support Agent";

  if (fetching && !fullName) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <Loader2 className="size-8 animate-spin text-primary" />
        <span className="ml-3 text-body-md text-on-surface-variant font-medium">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Top Header Banner Card ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-md">
        {/* Cover Gradient */}
        <div className="h-36 w-full bg-gradient-to-r from-primary via-primary/80 to-blue-600 p-6 flex justify-between items-start">
          <div className="flex items-center gap-2 text-white/90 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="size-4" />
            <span>Agent Workspace / Profile</span>
          </div>
          <button
            type="button"
            onClick={() => void loadProfile()}
            className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xs transition-colors hover:bg-white/30"
          >
            <RefreshCw className="size-3.5" />
            Refresh
          </button>
        </div>

        {/* Profile Info Overlay Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-6 pb-6 pt-0">
          <div className="flex items-end gap-5 -mt-12">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Profile Avatar */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative group size-24 shrink-0 rounded-2xl border-4 border-surface-container-lowest bg-surface-container-high shadow-lg overflow-hidden cursor-pointer"
              title="Click to upload profile photo"
            >
              {profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profileImage}
                  alt={fullName}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary-container text-2xl font-bold text-on-primary-container">
                  {fullName ? fullName.charAt(0).toUpperCase() : "A"}
                </div>
              )}
              {/* Overlay camera icon */}
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingImage ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : (
                  <>
                    <Camera className="size-6 mb-0.5" />
                    <span className="text-[10px] font-bold">Upload</span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-headline-md font-bold text-on-surface">{fullName || "Agent Name"}</h1>
                <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary border border-primary/20">
                  {roleName}
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-600 border border-green-500/20">
                  <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                  Active
                </span>
              </div>
              <p className="text-body-md text-on-surface-variant flex items-center gap-2">
                <Briefcase className="size-4 text-outline" />
                <span>{jobTitle}</span>
                <span className="text-outline">•</span>
                <Mail className="size-4 text-outline" />
                <span>{email}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-t border-outline-variant bg-surface-container-low px-6">
          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3.5 text-sm font-bold transition-all ${
              activeTab === "info"
                ? "border-primary text-primary bg-surface-container-lowest"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <UserIcon className="size-4" />
            Personal Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3.5 text-sm font-bold transition-all ${
              activeTab === "security"
                ? "border-primary text-primary bg-surface-container-lowest"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <ShieldCheck className="size-4" />
            Security &amp; Password
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("stats")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3.5 text-sm font-bold transition-all ${
              activeTab === "stats"
                ? "border-primary text-primary bg-surface-container-lowest"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Award className="size-4" />
            Performance &amp; Activity
          </button>
        </div>
      </div>

      {/* ── Tab Content Area ────────────────────────────────────────── */}

      {/* TAB 1: Personal Details */}
      {activeTab === "info" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSaveProfile} className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-outline-variant/60 pb-4">
                <div>
                  <h2 className="text-headline-sm font-bold text-on-surface">Edit Profile Information</h2>
                  <p className="text-body-md text-on-surface-variant">Update your public agent details and profile avatar.</p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 font-bold text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  <span>{loading ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-label-md font-semibold text-on-surface">
                    Full Name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 py-2.5 text-body-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Chen Reatrey"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-label-md font-semibold text-on-surface">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 py-2.5 text-body-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="agent@example.com"
                  />
                </div>

                {/* Job Title */}
                <div className="space-y-1.5">
                  <label className="block text-label-md font-semibold text-on-surface">
                    Job Title / Role Title
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 py-2.5 text-body-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Senior Support Specialist"
                  />
                </div>

                {/* Profile Image File Upload */}
                <div className="space-y-1.5 sm:col-span-2 border-t border-outline-variant/40 pt-4 mt-2">
                  <label className="block text-label-md font-semibold text-on-surface">
                    Profile Photo
                  </label>
                  <div className="flex flex-wrap items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/60">
                    <div className="size-16 shrink-0 rounded-xl overflow-hidden border border-outline-variant bg-surface-container-lowest relative shadow-xs">
                      {profileImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profileImage} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl font-bold text-on-surface-variant">
                          {fullName ? fullName.charAt(0).toUpperCase() : "A"}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 flex-1 min-w-[220px]">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="flex items-center gap-2 rounded-lg bg-surface-container-lowest px-4 py-2 text-xs font-bold text-on-surface border border-outline-variant hover:bg-surface-container-high transition-colors shadow-xs cursor-pointer"
                        >
                          {uploadingImage ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4 text-primary" />}
                          <span>{uploadingImage ? "Processing..." : "Upload New Image"}</span>
                        </button>
                        {profileImage && (
                          <button
                            type="button"
                            onClick={() => setProfileImage("")}
                            className="rounded-lg px-3 py-2 text-xs font-semibold text-error hover:bg-error-container/20 transition-colors cursor-pointer"
                          >
                            Remove Photo
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        PNG, JPG, or WEBP files supported (up to 10MB). Image is previewed live and updated on Save.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="block text-label-md font-semibold text-on-surface">
                  Professional Bio / Notes
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full resize-none rounded-lg border border-outline-variant bg-surface-container-lowest p-3.5 text-body-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Tell your team about your expertise, timezone, or support focus area..."
                />
              </div>
            </form>
          </div>

          {/* Sidebar Summary Card */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm space-y-4">
              <h3 className="text-label-md font-bold uppercase tracking-wider text-on-surface-variant">Account Summary</h3>
              <div className="space-y-3 text-body-md">
                <div className="flex justify-between border-b border-outline-variant/40 pb-2">
                  <span className="text-on-surface-variant">Account ID</span>
                  <span className="font-mono text-xs font-semibold text-on-surface">{currentUser?.id?.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between border-b border-outline-variant/40 pb-2">
                  <span className="text-on-surface-variant">System Role</span>
                  <span className="font-semibold text-primary">{roleName}</span>
                </div>
                <div className="flex justify-between border-b border-outline-variant/40 pb-2">
                  <span className="text-on-surface-variant">Account Status</span>
                  <span className="flex items-center gap-1 font-semibold text-green-600">
                    <CheckCircle2 className="size-4" />
                    Verified Active
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Security Policy</span>
                  <span className="font-semibold text-on-surface">SOC2 Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Security & Password */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleChangePassword} className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-outline-variant/60 pb-4">
                <div>
                  <h2 className="text-headline-sm font-bold text-on-surface flex items-center gap-2">
                    <Lock className="size-5 text-primary" />
                    Change Password
                  </h2>
                  <p className="text-body-md text-on-surface-variant">Ensure your account uses a strong, unique password.</p>
                </div>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 font-bold text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {passwordLoading ? <Loader2 className="size-4 animate-spin" /> : <Key className="size-4" />}
                  <span>{passwordLoading ? "Updating..." : "Update Password"}</span>
                </button>
              </div>

              <div className="space-y-4 max-w-md">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <label className="block text-label-md font-semibold text-on-surface">
                    Current Password <span className="text-error">*</span>
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 py-2.5 text-body-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="••••••••••••"
                  />
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="block text-label-md font-semibold text-on-surface">
                    New Password <span className="text-error">*</span>
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 py-2.5 text-body-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="At least 6 characters"
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="block text-label-md font-semibold text-on-surface">
                    Confirm New Password <span className="text-error">*</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 py-2.5 text-body-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm space-y-4">
              <h3 className="text-label-md font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
                <ShieldCheck className="size-4 text-green-600" />
                Security Gateway
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Your account is protected by Kinetic Security Shield with active token refresh interceptors and session auditing.
              </p>
              <div className="rounded-xl bg-surface-container-low p-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Multi-Factor Auth</span>
                  <span className="font-semibold text-green-600">Enabled</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Last Session Check</span>
                  <span className="font-semibold text-on-surface">Just Now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Performance & Activity */}
      {activeTab === "stats" && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-xs">
              <div className="flex items-center justify-between text-on-surface-variant mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Tickets Resolved</span>
                <CheckSquare className="size-5 text-primary" />
              </div>
              <p className="text-headline-lg font-bold text-on-surface">342</p>
              <p className="text-xs font-semibold text-green-600 mt-1">↑ 18% this month</p>
            </div>

            <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-xs">
              <div className="flex items-center justify-between text-on-surface-variant mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Avg. Response Time</span>
                <Clock className="size-5 text-blue-600" />
              </div>
              <p className="text-headline-lg font-bold text-on-surface">14m</p>
              <p className="text-xs font-semibold text-green-600 mt-1">Faster than SLA goal</p>
            </div>

            <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-xs">
              <div className="flex items-center justify-between text-on-surface-variant mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Customer Rating (CSAT)</span>
                <Award className="size-5 text-amber-500" />
              </div>
              <p className="text-headline-lg font-bold text-on-surface">4.9 / 5.0</p>
              <p className="text-xs font-semibold text-green-600 mt-1">98.4% positive ratings</p>
            </div>

            <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-xs">
              <div className="flex items-center justify-between text-on-surface-variant mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">SLA Adherence</span>
                <ShieldCheck className="size-5 text-purple-600" />
              </div>
              <p className="text-headline-lg font-bold text-on-surface">99.2%</p>
              <p className="text-xs font-semibold text-green-600 mt-1">Exceeds 95% target</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
