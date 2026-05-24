import { Layout } from "@/components/layout/Sidebar";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Play,
  Clock,
  Flame,
  Target,
  Dumbbell,
  TrendingUp,
  Zap,
  Award,
  BrainCircuit,
  Activity,
  Lightbulb,
  ShieldCheck,
  BarChart2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  Cell,
  AreaChart,
  Area,
  PieChart,
  Pie,
  LineChart,
  Line,
  Legend,
} from "recharts";

// ─── Static workout catalog ───────────────────────────────────────────────────
const workoutCatalog = [
  { id: 1, title: "Upper Body Power",  type: "STRENGTH", duration: "45min", cals: "520kcal", level: "Intermediate", color: "text-primary",     border: "border-primary/50",     img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=120&h=120&fit=crop&auto=format" },
  { id: 2, title: "Fat Burn Run",      type: "CARDIO",   duration: "30min", cals: "420kcal", level: "Beginner",     color: "text-secondary",   border: "border-secondary/50",   img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=120&h=120&fit=crop&auto=format" },
  { id: 3, title: "Morning Yoga Flow", type: "YOGA",     duration: "25min", cals: "160kcal", level: "Beginner",     color: "text-emerald-400", border: "border-emerald-500/50", img: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=120&h=120&fit=crop&auto=format" },
  { id: 4, title: "HIIT Boxing Blast", type: "HIIT",     duration: "20min", cals: "300kcal", level: "Advanced",     color: "text-orange-400",  border: "border-orange-500/50",  img: "https://images.unsplash.com/photo-1549476464-37392f717541?w=120&h=120&fit=crop&auto=format" },
];

const WEEK_DAYS         = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const INTENSITY_FACTORS = [0.7, 0.85, 0.6, 1.0, 0.75, 1.15, 0.5];
const VOLUME_FACTORS    = [0.65, 0.90, 0.55, 1.0, 0.80, 1.20, 0.45];

const TYPE_META = [
  { type: "HIIT",     label: "HIIT",     calFactor: 15.0, color: "#f97316" },
  { type: "STRENGTH", label: "Strength", calFactor: 11.5, color: "#7C3AED" },
  { type: "CARDIO",   label: "Cardio",   calFactor: 14.0, color: "#06B6D4" },
  { type: "YOGA",     label: "Yoga",     calFactor:  5.3, color: "#22c55e" },
];

const FITNESS_LEVEL_SCORE: Record<string, number> = {
  Beginner: 30, Intermediate: 60, Advanced: 85, Athlete: 100,
};

// Priority color map for AI suggestions
const PRIORITY_COLOR: Record<string, string> = {
  High:   "text-rose-400 bg-rose-500/15 border-rose-500/30",
  Medium: "text-yellow-400 bg-yellow-500/15 border-yellow-500/30",
  Low:    "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
};

const FITNESS_FOCUS_COLOR: Record<string, string> = {
  "Cardio Health":        "text-cyan-400",
  "Strength Building":    "text-violet-400",
  "Lifestyle Improvement":"text-emerald-400",
  "Mental Wellness":      "text-blue-400",
  "Weight Management":    "text-orange-400",
};

export default function Workouts() {
  const [userData, setUserData]   = useState<any>(null);
  const [aiRows, setAiRows]       = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading]     = useState(true);

  // ── Fetch both tables ────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const stored = localStorage.getItem("fitbeat_user");
        if (!stored) { setLoading(false); return; }
        const { user_id } = JSON.parse(stored);

        const [{ data: fitness }, { data: ai }] = await Promise.all([
          supabase.from("master_fitness").select("*").eq("user_id", user_id).single(),
          supabase.from("ai_table").select("*").eq("user_id", user_id),
        ]);

        if (fitness) setUserData(fitness);
        if (ai)      setAiRows(ai);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, []);

  // ── master_fitness fields ────────────────────────────────────────────────────
  const preferredWorkout = userData?.preferred_workout           || null;
  const fitnessLevel     = userData?.fitness_level               || null;
  const workoutDays      = userData?.workout_days_per_week       ?? null;
  const durMin           = userData?.avg_workout_duration_mins   ?? null;
  const weekendActivity  = userData?.weekend_activity_score      ?? null;
  const healthGoal       = userData?.health_goal                 || null;
  const calorieBurn      = userData?.daily_calorie_burn          ?? null;
  const stressLevel      = userData?.stress_level                || null;
  const energyScore      = userData?.energy_level_score          ?? null;
  const weeklyMins       = userData?.weekly_active_minutes       ?? null;
  const bmi              = userData?.bmi                         ?? null;
  const restingHR        = userData?.resting_heart_rate          ?? null;
  const meditationMins   = userData?.meditation_minutes_per_day  ?? null;
  const productivityScore= userData?.productivity_score          ?? null;
  const mentalWellness   = userData?.mental_wellness_score       ?? null;
  const activityPattern  = userData?.activity_pattern            || null;
  const sleepHours       = userData?.sleep_hours_avg             ?? null;
  const waterIntake      = userData?.water_intake_liters         ?? null;
  const sedentaryHrs     = userData?.sedentary_hours_per_day     ?? null;

  // ── Derived values ────────────────────────────────────────────────────────────
  const featuredTitle    = preferredWorkout ? `${preferredWorkout} Session` : "Total Body Workout";
  const activeDays       = workoutDays ? parseInt(workoutDays) : 0;
  const consistencyPct   = workoutDays ? Math.min(100, Math.round((parseInt(workoutDays) / 7) * 100)) : 0;
  const fitnessScore     = fitnessLevel ? (FITNESS_LEVEL_SCORE[fitnessLevel] ?? 50) : null;
  const weekendScore     = weekendActivity != null ? Math.round(weekendActivity * 10) : null;

  // ── Chart data ────────────────────────────────────────────────────────────────
  const weeklyIntensity = durMin
    ? WEEK_DAYS.map((day, i) => ({
        day,
        intensity: Math.round(durMin * INTENSITY_FACTORS[i]),
        calories:  calorieBurn ? Math.round(calorieBurn * INTENSITY_FACTORS[i] * 0.8) : 0,
      }))
    : null;

  const weeklyVolume = durMin && calorieBurn
    ? WEEK_DAYS.map((day, i) => ({
        day,
        volume:   Math.round(durMin * VOLUME_FACTORS[i]),
        calories: Math.round(calorieBurn * VOLUME_FACTORS[i] * 0.85),
      }))
    : null;

  const calByType = calorieBurn
    ? TYPE_META.map(t => ({
        type: t.label,
        kcal: Math.round(calorieBurn * t.calFactor * (durMin ? durMin / 60 : 0.5) * 0.065),
        color: t.color,
      }))
    : null;

  const typeRadar = [
    { type: "Strength", value: preferredWorkout?.toLowerCase().includes("gym") || preferredWorkout?.toLowerCase().includes("strength") ? 90 : 50 },
    { type: "Cardio",   value: preferredWorkout?.toLowerCase().includes("running") || preferredWorkout?.toLowerCase().includes("cycling") ? 90 : 40 },
    { type: "Yoga",     value: preferredWorkout?.toLowerCase().includes("yoga") ? 90 : 30 },
    { type: "HIIT",     value: preferredWorkout?.toLowerCase().includes("hiit") ? 90 : 45 },
    { type: "Recovery", value: weekendActivity != null ? Math.round(weekendActivity * 10) : 35 },
  ];

  // ── NEW: Wellness score radar from master_fitness ─────────────────────────────
  const wellnessRadar = [
    { metric: "Energy",      value: energyScore      != null ? Math.round(energyScore * 10)       : 0 },
    { metric: "Sleep",       value: sleepHours       != null ? Math.min(100, Math.round((sleepHours / 9) * 100)) : 0 },
    { metric: "Productivity",value: productivityScore != null ? productivityScore                   : 0 },
    { metric: "Mental",      value: mentalWellness   != null ? Math.round(mentalWellness * 10)     : 0 },
    { metric: "Hydration",   value: waterIntake      != null ? Math.min(100, Math.round((waterIntake / 3) * 100)) : 0 },
  ];

  // ── NEW: AI fitness focus distribution from ai_table ─────────────────────────
  const focusDistribution = (() => {
    if (!aiRows.length) return null;
    const counts: Record<string, number> = {};
    aiRows.forEach(r => {
      const f = r.fitness_focus || "Other";
      counts[f] = (counts[f] || 0) + 1;
    });
    const colors = ["#7C3AED","#06B6D4","#f97316","#22c55e","#f59e0b","#ec4899"];
    return Object.entries(counts).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
  })();

  // ── NEW: AI priority breakdown bar chart ─────────────────────────────────────
  const priorityData = (() => {
    if (!aiRows.length) return null;
    const counts: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
    aiRows.forEach(r => { if (r.priority_level in counts) counts[r.priority_level]++; });
    return [
      { label: "High",   count: counts.High,   color: "#f43f5e" },
      { label: "Medium", count: counts.Medium, color: "#f59e0b" },
      { label: "Low",    count: counts.Low,    color: "#22c55e" },
    ];
  })();

  // ── NEW: Confidence score trend across AI rows ────────────────────────────────
  const confidenceTrend = aiRows.length
    ? aiRows.map((r, i) => ({
        index: i + 1,
        confidence: Number(r.ai_confidence_score) || 0,
        match:      Number(r.match_score)         || 0,
      }))
    : null;

  // ── AI suggestions filtered/sorted by tab ────────────────────────────────────
  const aiFiltered = (() => {
    const sorted = [...aiRows].sort((a, b) => Number(b.ai_confidence_score) - Number(a.ai_confidence_score));
    if (activeTab === "All")   return sorted.slice(0, 6);
    if (activeTab === "High")  return sorted.filter(r => r.priority_level === "High").slice(0, 6);
    if (activeTab === "Goals") return sorted.filter(r => r.goal_type).slice(0, 6);
    return sorted.slice(0, 6);
  })();

  // ── master_fitness insights ───────────────────────────────────────────────────
  const insights = [
    durMin && calorieBurn
      ? { icon: Flame,       color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20",
          title: "Calorie Efficiency",
          body: `At ${durMin} min/session you burn ~${calorieBurn} kcal — that's ${(calorieBurn / durMin).toFixed(1)} kcal/min.` }
      : null,
    workoutDays && durMin
      ? { icon: TrendingUp,  color: "text-primary",    bg: "bg-primary/10",    border: "border-primary/20",
          title: "Weekly Volume",
          body: `${workoutDays} sessions × ${durMin} min = ${parseInt(workoutDays) * durMin} total active minutes per week.` }
      : null,
    fitnessLevel
      ? { icon: Award,       color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20",
          title: "Fitness Level",
          body: fitnessLevel === "Advanced" || fitnessLevel === "Athlete"
            ? `${fitnessLevel} level — push intensity to keep progressing.`
            : `You're at ${fitnessLevel} — consistent training moves you to the next tier.` }
      : null,
    weekendActivity != null
      ? { icon: Zap,         color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20",
          title: "Weekend Activity",
          body: weekendActivity >= 7
            ? `Weekend activity score ${weekendActivity}/10 is excellent — great for recovery and momentum.`
            : `Weekend activity score ${weekendActivity}/10 — try adding light cardio or walks on rest days.` }
      : null,
    stressLevel
      ? { icon: ShieldCheck, color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20",
          title: "Stress & Recovery",
          body: stressLevel === "High"
            ? `Stress level is High — prioritize rest, meditation (${meditationMins ?? 0} min/day), and lower-intensity workouts.`
            : `Stress level is ${stressLevel} — keep up your current recovery habits.` }
      : null,
    energyScore != null
      ? { icon: Zap,         color: "text-cyan-400",    bg: "bg-cyan-500/10",    border: "border-cyan-500/20",
          title: "Energy Level",
          body: energyScore >= 7
            ? `Energy score ${energyScore}/10 — you're well-fuelled for intense sessions.`
            : `Energy score ${energyScore}/10 — consider improving sleep (currently ${sleepHours ?? "?"} hrs) and hydration (${waterIntake ?? "?"} L/day).` }
      : null,
    sedentaryHrs != null
      ? { icon: Activity,    color: "text-rose-400",    bg: "bg-rose-500/10",    border: "border-rose-500/20",
          title: "Sedentary Warning",
          body: sedentaryHrs >= 8
            ? `${sedentaryHrs} sedentary hrs/day is high. Break it up with 5-min walks every hour.`
            : `${sedentaryHrs} sedentary hrs/day is manageable — keep your ${weeklyMins ?? "—"} weekly active minutes up.` }
      : null,
    bmi != null
      ? { icon: BarChart2,   color: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/20",
          title: "BMI Insight",
          body: bmi < 18.5
            ? `BMI ${bmi} (Underweight) — focus on strength training and calorie-dense foods.`
            : bmi < 25
            ? `BMI ${bmi} (Healthy) — maintain with ${workoutDays ?? "—"} workout days/week.`
            : bmi < 30
            ? `BMI ${bmi} (Overweight) — cardio + strength combo recommended for your ${healthGoal} goal.`
            : `BMI ${bmi} (Obese) — consult a professional; start with low-impact cardio like ${preferredWorkout ?? "walking"}.` }
      : null,
  ].filter(Boolean) as Array<{ icon: any; color: string; bg: string; border: string; title: string; body: string }>;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[70vh]">
          <p className="text-muted-foreground text-lg">Loading workout data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 pb-10">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">Workouts</h1>
            <p className="text-muted-foreground text-lg">Train smarter. Get stronger. Every day.</p>
          </div>
          <Tabs defaultValue="all" className="w-full md:w-auto">
            <TabsList className="bg-black/40 border border-white/10">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="strength">Strength</TabsTrigger>
              <TabsTrigger value="cardio">Cardio</TabsTrigger>
              <TabsTrigger value="yoga">Yoga</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* ── Featured Banner ── */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 h-52">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=400&fit=crop&auto=format"
            alt="Featured workout"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="relative z-10 p-8 h-full flex flex-col justify-end">
            <div className="text-xs font-bold tracking-widest text-primary uppercase mb-2">
              {preferredWorkout ? "Your Preferred Workout" : "Featured Today"}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{featuredTitle}</h2>
            <div className="flex items-center gap-4 text-sm text-white/70 flex-wrap">
              {durMin        && <span className="flex items-center gap-1.5"><Clock  className="w-4 h-4"/>{durMin} min</span>}
              {fitnessLevel  && <span className="flex items-center gap-1.5"><Target className="w-4 h-4"/>{fitnessLevel}</span>}
              {calorieBurn   && <span className="flex items-center gap-1.5"><Flame  className="w-4 h-4"/>~{calorieBurn} kcal</span>}
              {activityPattern && <span className="flex items-center gap-1.5"><Activity className="w-4 h-4"/>{activityPattern}</span>}
            </div>
          </div>
          <button className="absolute right-8 bottom-8 flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all shadow-[0_0_20px_rgba(124,58,237,0.5)]">
            <Play className="w-4 h-4" fill="currentColor" /> Start Now
          </button>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Fitness Level",    value: fitnessLevel   || "—",                                icon: Target,   color: "text-primary",    bg: "bg-primary/15" },
            { label: "Workout Days",     value: workoutDays    != null ? `${workoutDays}/wk` : "—",   icon: Dumbbell, color: "text-secondary",  bg: "bg-secondary/15" },
            { label: "Session Duration", value: durMin         != null ? `${durMin} min` : "—",        icon: Clock,    color: "text-purple-400", bg: "bg-purple-500/15" },
            { label: "Calorie Target",   value: calorieBurn    != null ? `${calorieBurn} kcal` : "—", icon: Flame,    color: "text-orange-400", bg: "bg-orange-500/15" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="glass-panel border-white/10">
                <CardContent className="p-5">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-muted-foreground text-xs mb-1">{stat.label}</p>
                  <p className={`text-xl font-bold ${stat.value === "—" ? "text-white/30" : "text-white"}`}>{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ── Performance Rings ── */}
        {(consistencyPct > 0 || fitnessScore != null || weekendScore != null) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Workout Consistency", value: consistencyPct,  unit: "%",   color: "#7C3AED", sub: `${workoutDays || 0} of 7 days active`,                         show: consistencyPct > 0 },
              { label: "Fitness Level Score", value: fitnessScore ?? 0, unit: "/100", color: "#06B6D4", sub: fitnessLevel || "Not set",                                   show: fitnessScore != null },
              { label: "Weekend Activity",    value: weekendScore  ?? 0, unit: "/100", color: "#f97316", sub: weekendActivity != null ? `${weekendActivity}/10 score` : "Not set", show: weekendScore != null },
            ].filter(r => r.show).map((ring, i) => (
              <motion.div key={ring.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                <Card className="glass-panel border-white/10">
                  <CardContent className="p-5 flex items-center gap-5">
                    <div className="relative w-20 h-20 shrink-0">
                      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                        <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                        <circle cx="40" cy="40" r="30" fill="none" stroke={ring.color} strokeWidth="7"
                          strokeDasharray={`${(ring.value / 100) * 188.5} 188.5`} strokeLinecap="round"
                          style={{ filter: `drop-shadow(0 0 6px ${ring.color}80)`, transition: "stroke-dasharray 0.8s ease" }} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-white leading-none">{ring.value}</span>
                        <span className="text-[9px] text-muted-foreground">{ring.unit}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white mb-0.5">{ring.label}</p>
                      <p className="text-xs text-muted-foreground">{ring.sub}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Main 2-col grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Left / Main column */}
          <div className="xl:col-span-2 space-y-6">

            {/* Recommended workouts */}
            <section>
              <h3 className="text-xl font-bold text-white mb-4">Recommended for You</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workoutCatalog.map((wk) => (
                  <Card key={wk.id} className={`glass-panel border-white/10 hover:${wk.border} transition-all group cursor-pointer overflow-hidden`}>
                    <CardContent className="p-0 flex items-stretch">
                      <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden">
                        <img src={wk.img} alt={wk.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className={`w-6 h-6 ${wk.color}`} fill="currentColor" />
                        </div>
                      </div>
                      <div className="flex-1 p-4">
                        <div className={`text-[10px] font-bold tracking-wider ${wk.color} mb-1`}>{wk.type}</div>
                        <h4 className="font-bold text-white text-base leading-tight mb-2">{wk.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{wk.duration}</span>
                          <span className="flex items-center gap-1"><Flame className="w-3 h-3"/>{wk.cals}</span>
                          <span className="px-1.5 py-0.5 rounded-sm bg-white/5 border border-white/10">{wk.level}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Weekly Intensity Bar */}
            <Card className="glass-panel border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-white">Weekly Workout Schedule</h3>
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  {durMin ? `Projected intensity based on ${durMin}-min sessions · ${workoutDays ?? "—"} days/week` : "Set your workout duration in your profile"}
                </p>
                {weeklyIntensity ? (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={weeklyIntensity} barSize={24}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} tickLine={false} axisLine={false} unit=" min" />
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: "rgba(10,15,30,0.9)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "8px" }}
                          formatter={(v: number) => [`${v} min`, "Duration"]}
                        />
                        <Bar dataKey="intensity" radius={[5,5,0,0]} name="Duration (min)">
                          {weeklyIntensity.map((_, i) => (
                            <Cell key={i} fill={i < activeDays ? "#7C3AED" : "rgba(255,255,255,0.07)"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex gap-4 mt-3">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-2.5 h-2.5 rounded bg-primary inline-block" />Active days</span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-2.5 h-2.5 rounded bg-white/10 inline-block" />Rest days</span>
                    </div>
                  </>
                ) : (
                  <div className="h-[160px] flex flex-col items-center justify-center gap-3 border border-dashed border-white/10 rounded-xl">
                    <Zap className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground text-center">Set workout duration to see your weekly schedule</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Volume & Calorie Trend */}
            <Card className="glass-panel border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-white">Volume & Calorie Trend</h3>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-1.5 rounded bg-primary inline-block"/>Volume (min)</span>
                    {calorieBurn && <span className="flex items-center gap-1.5"><span className="w-2.5 h-1.5 rounded bg-orange-400 inline-block"/>Calories</span>}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  {durMin && calorieBurn ? `Based on ${durMin}-min sessions at ${calorieBurn} kcal target` : "Set duration and calorie data in your profile"}
                </p>
                {weeklyVolume ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={weeklyVolume}>
                      <defs>
                        <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="calWkGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#f97316" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} tickLine={false} axisLine={false} />
                      <RechartsTooltip contentStyle={{ backgroundColor: "rgba(10,15,30,0.9)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "8px" }} />
                      <Area type="monotone" dataKey="volume"   stroke="#7C3AED" strokeWidth={2} fill="url(#volGrad)"   name="Volume (min)" />
                      <Area type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={2} fill="url(#calWkGrad)" name="Calories (kcal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[180px] flex flex-col items-center justify-center gap-3 border border-dashed border-white/10 rounded-xl">
                    <Activity className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground text-center">Enter duration and calorie data to see your volume trend</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Calorie Burn by Type */}
            <Card className="glass-panel border-white/10">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-white mb-1">Estimated Calorie Burn by Type</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  {calorieBurn && durMin ? `Based on ${durMin}-min sessions at ${calorieBurn} kcal/day target` : "Set your calorie burn and workout duration in your profile"}
                </p>
                {calByType ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={calByType} layout="vertical" barSize={18}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                      <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} tickLine={false} axisLine={false} unit=" kcal" />
                      <YAxis type="category" dataKey="type" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }} tickLine={false} axisLine={false} width={60} />
                      <RechartsTooltip contentStyle={{ backgroundColor: "rgba(10,15,30,0.9)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "8px" }} formatter={(v: number) => [`${v} kcal`, "Estimated Burn"]} />
                      <Bar dataKey="kcal" radius={[0,5,5,0]} name="Calories (kcal)">
                        {calByType.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[160px] flex flex-col items-center justify-center gap-3 border border-dashed border-white/10 rounded-xl">
                    <Flame className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground text-center">Enter calorie burn and duration to see burn by type</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── NEW: AI Confidence & Match Trend (from ai_table) ── */}
            {confidenceTrend && confidenceTrend.length > 1 && (
              <Card className="glass-panel border-white/10">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-white mb-1">AI Confidence & Match Score Trend</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Across {aiRows.length} AI recommendations generated for your profile
                  </p>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={confidenceTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="index" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} tickLine={false} axisLine={false} label={{ value: "Recommendation #", fill: "rgba(255,255,255,0.3)", fontSize: 10, position: "insideBottom", offset: -2 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} tickLine={false} axisLine={false} unit="%" />
                      <RechartsTooltip contentStyle={{ backgroundColor: "rgba(10,15,30,0.9)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "8px" }} />
                      <Line type="monotone" dataKey="confidence" stroke="#7C3AED" strokeWidth={2} dot={{ r: 3, fill: "#7C3AED" }} name="AI Confidence %" />
                      <Line type="monotone" dataKey="match"      stroke="#06B6D4" strokeWidth={2} dot={{ r: 3, fill: "#06B6D4" }} name="Match Score %" />
                      <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* ── NEW: AI Priority Breakdown (from ai_table) ── */}
            {priorityData && (
              <Card className="glass-panel border-white/10">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-white mb-1">AI Recommendation Priority Breakdown</h3>
                  <p className="text-xs text-muted-foreground mb-4">Distribution of your {aiRows.length} AI-generated recommendations by priority</p>
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={priorityData} barSize={40}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <RechartsTooltip contentStyle={{ backgroundColor: "rgba(10,15,30,0.9)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "8px" }} formatter={(v: number) => [`${v} recommendations`, "Count"]} />
                      <Bar dataKey="count" radius={[6,6,0,0]}>
                        {priorityData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ── Right Panel ── */}
          <div className="space-y-6">

            {/* Workout Profile */}
            <Card className="glass-panel border-white/10">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Your Workout Profile</h3>
                <div className="space-y-3">
                  {[
                    { label: "Fitness Level",    value: fitnessLevel    || "—", icon: Target,   color: "text-primary" },
                    { label: "Preferred Workout",value: preferredWorkout || "—", icon: Dumbbell, color: "text-secondary" },
                    { label: "Days / Week",      value: workoutDays != null ? `${workoutDays} days` : "—", icon: Clock, color: "text-purple-400" },
                    { label: "Session Length",   value: durMin != null ? `${durMin} min` : "—", icon: Clock, color: "text-orange-400" },
                    { label: "Activity Pattern", value: activityPattern  || "—", icon: Activity, color: "text-cyan-400" },
                    { label: "Weekend Activity", value: weekendActivity != null ? `${weekendActivity} / 10` : "—", icon: Flame, color: "text-emerald-400" },
                    { label: "Health Goal",      value: healthGoal      || "—", icon: Target,   color: "text-rose-400" },
                    { label: "Stress Level",     value: stressLevel     || "—", icon: Zap,      color: "text-yellow-400" },
                    { label: "Energy Score",     value: energyScore != null ? `${energyScore} / 10` : "—", icon: Zap, color: "text-lime-400" },
                    { label: "Resting HR",       value: restingHR != null ? `${restingHR} bpm` : "—", icon: Activity, color: "text-red-400" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between bg-white/3 rounded-lg px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                        <span className="text-muted-foreground text-sm">{item.label}</span>
                      </div>
                      <span className={`font-semibold text-sm ${item.value === "—" ? "text-white/30" : "text-white"}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Training Focus Radar */}
            <Card className="glass-panel border-white/10">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-white mb-1">Training Focus</h3>
                <p className="text-xs text-muted-foreground mb-3">Based on your preferred workout</p>
                <ResponsiveContainer width="100%" height={190}>
                  <RadarChart data={typeRadar}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="type" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }} />
                    <Radar dataKey="value" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.2} strokeWidth={2}
                      dot={{ fill: "#06B6D4", r: 3, strokeWidth: 0 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* ── NEW: Wellness Radar (from master_fitness) ── */}
            <Card className="glass-panel border-white/10">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-white mb-1">Wellness Overview</h3>
                <p className="text-xs text-muted-foreground mb-3">Energy · Sleep · Productivity · Mental · Hydration</p>
                <ResponsiveContainer width="100%" height={190}>
                  <RadarChart data={wellnessRadar}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }} />
                    <Radar dataKey="value" stroke="#f97316" fill="#f97316" fillOpacity={0.2} strokeWidth={2}
                      dot={{ fill: "#f97316", r: 3, strokeWidth: 0 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* ── NEW: AI Fitness Focus Donut (from ai_table) ── */}
            {focusDistribution && (
              <Card className="glass-panel border-white/10">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-white mb-1">AI Fitness Focus Areas</h3>
                  <p className="text-xs text-muted-foreground mb-4">From your {aiRows.length} AI recommendations</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={focusDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                        {focusDistribution.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <RechartsTooltip contentStyle={{ backgroundColor: "rgba(10,15,30,0.9)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "8px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {focusDistribution.map((d) => (
                      <span key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: d.color }} />{d.name}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Muscle Map */}
            <Card className="glass-panel border-white/10">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Targeted Muscle Groups</h3>
                <div className="relative rounded-xl overflow-hidden border border-white/5">
                  <img src="/muscle-map.png" alt="Targeted Muscle Groups" className="w-full h-auto object-contain" />
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute left-0 right-0 h-[2px]"
                      style={{
                        background: "linear-gradient(90deg, transparent 0%, #06B6D4 40%, #7C3AED 60%, transparent 100%)",
                        boxShadow: "0 0 8px 2px rgba(6,182,212,0.6), 0 0 20px 4px rgba(124,58,237,0.3)",
                        animation: "scanLine 3s ease-in-out infinite",
                      }} />
                  </div>
                  <style>{`@keyframes scanLine { 0% { top: 0%; } 50% { top: calc(100% - 2px); } 100% { top: 0%; } }`}</style>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── AI Suggestions from ai_table ── */}
        {aiRows.length > 0 && (
          <div>
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" /> AI Workout Suggestions
            </h2>
            {/* Filter tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {["All", "High", "Goals"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-primary to-secondary text-white shadow-[0_0_12px_rgba(124,58,237,0.3)]"
                      : "glass-panel border border-white/10 text-muted-foreground hover:text-white"
                  }`}>
                  {tab === "High" ? "High Priority" : tab === "Goals" ? "By Goal" : tab}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiFiltered.map((row, i) => (
                <motion.div key={row.ai_id ?? i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className="glass-panel border-white/10 hover:border-primary/30 transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-semibold text-white leading-tight">{row.suggestion_title || "AI Suggestion"}</p>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border shrink-0 ${PRIORITY_COLOR[row.priority_level] || "text-white/50 bg-white/5 border-white/10"}`}>
                          {row.priority_level || "—"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{row.suggestion_text || "—"}</p>
                      <div className="flex flex-wrap gap-2 text-[10px]">
                        {row.fitness_focus && (
                          <span className={`px-2 py-1 rounded-full bg-white/5 border border-white/10 font-medium ${FITNESS_FOCUS_COLOR[row.fitness_focus] || "text-white/60"}`}>
                            {row.fitness_focus}
                          </span>
                        )}
                        {row.goal_type && (
                          <span className="px-2 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 font-medium capitalize">
                            {row.goal_type}
                          </span>
                        )}
                        {row.trigger_condition && (
                          <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/50">
                            {row.trigger_condition}
                          </span>
                        )}
                      </div>
                      {row.daily_action_tip && (
                        <div className="mt-3 text-[11px] text-cyan-300 flex items-center gap-1.5">
                          <Zap className="w-3 h-3 shrink-0" /> {row.daily_action_tip}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                        <span className="text-[10px] text-muted-foreground">AI Confidence</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
                              style={{ width: `${row.ai_confidence_score || 0}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-white">{row.ai_confidence_score || "—"}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── Workout Insights from master_fitness ── */}
        {insights.length > 0 && (
          <div>
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-secondary" /> Workout Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((ins, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <Card className={`glass-panel border ${ins.border} ${ins.bg}`}>
                    <CardContent className="p-5 flex gap-4 items-start">
                      <div className="p-2 rounded-lg bg-white/5 shrink-0">
                        <ins.icon className={`w-5 h-5 ${ins.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white mb-1">{ins.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{ins.body}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}