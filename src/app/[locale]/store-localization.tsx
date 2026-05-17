"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import {
  getLocalizationOption,
  resolveCountryCode,
  setCountryCookie,
  type LocalizationOption,
} from "@/lib/localization";

interface StoreLocalizationValue {
  countryCode: string;
  activeOption: LocalizationOption;
  options: LocalizationOption[];
  setCountryCode: (countryCode: string) => void;
}

const StoreLocalizationContext = createContext<StoreLocalizationValue | null>(null);

export function StoreLocalizationProvider({
  children,
  countryCode,
  options,
}: {
  children: ReactNode;
  countryCode: string;
  options: LocalizationOption[];
}) {
  const [selectedCountryCode, setSelectedCountryCode] = useState(() => resolveCountryCode(countryCode, options));

  const updateCountryCode = useCallback(
    (nextCountryCode: string) => {
      const resolved = resolveCountryCode(nextCountryCode, options);
      setCountryCookie(resolved);
      setSelectedCountryCode(resolved);
    },
    [options],
  );

  const value = useMemo(
    () => ({
      countryCode: selectedCountryCode,
      activeOption: getLocalizationOption(selectedCountryCode, options),
      options,
      setCountryCode: updateCountryCode,
    }),
    [options, selectedCountryCode, updateCountryCode],
  );

  return <StoreLocalizationContext.Provider value={value}>{children}</StoreLocalizationContext.Provider>;
}

export function useStoreLocalization() {
  const context = useContext(StoreLocalizationContext);
  if (!context) {
    throw new Error("useStoreLocalization must be used within StoreLocalizationProvider");
  }
  return context;
}
