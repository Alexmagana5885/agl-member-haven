import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Strip HTML tags from string and truncate to max length for previews
 */
export function stripHtml(html: string, maxLength: number = 150): string {
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, '');
  // Decode HTML entities
  text = text.replace(/&amp;/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/&#39;/g, "'");
  // Trim whitespace
  text = text.replace(/\\'/g, "'").trim();
  // Truncate
  if (text.length > maxLength) {
    text = text.substring(0, maxLength).trim() + '...';
  }
  return text;
}
