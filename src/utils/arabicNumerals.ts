/**
 * Converts regular Arabic numerals (0-9) to Arabic-Indic numerals (٠-٩)
 */
export function toArabicIndic(num: number | string): string {
  const arabicIndicMap: { [key: string]: string } = {
    '0': '٠',
    '1': '١',
    '2': '٢',
    '3': '٣',
    '4': '٤',
    '5': '٥',
    '6': '٦',
    '7': '٧',
    '8': '٨',
    '9': '٩'
  };

  return num.toString().replace(/[0-9]/g, (digit) => arabicIndicMap[digit] || digit);
}