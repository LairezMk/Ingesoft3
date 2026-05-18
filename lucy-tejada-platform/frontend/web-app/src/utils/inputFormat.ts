/**
 * ============================================
 * INPUT FORMAT HELPERS
 * ============================================
 */

export const digitsOnly = (value: string, maxLength?: number) => {
  const digits = value.replace(/\D+/g, "");
  return typeof maxLength === "number" ? digits.slice(0, maxLength) : digits;
};

export const formatDateInput = (value: string) => {
  const digits = digitsOnly(value, 6);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 6)].filter(Boolean);
  return parts.join("/");
};

export const toIsoDateFromDisplay = (display: string) => {
  const digits = digitsOnly(display, 6);
  if (digits.length !== 6) return "";
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 6);
  return `20${year}-${month}-${day}`;
};

export const toDisplayDateFromIso = (iso: string) => {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return "";
  return `${day}/${month}/${year.slice(-2)}`;
};
