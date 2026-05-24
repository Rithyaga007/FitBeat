import { supabase } from "../lib/supabase";
import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

import {
  Eye,
  EyeOff,
  Lock,
  User,
  ArrowRight,
  TrendingUp,
  Heart,
  Target,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import heroImage from "@assets/ChatGPT_Image_May_14,_2026,_10_08_46_AM_1779325862743.png";

/* =========================================
   FEATURES
========================================= */

const FEATURES = [
  {
    icon: TrendingUp,

    title: "Smart Tracking",

    desc:
      "Monitor your activities, workouts and progress in real time.",

    color: "text-violet-400",

    bg: "bg-violet-500/20",

    border:
      "border-violet-500/30",
  },

  {
    icon: Heart,

    title: "Health Insights",

    desc:
      "Get AI-powered insights to improve your health and performance.",

    color: "text-pink-400",

    bg: "bg-pink-500/20",

    border:
      "border-pink-500/30",
  },

  {
    icon: Target,

    title: "Achieve Goals",

    desc:
      "Set goals, stay motivated and achieve more every day.",

    color: "text-cyan-400",

    bg: "bg-cyan-500/20",

    border:
      "border-cyan-500/30",
  },
];

/* =========================================
   AVATARS
========================================= */

const AVATARS = [
  "https://i.pravatar.cc/32?img=1",

  "https://i.pravatar.cc/32?img=2",

  "https://i.pravatar.cc/32?img=3",
];

/* =========================================
   LOGIN
========================================= */

export default function Login() {

  const [, setLocation] =
    useLocation();

  const [showPassword, setShowPassword] =
    useState(false);

  const [username, setUsername] =
    useState("susi");

  const [password, setPassword] =
    useState("susi123");

  const [remember, setRemember] =
    useState(true);

  /*
    ERROR STATE
  */

  const [error, setError] =
    useState("");

  /*
    LOGIN
  */

  const handleLogin = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    /*
      CLEAR OLD ERROR
    */

    setError("");

    try {

      const {
        data,
        error,
      } = await supabase

        .from("master_fitness")

        .select("*")

        .eq(
          "username",
          username
        )

        .eq(
          "password",
          password
        )

        .single();

      /*
        INVALID LOGIN
      */

      if (
        error ||
        !data
      ) {

       setError(
  "Invalid Username or Password. If you don't have login details, kindly sign up."
);

        return;
      }

      console.log(
        "Logged User:",
        data
      );

      /*
        SAVE USER
      */

      localStorage.setItem(
        "fitbeat_user",
        JSON.stringify(data)
      );

      /*
        SUCCESS LOGIN
      */

      setLocation(
        "/dashboard"
      );

    } catch (err) {

      console.error(err);

      setError(
        "Something went wrong. Please try again."
      );
    }
  };

  return (

    <div className="min-h-screen bg-[#06071a] flex overflow-hidden">

      {/* =========================================
          LEFT PANEL
      ========================================= */}

      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-[#06071a]">

        {/* Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-700/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-cyan-700/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Hero */}
        <img
          src={heroImage}
          alt="Fitness"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#06071a]/80 via-[#06071a]/40 to-[#06071a]/10" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#06071a]/70 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">

          {/* Logo */}
          <div className="flex items-center">

            <img
              src="/fitbeat-logo.png"
              alt="FitBeat"
              className="h-24 w-auto object-contain"
            />

          </div>

          {/* Headline */}
          <div className="max-w-sm">

            <motion.div
              initial={{
                opacity: 0,
                y: 30,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.7,
              }}
            >

              <h1 className="text-5xl font-heading font-extrabold text-white leading-tight mb-3">

                Your Fitness.
                <br />

                Your{" "}

                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">

                  Beat.

                </span>
              </h1>

              <p className="text-slate-300 text-base mb-8 leading-relaxed">

                Track workouts,
                monitor health,
                and achieve your goals
                with AI-powered insights.

              </p>
            </motion.div>

            {/* Feature Cards */}
            <div className="space-y-3">

              {FEATURES.map(
                (
                  f,
                  i
                ) => (

                  <motion.div
                    key={f.title}
                    initial={{
                      opacity: 0,
                      x: -20,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay:
                        0.3 +
                        i * 0.15,
                      duration: 0.5,
                    }}
                    className={`flex items-center gap-4 p-4 rounded-xl border ${f.border} backdrop-blur-md bg-white/5`}
                  >

                    <div
                      className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center shrink-0`}
                    >

                      <f.icon
                        className={`w-5 h-5 ${f.color}`}
                      />

                    </div>

                    <div>

                      <p className="text-white font-semibold text-sm">

                        {f.title}

                      </p>

                      <p className="text-slate-400 text-xs leading-snug">

                        {f.desc}

                      </p>

                    </div>
                  </motion.div>
                )
              )}
            </div>

            {/* Social Proof */}
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.9,
                duration: 0.5,
              }}
              className="mt-6 flex items-center gap-4 p-4 rounded-xl border border-white/10 backdrop-blur-md bg-white/5 w-fit"
            >

              <div className="flex -space-x-2">

                {AVATARS.map(
                  (
                    src,
                    i
                  ) => (

                    <img
                      key={i}
                      src={src}
                      alt=""
                      className="w-8 h-8 rounded-full border-2 border-[#06071a] object-cover"
                    />
                  )
                )}
              </div>

              <div>

                <p className="text-white font-bold text-sm">

                  Join 50K+ users

                </p>

                <p className="text-slate-400 text-xs">

                  achieving their fitness goals

                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* =========================================
          RIGHT PANEL
      ========================================= */}

      <div className="w-full lg:w-[480px] xl:w-[520px] bg-[#0b0d2a] flex flex-col items-center justify-center p-8 relative shrink-0">

        {/* Glow */}
        <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-violet-700/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-cyan-700/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center mb-10">

          <img
            src="/fitbeat-logo.png"
            alt="FitBeat"
            className="h-24 w-auto object-contain"
          />

        </div>

        <motion.div
          initial={{
            opacity: 0,
            y: 24,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="w-full max-w-[400px] relative z-10"
        >

          {/* Heading */}
          <div className="text-center mb-8">

            <h2 className="text-3xl font-heading font-bold text-white mb-2">

              Welcome Back!

            </h2>

            <p className="text-slate-400 text-sm">

              Login to continue your fitness journey

            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* Username */}
            <div className="space-y-2">

              <label className="text-sm font-medium text-slate-300">

                Username

              </label>

              <div className="relative">

                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <Input
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value
                    )
                  }
                  placeholder="Enter your username"
                  className="pl-11 h-12 bg-[#141630] border-[#1e2140] text-white placeholder:text-slate-500 focus-visible:border-violet-500 focus-visible:ring-violet-500/30 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">

              <div className="flex justify-between items-center">

                <label className="text-sm font-medium text-slate-300">

                  Password

                </label>

                <a
                  href="#"
                  className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
                >

                  Forgot Password?

                </a>
              </div>

              <div className="relative">

                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <Input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="Enter your password"
                  className="pl-11 pr-12 h-12 bg-[#141630] border-[#1e2140] text-white placeholder:text-slate-500 focus-visible:border-violet-500 focus-visible:ring-violet-500/30 rounded-xl text-sm"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >

                  {showPassword ? (

                    <EyeOff className="w-4 h-4" />

                  ) : (

                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* ERROR MESSAGE */}
              {error && (

                <motion.p
                  initial={{
                    opacity: 0,
                    y: -5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="text-red-400 text-sm font-medium mt-2"
                >

                  {error}

                </motion.p>
              )}
            </div>

            {/* Remember */}
            <div className="flex items-center gap-3">

              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(v) =>
                  setRemember(
                    !!v
                  )
                }
                className="border-violet-500/50 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600 rounded w-4 h-4"
              />

              <label
                htmlFor="remember"
                className="text-sm text-slate-300 cursor-pointer select-none"
              >

                Remember me

              </label>
            </div>

            {/* LOGIN BUTTON */}
            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 text-white font-semibold text-base border-0 shadow-[0_0_24px_rgba(124,58,237,0.5)] hover:shadow-[0_0_32px_rgba(124,58,237,0.7)] transition-all group"
            >

              Login

              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />

            </Button>
          </form>

          {/* SIGN UP */}
          <p className="text-center text-sm text-slate-400 mt-6">

            Don't have an account?{" "}

            <button
              type="button"
              onClick={() =>
                setLocation(
                  "/onboarding"
                )
              }
              className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
            >

              Sign up

            </button>
          </p>

          {/* SECURITY */}
          <div className="flex items-center justify-center gap-2 mt-6">

            <ShieldCheck className="w-4 h-4 text-emerald-400" />

            <p className="text-xs text-slate-500">

              Your data is{" "}

              <span className="text-emerald-400 font-medium">

                secure

              </span>{" "}

              and{" "}

              <span className="text-cyan-400 font-medium">

                encrypted

              </span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}