"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { U } from "@/components/T";

// Small notice at the bottom, shown once. With Google Analytics on it asks to accept or keep only essentials.
export default function ConsentBar({ ga }: { ga: boolean }) {
  const path = usePathname();
  const [show, setShow] = useState(false);
  useEffect(() => { try { setShow(!localStorage.getItem("consent") && window.parent === window); } catch {} }, []);
  if (!show || path.startsWith("/developer")) return null;
  const choose = (v: "all" | "essential") => { try { localStorage.setItem("consent", v); } catch {} window.dispatchEvent(new Event("consent-changed")); setShow(false); };
  const b = "bd-gold-40 rounded-full border px-4 py-2 text-sm text-gold";
  return (
    <div role="dialog" aria-label="Privacy notice" className="bd-gold-40 r-card fixed inset-x-3 top-3 z-[60] mx-auto max-w-xl border bg-bg/95 p-4 shadow-2xl backdrop-blur" style={{ top: "calc(12px + env(safe-area-inset-top, 0px))" }}>
      <p className="text-sm text-fg"><U k="consentText" />{ga && <> <U k="consentGa" /></>} <Link href="/privacy" className="text-em underline"><U k="privacy" /></Link></p>
      <div className="mt-3 flex flex-wrap gap-2">
        {ga ? (<><button className="border-em rounded-full border px-4 py-2 text-sm text-em" onClick={() => choose("all")}><U k="accept" /></button><button className={b} onClick={() => choose("essential")}><U k="essential" /></button></>)
            : <button className="border-em rounded-full border px-5 py-2 text-sm text-em" onClick={() => choose("essential")}><U k="ok" /></button>}
      </div>
    </div>
  );
}
