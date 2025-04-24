import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names with tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to a string
 * @param date Date to format
 * @param format Format to use (default: dd/MM/yyyy)
 */
export function formatDate(date: Date | string, format: string = "dd/MM/yyyy"): string {
  if (!date) return "";
  
  const d = typeof date === "string" ? new Date(date) : date;
  
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  
  return format
    .replace("dd", day)
    .replace("MM", month)
    .replace("yyyy", year.toString())
    .replace("yy", year.toString().slice(-2));
}

/**
 * Format a number as currency
 * @param value Value to format
 * @param locale Locale to use (default: pt-BR)
 * @param currency Currency to use (default: BRL)
 */
export function formatCurrency(
  value: number, 
  locale: string = "pt-BR", 
  currency: string = "BRL"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}

/**
 * Truncate a string to a maximum length
 * @param str String to truncate
 * @param maxLength Maximum length (default: 50)
 * @param suffix Suffix to add if truncated (default: "...")
 */
export function truncate(str: string, maxLength: number = 50, suffix: string = "..."): string {
  if (!str) return "";
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + suffix;
}

/**
 * Debounce a function
 * @param fn Function to debounce
 * @param ms Delay in milliseconds
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Generate initials from a name
 * @param name Name to generate initials from
 */
export function getInitials(name: string): string {
  if (!name) return "";
  
  return name
    .split(" ")
    .map(part => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Check if a value is a valid email
 * @param email Email to check
 */
export function isValidEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
}

/**
 * Check if a value is a valid phone number
 * @param phone Phone number to check
 */
export function isValidPhone(phone: string): boolean {
  const re = /^[0-9\s\-\(\)]+$/;
  return re.test(phone);
}
