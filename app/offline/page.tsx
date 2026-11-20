import { U } from "@/components/T";
export const metadata = { title: "Offline", robots: { index: false, follow: false } };
export default function Offline() {
  return <main className="mx-auto grid min-h-[70vh] max-w-md place-content-center px-5 text-center"><p className="font-serif text-3xl text-gold"><U k="offline" /></p></main>;
}
