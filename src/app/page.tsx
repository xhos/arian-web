"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/transactions");
  }, [router]);

  return (
    <div className="min-h-screen p-6 flex items-center justify-center">
      <div className="text-sm text-muted-foreground">redirecting to transactions...</div>
    </div>
  );
}
