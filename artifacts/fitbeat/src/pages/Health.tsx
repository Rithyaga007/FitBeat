import { Layout } from "@/components/layout/Sidebar";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  HeartPulse,
  Droplets,
  Brain,
  Activity,
  Info,
  ChevronRight,
  BrainCircuit,
  Moon,
  Zap,
  Cigarette,
  Wine,
  Watch,
  Sun,
  Timer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

// ── helpers ──────────────────────────────────────────────────────────────────
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function buildHeartRateData(restingHR: number) {
  return [
    { time: "12AM", value: restingHR },
    { time: "3AM",  value: Math.round(restingHR * 0.93) },
    { time: "6AM",  value: Math.round(restingHR * 1.05) },
    { time: "9AM",  value: Math.round(restingHR * 1.25) },
    { time: "12PM", value: Math.round(restingHR * 1.45) },
    { time: "3PM",  value: Math.round(restingHR * 1.75) },
    { time: "6PM",  value: Math.round(restingHR * 1.55) },
    { time: "9PM",  value: Math.round(restingHR * 1.10) },
    { time: "12AM", value: Math.round(restingHR * 1.02) },
  ];
}

// stress_level is a string: "Low" | "Moderate" | "High"
const STRESS_NUM: Record<string, number> = { Low: 3, Moderate: 6, High: 9 };
function buildStressTrendData(stressLabel: string) {
  const base    = (STRESS_NUM[stressLabel] ?? 5) * 10;
  const factors = [0.70, 0.84, 0.76, 1.10, 1.24, 1.36, 1.44];
  return DAYS.map((day, i) => ({ day, stress: Math.min(100, Math.round(base * factors[i])) }));
}

function buildSleepData(sleepHrs: number) {
  const factors = [0.88, 1.05, 0.92, 1.0, 0.80, 1.15, 1.10];
  return DAYS.map((day, i) => ({
    day,
    sleep:  +(sleepHrs * factors[i]).toFixed(1),
    target: 8,
  }));
}

const SLEEP_COLOR = (v: number) => v >= 7 ? "#7C3AED" : v >= 5 ? "#eab308" : "#ef4444";

// Derive a simple 0-100 health score from available columns
function calcHealthScore(d: any): number {
  let score = 0, count = 0;
  if (d.energy_level_score)      { score += Math.min(100, Number(d.energy_level_score) * 10); count++; }
  if (d.mental_wellness_score)   { score += Math.min(100, Number(d.mental_wellness_score) * 10); count++; }
  if (d.productivity_score)      { score += Math.min(100, Number(d.productivity_score)); count++; }
  if (d.sleep_hours_avg) {
    score += Math.min(100, Math.round((Number(d.sleep_hours_avg) / 9) * 100)); count++;
  }
  if (d.water_intake_liters) {
    score += Math.min(100, Math.round((Number(d.water_intake_liters) / 3) * 100)); count++;
  }
  if (d.resting_heart_rate) {
    const hr = Number(d.resting_heart_rate);
    score += hr < 60 ? 100 : hr < 80 ? 85 : hr < 100 ? 65 : 40;
    count++;
  }
  return count > 0 ? Math.round(score / count) : 0;
}

