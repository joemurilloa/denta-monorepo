import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import BottomNav from "./BottomNav";

export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1280);

    return (
        <div className="flex min-h-screen bg-base">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div
                className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'md:pl-[240px]' : 'md:pl-[60px]'
                    }`}
            >
                <Topbar onMenuToggle={() => setSidebarOpen((o) => !o)} />

                <main className="flex-1 w-full max-w-[1100px] mx-auto p-6 md:p-8 pb-24 md:pb-8">
                    <Outlet />
                </main>

                <BottomNav />
            </div>
        </div>
    );
}
