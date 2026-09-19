"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-heading text-3xl font-bold tracking-tight">Something went wrong.</h1>
      <p className="max-w-[44ch] text-[15px] text-muted">An unexpected error occurred. Please try again.</p>
      <button onClick={reset} className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-ink hover:bg-accent-hover">
        Try again
      </button>
    </main>
  );
}
