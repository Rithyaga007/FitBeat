import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useUser } from "@/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";

import {
  LayoutDashboard,
  Dumbbell,
  HeartPulse,
  Sparkles,
  Target,
  Award,
  Bell,
  X,
  Trophy,
  Flame,
  BrainCircuit,
  Footprints,
  LogOut,
} from "lucide-react";

import { Button } from "@/components/ui/button";

/* =========================================
   NAVIGATION
========================================= */

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },

  {
    href: "/workouts",
    label: "Workouts",
    icon: Dumbbell,
  },

  {
    href: "/health",
    label: "Health",
    icon: HeartPulse,
  },

  {
    href: "/goals",
    label: "Goals",
    icon: Target,
  },

  {
    href: "/brands",
    label: "Products & Services",
    icon: Award,
  },
  
  {
    href: "/recommendation",
    label: "Recommendation",
    icon: Sparkles,
  },
];

/* =========================================
   ICONS
========================================= */

const getNotificationIcon = (
  type: string
) => {

  switch (type) {

    case "steps":
      return Footprints;

    case "calories":
      return Flame;

    case "achievement":
      return Trophy;

    case "recommendation":
      return BrainCircuit;

    case "health":
      return HeartPulse;

    case "workout":
      return Dumbbell;

    default:
      return Bell;
  }
};

/* =========================================
   COLORS
========================================= */

const getNotificationColor = (
  type: string
) => {

  switch (type) {

    case "steps":
      return {
        color: "text-primary",
        bg: "bg-primary/20",
      };

    case "calories":
      return {
        color: "text-orange-400",
        bg: "bg-orange-500/20",
      };

    case "achievement":
      return {
        color: "text-yellow-400",
        bg: "bg-yellow-500/20",
      };

    case "recommendation":
      return {
        color: "text-secondary",
        bg: "bg-secondary/20",
      };

    case "health":
      return {
        color: "text-rose-400",
        bg: "bg-rose-500/20",
      };

    case "workout":
      return {
        color: "text-emerald-400",
        bg: "bg-emerald-500/20",
      };

    default:
      return {
        color: "text-primary",
        bg: "bg-primary/20",
      };
  }
};

/* =========================================
   LAYOUT
========================================= */

