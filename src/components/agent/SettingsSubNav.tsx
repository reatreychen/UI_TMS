"use client";

import { SETTINGS_SUB_NAV } from "@/src/constants/agentSettings";

interface SettingsSubNavProps {
  activeSection: string;
  onSelect: (id: string) => void;
}

export function SettingsSubNav({ activeSection, onSelect }: SettingsSubNavProps) {
  return (
    <nav className="flex w-full flex-col gap-1 md:w-64">
      {SETTINGS_SUB_NAV.map((item) => {
        const isActive = activeSection === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`flex items-center gap-3 border-l-4 px-4 py-3 text-left transition-all ${
              isActive
                ? "border-primary bg-primary/5 font-bold text-primary"
                : "border-transparent text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={
                isActive
                  ? { fontVariationSettings: "'FILL' 1" }
                  : undefined
              }
            >
              {item.icon}
            </span>
            <span className="text-body-md">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
