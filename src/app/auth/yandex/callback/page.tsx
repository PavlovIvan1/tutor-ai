"use client";

import { Inner } from "@/components/layout/YandexCallbackInner";
import { Suspense } from "react";

export default function YandexCallbackPage() {
  return (
    <main className="py-24 flex justify-center">
      <Suspense fallback={<span className="loading loading-dots loading-lg" />}>
        <Inner />
      </Suspense>
    </main>
  );
}
