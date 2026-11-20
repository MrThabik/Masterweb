"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Anonymous visit counter (no cookies, no IP address stored). Skips Developer Space, the editor preview and "Do Not Track".
export default function Tracker({ enabled }: { enabled: boolean }) {
  const path = usePathname();
  useEffect(() => {
    if (!enabled || path.startsWith("/developer") || window.parent !== window || navigator.doNotTrack === "1") return;
    let vid = "";
    try { vid = localStorage.getItem("vid") || ""; if (!vid) { vid = crypto.randomUUID(); localStorage.setItem("vid", vid); } } catch { return; }
    fetch("/api/track", { method: "POST", keepalive: true, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path, ref: document.referrer, vid, lang: document.documentElement.lang }) }).catch(() => {});
  }, [path, enabled]);
  return null;
}
