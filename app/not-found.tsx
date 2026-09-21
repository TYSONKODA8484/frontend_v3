import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="font-mono text-[11px] tracking-widest text-dim">404</span>
      <h1 className="font-heading text-3xl font-bold tracking-tight">This page doesn&apos;t exist.</h1>
      <p className="max-w-[44ch] text-[15px] text-muted">The link may be broken or the page may have moved.</p>
      <Link href="/" className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-ink hover:bg-accent-hover">
        Back to ShootPX
      </Link>
    </main>
  );
}
