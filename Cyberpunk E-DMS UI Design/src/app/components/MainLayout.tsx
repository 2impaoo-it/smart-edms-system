import { Outlet } from "react-router";
import { Sidebar } from "@/app/components/Sidebar";
import { MobileNav } from "@/app/components/MobileNav";
import { CursorLight } from "@/app/components/CursorLight";

export function MainLayout() {
  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-hidden">
      <CursorLight />
      <Sidebar />
      <MobileNav />
      <main className="md:ml-20 min-h-screen pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}