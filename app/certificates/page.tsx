import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import CertViewer, { type Cert } from "@/components/CertViewer";
import { getSettings, siteBase } from "@/lib/settings";
import { pageMeta } from "@/lib/seo";
import { T, U } from "@/components/T";

export const revalidate = 30;
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return pageMeta(s, "/certificates", "Certificates and resume of Mr Thabik (Thaseen Shabik N)", `Certificates, training and resume of ${s.owner_name}, also known as Mr Thabik.`);
}

const fileUrl = (p: string) => supabase.storage.from("gallery").getPublicUrl(p).data.publicUrl;

export default async function Certificates() {
  const s = await getSettings();
  const { data } = await supabase.from("certificates").select("*").order("sort");
  const rows = (data ?? []).filter((c) => !c.hidden && c.file_path);
  const certs: Cert[] = rows.map((c) => ({ id: c.id, title: c.title, issuer: c.issuer, issued_on: c.issued_on, category: c.category, description: c.description, credential_url: c.credential_url, url: fileUrl(c.file_path), file_type: c.file_type, downloadable: !!c.downloadable }));
  const resume: Cert | null = s.resume_enabled && s.resume_path ? { id: "resume", title: s.resume_title, issuer: null, issued_on: null, category: "Resume", description: null, credential_url: null, url: fileUrl(s.resume_path), file_type: "pdf", downloadable: s.resume_download } : null;
  const ld = {
    "@context": "https://schema.org", "@type": "Person", "@id": `${siteBase()}/#person`, name: s.owner_name, alternateName: ["Mr Thabik"],
    hasCredential: rows.map((c) => ({ "@type": "EducationalOccupationalCredential", name: c.title, credentialCategory: "certificate", ...(c.issuer ? { recognizedBy: { "@type": "Organization", name: c.issuer } } : {}), ...(c.credential_url && /^https:/i.test(c.credential_url) ? { url: c.credential_url } : {}) })),
  };
  return (
    <main className="mx-auto min-h-screen px-5 py-12" style={{ maxWidth: "var(--content-w)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <Link href="/" className="text-sm text-em">← {s.site_name}</Link>
      <h1 className="my-4 font-serif text-4xl text-gold"><T en={s.cert_title} ta={s.cert_title === "Certificates" ? "சான்றிதழ்கள்" : undefined} /></h1>
      {s.cert_intro && <p className="mb-6 max-w-2xl text-muted">{s.cert_intro}</p>}
      <CertViewer certs={certs} resume={resume} watermark={s.cert_watermark} layout={s.cert_layout} />
    </main>
  );
}
