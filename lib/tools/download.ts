/** Fetches the image as a blob so the browser saves it instead of navigating. */
export async function downloadUrl(url: string, filename: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(await res.blob());
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
    return true;
  } catch {
    return false;
  }
}

/** Turns generated-image URLs back into Files so they can feed another tool's upload. */
export async function urlsToFiles(urls: string[]): Promise<File[]> {
  const files = await Promise.all(
    urls.map(async (url, i) => {
      try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const blob = await res.blob();
        const type = blob.type || "image/png";
        const ext = type.split("/")[1]?.replace("jpeg", "jpg") || "png";
        return new File([blob], `generated-${i + 1}.${ext}`, { type });
      } catch {
        return null;
      }
    }),
  );
  return files.filter((f): f is File => f !== null);
}
