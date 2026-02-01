import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert Western numerals to Eastern Arabic numerals
export function toArabicNumerals(num: number | string): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  return String(num).replace(/[0-9]/g, (d) => arabicNumerals[parseInt(d)])
}

// Convert Eastern Arabic numerals to Western
export function toWesternNumerals(str: string): string {
  const arabicNumerals: Record<string, string> = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  }
  return str.replace(/[٠-٩]/g, (d) => arabicNumerals[d] || d)
}

// Format law number in Arabic
export function formatLawNumber(num: number): string {
  const ordinals: Record<number, string> = {
    1: 'الأول',
    2: 'الثاني',
    3: 'الثالث',
    4: 'الرابع',
    5: 'الخامس',
    6: 'السادس',
    7: 'السابع',
    8: 'الثامن',
    9: 'التاسع',
    10: 'العاشر',
    11: 'الحادي عشر',
    12: 'الثاني عشر',
    13: 'الثالث عشر',
    14: 'الرابع عشر',
    15: 'الخامس عشر',
    16: 'السادس عشر',
    17: 'السابع عشر',
  }
  return ordinals[num] || `رقم ${toArabicNumerals(num)}`
}

// Get frequency badge info
export function getFrequencyBadge(frequency: 'high' | 'medium' | 'low'): {
  label: string
  emoji: string
  className: string
} {
  const badges = {
    high: { label: 'متكرر', emoji: '🔥', className: 'badge-high' },
    medium: { label: 'شائع', emoji: '⚠️', className: 'badge-medium' },
    low: { label: 'نادر', emoji: '📘', className: 'badge-low' },
  }
  return badges[frequency]
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Format date in Arabic
export function formatDateAr(input: number | Date): string {
  const date = input instanceof Date ? input : new Date(input)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return date.toLocaleDateString('ar-AE', options)
}

// Format relative time in Arabic
export function formatRelativeTimeAr(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    if (days === 1) return 'أمس'
    if (days === 2) return 'قبل يومين'
    if (days < 7) return `قبل ${toArabicNumerals(days)} أيام`
    return formatDateAr(timestamp)
  }
  if (hours > 0) {
    if (hours === 1) return 'قبل ساعة'
    if (hours === 2) return 'قبل ساعتين'
    return `قبل ${toArabicNumerals(hours)} ساعات`
  }
  if (minutes > 0) {
    if (minutes === 1) return 'قبل دقيقة'
    if (minutes === 2) return 'قبل دقيقتين'
    return `قبل ${toArabicNumerals(minutes)} دقائق`
  }
  return 'الآن'
}
