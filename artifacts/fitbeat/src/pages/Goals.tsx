import { Layout } from "@/components/layout/Sidebar";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import {
  Target,
  Footprints,
  Dumbbell,
  Flame,
  MoonStar,
  Droplets,
  ChevronRight,
  Plus,
  Zap,
  TrendingUp,
  Award,
  Brain,
  Activity,
  Timer,
  Salad,
  Sparkles,
  ShieldCheck,
  BadgeCheck,
  Lightbulb,
  Package,
  ChevronUp,
  ChevronDown,
  Minus,
  Heart,
  Monitor,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// ── Constants ────────────────────────────────────────────────────────────────

const WEEK_DAYS   = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEK_FACTORS = [0.75, 0.88, 0.70, 1.0, 0.80, 1.10, 0.95];

const freqColor: Record<string, string> = {
  Daily:   "text-primary bg-primary/10",
  Weekly:  "text-secondary bg-secondary/10",
  Monthly: "text-orange-400 bg-orange-400/10",
};

const priorityConfig: Record<
  string,
  { color: string; bg: string; border: string; icon: React.ElementType }
> = {
  High:   { color: "text-red-400",     bg: "bg-red-500/10",    border: "border-red-500/20",    icon: ChevronUp },
  Medium: { color: "text-amber-400",   bg: "bg-amber-500/10",  border: "border-amber-500/20",  icon: Minus },
  Low:    { color: "text-emerald-400", bg: "bg-emerald-500/10",border: "border-emerald-500/20",icon: ChevronDown },
};

const SLEEP_QUALITY_SCORE: Record<string, number> = {
  Poor: 25, Average: 50, Good: 75, Excellent: 100,
};

const FITNESS_LEVEL_ORDER = ["Beginner", "Intermediate", "Advanced", "Athlete"];

function bmiZone(bmi: number) {
  if (bmi < 18.5) return { label: "Underweight", color: "text-blue-400",    hex: "#60a5fa" };
  if (bmi < 25)   return { label: "Normal",      color: "text-emerald-400", hex: "#34d399" };
  if (bmi < 30)   return { label: "Overweight",  color: "text-amber-400",   hex: "#fbbf24" };
  return               { label: "Obese",         color: "text-red-400",     hex: "#f87171" };
}

// ── Chart helpers ─────────────────────────────────────────────────────────────

function buildWeeklySteps(avgSteps: number) {
  return WEEK_DAYS.map((day, i) => ({
    day,
    steps:  Math.round(avgSteps * WEEK_FACTORS[i]),
    target: 10000,
  }));
}

function buildWeeklyCalories(dailyCal: number) {
  return WEEK_DAYS.map((day, i) => ({
    day,
    calories: Math.round(dailyCal * WEEK_FACTORS[i] * 0.74),
  }));
}

function buildDurationTrend(avgMins: number) {
  return WEEK_DAYS.map((day, i) => ({
    day,
    mins: Math.round(avgMins * WEEK_FACTORS[i]),
  }));
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Goals() {
  const [userData,    setUserData]    = useState<any>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);

  // ── Fetch master_fitness + ai_table ──────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const stored = localStorage.getItem("fitbeat_user");
        if (!stored) { setLoading(false); return; }
        const { user_id } = JSON.parse(stored);

        // Parallel fetch both tables
        const [{ data: profile, error: profileErr }, { data: aiData, error: aiErr }] =
          await Promise.all([
            supabase.from("master_fitness").select("*").eq("user_id", user_id).single(),
            supabase.from("ai_table").select("*").eq("user_id", user_id),
          ]);

        if (!profileErr && profile) setUserData(profile);
        if (!aiErr && aiData)       setAiSuggestions(aiData);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, []);

  // ── master_fitness field bindings ─────────────────────────────────────────
  const stepsVal       = userData?.avg_daily_steps          != null ? Number(userData.avg_daily_steps)          : null;
  const workoutDaysVal = userData?.workout_days_per_week    != null ? Number(userData.workout_days_per_week)    : null;
  const workoutTarget  = workoutDaysVal != null ? workoutDaysVal + 1 : null;
  const calVal         = userData?.daily_calorie_burn       != null ? Number(userData.daily_calorie_burn)       : null;
  const calWeekly      = calVal != null ? Math.round(calVal * 0.74) : null;
  const sleepVal       = userData?.sleep_hours_avg          != null ? parseFloat(userData.sleep_hours_avg)      : null;
  const sleepQuality   = userData?.sleep_quality            || null;
  const waterVal       = userData?.water_intake_liters      != null ? parseFloat(userData.water_intake_liters)  : null;
  const activeMinVal   = userData?.weekly_active_minutes    != null ? Number(userData.weekly_active_minutes)    : null;
  const bmiVal         = userData?.bmi                      != null ? Number(userData.bmi)                      : null;
  const weightKg       = userData?.weight_kg                != null ? Number(userData.weight_kg)                : null;
  const energyScore    = userData?.energy_level_score       != null ? Number(userData.energy_level_score)       : null;   // 0–10
  const mentalScore    = userData?.mental_wellness_score    != null ? Number(userData.mental_wellness_score)    : null;   // 0–10
  const productivitySc = userData?.productivity_score       != null ? Number(userData.productivity_score)       : null;   // 0–100
  const weekendActSc   = userData?.weekend_activity_score   != null ? Number(userData.weekend_activity_score)   : null;   // 0–10
  const stressLevel    = userData?.stress_level             || null;
  const screenTime     = userData?.screen_time_hours        != null ? Number(userData.screen_time_hours)        : null;
  const sedentaryHrs   = userData?.sedentary_hours_per_day  != null ? Number(userData.sedentary_hours_per_day)  : null;
  const restingHR      = userData?.resting_heart_rate       != null ? Number(userData.resting_heart_rate)       : null;
  const meditationMins = userData?.meditation_minutes_per_day != null ? Number(userData.meditation_minutes_per_day) : null;
  const avgDuration    = userData?.avg_workout_duration_mins != null ? Number(userData.avg_workout_duration_mins) : null;
  const preferredWO    = userData?.preferred_workout        || null;
  const activityPattern= userData?.activity_pattern         || null;
  const dietType       = userData?.diet_type                || null;
  const fitnessLevel   = userData?.fitness_level            || null;
  const healthGoal     = userData?.health_goal              || null;
  const smartwatch     = userData?.smartwatch_user;

  // ── Derived values ────────────────────────────────────────────────────────
  // Hydration target: weight-based (WHO: 33 ml/kg), fallback 2.5 L
  const waterTarget    = weightKg ? Math.round(weightKg * 0.033 * 10) / 10 : 2.5;
  const bmiInfo        = bmiVal != null ? bmiZone(bmiVal) : null;
  const sleepQScore    = sleepQuality ? (SLEEP_QUALITY_SCORE[sleepQuality] ?? 0) : null;

  // ── Goal percentages ──────────────────────────────────────────────────────
  const stepsPct      = stepsVal      != null ? Math.min(100, Math.round((stepsVal / 10000) * 100))            : 0;
  const workoutPct    = workoutDaysVal != null && workoutTarget != null
    ? Math.min(100, Math.round((workoutDaysVal / workoutTarget) * 100)) : 0;
  const calPct        = calWeekly     != null ? Math.min(100, Math.round((calWeekly / 2500) * 100))            : 0;
  const sleepPct      = sleepVal      != null ? Math.min(100, Math.round((sleepVal / 7) * 100))                : 0;
  const waterPct      = waterVal      != null ? Math.min(100, Math.round((waterVal / waterTarget) * 100))      : 0;
  const activeMinPct  = activeMinVal  != null ? Math.min(100, Math.round((activeMinVal / 150) * 100))          : 0;

  // ── Goals array ───────────────────────────────────────────────────────────
  const goals = [
    stepsVal != null && {
      id: 1, icon: Footprints,
      name: `${(10000).toLocaleString()} Steps Daily`,
      desc: "Build a daily habit of staying active",
      current: stepsVal, target: 10000, unit: "Steps", freq: "Daily", pct: stepsPct,
      color: "text-primary",     bg: "bg-primary/20",       bar: "from-primary to-secondary",    hex: "#7C3AED",
      img: "https://images.unsplash.com/photo-1594882645126-14020914d58d?w=80&h=80&fit=crop&auto=format",
    },
    workoutDaysVal != null && workoutTarget != null && {
      id: 2, icon: Dumbbell,
      name: `Workout ${workoutTarget}x Weekly`,
      desc: `Preferred: ${preferredWO ?? "Mixed"}`,
      current: workoutDaysVal, target: workoutTarget, unit: "Workouts", freq: "Weekly", pct: workoutPct,
      color: "text-purple-400",  bg: "bg-purple-500/20",    bar: "from-purple-500 to-purple-400", hex: "#A855F7",
      img: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=80&h=80&fit=crop&auto=format",
    },
    calWeekly != null && {
      id: 3, icon: Flame,
      name: "Burn 2,500 Calories Weekly",
      desc: "Create a calorie deficit and stay fit",
      current: calWeekly, target: 2500, unit: "kcal", freq: "Weekly", pct: calPct,
      color: "text-orange-400",  bg: "bg-orange-500/20",    bar: "from-orange-500 to-orange-400", hex: "#f97316",
      img: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=80&h=80&fit=crop&auto=format",
    },
    sleepVal != null && {
      id: 4, icon: MoonStar,
      name: "Sleep 7+ Hours Daily",
      desc: `Quality: ${sleepQuality ?? "—"}`,
      current: sleepVal, target: 7, unit: "Hours", freq: "Daily", pct: sleepPct,
      color: "text-blue-400",    bg: "bg-blue-500/20",      bar: "from-blue-500 to-blue-400",     hex: "#60a5fa",
      img: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=80&h=80&fit=crop&auto=format",
    },
    waterVal != null && {
      id: 5, icon: Droplets,
      name: `Drink ${waterTarget}L Water Daily`,
      desc: "Stay hydrated and energized",
      current: waterVal, target: waterTarget, unit: "Liters", freq: "Daily", pct: waterPct,
      color: "text-cyan-400",    bg: "bg-cyan-500/20",      bar: "from-cyan-500 to-cyan-400",     hex: "#22d3ee",
      img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&auto=format",
    },
    activeMinVal != null && {
      id: 6, icon: Activity,
      name: "150 Active Mins Weekly",
      desc: "WHO recommended weekly target",
      current: activeMinVal, target: 150, unit: "Mins", freq: "Weekly", pct: activeMinPct,
      color: "text-emerald-400", bg: "bg-emerald-500/20",   bar: "from-emerald-500 to-emerald-400", hex: "#34d399",
      img: "https://images.unsplash.com/photo-1530655638484-d9d538ae7b23?w=80&h=80&fit=crop&auto=format",
    },
  ].filter(Boolean) as Array<{
    id: number; icon: any; name: string; desc: string;
    current: number; target: number; unit: string; freq: string;
    pct: number; color: string; bg: string; bar: string; hex: string; img: string;
  }>;

  // ── Summary stats ─────────────────────────────────────────────────────────
  const activeCount    = goals.length;
  const overallPct     = activeCount > 0
    ? Math.round(goals.reduce((s, g) => s + g.pct, 0) / activeCount) : 0;
  const completedCount = goals.filter(g => g.pct >= 100).length;

  // ── Chart data ────────────────────────────────────────────────────────────
  const weeklyStepsData    = stepsVal  != null ? buildWeeklySteps(stepsVal)       : null;
  const weeklyCalData      = calVal    != null ? buildWeeklyCalories(calVal)      : null;
  const durationTrendData  = avgDuration != null ? buildDurationTrend(avgDuration) : null;

  // Wellness radar (all 0–100)
  const wellnessRadarData = [
    { axis: "Energy",        value: energyScore  != null ? energyScore * 10  : 0 },
    { axis: "Mental",        value: mentalScore  != null ? mentalScore * 10  : 0 },
    { axis: "Sleep Quality", value: sleepQScore  ?? 0 },
    { axis: "Weekend Act.",  value: weekendActSc != null ? weekendActSc * 10 : 0 },
    { axis: "Productivity",  value: productivitySc ?? 0 },
  ];

  // Goals radar
  const goalsRadarData = goals.map(g => ({
    goal: g.name.split(" ").slice(0, 2).join(" "),
    value: g.pct,
  }));

  // ── AI suggestions from ai_table ─────────────────────────────────────────
  // De-duplicate by ai_id, sort High → Medium → Low
  const priorityOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
  const uniqueSuggestions = Array.from(
    new Map(aiSuggestions.map(s => [s.ai_id, s])).values()
  ).sort((a, b) =>
    (priorityOrder[a.priority_level] ?? 3) - (priorityOrder[b.priority_level] ?? 3)
  );
  const topSuggestions = uniqueSuggestions.slice(0, 4);
  const dailyTips      = Array.from(
    new Set(aiSuggestions.map(s => s.daily_action_tip).filter(Boolean))
  ).slice(0, 6);

  // ── Contextual insights (master_fitness derived) ──────────────────────────
  const insights = [
    stepsVal != null && {
      icon: stepsVal >= 10000 ? Award : Footprints,
      color: stepsVal >= 10000 ? "text-emerald-400" : "text-primary",
      bg: stepsVal >= 10000 ? "bg-emerald-500/10" : "bg-primary/10",
      border: stepsVal >= 10000 ? "border-emerald-500/20" : "border-primary/20",
      title: stepsVal >= 10000 ? "Step Goal Achieved!" : "Steps Progress",
      body: stepsVal >= 10000
        ? `You're hitting ${stepsVal.toLocaleString()} steps — above your 10,000 target. Keep it up!`
        : `You're at ${stepsPct}% of your daily step goal. ${(10000 - stepsVal).toLocaleString()} more steps to go.`,
    },
    sleepVal != null && {
      icon: MoonStar,
      color: sleepVal >= 7 ? "text-blue-400" : "text-yellow-400",
      bg: sleepVal >= 7 ? "bg-blue-500/10" : "bg-yellow-500/10",
      border: sleepVal >= 7 ? "border-blue-500/20" : "border-yellow-500/20",
      title: sleepVal >= 7 ? "Sleep Goal On Track" : "Sleep Below Target",
      body: sleepVal >= 7
        ? `${sleepVal.toFixed(1)} hrs sleep (${sleepQuality ?? "—"} quality) supports recovery and other goals.`
        : `${sleepVal.toFixed(1)} hrs is under the 7-hr goal. Better sleep boosts workout performance.`,
    },
    calVal != null && {
      icon: Flame,
      color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20",
      title: "Weekly Calorie Burn",
      body: `At ${calVal} kcal/day you'll burn ~${(calVal * 7).toLocaleString()} kcal/week. ${calVal * 7 >= 2500 ? "Weekly target reachable!" : "Increase activity to hit 2,500 kcal."}`,
    },
    workoutDaysVal != null && {
      icon: TrendingUp,
      color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20",
      title: "Workout Frequency",
      body: `${workoutDaysVal} workouts/week puts you on pace. Aim for ${workoutTarget} to advance your ${preferredWO ?? "fitness"} goals.`,
    },
    bmiVal != null && bmiInfo != null && {
      icon: Activity,
      color: bmiInfo.color,
      bg: `bg-white/5`,
      border: `border-white/10`,
      title: `BMI: ${bmiVal.toFixed(1)} — ${bmiInfo.label}`,
      body: bmiVal < 18.5
        ? "Increase caloric intake and focus on strength training to build muscle mass."
        : bmiVal < 25
        ? "Your BMI is in a healthy range. Maintain current habits and stay consistent."
        : bmiVal < 30
        ? "Cardio + strength training can help move BMI into the normal range."
        : "Focus on a calorie deficit and structured cardio. Consider consulting a nutritionist.",
    },
    stressLevel != null && {
      icon: Brain,
      color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20",
      title: `Stress Level: ${stressLevel}`,
      body: stressLevel === "High"
        ? `High stress detected. You meditate ${meditationMins ?? 0} min/day — try increasing to 15+ min and reducing screen time (${screenTime ?? "—"} hrs/day).`
        : stressLevel === "Moderate"
        ? `Moderate stress. ${meditationMins ?? 0} min meditation + ${sleepVal?.toFixed(1) ?? "—"} hrs sleep are helping. Keep it consistent.`
        : "Low stress is a great foundation for consistent fitness progress!",
    },
  ].filter(Boolean) as Array<{
    icon: any; color: string; bg: string; border: string; title: string; body: string;
  }>;

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[70vh]">
          <p className="text-muted-foreground text-lg animate-pulse">Loading goals data…</p>
        </div>
      </Layout>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="space-y-8 pb-10">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">Goals</h1>
            <p className="text-muted-foreground text-lg">Set targets. Stay focused. Achieve more.</p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-secondary text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] border-0 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create New Goal
          </Button>
        </div>

        {/* ── Hero Banner ───────────────────────────────────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 h-48">
          <img
            src="https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=1200&h=400&fit=crop&auto=format"
            alt="Goals motivation"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent" />
          <div className="relative z-10 p-8 h-full flex flex-col justify-center gap-2">
            <div className="text-xs font-bold tracking-widest text-primary uppercase">
              {activityPattern ?? "Stay on Track"}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {activeCount > 0
                ? `${overallPct}% Average Goal Progress`
                : "Start Setting Your Goals!"}
            </h2>
            <div className="flex items-center gap-3 flex-wrap mt-1">
              {fitnessLevel && (
                <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/20 font-medium">
                  {fitnessLevel}
                </span>
              )}
              {healthGoal && (
                <span className="text-xs text-white/60">
                  Primary goal: <span className="text-white font-medium">{healthGoal}</span>
                </span>
              )}
              {preferredWO && (
                <span className="text-xs text-white/60">
                  Preferred: <span className="text-white font-medium">{preferredWO}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Summary Stat Cards ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Active Goals",    value: String(activeCount),                        sub: activeCount > 0 ? "In progress" : "Add goals",        icon: Target,     color: "text-primary",     bg: "bg-primary/20" },
            { label: "Avg Progress",    value: activeCount > 0 ? `${overallPct}%` : "—",  sub: activeCount > 0 ? "Across all goals" : "No goals yet", icon: Zap,        color: "text-secondary",   bg: "bg-secondary/20" },
            { label: "Goals Completed", value: String(completedCount),                     sub: completedCount > 0 ? "Hit 100%!" : "Keep pushing",     icon: Award,      color: "text-emerald-400", bg: "bg-emerald-500/20" },
            { label: "Fitness Level",   value: fitnessLevel ?? "—",                        sub: healthGoal ?? "Not set",                                icon: ShieldCheck, color: "text-violet-400",  bg: "bg-violet-500/20" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="glass-panel border-white/10 hover:border-white/20 transition-all">
                <CardContent className="p-5">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <p className="text-muted-foreground text-sm mb-1">{s.label}</p>
                  <p className="text-xl font-bold text-white truncate">{s.value}</p>
                  <p className="text-xs text-emerald-400 mt-1">{s.sub}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ── Daily Action Tips (ai_table → daily_action_tip) ──────────────── */}
        {dailyTips.length > 0 && (
          <div>
            <h2 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" /> Today's Action Tips
            </h2>
            <div className="flex flex-wrap gap-2">
              {dailyTips.map((tip, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="text-xs px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium whitespace-nowrap"
                >
                  {tip}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* ── Charts Row: Goals Radar + Weekly Pacing ───────────────────────── */}
        {goals.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Goals Radar */}
            <Card className="glass-panel border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">Goal Radar</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={goalsRadarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="goal" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }} />
                    <Radar dataKey="value" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.25} strokeWidth={2.5}
                      dot={{ fill: "#06B6D4", r: 4, strokeWidth: 0 }} />
                  </RadarChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground text-center mt-1">Progress % across all active goals</p>
              </CardContent>
            </Card>

            {/* Weekly Steps + Calories */}
            <Card className="lg:col-span-2 glass-panel border-white/10">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">Weekly Goal Pacing</CardTitle>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-1.5 rounded bg-primary inline-block" />Steps
                    </span>
                    {calVal && (
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-1.5 rounded bg-orange-400 inline-block" />Calories
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {weeklyStepsData ? (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={weeklyStepsData.map((d, i) => ({
                          ...d,
                          calories: weeklyCalData?.[i]?.calories ?? 0,
                        }))}
                        barGap={3} barSize={18}
                      >
                        <defs>
                          <linearGradient id="stepsGoalGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.35} />
                          </linearGradient>
                          <linearGradient id="calGoalGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f97316" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#f97316" stopOpacity={0.35} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="s" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} tickLine={false} axisLine={false} />
                        {calVal && <YAxis yAxisId="c" orientation="right" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} tickLine={false} axisLine={false} />}
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: "rgba(10,15,30,0.9)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "8px" }}
                          itemStyle={{ color: "#fff" }}
                        />
                        <Bar yAxisId="s" dataKey="steps"    fill="url(#stepsGoalGrad)" radius={[4,4,0,0]} name="Steps" />
                        {calVal && <Bar yAxisId="c" dataKey="calories" fill="url(#calGoalGrad)"  radius={[4,4,0,0]} name="Calories (kcal)" />}
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-primary/5 border border-primary/15">
                      <TrendingUp className="w-4 h-4 text-primary shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        {stepsVal >= 10000
                          ? "You're hitting your 10,000 step target — on track for the week!"
                          : `Averaging ${stepsVal!.toLocaleString()} steps/day — ${(10000 - stepsVal!).toLocaleString()} more/day to hit 10,000.`}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="h-[200px] flex flex-col items-center justify-center gap-3 border border-dashed border-white/10 rounded-xl">
                    <TrendingUp className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground text-center">Set your daily steps in your profile to see weekly pacing</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Wellness Radar + Scores + Duration Trend ──────────────────────── */}
        {(energyScore != null || mentalScore != null || productivitySc != null) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Wellness Radar */}
            <Card className="glass-panel border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Brain className="w-4 h-4 text-violet-400" /> Wellness Radar
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={wellnessRadarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="axis" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 10 }} />
                    <Radar dataKey="value" stroke="#A855F7" fill="#A855F7" fillOpacity={0.2} strokeWidth={2}
                      dot={{ fill: "#f59e0b", r: 4, strokeWidth: 0 }} />
                  </RadarChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground text-center">Scores normalized to 0–100</p>
              </CardContent>
            </Card>

            {/* Wellness Progress Bars */}
            <Card className="glass-panel border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">Wellness Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-1">
                {[
                  { label: "Energy Level",    val: energyScore,  max: 10,  color: "#f59e0b", icon: Zap },
                  { label: "Mental Wellness", val: mentalScore,  max: 10,  color: "#A855F7", icon: Brain },
                  { label: "Productivity",    val: productivitySc, max: 100, color: "#22d3ee", icon: TrendingUp },
                  { label: "Sleep Quality",   val: sleepQScore,  max: 100, color: "#60a5fa", icon: MoonStar },
                  { label: "Weekend Activity",val: weekendActSc, max: 10,  color: "#34d399", icon: Activity },
                ].filter(w => w.val != null).map((w) => {
                  const pct = Math.min(100, Math.round(((w.val ?? 0) / w.max) * 100));
                  return (
                    <div key={w.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <w.icon className="w-3.5 h-3.5" style={{ color: w.color }} />
                          <span className="text-xs text-muted-foreground">{w.label}</span>
                        </div>
                        <span className="text-xs font-semibold text-white">{w.val} / {w.max}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: w.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Workout Duration Trend */}
            <Card className="glass-panel border-white/10">
              {durationTrendData ? (
                <>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Timer className="w-4 h-4 text-emerald-400" /> Workout Duration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={190}>
                      <AreaChart data={durationTrendData}>
                        <defs>
                          <linearGradient id="durGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#34d399" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} tickLine={false} axisLine={false} />
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: "rgba(10,15,30,0.9)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: "8px" }}
                          itemStyle={{ color: "#fff" }}
                          formatter={(v: number) => [`${v} mins`, "Duration"]}
                        />
                        <Area dataKey="mins" stroke="#34d399" strokeWidth={2} fill="url(#durGrad)" name="Duration" />
                      </AreaChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Avg: {avgDuration} mins/session · {preferredWO ?? "Mixed"}
                    </p>
                  </CardContent>
                </>
              ) : (
                <>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-lg">Body Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-2">
                    {[
                      { label: "Height",  value: userData?.height_cm  ? `${userData.height_cm} cm`  : "—" },
                      { label: "Weight",  value: weightKg             ? `${weightKg} kg`             : "—" },
                      { label: "BMI",     value: bmiVal               ? `${bmiVal} — ${bmiInfo?.label ?? ""}` : "—" },
                      { label: "HR",      value: restingHR            ? `${restingHR} bpm`           : "—" },
                    ].map(s => (
                      <div key={s.label} className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                        <span className="text-xs text-muted-foreground">{s.label}</span>
                        <span className="text-sm font-semibold text-white">{s.value}</span>
                      </div>
                    ))}
                  </CardContent>
                </>
              )}
            </Card>
          </div>
        )}

        {/* ── Body & Lifestyle Metrics ──────────────────────────────────────── */}
        {(bmiVal != null || restingHR != null || sedentaryHrs != null || screenTime != null) && (
          <div>
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" /> Body & Lifestyle Metrics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                bmiVal != null && {
                  label: "BMI", value: bmiVal.toFixed(1), sub: bmiInfo?.label ?? "",
                  icon: Activity, color: bmiInfo?.color ?? "text-white", bg: "bg-white/5",
                },
                restingHR != null && {
                  label: "Resting HR", value: `${restingHR} bpm`,
                  sub: restingHR < 60 ? "Athletic" : restingHR < 100 ? "Normal" : "Elevated",
                  icon: Heart, color: "text-red-400", bg: "bg-red-500/10",
                },
                sedentaryHrs != null && {
                  label: "Sedentary", value: `${sedentaryHrs} hrs/day`,
                  sub: sedentaryHrs > 8 ? "⚠ High" : sedentaryHrs > 4 ? "Moderate" : "Low",
                  icon: Timer, color: sedentaryHrs > 8 ? "text-red-400" : "text-amber-400", bg: "bg-amber-500/10",
                },
                screenTime != null && {
                  label: "Screen Time", value: `${screenTime} hrs/day`,
                  sub: screenTime > 8 ? "⚠ High" : screenTime > 4 ? "Moderate" : "Low",
                  icon: Monitor, color: screenTime > 8 ? "text-red-400" : "text-cyan-400", bg: "bg-cyan-500/10",
                },
                meditationMins != null && {
                  label: "Meditation", value: `${meditationMins} min/day`,
                  sub: meditationMins >= 10 ? "On track" : "Needs more",
                  icon: Brain, color: "text-violet-400", bg: "bg-violet-500/10",
                },
                dietType != null && {
                  label: "Diet Type", value: dietType, sub: "Current plan",
                  icon: Salad, color: "text-green-400", bg: "bg-green-500/10",
                },
              ].filter(Boolean).map((m: any, i) => (
                <motion.div key={m.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className="glass-panel border-white/10 hover:border-white/20 transition-all">
                    <CardContent className="p-4">
                      <div className={`w-8 h-8 rounded-lg ${m.bg} flex items-center justify-center mb-3`}>
                        <m.icon className={`w-4 h-4 ${m.color}`} />
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                      <p className="text-sm font-bold text-white">{m.value}</p>
                      <p className={`text-xs mt-1 ${m.color}`}>{m.sub}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── Goal Breakdown Donuts ─────────────────────────────────────────── */}
        {goals.length > 1 && (
          <Card className="glass-panel border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg">Goal Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {goals.map((g) => (
                  <div key={g.id} className="flex flex-col items-center gap-2">
                    <div className="relative w-20 h-20">
                      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                        <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
                        <circle cx="40" cy="40" r="30" fill="none" stroke={g.hex} strokeWidth="7"
                          strokeDasharray={`${(g.pct / 100) * 188.5} 188.5`} strokeLinecap="round"
                          style={{ filter: `drop-shadow(0 0 6px ${g.hex}80)` }} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">{g.pct}%</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`w-7 h-7 rounded-lg ${g.bg} flex items-center justify-center mx-auto mb-1`}>
                        <g.icon className={`w-3.5 h-3.5 ${g.color}`} />
                      </div>
                      <p className="text-xs text-muted-foreground leading-tight">{g.name.split(" ").slice(0, 3).join(" ")}</p>
                      <p className="text-xs font-semibold text-white mt-0.5">
                        {typeof g.current === "number" && g.current < 10
                          ? g.current.toFixed(1)
                          : g.current.toLocaleString()}
                        <span className="text-muted-foreground font-normal"> / {g.target.toLocaleString()}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── AI Recommendations (ai_table) ────────────────────────────────── */}
        {topSuggestions.length > 0 && (
          <div>
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary" /> AI Recommendations
              <span className="text-xs text-muted-foreground font-normal ml-1">
                — from {aiSuggestions.length} personalised signals
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topSuggestions.map((s, i) => {
                const p   = priorityConfig[s.priority_level] ?? priorityConfig.Low;
                const PIcon = p.icon;
                return (
                  <motion.div key={s.ai_id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <Card className={`glass-panel border ${p.border} hover:border-opacity-60 transition-all`}>
                      <CardContent className="p-5">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${p.bg} ${p.color} border ${p.border} flex items-center gap-1`}>
                                <PIcon className="w-3 h-3" /> {s.priority_level}
                              </span>
                              <span className="text-xs text-muted-foreground capitalize px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                                {s.goal_type}
                              </span>
                              <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                                {s.fitness_focus}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-white">{s.suggestion_title}</p>
                          </div>
                          {/* AI Confidence Donut */}
                          <div className="relative w-10 h-10 shrink-0">
                            <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
                              <circle cx="20" cy="20" r="14" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                              <circle cx="20" cy="20" r="14" fill="none" stroke="#7C3AED" strokeWidth="4"
                                strokeDasharray={`${(s.ai_confidence_score / 100) * 88} 88`} strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[9px] font-bold text-white">{s.ai_confidence_score}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Suggestion text */}
                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">{s.suggestion_text}</p>

                        {/* Trigger condition */}
                        <div className="flex items-center gap-1.5 mb-3">
                          <span className="text-xs text-amber-400/80">Trigger:</span>
                          <span className="text-xs text-white/60 capitalize">{String(s.trigger_condition).replace(/_/g, " ")}</span>
                        </div>

                        {/* Recommended product */}
                        {s.recommended_product && (
                          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                            <Package className="w-4 h-4 text-secondary shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] text-muted-foreground">Recommended</p>
                              <p className="text-xs font-semibold text-white truncate">{s.recommended_product}</p>
                            </div>
                            {s.match_score && (
                              <span className="text-xs text-emerald-400 font-semibold shrink-0">{s.match_score}% match</span>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Goal Insights (master_fitness derived) ───────────────────────── */}
        {insights.length > 0 && (
          <div>
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-secondary" /> Goal Insights
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

        {/* ── My Goals List ─────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-white font-semibold text-lg mb-4">My Goals</h2>

          {goals.length === 0 ? (
            <Card className="glass-panel border-white/10">
              <CardContent className="p-10 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                  <Target className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">No goals yet</p>
                  <p className="text-muted-foreground text-sm">
                    Complete your profile with fitness data to automatically generate your goals.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {goals.map((goal, i) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className="glass-panel border-white/10 hover:border-primary/30 transition-all group cursor-pointer overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex items-stretch">
                        {/* Thumbnail */}
                        <div className="relative w-20 flex-shrink-0 overflow-hidden">
                          <img src={goal.img} alt={goal.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className={`w-8 h-8 rounded-xl ${goal.bg} flex items-center justify-center`}>
                              <goal.icon className={`w-4 h-4 ${goal.color}`} />
                            </div>
                          </div>
                        </div>
                        {/* Content */}
                        <div className="flex items-center gap-4 flex-1 p-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div>
                                <p className="font-semibold text-white text-sm group-hover:text-primary transition-colors">{goal.name}</p>
                                <p className="text-xs text-muted-foreground">{goal.desc}</p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                                  {typeof goal.current === "number" && goal.current < 10
                                    ? goal.current.toFixed(1)
                                    : goal.current.toLocaleString()}
                                  {" / "}{goal.target.toLocaleString()}
                                </span>
                                <span className="text-xs text-muted-foreground">{goal.unit}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${freqColor[goal.freq]}`}>{goal.freq}</span>
                              <div className="flex-1">
                                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${goal.pct}%` }}
                                    transition={{ delay: 0.2 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                                    className={`h-full rounded-full bg-gradient-to-r ${goal.bar} shadow-[0_0_8px_rgba(124,58,237,0.4)]`}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Mini donut */}
                          <div className="relative w-12 h-12 shrink-0">
                            <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
                              <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                              <circle cx="24" cy="24" r="20" fill="none" stroke={goal.hex} strokeWidth="4"
                                strokeDasharray={`${(goal.pct / 100) * 125.6} 125.6`} strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-bold text-white">{goal.pct}%</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* ── Activity Profile Summary ──────────────────────────────────────── */}
        {(preferredWO || activityPattern || dietType || smartwatch != null) && (
          <Card className="glass-panel border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-emerald-400" /> Activity Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: "Workout Style",   value: preferredWO    ?? "—", icon: Dumbbell,   color: "text-purple-400" },
                  { label: "Activity Pattern",value: activityPattern ?? "—", icon: Activity,   color: "text-cyan-400" },
                  { label: "Diet",            value: dietType        ?? "—", icon: Salad,      color: "text-green-400" },
                  { label: "Avg Session",     value: avgDuration     != null ? `${avgDuration} mins` : "—", icon: Timer, color: "text-amber-400" },
                  { label: "Stress",          value: stressLevel     ?? "—", icon: Brain,
                    color: stressLevel === "High" ? "text-red-400" : stressLevel === "Moderate" ? "text-amber-400" : "text-emerald-400" },
                  { label: "Smartwatch",      value: (smartwatch === true || smartwatch === "TRUE") ? "Connected" : "Not used",
                    icon: ShieldCheck, color: (smartwatch === true || smartwatch === "TRUE") ? "text-emerald-400" : "text-muted-foreground" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-semibold text-white truncate">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </Layout>
  );
}
