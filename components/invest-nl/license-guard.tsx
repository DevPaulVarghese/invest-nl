"use client";

import { useEffect, useState, useCallback } from "react";
import {
  initLicenseHeartbeat,
  isLicenseValid,
  getLicenseEndpoints,
} from "@/lib/license";

export function LicenseGuard({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState(true);
  const [checking, setChecking] = useState(true);

  const runCheck = useCallback(async () => {
    const [ep1, ep2] = getLicenseEndpoints();
    try {
      const results = await Promise.all([
        fetch(ep1, { method: "HEAD", mode: "no-cors", cache: "no-store" })
          .then(() => true)
          .catch(() => false),
        fetch(ep2, { method: "HEAD", mode: "no-cors", cache: "no-store" })
          .then(() => true)
          .catch(() => false),
      ]);
      setVerified(results[0] || results[1]);
    } catch {
      setVerified(false);
    }
    setChecking(false);
  }, []);

  useEffect(() => {
    initLicenseHeartbeat();
    runCheck();
    const interval = setInterval(() => {
      setVerified(isLicenseValid());
    }, 30_000);
    return () => clearInterval(interval);
  }, [runCheck]);

  if (checking) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#0a0a0a",
          color: "#666",
          fontFamily: "system-ui",
        }}
      >
        Verifying license…
      </div>
    );
  }

  if (!verified) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#0a0a0a",
          color: "#ef4444",
          fontFamily: "system-ui",
          gap: "1rem",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>
          License Validation Failed
        </h1>
        <p style={{ color: "#888", maxWidth: "28rem", margin: 0 }}>
          This application requires a valid license from Paul Varghese /
          askFinz. Please contact{" "}
          <a
            href="https://paulvarghese.com"
            style={{ color: "#6366f1", textDecoration: "underline" }}
          >
            paulvarghese.com
          </a>{" "}
          to restore access.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
