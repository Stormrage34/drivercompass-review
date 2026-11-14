import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = {
  title: { absolute: "DriverCompass: truck driving jobs with the conditions written down" },
  description:
    "International C+E jobs from direct employers, each one using the same structured template: gross pay, rotation, home time, accommodation and who signs the contract.",
  openGraph: {
    title: "DriverCompass: truck driving jobs with the conditions written down",
    description:
      "Every vacancy uses the same structured template, so two offers compare field by field.",
    type: "website",
    images: ["/share.jpg"],
  },
  twitter: { card: "summary_large_image" },
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <MarketingShell>{children}</MarketingShell>;
}
