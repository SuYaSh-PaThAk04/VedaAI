"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type { AssignmentRecord } from "@vedaai/shared";
import dpsLogo from "@/DPS-logo.svg";
import notificationBell from "@/assets/Nortificaion-bell.svg";
import { API_URL } from "@/lib/config";

interface DashboardShellProps {
  children: ReactNode;
  active?: "home" | "assignments" | "toolkit" | "library" | "none";
  crumb?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

const navItems = [
  { key: "home", label: "Home", icon: "⌘", href: "/" },
  { key: "groups", label: "My Groups", icon: "▣", href: "/" },
  { key: "assignments", label: "Assignments", icon: "▤", href: "/" },
  { key: "toolkit", label: "AI Toolkit", icon: "✦", href: "/create" },
  { key: "library", label: "Library", icon: "◷", href: "/" }
];

function routeActiveKey(pathname: string): DashboardShellProps["active"] {
  if (pathname === "/create") {
    return "none";
  }

  if (pathname.startsWith("/assignments")) {
    return "assignments";
  }

  return "assignments";
}

function notificationMessage(assignment: AssignmentRecord) {
  if (assignment.status === "completed") {
    return "Question paper is ready";
  }

  if (assignment.status === "failed") {
    return "Generation failed";
  }

  if (assignment.status === "generating") {
    return "Generating paper";
  }

  return "Queued for generation";
}

function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "light";
  }

  const savedTheme = window.localStorage.getItem("veda-theme");
  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function DashboardShell({
  children,
  active,
  crumb = "Assignment",
  ctaLabel = "Create Assignment",
  ctaHref = "/create"
}: DashboardShellProps) {
  const pathname = usePathname();
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const activeKey = active ?? routeActiveKey(pathname);
  const isCtaActive = pathname === ctaHref;

  useEffect(() => {
    let isMounted = true;

    fetch(`${API_URL}/api/assignments`)
      .then((response) => (response.ok ? response.json() : []))
      .then((records: AssignmentRecord[]) => {
        if (isMounted) {
          setAssignments(records);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAssignments([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("veda-theme", theme);
  }, [theme]);

  const assignmentCount = assignments.length;
  const libraryCount = assignments.filter((assignment) => assignment.status === "completed" || assignment.result).length;
  const notifications = useMemo(() => assignments.slice(0, 6), [assignments]);
  const unreadCount = notifications.filter(
    (assignment) => !readNotificationIds.includes(assignment.id) && assignment.status !== "completed"
  ).length;

  function handleToggleNotifications() {
    setIsNotificationsOpen((value) => {
      const nextValue = !value;
      if (nextValue) {
        setReadNotificationIds((ids) => Array.from(new Set([...ids, ...notifications.map((item) => item.id)])));
      }

      return nextValue;
    });
  }

  function handleToggleTheme() {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  }

  return (
    <div className="veda-shell min-h-screen bg-[#d0d0d0] p-0 text-[#222] md:bg-[#d9d9d9] md:p-3 print:bg-white print:p-0">
      <div className="grid min-h-screen gap-0 md:min-h-[calc(100vh-24px)] md:gap-3 md:grid-cols-[270px_1fr] print:block print:min-h-0">
        <aside className="veda-sidebar no-print hidden rounded-[18px] bg-white/92 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.18)] md:flex md:flex-col">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-[#2b2220] text-xl font-black text-white shadow-inner">
              V
            </span>
            <span className="text-2xl font-extrabold tracking-tight">VedaAI</span>
          </Link>

          <Link
            href={ctaHref}
            className={`mt-12 flex h-11 items-center justify-center gap-2 rounded-full bg-[#242424] px-5 text-sm font-semibold text-white transition-all duration-300 ${
              isCtaActive
                ? "scale-[1.02] shadow-[0_0_0_2px_#ff6b4a,0_0_22px_rgba(255,86,52,0.55)]"
                : "shadow-[0_0_0_2px_#ff6b4a,0_6px_16px_rgba(255,86,52,0.28)] hover:scale-[1.01]"
            }`}
          >
            <span className={isCtaActive ? "animate-pulse" : ""}>✦</span>
            {ctaLabel}
          </Link>

          <nav className="mt-12 grid gap-2 text-sm font-medium text-[#777]">
            {navItems.map((item) => {
              const isActive = item.key === activeKey;
              const badge =
                item.key === "assignments" ? assignmentCount : item.key === "library" ? libraryCount : undefined;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`group relative flex h-9 items-center gap-3 overflow-hidden rounded-lg px-3 transition-all duration-300 ${
                    isActive
                      ? "translate-x-1 bg-[#eeeeee] text-[#252525] shadow-sm"
                      : "hover:translate-x-0.5 hover:bg-[#f4f4f4]"
                  }`}
                >
                  <span
                    className={`absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-r-full bg-[#ff6b3d] transition-all duration-300 ${
                      isActive ? "w-1 opacity-100" : "w-0 opacity-0"
                    }`}
                  />
                  <span className={`w-4 text-center text-base ${isActive ? "text-[#333]" : "text-[#8a8a8a]"}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {typeof badge === "number" && badge > 0 ? (
                    <span className="ml-auto rounded-full bg-[#ff6b3d] px-2 py-0.5 text-[10px] font-bold text-white">
                      {badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto grid gap-4">
            <Link href="/" className="flex items-center gap-3 px-2 text-sm font-medium text-[#777]">
              <span>⚙</span>
              Settings
            </Link>
            <div className="veda-school-card flex items-center gap-3 rounded-2xl bg-[#f2f2f2] p-3">
              <div className="grid size-12 place-items-center overflow-hidden rounded-full bg-white">
                <Image src={dpsLogo} alt="Delhi Public School logo" className="size-10 object-contain" />
              </div>
              <div>
                <p className="text-sm font-extrabold">Delhi Public School</p>
                <p className="text-xs text-[#777]">Bokaro Steel City</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="veda-main grid min-w-0 grid-rows-[76px_1fr] gap-0 md:grid-rows-[54px_1fr] md:gap-3">
          <header className="veda-header no-print flex items-center justify-between rounded-b-[18px] bg-white/95 px-3 shadow-sm backdrop-blur md:rounded-[18px] md:bg-white/86 md:px-4">
            <div className="flex items-center gap-2 md:gap-3 text-sm font-semibold text-[#9a9a9a]">
              <Link
                href="/"
                className="hidden size-8 place-items-center rounded-full text-xl text-[#333] hover:bg-[#f1f1f1] md:grid"
              >
                ←
              </Link>
              <Link href="/" className="flex items-center gap-2 md:hidden">
                <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-orange-500 to-[#2b2220] text-sm font-black text-white">
                  V
                </span>
                <span className="text-base font-extrabold text-[#222]">VedaAI</span>
              </Link>
              <span className="hidden text-lg text-[#b8b8b8] md:inline">▦</span>
              <span className="hidden md:inline">{crumb}</span>
            </div>
            <div className="relative flex items-center gap-4">
              <button
                type="button"
                onClick={handleToggleTheme}
                className="veda-icon-btn relative grid size-10 place-items-center rounded-full bg-white text-base shadow-sm ring-1 ring-black/5 transition hover:bg-[#f7f7f7]"
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? "☀" : "☾"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  handleToggleNotifications();
                }}
                className="veda-icon-btn relative grid size-10 place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/5 transition hover:bg-[#f7f7f7]"
                aria-label="Open notifications"
                aria-expanded={isNotificationsOpen}
              >
                <Image src={notificationBell} alt="" className="size-5 object-contain" aria-hidden />
                {unreadCount > 0 ? (
                  <span className="absolute right-1 top-0.5 grid min-w-4 place-items-center rounded-full bg-[#ff3b2f] px-1 text-[9px] font-bold leading-4 text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                ) : null}
              </button>
              {isNotificationsOpen ? (
                <div className="veda-dropdown fixed left-3 right-3 top-20 z-30 overflow-hidden rounded-2xl bg-white shadow-[0_18px_45px_rgba(0,0,0,0.18)] ring-1 ring-black/5 md:absolute md:left-auto md:right-28 md:top-12 md:w-80">
                  <div className="flex items-center justify-between border-b border-[#eeeeee] px-4 py-3">
                    <p className="text-sm font-extrabold">Notifications</p>
                    <button
                      type="button"
                      onClick={() => setReadNotificationIds(notifications.map((item) => item.id))}
                      className="text-xs font-bold text-[#ff6b3d]"
                    >
                      Mark read
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto p-2">
                    {notifications.length ? (
                      notifications.map((assignment) => (
                        <Link
                          key={assignment.id}
                          href={`/assignments/${assignment.id}`}
                          onClick={() => setIsNotificationsOpen(false)}
                          className="grid gap-1 rounded-xl px-3 py-3 hover:bg-[#f5f5f5]"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-sm font-extrabold">{assignment.title || "Untitled Assignment"}</p>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                                assignment.status === "failed"
                                  ? "bg-red-50 text-red-600"
                                  : assignment.status === "completed"
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-orange-50 text-orange-600"
                              }`}
                            >
                              {assignment.status}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-[#888]">{notificationMessage(assignment)}</p>
                        </Link>
                      ))
                    ) : (
                      <p className="px-3 py-8 text-center text-sm font-semibold text-[#888]">No notifications yet.</p>
                    )}
                  </div>
                </div>
              ) : null}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    setIsProfileOpen((value) => !value);
                  }}
                  className="veda-profile-btn flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-2 shadow-sm ring-1 ring-black/5 transition hover:bg-[#f7f7f7] md:pr-3"
                  aria-label="Open user menu"
                  aria-expanded={isProfileOpen}
                >
                  <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-[#2f2f2f] to-[#111] text-xs font-extrabold text-white ring-2 ring-white">
                    JD
                  </span>
                  <span className="hidden text-left sm:block">
                    <span className="block text-sm font-extrabold leading-4 text-[#222]">John Doe</span>
                    <span className="block text-[10px] font-semibold leading-3 text-[#888]">Teacher</span>
                  </span>
                  <span className={`text-sm text-[#777] transition-transform ${isProfileOpen ? "rotate-180" : ""}`}>⌄</span>
                </button>

                {isProfileOpen ? (
                  <div className="veda-dropdown absolute right-0 top-12 z-30 w-56 overflow-hidden rounded-2xl bg-white shadow-[0_18px_45px_rgba(0,0,0,0.18)] ring-1 ring-black/5">
                    <div className="flex items-center gap-3 border-b border-[#eeeeee] px-4 py-3">
                      <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-[#2f2f2f] to-[#111] text-xs font-extrabold text-white">
                        JD
                      </span>
                      <div>
                        <p className="text-sm font-extrabold">John Doe</p>
                        <p className="text-xs font-semibold text-[#888]">john.doe@vedaai.com</p>
                      </div>
                    </div>
                    <div className="grid p-2 text-sm font-semibold text-[#555]">
                      <Link href="/" onClick={() => setIsProfileOpen(false)} className="rounded-xl px-3 py-2 hover:bg-[#f5f5f5]">
                        View profile
                      </Link>
                      <Link href="/" onClick={() => setIsProfileOpen(false)} className="rounded-xl px-3 py-2 hover:bg-[#f5f5f5]">
                        Account settings
                      </Link>
                      <button type="button" className="rounded-xl px-3 py-2 text-left text-[#df4338] hover:bg-[#f5f5f5]">
                        Sign out
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
              <button type="button" className="grid size-9 place-items-center rounded-full text-xl md:hidden" aria-label="Open menu">
                ☰
              </button>
            </div>
          </header>

          <section className="veda-content print-root min-w-0 overflow-hidden bg-[#d0d0d0] pb-24 md:rounded-[18px] md:bg-[#eeeeee] md:pb-0 md:shadow-inner print:rounded-none print:shadow-none">
            {children}
          </section>
        </main>
      </div>

      <nav className="veda-bottom-nav no-print fixed bottom-3 left-3 right-3 z-40 grid h-16 grid-cols-4 rounded-2xl bg-[#111] px-2 shadow-[0_12px_30px_rgba(0,0,0,0.35)] md:hidden">
        {navItems
          .filter((item) => ["home", "assignments", "library", "toolkit"].includes(item.key))
          .map((item) => {
            const isActive = item.key === activeKey || (item.key === "toolkit" && isCtaActive);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`grid place-items-center gap-0.5 rounded-xl py-2 text-[10px] font-bold transition ${
                  isActive ? "text-white" : "text-[#555]"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
      </nav>
    </div>
  );
}
