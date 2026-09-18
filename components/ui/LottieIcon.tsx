"use client";

import UseAnimations from "react-useanimations";
import type { Animation } from "react-useanimations/utils";

export function LottieIcon({
  animation,
  size = 64,
  loop = true,
  className = "",
}: {
  animation: Animation;
  size?: number;
  loop?: boolean;
  className?: string;
}) {
  return (
    <UseAnimations
      animation={animation}
      size={size}
      loop={loop}
      autoplay
      strokeColor="#c8ff00"
      className={className}
    />
  );
}
