export const DEFAULT_COUNTRY_CODE = "US";
export const DEFAULT_LANGUAGE_CODE = "EN";
export const COUNTRY_COOKIE = "chronostrap_country";
export const COUNTRY_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export interface LocalizationOption {
  countryCode: string;
  countryName: string;
  currencyCode: string;
  currencyName: string;
  currencySymbol: string;
  isPrimaryCurrency?: boolean;
}

export const FALLBACK_LOCALIZATION_OPTIONS: LocalizationOption[] = [
  {
    countryCode: DEFAULT_COUNTRY_CODE,
    countryName: "United States",
    currencyCode: "USD",
    currencyName: "US Dollar",
    currencySymbol: "$",
    isPrimaryCurrency: true,
  },
];

export function normalizeCountryCode(value?: string | null) {
  const code = value
    ?.trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 2);
  return code && code.length === 2 ? code : DEFAULT_COUNTRY_CODE;
}

export function resolveCountryCode(value: string | null | undefined, options: LocalizationOption[]) {
  const normalized = normalizeCountryCode(value);
  if (options.some((option) => option.countryCode === normalized)) {
    return normalized;
  }

  return (
    options.find((option) => option.countryCode === DEFAULT_COUNTRY_CODE)?.countryCode ??
    options.find((option) => option.isPrimaryCurrency)?.countryCode ??
    options[0]?.countryCode ??
    DEFAULT_COUNTRY_CODE
  );
}

export function getLocalizationOption(countryCode: string, options: LocalizationOption[]) {
  const resolved = resolveCountryCode(countryCode, options);
  return options.find((option) => option.countryCode === resolved) ?? FALLBACK_LOCALIZATION_OPTIONS[0];
}

export function setCountryCookie(countryCode: string) {
  document.cookie = `${COUNTRY_COOKIE}=${normalizeCountryCode(countryCode)}; path=/; max-age=${COUNTRY_COOKIE_MAX_AGE}; samesite=lax`;
}
