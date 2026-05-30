import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { X } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  headerActions?: ReactNode;
}

export function AppLayout({
  children,
  title,
  subtitle,
  showSearch = true,
  headerActions,
}: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <Toaster richColors position="top-right" closeButton />
      {/* Desktop Sidebar - Fixed Position */}
      <AppSidebar />

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-[#111827] z-50 lg:hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(255,255,255,0.1)]">
              <h2 className="text-base text-[#E5E7EB] font-semibold">HR System</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-[#E5E7EB] hover:bg-[rgba(255,255,255,0.08)] rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-[calc(100%-73px)] overflow-y-auto">
              <AppSidebar />
            </div>
          </div>
        </>
      )}

      {/* Main Content Area - Aligned to right of fixed sidebar */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <AppHeader
          title={title ?? ""}
          subtitle={subtitle ?? ""}
          showSearch={showSearch}
          onMenuClick={() => setMobileMenuOpen(true)}
          actions={headerActions}
        />
        <main className="flex-1 overflow-y-auto bg-[#F9FAFB]">{children}</main>
      </div>
    </div>
  );
}
