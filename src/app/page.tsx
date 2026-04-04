import SiteHeader from "@/components/SiteHeader";
import { DashboardContent } from "@/components/DashboardContent";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <DashboardContent />
    </div>
  );
}
