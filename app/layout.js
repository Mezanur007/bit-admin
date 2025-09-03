import "@/styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.css";

import { NextIntlClientProvider } from "next-intl";
import RootLayoutClient from "./RootLayoutClient";

export const metadata = {
  title: "B-IT Admin",
  description:
    "BIT Admin, an administration panel for managing and controlling system operations.",
};

export default function RootLayout({ children }) {
  return (
    <NextIntlClientProvider>
      <RootLayoutClient>{children}</RootLayoutClient>
    </NextIntlClientProvider>
  );
}
