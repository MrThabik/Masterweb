import Link from "next/link";
import { U } from "@/components/T";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-[70vh] max-w-xl place-content-center gap-4 px-5 text-center">
      <p className="font-serif text-8xl text-gold">404</p>
      <h1 className="font-serif text-3xl text-fg"><U k="notFoundTitle" /></h1>
      <p className="text-muted"><U k="notFoundText" /></p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link href="/" className="border-em rounded-full border px-6 py-3 text-em"><U k="goHome" /></Link>
        <Link href="/blog" className="bd-gold-40 rounded-full border px-6 py-3 text-gold"><U k="latestPosts" /></Link>
        <Link href="/contact" className="bd-gold-40 rounded-full border px-6 py-3 text-gold"><U k="contactTitle" /></Link>
      </div>
    </main>
  );
}
