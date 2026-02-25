/**
 * PII types supported for masking.
 */
export type PIIType = 'account_no' | 'mobile_no' | 'pan' | 'aadhaar' | 'unknown';

/** Regex and mask config per PII type */
const PII_CONFIG: Record<
  Exclude<PIIType, 'unknown'>,
  { pattern: RegExp; mask: (value: string) => string }
> = {
  // Indian PAN: AAAAA9999A (5 letters, 4 digits, 1 letter)
  pan: {
    pattern: /^[A-Z]{5}[0-9]{4}[A-Z]$/i,
    mask: (v) => v.slice(0, 2) + '*'.repeat(6) + v.slice(-2),
  },
  // Indian mobile: 10 digits, optional +91 or 0 prefix
  mobile_no: {
    pattern: /^(\+91[\s-]?)?(0)?([6-9]\d{9})$/,
    mask: (v) => {
      const digits = v.replace(/\D/g, '').slice(-10);
      return digits.slice(0, 2) + '****' + digits.slice(-2);
    },
  },
  // Aadhaar: 12 digits, optional spaces/dashes (e.g. 1234 5678 9012)
  aadhaar: {
    pattern: /^(?:\d[\s-]*){12}$/,
    mask: (v) => {
      const digits = v.replace(/\D/g, '').slice(0, 12);
      if (digits.length < 12) return '**** **** ****';
      return digits.slice(0, 2) + '**** ****' + digits.slice(-2);
    },
  },
  // Account number: 9–18 digits, optional spaces
  account_no: {
    pattern: /^\d{9,18}$/,
    mask: (v) => {
      const d = v.replace(/\D/g, '');
      if (d.length < 6) return '****';
      return '*'.repeat(d.length - 4) + d.slice(-4);
    },
  },
};

/** Order of checks: more specific (PAN, mobile, aadhaar) before generic (account_no) */
const DETECTION_ORDER: (keyof typeof PII_CONFIG)[] = [
  'pan',
  'mobile_no',
  'aadhaar',
  'account_no',
];

/**
 * Detects the type of PII from a string using regex.
 */
export function detectPIIType(value: string): PIIType {
  const normalized = typeof value === 'string' ? value.trim() : '';
  if (!normalized) return 'unknown';

  for (const key of DETECTION_ORDER) {
    const config = PII_CONFIG[key];
    const toMatch = key === 'account_no' ? normalized.replace(/\D/g, '') : normalized;
    if (config.pattern.test(toMatch)) return key;
  }
  return 'unknown';
}

/**
 * Masks PII (account_no, mobile_no, PAN, Aadhaar). Detects type via regex and masks part of the data.
 * Returns the masked string; if type is unknown, returns a generic mask.
 *
 * @param value - Raw PII string
 * @returns Masked string (e.g. "AB******XY" for PAN, "12**** ****34" for Aadhaar)
 */
export function maskPI(value: string | null | undefined): string {
  if (value == null || typeof value !== 'string') return '';

  const trimmed = value.trim();
  if (!trimmed) return '';

  const type = detectPIIType(trimmed);
  if (type === 'unknown') {
    if (/^\d+$/.test(trimmed.replace(/\D/g, '')) && trimmed.replace(/\D/g, '').length >= 9) {
      return PII_CONFIG.account_no.mask(trimmed.replace(/\D/g, ''));
    }
    return trimmed.length <= 4 ? '****' : '*'.repeat(trimmed.length - 4) + trimmed.slice(-4);
  }

  const config = PII_CONFIG[type];
  const toMask = type === 'account_no' ? trimmed.replace(/\D/g, '') : trimmed;
  return config.mask(toMask);
}
