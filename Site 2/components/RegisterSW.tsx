"use client";
import { useEffect } from "react";
// Lets the website be installed as an app and shows a friendly page when offline
export default function RegisterSW() {
  useEffect(() => { if ("serviceWorker" in navigator && window.parent === window && location.hostname !== "localhost") navigator.serviceWorker.register("/sw.js").catch(() => {}); }, []);
  return null;
}
