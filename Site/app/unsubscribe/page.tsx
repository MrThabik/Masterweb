import type { Metadata } from "next";
import UnsubscribeButton from "@/components/UnsubscribeButton";
import { U } from "@/components/T";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false, follow: false } };

export default function Unsubscribe({ searchParams }: { searchParams: { t?: string } }) {
  return (
    <main className="mx-auto grid min-h-[70vh] max-w-md place-content-center gap-4 px-5 text-center">
      <h1 className="font-serif text-4xl text-gold"><U k="unsubTitle" /></h1>
      <p className="text-muted"><U k="unsubText" /></p>
      <UnsubscribeButton token={searchParams.t ?? ""} />
    </main>
  );
}
