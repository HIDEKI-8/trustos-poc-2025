"use client";

/**
 * Temporary Providers wrapper (minimal)
 * - This intentionally avoids importing wagmi/connectors so the build won't fail.
 * - Replace this with your wagmi + viem config later when you fix connector import paths.
 */

import React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
