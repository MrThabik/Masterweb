"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Google Analytics: only when an ID is set, never inside Developer Space, and (when the notice is on) only after the visitor accepts
export default function Analytics({ id, needConsent }: { id: string; needConsent: boolean }) {
  const path = usePathname();
  const [ok, setOk] = useState(!needConsent);
  useEffect(() => {
    if (!needConsent) { setOk(true); return; }
    const read = () => { try { setOk(localStorage.getItem("consent") === "all"); } catch { setOk(false); } };
    read();
    window.addEventListener("consent-changed", read);
    return () => window.removeEventListener("consent-changed", read);
  }, [needConsent]);
  if (!id || !ok || path.startsWith("/developer")) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${id}');`}</Script>
    </>
  );
}
