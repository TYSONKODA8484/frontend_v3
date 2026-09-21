"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";

/**
 * Renders nothing — as soon as Firebase resolves an existing signed-in
 * session, sends the visitor straight to /studio instead of the marketing
 * page. Firebase's session is cached locally, so this resolves almost
 * immediately for a returning signed-in user.
 */
export function HomeAuthRedirect() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && profile) router.replace("/studio");
  }, [loading, profile, router]);

  return null;
}
