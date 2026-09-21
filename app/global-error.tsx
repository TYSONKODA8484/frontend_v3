"use client";

// Replaces the whole root layout when it fails, so it brings its own <html>.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#000", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 30, margin: 0 }}>Something went wrong.</h1>
          <p style={{ color: "#c3c8c4", margin: 0 }}>An unexpected error occurred. Please try again.</p>
          <button onClick={reset} style={{ background: "#c8ff00", color: "#0b0f04", border: 0, borderRadius: 999, padding: "12px 24px", fontWeight: 600, cursor: "pointer" }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
