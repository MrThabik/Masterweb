import type { Metadata } from "next";
import Link from "next/link";
import { supabase, Site } from "@/lib/supabase";
import { getSettings } from "@/lib/settings";
import { pageMeta } from "@/lib/seo";
import { T } from "@/components/T";

export const revalidate = 30;
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return pageMeta(s, "/websites", "All websites by Mr Thabik (Thaseen Shabik N)", `Every website by Mr Thabik, also known as ${s.owner_name}: portfolios, projects and creative work.`);
}

export default async function Websites() {
  const s = await getSettings();
  const { data } = await supabase.from("sites").select("*").eq("hidden", false).order("sort");
  const sites = (data as Site[] | null) ?? [];
  const ld = { "@context": "https://schema.org", "@type": "ItemList", name: `Websites by ${s.owner_name} (Mr Thabik)`, itemListElement: sites.map((x, i) => ({ "@type": "ListItem", position: i + 1, url: x.url, name: x.name })) };
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <Link href="/" className="text-sm text-em">← {s.site_name}</Link>
      <h1 className="my-4 font-serif text-4xl text-gold"><T en="All websites" ta="அனைத்து இணையதளங்கள்" /></h1>
      <p className="mb-6 text-muted">Websites by Mr Thabik ({s.owner_name}).</p>
      <ul className="grid gap-5">
        {sites.map((x) => (
          <li key={x.id} className="bd-gold-25 r-card border bg-card p-4">
            <h2 className="font-serif text-2xl text-gold"><a href={x.url} rel="noopener">{x.name}</a></h2>
            <p className="my-1 text-muted">{x.description}</p>
            <a href={x.url} rel="noopener" className="break-all text-sm text-em underline">{x.url.replace(/^https?:\/\//, "")}</a>
          </li>
        ))}
      </ul>
    </main>
  );
}
