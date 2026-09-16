import type { Metadata } from "next";
import { SITE } from "@/constants";
import "./globals.css";

export const metadata: Metadata = { metadataBase: new URL("http://localhost:3000"), title: { default: "CAUCE", template: "%s · CAUCE" }, description: SITE.description };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
