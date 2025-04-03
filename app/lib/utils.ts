import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Mescla classes do Tailwind e evita conflitos
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 