"use client";

import LandingPage from "@/components/LandingPage";

/**
 * The public showcase, always reachable — including once you are signed in.
 * "/" shows the dashboard to a signed-in user, so this route is what the
 * "Voir le site" links point at.
 */
export default function SitePage() {
  return <LandingPage />;
}