export default function Health() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading]   = useState(true);

  // ── Fetch master_fitness ─────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const stored = localStorage.getItem("fitbeat_user");
        if (!stored) { setLoading(false); return; }
        const { user_id } = JSON.parse(stored);
        const { data, error } = await supabase
          .from("master_fitness")
          .select("*")
          .eq("user_id", user_id)
          .single();
        if (!error && data) setUserData(data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  // ── master_fitness field bindings ────────────────────────────────────────
  const restingHR         = userData?.resting_heart_rate      ? Number(userData.resting_heart_rate)      : null;
  const waterVal          = userData?.water_intake_liters      ? parseFloat(userData.water_intake_liters)  : null;
  const stressLabel       = userData?.stress_level             || null;   // "Low"|"Moderate"|"High"
  const energyScore       = userData?.energy_level_score       != null ? Number(userData.energy_level_score)       : null;
  const mentalWellness    = userData?.mental_wellness_score    != null ? Number(userData.mental_wellness_score)    : null;
  const productivityScore = userData?.productivity_score       != null ? Number(userData.productivity_score)       : null;
  const sleepHrs          = userData?.sleep_hours_avg          != null ? parseFloat(userData.sleep_hours_avg)      : null;
  const sleepQuality      = userData?.sleep_quality            || null;
  const wakeUpTime        = userData?.wake_up_time             || null;
  const sleepTime         = userData?.sleep_time               || null;
  const meditationMins    = userData?.meditation_minutes_per_day != null ? Number(userData.meditation_minutes_per_day) : null;
  const smokingStatus     = userData?.smoking_status           || null;
  const alcoholPerWeek    = userData?.alcohol_consumption_per_week != null ? Number(userData.alcohol_consumption_per_week) : null;
  const smartwatchUser    = userData?.smartwatch_user;
  const healthGoal        = userData?.health_goal              || null;
  const bmi               = userData?.bmi                      != null ? Number(userData.bmi)               : null;
  const weightKg          = userData?.weight_kg                != null ? Number(userData.weight_kg)         : null;
  const heightCm          = userData?.height_cm                != null ? Number(userData.height_cm)         : null;
  const screenTime        = userData?.screen_time_hours        != null ? Number(userData.screen_time_hours) : null;
  const sedentaryHrs      = userData?.sedentary_hours_per_day  != null ? Number(userData.sedentary_hours_per_day) : null;
  const weekendActivity   = userData?.weekend_activity_score   != null ? Number(userData.weekend_activity_score)  : null;
  const activityPattern   = userData?.activity_pattern         || null;

  // ── Derived ──────────────────────────────────────────────────────────────
  const healthScore    = userData ? calcHealthScore(userData) : null;
  const healthLabel    = healthScore != null ? (healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : "Fair") : null;

  // Hydration goal: 2.5 L recommended baseline
  const hydrationGoal  = 2.5;
  const waterPct       = waterVal != null ? Math.min(100, Math.round((waterVal / hydrationGoal) * 100)) : null;
  const waterRemaining = waterVal != null ? Math.max(0, hydrationGoal - waterVal).toFixed(1) : null;

  const peakHR      = restingHR != null ? Math.round(restingHR * 1.75) : null;
  const fatBurnZone = restingHR != null ? Math.round(restingHR * 1.25) : null;
  const cardioZone  = restingHR != null ? Math.round(restingHR * 1.45) : null;

  // ── Chart data ────────────────────────────────────────────────────────────
  const heartRateData   = restingHR != null ? buildHeartRateData(restingHR) : null;
  const stressTrendData = stressLabel ? buildStressTrendData(stressLabel) : null;
  const sleepTrendData  = sleepHrs   != null ? buildSleepData(sleepHrs)   : null;

  const hrInsights = restingHR && peakHR && fatBurnZone && cardioZone ? [
    { label: "Resting HR",  value: `${restingHR} bpm`,  sub: "Your baseline",      color: "text-primary",    bg: "bg-primary/10",    dot: "#7C3AED" },
    { label: "Fat Burn",    value: `${fatBurnZone} bpm`, sub: `~${Math.round(fatBurnZone*0.8)}–${fatBurnZone}`, color: "text-emerald-400", bg: "bg-emerald-500/10", dot: "#22c55e" },
    { label: "Cardio Zone", value: `${cardioZone} bpm`,  sub: `~${fatBurnZone}–${cardioZone}`, color: "text-yellow-400", bg: "bg-yellow-500/10", dot: "#eab308" },
    { label: "Est. Peak",   value: `${peakHR} bpm`,      sub: "At peak effort",    color: "text-rose-400",   bg: "bg-rose-500/10",   dot: "#ef4444" },
  ] : null;

  // Wellness radar — all from master_fitness
  const wellnessRadar = [
    { dim: "Health",     value: healthScore   ?? 0 },
    { dim: "Energy",     value: energyScore   != null ? energyScore * 10 : 0 },
    { dim: "Mental",     value: mentalWellness != null ? mentalWellness * 10 : 0 },
    { dim: "Productivity", value: productivityScore ?? 0 },
    { dim: "Sleep",      value: sleepHrs != null ? Math.min(100, Math.round((sleepHrs / 9) * 100)) : 0 },
    { dim: "Hydration",  value: waterPct ?? 0 },
  ];

  // NEW: BMI category donut
  const bmiCategory = bmi != null
    ? bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese"
    : null;
  const bmiDonut = bmi != null ? [
    { name: "BMI",      value: Math.min(bmi, 40),  color: bmi < 25 ? "#22c55e" : bmi < 30 ? "#eab308" : "#ef4444" },
    { name: "Remaining",value: Math.max(0, 40 - bmi), color: "rgba(255,255,255,0.05)" },
  ] : null;

  // NEW: Daily time allocation from master_fitness
  const activeHrs     = userData?.weekly_active_minutes != null ? +(Number(userData.weekly_active_minutes) / 60 / 7).toFixed(1) : null;
  const timeAllocation = (sedentaryHrs != null || activeHrs != null || sleepHrs != null) ? [
    { name: "Sleep",      value: sleepHrs      ?? 0, color: "#7C3AED" },
    { name: "Active",     value: activeHrs     ?? 0, color: "#06B6D4" },
    { name: "Sedentary",  value: sedentaryHrs  ?? 0, color: "#f97316" },
    { name: "Screen",     value: screenTime    ?? 0, color: "#eab308" },
    { name: "Other",      value: Math.max(0, +(24 - (sleepHrs ?? 0) - (activeHrs ?? 0) - (sedentaryHrs ?? 0) - (screenTime ?? 0)).toFixed(1)), color: "#4B5563" },
  ].filter(d => d.value > 0) : null;

  // NEW: Wellness score bars (derived from master_fitness fields, scaled to 100)
  const wellnessScores = [
    { label: "Energy",       value: energyScore   != null ? energyScore * 10 : null,          color: "#7C3AED", max: 100 },
    { label: "Mental",       value: mentalWellness != null ? mentalWellness * 10 : null,       color: "#06B6D4", max: 100 },
    { label: "Productivity", value: productivityScore ?? null,                                  color: "#22c55e", max: 100 },
    { label: "Weekend Act.", value: weekendActivity != null ? weekendActivity * 10 : null,     color: "#f97316", max: 100 },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[70vh]">
          <p className="text-muted-foreground text-lg">Loading health data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 pb-10">

        {/* ── Header ── */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">Health</h1>
          <p className="text-muted-foreground text-lg">Monitor your vital signs and health metrics.</p>
        </div>

        {/* ── Hero Banner ── */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 h-48">
          <img
            src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=1200&h=400&fit=crop&auto=format"
            alt="Health monitoring"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent" />
          <div className="relative z-10 p-8 h-full flex flex-col justify-center gap-3">
            <div className="text-xs font-bold tracking-widest text-rose-400 uppercase">Your Health Today</div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {healthScore != null ? `Health Score: ${healthScore} — ${healthLabel}` : "Your Health Overview"}
            </h2>
            <p className="text-white/60 text-sm max-w-md">
              {healthGoal
                ? `Working toward: ${healthGoal}${activityPattern ? ` · Pattern: ${activityPattern}` : ""}`
                : "Complete your profile to see your personalized health metrics."}
            </p>
          </div>
        </div>

        {/* ── Tip banners ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop&auto=format", label: "Cardio",    tip: "30 min runs improve heart health and endurance" },
            { img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=200&fit=crop&auto=format",  label: "Recovery",  tip: "Stretching and rest reduce stress hormones" },
            { img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&h=200&fit=crop&auto=format", label: "Nutrition", tip: "A balanced diet keeps your vitals optimal" },
          ].map((item) => (
            <div key={item.label} className="relative rounded-xl overflow-hidden border border-white/10 h-28 group cursor-pointer">
              <img src={item.img} alt={item.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-3">
                <div className="text-[10px] font-bold tracking-widest text-primary uppercase mb-0.5">{item.label}</div>
                <p className="text-white text-xs font-medium leading-tight">{item.tip}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Top Vital Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Resting Heart Rate", value: restingHR != null ? `${restingHR}` : "—",          unit: restingHR != null ? "bpm" : "",     icon: HeartPulse, color: "text-rose-400",   bg: "bg-rose-500/20" },
            { label: "Water Intake",       value: waterVal  != null ? `${waterVal}` : "—",            unit: waterVal  != null ? "L/day" : "",   icon: Droplets,  color: "text-cyan-400",   bg: "bg-cyan-500/20" },
            { label: "Stress Level",       value: stressLabel || "—",                                 unit: "",                                  icon: Brain,     color: "text-yellow-400", bg: "bg-yellow-500/20" },
            { label: "Energy Level",       value: energyScore != null ? String(energyScore) : "—",    unit: energyScore != null ? "/ 10" : "",  icon: Activity,  color: "text-purple-400", bg: "bg-purple-500/20" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="glass-panel border-white/10 hover:border-white/20 transition-all">
                <CardContent className="p-5">
                  <div className={`p-2 rounded-lg ${stat.bg} w-fit mb-3`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-bold ${stat.value === "—" ? "text-white/30" : "text-white"}`}>{stat.value}</span>
                    {stat.unit && <span className="text-sm text-muted-foreground">{stat.unit}</span>}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ── Secondary Vital Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "BMI",            value: bmi != null ? `${bmi}` : "—",                     unit: bmi != null ? bmiCategory || "" : "",     icon: Activity,  color: "text-emerald-400", bg: "bg-emerald-500/20" },
            { label: "Sleep Duration", value: sleepHrs != null ? `${sleepHrs.toFixed(1)}` : "—", unit: sleepHrs != null ? "hrs/night" : "",      icon: Moon,      color: "text-blue-400",    bg: "bg-blue-500/20" },
            { label: "Meditation",     value: meditationMins != null ? String(meditationMins) : "—", unit: meditationMins != null ? "min/day" : "", icon: Timer,   color: "text-violet-400",  bg: "bg-violet-500/20" },
            { label: "Screen Time",    value: screenTime != null ? `${screenTime}` : "—",        unit: screenTime != null ? "hrs/day" : "",       icon: Zap,       color: "text-orange-400",  bg: "bg-orange-500/20" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-panel border-white/10 hover:border-white/20 transition-all">
                <CardContent className="p-5">
                  <div className={`p-2 rounded-lg ${stat.bg} w-fit mb-3`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-bold ${stat.value === "—" ? "text-white/30" : "text-white"}`}>{stat.value}</span>
                    {stat.unit && <span className="text-sm text-muted-foreground">{stat.unit}</span>}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ── Heart Rate + Health Score / Hydration ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="glass-panel border-white/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-white text-lg font-semibold">Heart Rate Zone</CardTitle>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                {heartRateData ? (
                  <>
                    <div className="flex gap-4 mb-4 text-xs flex-wrap">
                      {hrInsights && hrInsights.map((z) => (
                        <div key={z.label} className="flex items-center gap-1">
                          <div className="w-3 h-0.5 rounded" style={{ backgroundColor: z.dot }} />
                          <span className="text-muted-foreground">{z.label}: {z.value}</span>
                        </div>
                      ))}
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={heartRateData}>
                        <defs>
                          <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#7C3AED" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="time" tick={{ fill: "hsl(229 20% 70%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis
                          domain={[Math.round((restingHR ?? 60) * 0.85), Math.round((restingHR ?? 60) * 1.85)]}
                          tick={{ fill: "hsl(229 20% 70%)", fontSize: 11 }} axisLine={false} tickLine={false}
                        />
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: "hsl(229 63% 8%)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 12, color: "#fff" }}
                          formatter={(v: number) => [`${v} bpm`, "Heart Rate"]}
                        />
                        <Line type="monotone" dataKey="value" stroke="#7C3AED" strokeWidth={2.5}
                          dot={{ fill: "#06B6D4", r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: "#06B6D4" }} />
                      </LineChart>
                    </ResponsiveContainer>
                    {hrInsights && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/5 pt-4 mt-2">
                        {hrInsights.map((ins) => (
                          <div key={ins.label} className={`rounded-xl p-3 ${ins.bg}`}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ins.dot }} />
                              <span className="text-muted-foreground text-[11px]">{ins.label}</span>
                            </div>
                            <p className={`text-base font-bold ${ins.color}`}>{ins.value}</p>
                            <p className="text-muted-foreground text-[11px] mt-0.5">{ins.sub}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-[220px] flex flex-col items-center justify-center gap-3 border border-dashed border-white/10 rounded-xl">
                    <HeartPulse className="w-10 h-10 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm text-center max-w-xs">Enter your resting heart rate in your profile to see your heart rate zones.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Health Score + Hydration */}
          <motion.div className="space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="glass-panel border-white/10">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">Health Score</CardTitle>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-center text-center gap-3">
                {healthScore != null ? (
                  <>
                    <div className="relative w-32 h-32">
                      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                        <circle cx="60" cy="60" r="50" fill="none" stroke="url(#healthGrad)" strokeWidth="10"
                          strokeDasharray={`${(healthScore / 100) * 314} 314`} strokeLinecap="round" />
                        <defs>
                          <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#7C3AED" />
                            <stop offset="100%" stopColor="#06B6D4" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-white">{healthScore}</span>
                        <span className="text-sm text-emerald-400 font-medium">{healthLabel}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Derived from energy, mental, sleep, hydration & HR data.</p>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <BrainCircuit className="w-10 h-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Complete your profile to see your health score.</p>
                  </div>
                )}
                <Button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm" variant="outline">
                  View Insights <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>

            {/* Hydration */}
            <Card className="glass-panel border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base">Hydration</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-3">
                {waterVal != null ? (
                  <>
                    <div className="relative w-28 h-28">
                      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                        <circle cx="60" cy="60" r="50" fill="none" stroke="#06B6D4" strokeWidth="10"
                          strokeDasharray={`${((waterPct ?? 0) / 100) * 314} 314`} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-white">{waterPct}%</span>
                        <span className="text-xs text-muted-foreground">Daily Goal</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{waterVal} <span className="text-base text-muted-foreground">L</span></p>
                      <p className="text-xs text-muted-foreground">of {hydrationGoal} L goal</p>
                      {waterRemaining && parseFloat(waterRemaining) > 0 && (
                        <p className="text-xs text-cyan-400 mt-1">{waterRemaining} L remaining</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <Droplets className="w-10 h-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground text-center">Enter your water intake in your profile.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ── Sleep Trend + Wellness Radar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <Card className="glass-panel border-white/10">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Moon className="w-5 h-5 text-blue-400" />
                  <CardTitle className="text-white text-lg">Sleep Duration Trend</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {sleepTrendData ? (
                  <>
                    <p className="text-xs text-muted-foreground mb-3">
                      Weekly projection · Quality: <span className="text-white/70">{sleepQuality}</span> ·
                      Avg: <span className="text-white/70">{sleepHrs?.toFixed(1)} hrs</span> ·
                      Wake: <span className="text-white/70">{wakeUpTime}</span> ·
                      Sleep: <span className="text-white/70">{sleepTime}</span>
                    </p>
                    <ResponsiveContainer width="100%" height={170}>
                      <BarChart data={sleepTrendData} barSize={26}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis domain={[0, 10]} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} tickLine={false} axisLine={false} unit="h" />
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: "rgba(10,15,30,0.9)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "8px" }}
                          formatter={(v: number) => [`${v} hrs`, "Sleep"]}
                        />
                        <Bar dataKey="sleep" radius={[5,5,0,0]} name="Sleep (hrs)">
                          {sleepTrendData.map((d, i) => <Cell key={i} fill={SLEEP_COLOR(d.sleep)} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-primary inline-block" />≥ 7 hrs (optimal)</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-yellow-400 inline-block" />5–7 hrs (moderate)</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-400 inline-block" />&lt; 5 hrs (low)</span>
                    </div>
                  </>
                ) : (
                  <div className="h-[170px] flex flex-col items-center justify-center gap-3 border border-dashed border-white/10 rounded-xl">
                    <Moon className="w-8 h-8 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm text-center">Enter your sleep duration in your profile</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Wellness Radar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="glass-panel border-white/10 h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-secondary" />
                  <CardTitle className="text-white text-base">Wellness Radar</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-2">
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={wellnessRadar}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="dim" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }} />
                    <Radar dataKey="value" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="w-full space-y-2">
                  {wellnessRadar.filter(d => d.value > 0).map((d) => (
                    <div key={d.dim}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-muted-foreground">{d.dim}</span>
                        <span className="text-white font-medium">{d.value}</span>
                      </div>
                      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full bg-secondary transition-all duration-700" style={{ width: `${Math.min(100, d.value)}%` }} />
                      </div>
                    </div>
                  ))}
                  {wellnessRadar.every(d => d.value === 0) && (
                    <p className="text-xs text-muted-foreground text-center py-2">Complete your profile to see wellness scores</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ── Wellness Scores + Stress Trend ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="glass-panel border-white/10 h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg font-semibold">Wellness Scores</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Score grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {wellnessScores.map((score) => (
                    <div key={score.label} className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col gap-2">
                      <p className="text-muted-foreground text-xs">{score.label}</p>
                      {score.value != null ? (
                        <>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-white">{score.value}</span>
                            <span className="text-sm text-muted-foreground">/ 100</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${Math.min(100, score.value)}%`, backgroundColor: score.color }} />
                          </div>
                        </>
                      ) : (
                        <span className="text-3xl font-bold text-white/30">—</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Lifestyle grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Sleep Quality",   value: sleepQuality || "—",                                          icon: Moon,      color: "text-blue-400" },
                    { label: "Sleep Hrs",        value: sleepHrs ? `${sleepHrs.toFixed(1)} hrs` : "—",               icon: Moon,      color: "text-violet-400" },
                    { label: "Meditation",       value: meditationMins != null ? `${meditationMins} min/day` : "—",  icon: Timer,     color: "text-emerald-400" },
                    { label: "Smoking",          value: smokingStatus || "—",                                         icon: Cigarette, color: "text-rose-400" },
                    { label: "Alcohol / Week",   value: alcoholPerWeek != null ? `${alcoholPerWeek} units` : "—",    icon: Wine,      color: "text-amber-400" },
                    { label: "Smartwatch",       value: smartwatchUser === true || smartwatchUser === "TRUE" ? "Yes" : smartwatchUser === false || smartwatchUser === "FALSE" ? "No" : "—", icon: Watch, color: "text-sky-400" },
                    { label: "Wake-Up Time",     value: wakeUpTime ? `${wakeUpTime}` : "—",                          icon: Sun,       color: "text-yellow-400" },
                    { label: "Sedentary Hrs",    value: sedentaryHrs != null ? `${sedentaryHrs} hrs` : "—",          icon: Activity,  color: "text-orange-400" },
                    { label: "Screen Time",      value: screenTime != null ? `${screenTime} hrs` : "—",              icon: Zap,       color: "text-red-400" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg bg-white/5 border border-white/5 p-3 flex items-center gap-2">
                      <item.icon className={`w-3.5 h-3.5 shrink-0 ${item.color}`} />
                      <div>
                        <p className="text-muted-foreground text-[11px] mb-0.5">{item.label}</p>
                        <p className={`text-sm font-semibold ${item.value === "—" ? "text-white/30" : "text-white"}`}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stress Trend */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <Card className="glass-panel border-white/10 h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base">Stress Level Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {stressTrendData ? (
                  <>
                    <p className="text-xs text-muted-foreground mb-3">
                      Current: <span className={`font-semibold ${stressLabel === "High" ? "text-rose-400" : stressLabel === "Moderate" ? "text-yellow-400" : "text-emerald-400"}`}>{stressLabel}</span>
                    </p>
                    <ResponsiveContainer width="100%" height={140}>
                      <AreaChart data={stressTrendData}>
                        <defs>
                          <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#eab308" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="day" tick={{ fill: "hsl(229 20% 70%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fill: "hsl(229 20% 70%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: "hsl(229 63% 8%)", border: "1px solid rgba(234,179,8,0.3)", borderRadius: 8, color: "#fff" }}
                          formatter={(v: number) => [`${v}`, "Stress"]}
                        />
                        <Area type="monotone" dataKey="stress" stroke="#eab308" strokeWidth={2} fill="url(#stressGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                    <div className="mt-3 flex items-start gap-3 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                      <Brain className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-white">Insight</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {stressLabel === "High"
                            ? `High stress detected. You meditate ${meditationMins ?? 0} min/day — consider increasing to 15+ min.`
                            : stressLabel === "Moderate"
                            ? `Moderate stress. Regular breaks and ${sleepHrs?.toFixed(1) ?? "—"} hrs sleep help recovery.`
                            : "Your stress level is well managed. Keep it up!"}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-[140px] flex flex-col items-center justify-center gap-3 border border-dashed border-white/10 rounded-xl">
                    <Brain className="w-8 h-8 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm text-center">Enter your stress level in your profile</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ── NEW: BMI Card + Daily Time Allocation ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* BMI Donut */}
          {bmi != null && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Card className="glass-panel border-white/10">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-white mb-1">Body Composition</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    BMI, weight and height from your profile
                  </p>
                  <div className="flex items-center gap-6">
                    <div className="relative w-32 h-32 shrink-0">
                      <PieChart width={128} height={128}>
                        <Pie data={bmiDonut!} cx={60} cy={60} innerRadius={42} outerRadius={58} dataKey="value" startAngle={90} endAngle={-270} paddingAngle={2}>
                          {bmiDonut!.map((d, i) => <Cell key={i} fill={d.color} />)}
                        </Pie>
                      </PieChart>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-white">{bmi}</span>
                        <span className={`text-[10px] font-semibold ${bmi < 25 ? "text-emerald-400" : bmi < 30 ? "text-yellow-400" : "text-rose-400"}`}>{bmiCategory}</span>
                      </div>
                    </div>
                    <div className="space-y-3 flex-1">
                      {[
                        { label: "Height",  value: heightCm != null ? `${heightCm} cm` : "—",  color: "text-primary" },
                        { label: "Weight",  value: weightKg != null ? `${weightKg} kg` : "—",  color: "text-secondary" },
                        { label: "BMI",     value: bmi != null ? String(bmi) : "—",             color: bmi < 25 ? "text-emerald-400" : bmi < 30 ? "text-yellow-400" : "text-rose-400" },
                        { label: "Category",value: bmiCategory || "—",                           color: "text-white/70" },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between items-center bg-white/5 rounded-lg px-3 py-1.5">
                          <span className="text-muted-foreground text-xs">{row.label}</span>
                          <span className={`text-sm font-semibold ${row.color}`}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Daily Time Allocation Donut */}
          {timeAllocation && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
              <Card className="glass-panel border-white/10">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-white mb-1">Daily Time Allocation</h3>
                  <p className="text-xs text-muted-foreground mb-4">Sleep · Active · Sedentary · Screen · Other (24 hrs)</p>
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width={140} height={140}>
                      <PieChart>
                        <Pie data={timeAllocation} cx="50%" cy="50%" innerRadius={40} outerRadius={62} dataKey="value" paddingAngle={2}>
                          {timeAllocation.map((d, i) => <Cell key={i} fill={d.color} />)}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: "rgba(10,15,30,0.9)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "8px" }}
                          formatter={(v: number) => [`${v} hrs`, ""]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 flex-1">
                      {timeAllocation.map((d) => (
                        <div key={d.name}>
                          <div className="flex justify-between text-xs mb-0.5">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: d.color }} />
                              {d.name}
                            </span>
                            <span className="text-white font-medium">{d.value} hrs</span>
                          </div>
                          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${Math.min(100, (d.value / 24) * 100)}%`, backgroundColor: d.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

      </div>
    </Layout>
  );
}