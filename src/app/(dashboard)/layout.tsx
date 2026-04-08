import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <main className="lg:pl-64">
        <div className="px-4 py-8 sm:px-6 lg:px-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </>
  );
}