export function Layout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [location, setLocation] =
    useLocation();

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [notifications, setNotifications] =
    useState<any[]>([]);

  const [loadingNotifications, setLoadingNotifications] =
    useState(false);

  /*
    READ IDS
    RESET ONLY AFTER LOGOUT
  */

  const [readIds, setReadIds] =
    useState<Set<number>>(new Set());

  const { clearProfile } =
    useUser();

  /* =========================================
     UNREAD COUNT
  ========================================= */

  const unreadCount =
    notifications.filter(
      (n) =>
        n.unread &&
        !readIds.has(n.id)
    ).length;

  /* =========================================
     MARK ALL READ
  ========================================= */

  const markAllRead = () => {

    setReadIds(
      new Set(
        notifications.map(
          (n) => n.id
        )
      )
    );
  };

  /* =========================================
     MARK SINGLE READ
  ========================================= */

  const markRead = (
    id: number
  ) => {

    setReadIds(
      (prev) =>
        new Set([
          ...prev,
          id,
        ])
    );
  };

  /* =========================================
     FETCH AI NOTIFICATIONS
  ========================================= */

  useEffect(() => {

    fetchNotifications();

  }, []);

  const fetchNotifications =
    async () => {

      try {

        setLoadingNotifications(
          true
        );

        /*
          MOCK AI DATABASE DATA
          Replace later with API
        */

        const aiNotifications = [

          {
            id: 1,

            title:
              "AI Recommendation Ready",

            message:
              "Low protein intake detected. Whey Protein suggested.",

            time:
              "2 min ago",

            unread: true,

            type:
              "recommendation",
          },

          {
            id: 2,

            title:
              "Weight Loss Insight",

            message:
              "AI suggests increasing hydration and cardio sessions.",

            time:
              "12 min ago",

            unread: true,

            type:
              "health",
          },

          {
            id: 3,

            title:
              "Workout Recovery Alert",

            message:
              "Recovery score is low. AI suggests recovery supplements.",

            time:
              "35 min ago",

            unread: true,

            type:
              "workout",
          },

          {
            id: 4,

            title:
              "AI Sleep Recommendation",

            message:
              "Poor sleep pattern detected. Magnesium recommended.",

            time:
              "1 hr ago",

            unread: false,

            type:
              "recommendation",
          },

          {
            id: 5,

            title:
              "Calorie Burn Milestone",

            message:
              "Excellent progress. You burned 650 kcal today.",

            time:
              "2 hrs ago",

            unread: false,

            type:
              "calories",
          },
        ];

        /*
          SIMULATE API DELAY
        */

        setTimeout(() => {

          setNotifications(
            aiNotifications
          );

          setLoadingNotifications(
            false
          );

        }, 1000);

      } catch (error) {

        console.error(
          "Notification Fetch Error:",
          error
        );

        setLoadingNotifications(
          false
        );
      }
    };

  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout = () => {

    /*
      RESET READ IDS
      AFTER LOGOUT
    */

    setReadIds(
      new Set()
    );

    clearProfile();

    setLocation("/");
  };

  return (

    <div className="min-h-screen bg-background text-foreground flex overflow-hidden relative">

      {/* Background */}
      <div className="fixed top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="fixed bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      {/* SIDEBAR */}
      <aside className="w-64 glass-panel border-r border-white/5 flex flex-col z-10 shrink-0">

        {/* LOGO */}
        <div className="h-20 flex items-center px-4 border-b border-white/5">

          <Link
            href="/dashboard"
            className="flex items-center"
          >

            <img
              src="/fitbeat-logo.png"
              alt="FitBeat"
              className="h-16 w-auto object-contain"
            />

          </Link>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 py-6 px-4 space-y-2">

          {NAV_ITEMS.map(
            (item) => {

              const isActive =
                location ===
                item.href;

              return (

                <Link
                  key={item.href}
                  href={item.href}
                >

                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer relative ${
                      isActive
                        ? "bg-primary/20 text-white shadow-[inset_2px_0_0_0_hsl(var(--primary))]"
                        : "text-muted-foreground hover:bg-white/5 hover:text-white"
                    }`}
                  >

                    <item.icon
                      className={`w-5 h-5 ${
                        isActive
                          ? "text-secondary drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                          : ""
                      }`}
                    />

                    <span className="font-medium">
                      {item.label}
                    </span>

                    {isActive && (

                      <motion.div
                        layoutId="activeNav"
                        className="absolute left-0 w-1 h-8 bg-gradient-to-b from-primary to-secondary rounded-r-full shadow-[0_0_10px_rgba(124,58,237,0.8)]"
                      />
                    )}
                  </div>
                </Link>
              );
            }
          )}
        </nav>

        {/* PROMO */}
        <div className="px-4 pb-5">

          <div className="relative rounded-2xl overflow-hidden border border-white/10">

            <img
              src="/sidebar-promo.png"
              alt="Promo"
              className="w-full h-auto object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#050816]/70 via-transparent to-transparent" />

            <div className="absolute bottom-3 left-3 right-3">

              <p className="text-white text-xs font-bold leading-tight">
                Track. Train. Transform.
              </p>

              <p className="text-white/70 text-[10px] mt-0.5">
                Your AI fitness companion
              </p>

            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col min-w-0 z-10 relative h-screen overflow-hidden">

        {/* HEADER */}
        <header className="h-20 glass-panel border-b border-white/5 px-8 flex items-center justify-end shrink-0 relative z-20">

          <div className="flex items-center gap-6">

            {/* NOTIFICATIONS */}
            <div className="relative">

              <button
                onClick={() =>
                  setShowNotifications(
                    (prev) =>
                      !prev
                  )
                }
                className="relative p-2 text-muted-foreground hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >

                <Bell
                  className={`w-5 h-5 transition-colors ${
                    showNotifications
                      ? "text-primary"
                      : ""
                  }`}
                />

                {unreadCount >
                  0 && (

                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full shadow-[0_0_5px_rgba(220,38,38,0.8)]" />
                )}
              </button>

              {/* PANEL */}
              <AnimatePresence>

                {showNotifications && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() =>
                        setShowNotifications(
                          false
                        )
                      }
                    />

                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 10,
                        scale: 0.95,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        y: 10,
                        scale: 0.95,
                      }}
                      className="absolute right-0 top-12 w-[380px] bg-[hsl(var(--card))] border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] z-40 overflow-hidden backdrop-blur-xl"
                    >

                      {/* PANEL HEADER */}
                      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">

                        <div className="flex items-center gap-3">

                          <h3 className="font-semibold text-white text-base">
                            Notifications
                          </h3>

                          {unreadCount >
                            0 && (

                            <span className="text-xs font-bold bg-primary text-white px-2 py-0.5 rounded-full">

                              {
                                unreadCount
                              }{" "}
                              new

                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">

                          {unreadCount >
                            0 && (

                            <button
                              onClick={
                                markAllRead
                              }
                              className="text-xs text-primary hover:text-primary/80"
                            >

                              Mark all read

                            </button>
                          )}

                          <button
                            onClick={() =>
                              setShowNotifications(
                                false
                              )
                            }
                            className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white"
                          >

                            <X className="w-4 h-4" />

                          </button>
                        </div>
                      </div>

                      {/* LIST */}
                      <div className="max-h-[440px] overflow-y-auto">

                        {loadingNotifications && (

                          <div className="p-6 text-center text-sm text-muted-foreground">

                            Loading AI notifications...

                          </div>
                        )}

                        {!loadingNotifications &&
                          notifications.length ===
                            0 && (

                            <div className="p-6 text-center text-sm text-muted-foreground">

                              No AI notifications available

                            </div>
                          )}

                        {notifications.map(
                          (
                            notif,
                            i
                          ) => {

                            const Icon =
                              getNotificationIcon(
                                notif.type
                              );

                            const notificationStyle =
                              getNotificationColor(
                                notif.type
                              );

                            const isUnread =
                              notif.unread &&
                              !readIds.has(
                                notif.id
                              );

                            return (

                              <motion.button
                                key={
                                  notif.id
                                }
                                initial={{
                                  opacity: 0,
                                  x: 10,
                                }}
                                animate={{
                                  opacity: 1,
                                  x: 0,
                                }}
                                transition={{
                                  delay:
                                    i *
                                    0.04,
                                }}

                                /*
                                  NO REDIRECT
                                  ONLY REDUCE COUNT
                                */

                                onClick={() => {

                                  markRead(
                                    notif.id
                                  );
                                }}

                                className={`w-full text-left flex items-start gap-4 px-5 py-4 border-b border-white/5 transition-all hover:bg-white/5 ${
                                  isUnread
                                    ? "bg-primary/5"
                                    : ""
                                }`}
                              >

                                {/* ICON */}
                                <div
                                  className={`w-10 h-10 rounded-xl ${notificationStyle.bg} flex items-center justify-center shrink-0 mt-0.5`}
                                >

                                  <Icon
                                    className={`w-5 h-5 ${notificationStyle.color}`}
                                  />

                                </div>

                                {/* CONTENT */}
                                <div className="flex-1 min-w-0">

                                  <div className="flex items-center gap-2 mb-0.5">

                                    <p className="text-sm font-semibold text-white">

                                      {
                                        notif.title
                                      }

                                    </p>

                                    {isUnread && (

                                      <span className="w-2 h-2 rounded-full bg-primary" />
                                    )}
                                  </div>

                                  <p className="text-xs text-muted-foreground leading-relaxed">

                                    {
                                      notif.message
                                    }

                                  </p>

                                  <p className="text-xs text-primary/70 mt-1.5">

                                    {
                                      notif.time
                                    }

                                  </p>
                                </div>
                              </motion.button>
                            );
                          }
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* LOGOUT */}
            <div className="flex items-center pl-6 border-l border-white/10">

              <Button
                onClick={
                  handleLogout
                }
                className="bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-2 px-4 py-2 rounded-xl"
              >

                <LogOut className="w-4 h-4" />

                Logout

              </Button>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-auto p-8 scroll-smooth">

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -20,
            }}
            transition={{
              duration: 0.4,
            }}
            className="max-w-7xl mx-auto"
          >

            {children}

          </motion.div>
        </div>
      </main>
    </div>
  );
}