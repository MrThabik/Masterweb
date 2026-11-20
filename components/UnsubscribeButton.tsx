"use client";
import { useState } from "react";
import { U } from "@/components/T";

export default function UnsubscribeButton({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "err">("idle");
  if (state === "done") return <p className="text-em"><U k="unsubDone" /></p>;
  return (
    <div>
      <button disabled={state === "busy" || !token} onClick={async () => { setState("busy"); const r = await fetch("/api/unsubscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ t: token }) }); setState(r.ok ? "done" : "err"); }} className="border-em rounded-full border px-6 py-3 text-em disabled:opacity-50"><U k="unsubTitle" /></button>
      {state === "err" && <p className="mt-2 text-sm text-red-400">Something went wrong. Please write to me and I will remove you.</p>}
    </div>
  );
}
