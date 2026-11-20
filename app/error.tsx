"use client";
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto grid min-h-[70vh] max-w-md place-content-center gap-4 px-5 text-center">
      <h1 className="font-serif text-3xl text-gold">Something went wrong</h1>
      <p className="text-muted">Please try again. If it keeps happening, come back in a few minutes.</p>
      <button onClick={reset} className="border-em mx-auto w-fit rounded-full border px-6 py-3 text-em">Try again</button>
    </main>
  );
}
