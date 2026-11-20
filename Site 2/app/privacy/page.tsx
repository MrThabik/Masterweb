import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { pageMeta } from "@/lib/seo";
import { T } from "@/components/T";

export const revalidate = 30;
export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await getSettings(), "/privacy", "Privacy", "How this website handles your information.");
}

export default async function Privacy() {
  const s = await getSettings();
  const rows: [string, string, string, string][] = [
    ["What is stored on your device", "உங்கள் சாதனத்தில் சேமிக்கப்படுவது", "Your language, light or dark choice, the photos you liked and a random visitor code are kept in your browser’s own storage so the site can remember you. This site does not set tracking cookies.", "உங்கள் மொழி, ஒளி அல்லது இருள் தேர்வு, நீங்கள் விரும்பிய படங்கள் மற்றும் ஒரு சீரற்ற பார்வையாளர் குறியீடு உங்கள் உலாவியின் சேமிப்பில் வைக்கப்படுகின்றன. இந்த இணையதளம் கண்காணிப்பு குக்கீகளை அமைப்பதில்லை."],
    ["Visit statistics", "வருகைப் புள்ளிவிவரங்கள்", "The site counts page visits to learn which pages are read. It records the page, the website you came from, your country, whether you use a phone or computer, and the random visitor code. It does not store your name or IP address.", "எந்தப் பக்கங்கள் படிக்கப்படுகின்றன என்பதை அறிய பக்க வருகைகள் எண்ணப்படுகின்றன. பக்கம், நீங்கள் வந்த இணையதளம், உங்கள் நாடு, தொலைபேசி அல்லது கணினி, மற்றும் சீரற்ற குறியீடு பதிவாகும். உங்கள் பெயர் அல்லது IP முகவரி சேமிக்கப்படாது."],
    ["Contact form and WhatsApp", "தொடர்புப் படிவம் மற்றும் வாட்ஸ்அப்", "If you send a message, your name, message and the email or phone you add are stored so I can reply. WhatsApp opens the WhatsApp app and is handled by WhatsApp.", "நீங்கள் செய்தி அனுப்பினால், பதிலளிக்க உங்கள் பெயர், செய்தி மற்றும் நீங்கள் சேர்க்கும் மின்னஞ்சல் அல்லது தொலைபேசி சேமிக்கப்படும். வாட்ஸ்அப் செயலியை திறக்கும்; அதை வாட்ஸ்அப் கையாளும்."],
    ["Email updates", "மின்னஞ்சல் அறிவிப்புகள்", "If you subscribe, your email is used only to tell you about new posts. Every email has an unsubscribe link, and I will remove you on request.", "நீங்கள் சந்தா செய்தால், புதிய பதிவுகளைத் தெரிவிக்க மட்டுமே உங்கள் மின்னஞ்சல் பயன்படுத்தப்படும். ஒவ்வொரு மின்னஞ்சலிலும் சந்தாவை நிறுத்தும் இணைப்பு உண்டு."],
    ...(s.ga_id ? [["Google Analytics", "Google Analytics", "If you accept analytics, Google Analytics is also used to understand how the site is used. You can decline in the notice.", "நீங்கள் ஏற்றால், இணையதளம் எவ்வாறு பயன்படுத்தப்படுகிறது என்பதை அறிய Google Analytics பயன்படுத்தப்படும். அறிவிப்பில் மறுக்கலாம்."] as [string, string, string, string]] : []),
    ["Where it is kept", "எங்கு சேமிக்கப்படுகிறது", "The website is hosted on Vercel and its data is kept in Supabase.", "இணையதளம் Vercel இல் இயங்குகிறது; தரவு Supabase இல் சேமிக்கப்படுகிறது."],
  ];
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-12 leading-8">
      <Link href="/" className="text-sm text-em">← {s.site_name}</Link>
      <h1 className="my-4 font-serif text-4xl text-gold"><T en="Privacy" ta="தனியுரிமை" /></h1>
      {rows.map(([te, tt, be, bt]) => (
        <section key={te} className="mb-5">
          <h2 className="font-serif text-2xl text-gold"><T en={te} ta={tt} /></h2>
          <p className="text-muted"><T en={be} ta={bt} /></p>
        </section>
      ))}
      {s.privacy_extra && <p className="mb-5 whitespace-pre-line text-muted">{s.privacy_extra}</p>}
      {s.privacy_contact && <p className="text-fg"><T en="Questions or removal requests:" ta="கேள்விகள் அல்லது நீக்கும் கோரிக்கைகள்:" /> <a className="text-em underline" href={s.privacy_contact.includes("@") ? `mailto:${s.privacy_contact}` : s.privacy_contact}>{s.privacy_contact}</a></p>}
    </main>
  );
}
