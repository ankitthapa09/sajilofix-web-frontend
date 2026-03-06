"use client";

import React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type IssueImageViewerModalProps = {
  isOpen: boolean;
  photos: string[];
  activeIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
};

export default function IssueImageViewerModal({
  isOpen,
  photos,
  activeIndex,
  onClose,
  onPrev,
  onNext,
  onSelect,
}: IssueImageViewerModalProps) {
  if (!isOpen || photos.length === 0) return null;

  const activePhotoUrl = photos[activeIndex] ?? photos[0];
  const hasMultiple = photos.length > 1;

  return (
    <div className="fixed inset-0 z-80 bg-black/40 p-4 backdrop-blur-sm sm:p-6">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-6">
          <div>
            <div className="text-sm font-semibold text-gray-900">Issue Image Viewer</div>
            <div className="text-xs text-gray-500">
              Image {activeIndex + 1} of {photos.length}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrev}
              disabled={!hasMultiple}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!hasMultiple}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900"
              aria-label="Close image viewer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-6">
          <div className="relative h-full w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-900">
            <Image
              src={activePhotoUrl}
              alt="Issue evidence full view"
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>
        </div>

        {hasMultiple ? (
          <div className="border-t border-gray-200 px-4 py-3 sm:px-6">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {photos.map((photo, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={`${photo}-${index}`}
                    type="button"
                    onClick={() => onSelect(index)}
                    className={
                      "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition-colors " +
                      (isActive ? "border-blue-500" : "border-gray-200 hover:border-gray-300")
                    }
                    aria-label={`View image ${index + 1}`}
                  >
                    <Image
                      src={photo}
                      alt={`Issue thumbnail ${index + 1}`}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
