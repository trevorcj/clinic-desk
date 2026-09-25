"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import LogoDark from "@/public/logo-dark.svg";
import { CalendarClock, Menu, Search } from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  FailureSimulationProvider,
  useFailureSimulation,
} from "@/app/context/FailureSimulationContext";
import { ToastProvider } from "@/app/context/ToastContext";
import { useQueryState, parseAsString } from "nuqs";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

let clockSnapshot = new Date().toISOString();

function subscribeToClock(callback: () => void) {
  const interval = setInterval(() => {
    clockSnapshot = new Date().toISOString();
    callback();
  }, 1000);

  return () => clearInterval(interval);
}

function getClockSnapshot() {
  return clockSnapshot;
}

function getClockServerSnapshot() {
  return "";
}

function HeaderDateTime() {
  const clientTime = useSyncExternalStore(
    subscribeToClock,
    getClockSnapshot,
    getClockServerSnapshot,
  );

  if (!clientTime) {
    return (
      <div className="text-xs flex flex-col items-end gap-0.5 ml-auto opacity-0">
        <p className="font-medium text-text-primary">Loading date...</p>
      </div>
    );
  }

  const time = new Date(clientTime);
  const dateStr = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(time);

  const timeStr = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(time);

  return (
    <div className="text-sm flex items-end gap-2 ml-auto">
      <p>{dateStr}</p>
      <p>|</p>
      <time className="uppercase">{timeStr}</time>
    </div>
  );
}

function HeaderSearch() {
  const [urlSearch, setUrlSearch] = useQueryState(
    "search",
    parseAsString.withDefault("").withOptions({ shallow: false }),
  );
  const [, setPage] = useQueryState("page");
  const [localSearch, setLocalSearch] = useState(urlSearch);
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);

  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch);
    setLocalSearch(urlSearch);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    setPage(null);
    setUrlSearch(val ? val : null);
  };

  return (
    <div className="relative w-full">
      <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={localSearch}
        onChange={handleChange}
        placeholder="Search appointments, patients..."
        className="w-full rounded-full border border-border/15 bg-stone-50/50 pl-9 pr-4 py-2 text-sm outline-none placeholder:text-text-secondary focus:border-text-primary transition-all"
      />
    </div>
  );
}

function SidebarContent({
  isMobileOpen,
  setIsMobileOpen,
}: {
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
}) {
  const pathname = usePathname();
  const { simulateFailure, setSimulateFailure } = useFailureSimulation();

  const isNavItemActive = (href: string) => {
    if (href === "/appointments") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navItems = [
    {
      href: "/appointments",
      label: "Appointments",
      icon: CalendarClock,
    },
  ];

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/10 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        <div className="flex h-16 items-center px-6 border-b border-border/10">
          <Link href="/">
            <Image
              src={LogoDark}
              width={169}
              height={24}
              alt="ClinicDesk Logo"
              className="h-5 w-auto"
            />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isNavItemActive(href);

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 py-2.5 px-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  active
                    ? "bg-black text-white"
                    : "text-text-primary/70 hover:text-text-primary hover:bg-stone-100"
                }`}
                onClick={() => setIsMobileOpen(false)}>
                <Icon height={18} width={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/10 p-4 w-full bg-stone-50/40">
          <div className="flex justify-between items-center w-full">
            <div>
              <p className="text-sm font-medium text-text-primary">
                Simulate failure
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
            </label>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <FailureSimulationProvider>
        <ToastProvider>
          <div className="flex h-screen w-full bg-background text-text-primary antialiased overflow-hidden">
            <SidebarContent
              isMobileOpen={isMobileOpen}
              setIsMobileOpen={setIsMobileOpen}
            />

            <div className="flex flex-1 flex-col overflow-hidden min-w-[320px]">
              <header className="flex h-16 items-center justify-between border-b border-border/10 bg-white px-4 md:px-8 shrink-0">
                <button
                  onClick={() => setIsMobileOpen(true)}
                  className="rounded-md p-1.5 text-text-primary hover:bg-stone-100 cursor-pointer lg:hidden"
                  aria-label="Open Sidebar">
                  <Menu className="w-5 h-5" />
                </button>

                <div className="hidden sm:block flex-1 max-w-md ml-4 lg:ml-0">
                  <HeaderSearch />
                </div>

                <HeaderDateTime />
              </header>

              <main className="flex-1 overflow-y-auto flex flex-col">
                {children}
              </main>
            </div>
          </div>
        </ToastProvider>
      </FailureSimulationProvider>
    </QueryClientProvider>
  );
}
