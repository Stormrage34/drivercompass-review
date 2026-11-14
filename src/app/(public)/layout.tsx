import { MarketingShell } from "@/components/marketing/marketing-shell";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <MarketingShell>
      <main id="main-content" className="site-main">
        {children}
      </main>
    </MarketingShell>
  );
}
