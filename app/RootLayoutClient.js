"use client";

import { useTranslations, useLocale } from "next-intl";
import { ToastContainer } from "react-toastify";
import { AppProviders } from "@/contexts";

export default function RootLayoutClient({ children }) {
  const locale = useLocale();

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      data-scroll-behavior="smooth"
    >
      <head>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"></script>
      </head>
      <body>
        <ToastContainer position="top-center" autoClose={3000} />
        <main
          className="d-flex flex-column flex-grow-1 bg-white"
          style={{ paddingTop: "76.84px" }}
        >
          <AppProviders>{children}</AppProviders>
        </main>
      </body>
    </html>
  );
}
