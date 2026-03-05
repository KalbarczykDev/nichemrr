import SiteHeader from "@/components/SiteHeader";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 items-center justify-center bg-background px-4">
        {children}
      </div>
    </>
  );
}
