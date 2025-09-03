"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  const toggleLanguage = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    document.cookie = `locale=${newLocale}; path=/; max-age=${
      60 * 60 * 24 * 30
    }`;

    router.refresh();
  };

  return (
    <div
      className="primaryButton"
      style={{ borderRadius: "12px" }}
      onClick={toggleLanguage}
    >
      {locale === "ar" ? "English" : "العربية"}
    </div>
  );
}
