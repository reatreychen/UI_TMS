"use client";

import { useState } from "react";
import { SettingsSubNav } from "./SettingsSubNav";
import { SettingsProfileForm } from "./SettingsProfileForm";

function PlaceholderPanel({ title }: { title: string }) {
  return (
    <div className="flex flex-1 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg shadow-sm">
      <div className="text-center">
        <span className="material-symbols-outlined mb-4 text-[48px] text-outline">
          construction
        </span>
        <h3 className="text-headline-md font-headline-md text-on-surface">
          {title}
        </h3>
        <p className="mt-2 text-body-md text-on-surface-variant">
          This section is coming soon.
        </p>
      </div>
    </div>
  );
}

export function SettingsView() {
  const [activeSection, setActiveSection] = useState("profile");

  const renderPanel = () => {
    switch (activeSection) {
      case "profile":
        return <SettingsProfileForm />;
      case "notifications":
        return <PlaceholderPanel title="Notification Preferences" />;
      case "security":
        return <PlaceholderPanel title="Security & Privacy" />;
      case "preferences":
        return <PlaceholderPanel title="System Preferences" />;
      default:
        return <SettingsProfileForm />;
    }
  };

  return (
    <div className="flex flex-col gap-stack-lg md:flex-row">
      <SettingsSubNav
        activeSection={activeSection}
        onSelect={setActiveSection}
      />
      {renderPanel()}
    </div>
  );
}
