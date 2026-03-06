"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

type Props = {
  featureName: string;
};

export default function AdminFeatureComingSoonPage({ featureName }: Props) {
  return (
    <div className="mx-auto max-w-3xl py-8">
      <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Sparkles className="h-7 w-7" />
        </div>

        <h1 className="text-center text-2xl font-semibold text-gray-900">{featureName}</h1>
        <p className="mt-2 text-center text-sm text-gray-600">Feature coming soon</p>
        <p className="mx-auto mt-4 max-w-xl text-center text-sm text-gray-500">
          We are building this module and will release it in an upcoming update.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
