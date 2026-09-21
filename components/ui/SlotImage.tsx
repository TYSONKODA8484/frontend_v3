import Image from "next/image";
import { PlaceholderSlot } from "@/components/ui/PlaceholderSlot";

/**
 * Fills its (relatively positioned) parent with an image. Falls back to the
 * labelled placeholder when no `src` is set yet. Pass `alt=""` for purely
 * decorative images.
 */
export function SlotImage({
  src,
  alt,
  placeholder,
  sizes,
  priority,
  position,
}: {
  src?: string | null;
  alt: string;
  /** Label shown while there is no image. */
  placeholder: string;
  sizes: string;
  priority?: boolean;
  /** CSS object-position, e.g. "center 22%". */
  position?: string;
}) {
  if (!src) return <PlaceholderSlot label={placeholder} />;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover"
      style={position ? { objectPosition: position } : undefined}
    />
  );
}
