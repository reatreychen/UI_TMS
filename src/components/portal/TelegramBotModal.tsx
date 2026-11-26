"use client";

import { useState, useEffect, useCallback } from "react";
import { Send, CheckCircle2, RefreshCw, X, MessageSquare, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchTelegramStatus,
  sendTelegramTestMessage,
  setTelegramChatId,
  discoverTelegramChatId,
} from "@/src/services/portalService";

interface TelegramBotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TelegramBotModal({ isOpen, onClose }: TelegramBotModalProps) {
  const [sendingTest, setSendingTest] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [botInfo, setBotInfo] = useState<{ firstName?: string; username?: string } | null>(null);
  const [chatId, setChatIdInput] = useState("");

  const loadStatus = useCallback(async () => {
    try {
      const data = await fetchTelegramStatus();
      setBotInfo(data.botInfo || null);
      if (data.targetChatId) {
        setChatIdInput(data.targetChatId);
      } else {
        const disc = await discoverTelegramChatId();
        if (disc.chatId) {
          setChatIdInput(disc.chatId);
        }
      }
    } catch (err) {
      console.error("Failed to load Telegram status", err);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setTimeout(() => {
      void loadStatus();
    }, 0);

    // Auto poll for chat ID every 3 seconds while modal is open
    const interval = setInterval(async () => {
      try {
        const res = await discoverTelegramChatId();
        if (res.chatId) {
          setChatIdInput((prev) => {
            if (!prev) {
              toast.success(`Chat ID connected: ${res.chatId}`);
            }
            return res.chatId;
          });
        }
      } catch {
        // Silent poll error
      }
    }, 3000);

    return () => {
      window.clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isOpen, loadStatus]);

  const handleSaveChatId = async () => {
    if (!chatId.trim()) {
      toast.error("Please enter a valid Chat ID.");
      return;
    }
    try {
      await setTelegramChatId(chatId.trim());
      toast.success("Telegram Chat ID saved!");
    } catch (err) {
      console.error("Failed to save Chat ID", err);
      toast.error("Failed to save Chat ID.");
    }
  };

  const handleDiscover = async () => {
    setDiscovering(true);
    try {
      const res = await discoverTelegramChatId();
      if (res.chatId) {
        setChatIdInput(res.chatId);
        toast.success(`Discovered Chat ID: ${res.chatId}`);
      } else {
        toast("No Telegram message detected yet. Click 'Open Telegram App' below and press START!", {
          icon: "💡",
          duration: 6000,
        });
      }
    } catch (err) {
      console.error("Failed to discover chat ID", err);
      toast.error("Discovery failed. Make sure bot is active.");
    } finally {
      setDiscovering(false);
    }
  };

  const handleSendTest = async () => {
    setSendingTest(true);
    try {
      const res = await sendTelegramTestMessage(chatId.trim() || undefined);
      if (res.success) {
        toast.success("Test notification sent to Telegram!");
        if (res.chatId) setChatIdInput(res.chatId);
      } else {
        toast.error(res.message || "Failed to send test message.");
      }
    } catch (err) {
      console.error("Failed to send test message", err);
      toast.error("Error connecting to Telegram Bot API.");
    } finally {
      setSendingTest(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant relative overflow-hidden animate-in zoom-in-95 duration-200 ease-out transform-gpu"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-sky-50 text-sky-600">
              <MessageSquare className="size-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-on-surface">
                Telegram Bot Integration
              </h2>
              <p className="text-xs text-on-surface-variant">
                Real-time Ticket Notifications via Telegram
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Bot Info Status Card */}
        <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-900 uppercase tracking-wider">
              Bot Status
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="size-3.5" />
              Connected
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-on-surface-variant">Bot Name:</span>
            <span className="font-semibold text-on-surface">
              {botInfo?.firstName || "TMS Bot"}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-on-surface-variant">Bot Handle:</span>
            <span className="font-mono font-bold text-sky-700">
              @{botInfo?.username || "TmsmessageBot"}
            </span>
          </div>
        </div>

        {/* Direct Link Banner */}
        <div className="mb-5 p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between gap-3">
          <div className="text-xs text-sky-900">
            <p className="font-bold">Step 1: Activate Bot</p>
            <p className="text-sky-700">Click below to open Telegram and press <strong>START</strong>.</p>
          </div>
          <a
            href={`https://t.me/${botInfo?.username || "TmsmessageBot"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 transition-all flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
          >
            <span>Open Telegram App</span>
            <ExternalLink className="size-3.5" />
          </a>
        </div>

        {/* Setup Info */}
        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-on-surface">
                Connected Telegram Chat ID:
              </label>
              {chatId && (
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="size-3" /> Auto-detected
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatIdInput(e.target.value)}
                placeholder="Click 'Auto Discover' or type Chat ID"
                className="flex-1 px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              />
              <button
                type="button"
                onClick={handleDiscover}
                disabled={discovering}
                title="Auto Discover Chat ID from recent messages"
                className="px-3.5 py-2.5 rounded-xl border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`size-3.5 ${discovering ? "animate-spin" : ""}`} />
                <span>{discovering ? "Checking..." : "Auto Discover"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant">
          <button
            type="button"
            onClick={handleSaveChatId}
            className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface font-bold text-xs hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            Save Chat ID
          </button>
          <button
            type="button"
            onClick={handleSendTest}
            disabled={sendingTest}
            className="px-5 py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {sendingTest ? (
              <RefreshCw className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}
            <span>{sendingTest ? "Sending..." : "Send Test Message"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
