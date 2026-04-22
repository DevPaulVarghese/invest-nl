"use client";

import { useEffect, useState } from "react";

export function AnimatedTagline() {
  const [showBad, setShowBad] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowBad(true);
      const timeout = setTimeout(() => setShowBad(false), 2000);
      return () => clearTimeout(timeout);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-flex h-[1.15em] overflow-hidden align-bottom leading-[1.15em]">
      <span
        className={`block transition-transform duration-700 ease-in-out ${
          showBad ? "-translate-y-full" : "translate-y-0"
        } text-green-600`}
      >
        &quot;AI for good&quot;
      </span>
      <span
        className={`absolute inset-x-0 top-0 block transition-transform duration-700 ease-in-out ${
          showBad ? "translate-y-0" : "translate-y-full"
        } text-red-600`}
      >
        &quot;AI for bad&quot;
      </span>
    </span>
  );
}
