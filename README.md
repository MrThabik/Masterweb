# THASEEN OS: master website

Hub of your websites + photo/art gallery + bilingual blog, all edited from /developer.

## Setup
1. Supabase: create a project. SQL Editor: edit `master@example.com` in `schema.sql` to your email, then run it.
2. Supabase > Storage: create two PUBLIC buckets: `screenshots` and `gallery`.
3. Supabase > Authentication > Users: add your Master user (email + password).
4. Generate admin secrets: `node scripts/make-admin-secrets.mjs <username> "<password>" <pin>` and put the 4 printed lines in your env. In Supabase > Authentication > Users set the Master user's password to the printed ADMIN_SUPABASE_PASSWORD, and in Authentication > Providers turn OFF new sign-ups.
5. Copy `.env.example` to `.env.local` and fill in the four values (MASTER_EMAIL = your Master email).
6. `npm install` then `npm run dev` and open http://localhost:3000
7. Open /developer, sign in, and add your sites; use /developer/gallery and /developer/blog.

## Deploy (Vercel)
Push to GitHub, import the repo in Vercel, add the same four environment variables, deploy.
Then add your own domain in Vercel > Settings > Domains.

## Pages
/ hub (3D ring + cards) | /gallery | /moodboard | /blog | /developer, /developer/gallery, /developer/blog, /developer/moodboard (Master only)

## Extras
- Intro (Bismillah, then THASEEN OS) plays once per session; tap to skip.
- Floating dock + Dark/Light switch (saved in the browser).
- Visit counters count taps on each card's Visit button.
- 3D ring uses `three`; cards show the screenshot you set in Developer Space.

## Admin protection
- Developer Space needs username + password + PIN, all checked on the server (scrypt hashes, constant-time compare).
- 5 wrong attempts from one address locks login for 15 minutes (30 total across all addresses).
- The real Supabase password is a random secret only the server knows; it is never typed or shown.
- Database rules (RLS) still allow writes only for the Master email, as a second layer.
- Sessions end when the tab closes or after 15 idle minutes. /developer is hidden from search engines and not linked publicly.

## Sitemap
`/sitemap.xml` and `/robots.txt` are generated automatically (blog posts are added when published; /developer and /api are excluded). Set `NEXT_PUBLIC_SITE_URL` to your real domain, then submit `https://masterweb.thaseenshabik.in/sitemap.xml` in Google Search Console.

## Getting found on Google ("Thaseen Shabik")
Built in: name-rich titles/descriptions, Person + WebSite structured data, share image, canonical links, sitemap, robots.txt.
You must do:
1. Use your own domain and set NEXT_PUBLIC_SITE_URL.
2. Google Search Console > add your domain > verify (HTML tag: put the content value in NEXT_PUBLIC_GOOGLE_VERIFICATION) > Sitemaps > submit /sitemap.xml > URL Inspection > Request indexing for the home page.
3. Link your three portfolio sites to this hub and the hub to them; add the hub link to LinkedIn, GitHub and other profiles (list those in NEXT_PUBLIC_SAME_AS).
Google decides rankings and search suggestions; nobody can force them. New sites usually take days to weeks to appear.

## Design & Layout (Developer Space > Design & Layout)
Colours (with ready-made sets), heading and text fonts, card style and roundness, home page section order, 3D cards on/off and height,
cards per row, navigation dock (position, links, dark/light button), opening intro (text, length, colour), gallery timing and watermark,
and optional custom CSS. Everything is saved in the `settings` table; no new upload is needed for these changes.
Developer Space adapts to phone, tablet and laptop (side menu on laptops, Menu button on phones, sticky Save bar).

## Round 1: contact, language switch, subscribe
- /contact: contact form (stored in Supabase, read in Developer Space > Messages) and a WhatsApp button. Set your number in Site Settings > Contact and WhatsApp.
- Tamil / English button in the dock. Tamil texts are edited in Site Settings > Tamil versions; fixed labels live in lib/i18n.ts.
- Subscribe box on the blog pages; people are listed in Developer Space > Subscribers (copy all emails or download CSV). Sending emails automatically needs an email service and is not included.
- Protection: hidden trap field, speed check, and limits per address (5 per hour) and overall, all on the server.
- Run the "Update 4" part of schema.sql once in Supabase. Add `Contact|/contact` to your dock links in Design & Layout.

## Round 2a: Developer Space upgrade
- Dashboard (/developer) with counts and quick actions; Websites manager moved to /developer/websites.
- Live preview: your real website inside Design & Layout and Site Settings (phone, tablet, laptop; any page). Colours, fonts and custom CSS update live.
- AI helper: describe a change (English or Tamil); it proposes changes, you Apply, then Save. Needs ANTHROPIC_API_KEY in Vercel; without it the helper shows a setup message. It can only change the listed settings with valid values.
- Voice: "open gallery", "save", "undo", "redo", or any description (sent to the AI helper). Works in Chrome and Edge.
- Guide button (tour) and Tips boxes on every page.
- History: every save of Design or Settings is kept (latest 30) and can be restored. Undo and Redo in the bottom bar.
- Run the "Update 5" part of schema.sql once in Supabase.

