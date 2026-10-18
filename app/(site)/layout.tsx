import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteBanner from "@/components/SiteBanner";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteBanner />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
