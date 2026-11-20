"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

// Takes a picture of the live website on the server. Shows the real reason if it fails.
export function CaptureButton({ id, url, onDone, onError }: { id: string; url: string; onDone: (screenshotUrl: string) => void; onError?: (message: string) => void }) {
  const [state, setState] = useState<"idle" | "busy" | "error">("idle");
  async function capture() {
    setState("busy");
    try {
      const { data } = await supabase.auth.getSession();
      const res = await fetch("/api/screenshot", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token}` }, body: JSON.stringify({ id, url }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `Capture failed (${res.status})`);
      onDone(json.url);
      setState("idle");
    } catch (e) {
      setState("error");
      onError?.(`${(e as Error).message}. If capture keeps failing, use “Use the site’s own preview image” or Upload screenshot.`);
    }
  }
  return (
    <button onClick={capture} disabled={state === "busy"} className="bd-gold-40 rounded-full border px-4 py-2 text-sm text-gold disabled:opacity-50">
      {state === "busy" ? "Capturing…" : state === "error" ? "Capture failed, retry" : "Capture screenshot"}
    </button>
  );
}
