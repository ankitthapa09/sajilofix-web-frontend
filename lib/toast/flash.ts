export type FlashToast = {
  type: "success" | "error" | "info";
  message: string;
};

const KEY = "sajilofix.flashToast.v1";

export function setFlashToast(toast: FlashToast) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(toast));
  } catch {
    // ignore
  }
}

export function consumeFlashToast(): FlashToast | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    window.localStorage.removeItem(KEY);

    const parsed = JSON.parse(raw) as FlashToast;
    if (!parsed || typeof parsed.message !== "string") return null;
    if (parsed.type !== "success" && parsed.type !== "error" && parsed.type !== "info") return null;

    return parsed;
  } catch {
    return null;
  }
}
