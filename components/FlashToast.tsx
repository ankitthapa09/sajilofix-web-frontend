"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { consumeFlashToast } from "@/lib/toast/flash";

export function FlashToast() {
  const pathname = usePathname();

  useEffect(() => {
    const ft = consumeFlashToast();
    if (!ft) return;

    if (ft.type === "success") toast.success(ft.message);
    else if (ft.type === "error") toast.error(ft.message);
    else toast(ft.message);
  }, [pathname]);

  return null;
}
