/**
 * Auth rules mirrored from the Flutter app (lib/core/.../auth_repository.dart)
 * so the web and the mobile accept exactly the same identifiers.
 */

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

/** In production the code arrives by email. Offline demo build accepts this one. */
export const DEMO_OTP = "225581";
export const OTP_LENGTH = 6;
export const RESEND_SECONDS = 30;

export const ADMIN_EMAIL = "admin@covoitelite.com";

export function isEmail(value: string): boolean {
  const v = value.trim();
  return v.includes("@") && EMAIL_RE.test(v);
}

/** Digits only, with a leading 00229 / 229 country prefix removed. */
function beninNationalDigits(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("00229")) digits = digits.slice(5);
  else if (digits.startsWith("229")) digits = digits.slice(3);
  return digits;
}

/** 10 digits starting with 01 (current), or 8 legacy digits not starting with 0. */
export function isValidBeninPhone(value: string): boolean {
  const d = beninNationalDigits(value);
  if (d.length === 10) return d.startsWith("01");
  if (d.length === 8) return !d.startsWith("0");
  return false;
}

/** Always returns +229 followed by 10 digits. */
export function normalizePhone(value: string): string {
  let d = beninNationalDigits(value);
  if (d.length === 8) d = `01${d}`;
  return `+229${d}`;
}

export function normalizeIdentifier(value: string): string {
  return value.includes("@") ? value.trim().toLowerCase() : normalizePhone(value);
}