## Round 3: editing everywhere (this version)
- Design & Layout: 8 one-tap templates, more fonts (17 headings, 12 text, 5 Tamil), font style (weight, italic, capitals, spacing, size, line spacing), background styles, page width, section spacing, drag-and-drop home sections (about, latest posts, photo strip, contact button, own text, subscribe), intro styles with a preview button.
- Site Settings & SEO: quick templates, About page builder (headings, paragraphs, lists, quotes, English + Tamil, drag to order), per-page Google titles and descriptions, Bing code, Google Analytics, index on/off.
- Gallery manager: slider or photo wall, change effects, shade, watermark, albums you name, captions, links, hide, select-many actions, drag to reorder.
- Mood-board manager: 4 ready-made looks, layout (masonry, squares, film strip), frames, hover effects, captions, shuffle, hide, drag to reorder.
- Blog manager: list layouts, post templates, text size and width, cover pictures, excerpts, tags, featured posts, formatting toolbar, preview.
- Run the "Update 6" part of schema.sql once in Supabase (before using captions, hide, covers, excerpts, tags).

## How to upload (GitHub, then Vercel)
1. Unzip this file on your computer. Open the unzipped folder until you see package.json.
2. On github.com open your repository, open the folder that holds the website (for example `site`), and delete it (three dots, Delete directory, Commit).
3. Click Add file, then Upload files. Drag in EVERYTHING that is inside the unzipped folder (so package.json is directly in your site folder). Commit changes.
4. Vercel builds by itself. Wait for Ready. Your environment variables stay as they are.

## Round 3b: website pictures (this version)
- Websites manager: Upload screenshot (big phone photos are shrunk automatically), Use the site's own preview image (reads the website's og:image), Capture screenshot (now uses your login correctly and shows the real reason if it fails), or paste a picture link. The picture is saved by itself and shown at once. Messages appear on the card itself.
- Dashboard > Test image upload: checks both image folders and says exactly what is wrong.
- Run the "Update 7" part of schema.sql once in Supabase: it repairs the image buckets, public links and permissions.

## Round 4: visitors, power tools and polish (this version)
- Visitor stats (/developer/stats): anonymous page views, visitors, right now, per day chart, top pages, referrers, countries, devices, language. No cookies, no IP addresses stored.
- Backup & Restore (/developer/backup): download one file with settings, websites, gallery, mood-board and posts (optionally subscribers and messages); restore it later (a safety copy downloads first). Pictures stay in Supabase storage.
- Scheduled posts: set "Publish at" on a post. Email subscribers: needs RESEND_API_KEY and EMAIL_FROM (resend.com). "Email subscribers now" sends at once; "Email subscribers when published" is sent by a daily check at 04:00 UTC (vercel.json; add CRON_SECRET in Vercel).
- Every email has an unsubscribe link (/unsubscribe).
- Colour mode: remembered per visitor; the first-visit default (dark, light or the visitor's device) is set in Design & Layout.
- Privacy page (/privacy) and a small notice (with Accept/Decline when Google Analytics is on); edit in Site Settings > Visitors, privacy and install. This is a starting template, not legal advice.
- Custom 404, loading and error screens; offline page.
- Faster loading: uploads are shrunk automatically; fonts and image storage are pre-connected.
- Installable app (add to home screen): manifest, icons and a small service worker.
- Run the "Update 8" part of schema.sql once in Supabase.

## Round 5: new domain, picture upload fix, search and AI visibility (this version)
- Domain: the default address is now https://masterweb.thaseenshabik.in. In Vercel set NEXT_PUBLIC_SITE_URL=https://masterweb.thaseenshabik.in, add the domain under Settings > Domains (add the DNS record Vercel shows), and set the old masterweb2 domain to "Redirect to Another Domain" > masterweb.thaseenshabik.in. Then redeploy.
- Picture upload: the editor tries a direct upload and, if that is refused, uploads through the server, which also creates the storage folder and makes it public. Also available: "Use the site's own preview image" and "Paste a picture link". Dashboard > Test image upload explains any problem.
- Search and AI: Site Settings > "Apply recommended search settings" fills the names (Mr Thabik, Mr.Thabik, MrThabik, Thaseen Shabik, Thaseen Shabik N), title, description, keywords, About text and questions. New pages and files: /websites (every website listed), /llms.txt, /llms-full.txt, FAQ and ItemList structured data, more crawlers allowed in robots.txt.
- Then: Google Search Console (add the new address, submit /sitemap.xml, Request indexing), Bing Webmaster Tools (import from Search Console, submit the sitemap), Developer Space > Site Settings > Notify search engines now. Link every portfolio website to the master website and back, and use the same name "Mr Thabik | Thaseen Shabik" on LinkedIn, GitHub, Instagram, YouTube and X, with the master website as the link.

## Round 6: certificates and resume vault
- Run the Update 9 SQL (creates the certificates table). Public page: /certificates. Admin: Developer Space > Certificates & Resume.
- Certificates: title, issuer, date, category, description, verify link (https), file (picture or PDF), Hide, Downloadable, drag order. View-only files show a watermark and no download button (a screenshot can never be fully blocked).
- Resume: one PDF at the top of the page, with an option to allow download.
- Search: certificates are published as structured data (EducationalOccupationalCredential), /certificates is in the sitemap and llms.txt.
- Backup & Restore now includes certificates. Add the page to the dock in Design & Layout: Certificates | /certificates.
