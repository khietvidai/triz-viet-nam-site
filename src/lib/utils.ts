import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names with Tailwind CSS conflict resolution.
 * Uses clsx for conditional classes and tailwind-merge to handle overrides.
 * 
 * @param inputs - Class names, objects, or arrays to merge.
 * @returns A single string of merged class names.
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}
