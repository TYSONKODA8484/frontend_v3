"use client";

import { Lottie } from "lottie-react";

export function LottiePlayer({
  animationData,
  loop = true,
  className = "",
}: {
  animationData: object;
  loop?: boolean;
  className?: string;
}) {
  return <Lottie src={animationData} loop={loop} autoplay className={className} />;
}
