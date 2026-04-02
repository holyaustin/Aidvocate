// frontend/lib/utils.ts
// This file remains exactly as in the GenLayer boilerplate (from bet.txt)
// Contains cn() helper for Tailwind className merging

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
