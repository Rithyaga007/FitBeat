import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Sidebar";
import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import {
  Activity,
  Flame,
  Footprints,
  CalendarDays,
  MoonStar,
  BrainCircuit,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
} from "recharts";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const STEP_FACTORS = [0.76, 0.85, 0.69, 1.0, 0.72, 1.13, 0.97];
const CAL_FACTORS  = [0.80, 0.88, 0.72, 1.05, 0.75, 1.10, 0.92];
const BAR_COLORS   = ["#7C3AED","#8B5CF6","#9CA3AF","#06B6D4","#9CA3AF","#7C3AED","#06B6D4"];

function buildWeeklyData(dailySteps: number, calBurn: number) {
  return DAYS.map((name, i) => ({
    name,
    steps: Math.round(dailySteps * STEP_FACTORS[i]),
    calories: Math.round(calBurn * CAL_FACTORS[i]),
  }));
}

function buildRadarData(profile: any) {
  return [
    {
      metric: "Steps",
      value: profile?.avg_daily_steps
        ? Math.min(100, Math.round(parseInt(profile.avg_daily_steps) / 100))
        : 0,
    },
    {
      metric: "Sleep",
      value: profile?.sleep_hours_avg != null
        ? Math.min(100, Math.round((profile.sleep_hours_avg / 8) * 100))
        : 0,
    },
    {
      metric: "Calories",
      value: profile?.daily_calorie_burn != null
        ? Math.min(100, Math.round((profile.daily_calorie_burn / 700) * 100))
        : 0,
    },
    {
      metric: "Workouts",
      value: profile?.workout_days_per_week
        ? Math.min(
            100,
            Math.round((parseInt(profile.workout_days_per_week) / 5) * 100)
          )
        : 0,
    },
    {
      metric: "Active",
      value: profile?.weekly_active_minutes
        ? Math.min(
            100,
            Math.round(
              (parseInt(profile.weekly_active_minutes) / (7 * 90)) * 100
            )
          )
        : 0,
    },
    {
      metric: "Health",
      value: profile?.mental_wellness_score ?? 0,
    },
  ];
}

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);

useEffect(() => {
  const storedUser = localStorage.getItem("fitbeat_user");

  if (storedUser) {
    setProfile(JSON.parse(storedUser));
  }
}, []);
const displayName = profile?.name || "User";

const stepsVal =
  profile?.avg_daily_steps != null
    ? parseInt(profile.avg_daily_steps)
    : null;

const caloriesVal =
  profile?.daily_calorie_burn ?? null;

const activeMinVal =
  profile?.weekly_active_minutes != null
    ? Math.round(parseInt(profile.weekly_active_minutes) / 7)
    : null;

const workoutsVal =
  profile?.workout_days_per_week || null;

const sleepVal =
  profile?.sleep_hours_avg ?? null;

const healthScore =
  profile?.mental_wellness_score ?? null;

const goal =
  profile?.health_goal || null;

const preferredWorkout =
  profile?.preferred_workout || null;

const activityPattern =
  profile?.activity_pattern || null;

const stepsFormatted =
  stepsVal != null ? stepsVal.toLocaleString() : "—";

const sleepFormatted =
  sleepVal != null ? Number(sleepVal).toFixed(1) : "—";

const healthLabel =
  healthScore != null
    ? healthScore >= 80
      ? "Excellent"
      : healthScore >= 60
      ? "Good"
      : "Fair"
    : null;

const stepsProgress =
  stepsVal != null
    ? Math.min(100, Math.round(stepsVal / 100))
    : 0;

const activeMinProgress =
  activeMinVal != null
    ? Math.min(100, Math.round((activeMinVal / 90) * 100))
    : 0;

const caloriesProgress =
  caloriesVal != null
    ? Math.min(100, Math.round((caloriesVal / 700) * 100))
    : 0;

const workoutsProgress =
  workoutsVal != null
    ? Math.min(100, Math.round((parseInt(workoutsVal) / 5) * 100))
    : 0;

const sleepProgress =
  sleepVal != null
    ? Math.min(100, Math.round((sleepVal / 8) * 100))
    : 0;

const weeklyData =
  stepsVal != null && caloriesVal != null
    ? buildWeeklyData(stepsVal, caloriesVal)
    : null;

const radarData = buildRadarData(profile);

const stepsToGoal =
  stepsVal != null
    ? Math.max(0, 10000 - stepsVal)
    : null;

const sleepStatus =
  sleepVal != null
    ? sleepVal >= 7
      ? "good"
      : sleepVal >= 5
      ? "moderate"
      : "low"
    : null;

const insights = [
  stepsToGoal != null && stepsToGoal > 0
    ? {
        color: "text-primary",
        text: `${stepsToGoal.toLocaleString()} steps away from your 10,000-step goal.`,
      }
    : stepsToGoal === 0
    ? {
        color: "text-emerald-400",
        text: "You've hit your 10,000-step goal today!",
      }
    : null,

  caloriesVal != null
    ? {
        color: "text-orange-400",
        text: `Daily calorie burn target: ${caloriesVal} kcal.`,
      }
    : null,

  sleepStatus === "low"
    ? {
        color: "text-blue-400",
        text: `Sleep (${sleepFormatted} hrs) is below 7-hr minimum — prioritise rest.`,
      }
    : sleepStatus === "good"
    ? {
        color: "text-blue-400",
        text: `Great sleep! ${sleepFormatted} hrs keeps your recovery on track.`,
      }
    : sleepVal != null
    ? {
        color: "text-blue-400",
        text: `Sleep of ${sleepFormatted} hrs is moderate — aim for 7–8 hrs.`,
      }
    : null,

  preferredWorkout
    ? {
        color: "text-secondary",
        text: `Keep up your ${preferredWorkout} sessions to stay consistent.`,
      }
    : null,

  profile?.water_intake_liters != null
    ? {
        color: "text-cyan-400",
        text:
          profile.water_intake_liters >= 3
            ? `Excellent hydration level at ${profile.water_intake_liters}L/day.`
            : `Hydration is slightly low (${profile.water_intake_liters}L/day). Aim for 3L daily.`,
      }
    : null,

  profile?.bmi != null
    ? {
        color:
          profile.bmi > 30
            ? "text-red-400"
            : profile.bmi > 25
            ? "text-yellow-400"
            : "text-emerald-400",
        text:
          profile.bmi > 30
            ? `BMI (${profile.bmi}) indicates obesity risk — focus on calorie deficit and cardio.`
            : profile.bmi > 25
            ? `BMI (${profile.bmi}) suggests overweight range — maintain workout consistency.`
            : `Healthy BMI (${profile.bmi}) detected — maintain your current lifestyle.`,
      }
    : null,

  profile?.stress_level
    ? {
        color:
          profile.stress_level === "High"
            ? "text-red-400"
            : "text-emerald-400",
        text:
          profile.stress_level === "High"
            ? "High stress detected — add meditation and recovery days."
            : `Stress level is ${profile.stress_level} — recovery balance looks stable.`,
      }
    : null,

  profile?.screen_time_hours != null
    ? {
        color:
          profile.screen_time_hours > 8
            ? "text-yellow-400"
            : "text-emerald-400",
        text:
          profile.screen_time_hours > 8
            ? `Screen time (${profile.screen_time_hours} hrs/day) is high — increase movement breaks.`
            : `Screen time balance looks healthy at ${profile.screen_time_hours} hrs/day.`,
      }
    : null,

  profile?.weekly_active_minutes != null
    ? {
        color:
          profile.weekly_active_minutes >= 300
            ? "text-emerald-400"
            : "text-primary",
        text:
          profile.weekly_active_minutes >= 300
            ? `Excellent activity level with ${profile.weekly_active_minutes} active mins/week.`
            : `Increase weekly activity beyond ${profile.weekly_active_minutes} mins for better endurance.`,
      }
    : null,
].filter(Boolean) as { color: string; text: string }[];

  return (
    <Layout>
      <div className="space-y-8 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
              Welcome back, {displayName}! 👋
            </h1>
            <p className="text-muted-foreground text-lg">Ready to crush your fitness goals today?</p>
          </div>
          {goal && (
            <div className="glass-panel px-6 py-3 rounded-xl border border-primary/20 bg-primary/5 hidden md:block">
              <p className="text-sm font-medium text-primary uppercase tracking-wider mb-1">Your Goal</p>
              <p className="text-white font-medium">{goal}</p>
            </div>
          )}
        </div>

        {/* Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 h-44">
          <img
            src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&h=400&fit=crop&auto=format"
            alt="Fitness dashboard"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent" />
          <div className="relative z-10 p-8 h-full flex flex-col justify-center gap-2">
            <div className="text-xs font-bold tracking-widest text-primary uppercase">Today's Overview</div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {preferredWorkout ? `Preferred: ${preferredWorkout}` : "Stay Active Today"}
            </h2>
            <p className="text-white/60 text-sm max-w-md">
              {goal ? `Goal: ${goal}` : "Complete your profile to see personalized insights."}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: "Steps",          value: stepsFormatted,                            target: "10,000", unit: "",     icon: Footprints,   color: "text-primary",     bg: "bg-primary/20",     progress: stepsProgress },
            { label: "Active Minutes", value: activeMinVal != null ? String(activeMinVal) : "—", target: "90",     unit: "min", icon: Activity,     color: "text-secondary",   bg: "bg-secondary/20",   progress: activeMinProgress },
            { label: "Calories",       value: caloriesVal  != null ? String(caloriesVal)  : "—", target: "700",    unit: "kcal",icon: Flame,        color: "text-orange-400",  bg: "bg-orange-500/20",  progress: caloriesProgress },
            { label: "Workouts",       value: workoutsVal ?? "—",                        target: "5",      unit: "days",icon: CalendarDays, color: "text-purple-400",  bg: "bg-purple-500/20",  progress: workoutsProgress },
            { label: "Sleep",          value: sleepFormatted,                            target: "8",      unit: "hrs", icon: MoonStar,     color: "text-blue-400",    bg: "bg-blue-500/20",    progress: sleepProgress },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-panel border-white/10 hover:border-white/20 transition-colors overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-full h-1 bg-white/5 group-hover:bg-primary/50 transition-colors" />
                <CardContent className="p-5">
                  <div className={`p-2 rounded-lg ${stat.bg} w-fit mb-4`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <h3 className="text-muted-foreground text-sm font-medium mb-1">{stat.label}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-bold text-white">{stat.value}</span>
                    {stat.value !== "—" && (
                      <span className="text-sm text-muted-foreground">/ {stat.target} {stat.unit}</span>
                    )}
                  </div>
                  <Progress value={stat.progress} className="h-1.5 bg-black/40" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity + Calories Chart */}
          <Card className="lg:col-span-2 glass-panel border-white/10">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-1">
                <div>
                  <h3 className="text-xl font-bold text-white">Weekly Activity Overview</h3>
                  <p className="text-sm text-muted-foreground">
                    {stepsVal != null ? `Daily steps pattern based on ${stepsVal.toLocaleString()} goal` : "Set your steps goal in your profile"}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded bg-primary inline-block" />Steps</span>
                  {caloriesVal && <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded bg-orange-400 inline-block" />Calories</span>}
                </div>
              </div>
			  
			  {/* Weekly Performance Pattern */}
<Card className="glass-panel border-white/10">
  <CardContent className="p-6">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-xl font-bold text-white">
          Weekly Performance Pattern
        </h3>
        <p className="text-sm text-muted-foreground">
          AI-generated energy and activity trend
        </p>
      </div>
    </div>

    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={weeklyData || []}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
          />

          <XAxis
            dataKey="name"
            tick={{
              fill: "rgba(255,255,255,0.5)",
              fontSize: 12,
            }}
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            tick={{
              fill: "rgba(255,255,255,0.5)",
              fontSize: 11,
            }}
            tickLine={false}
            axisLine={false}
          />

          <RechartsTooltip
            contentStyle={{
              backgroundColor: "rgba(10,15,30,0.95)",
              border:
                "1px solid rgba(124,58,237,0.3)",
              borderRadius: "10px",
            }}
          />

          <Line
            type="monotone"
            dataKey="steps"
            stroke="#7C3AED"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />

          <Line
            type="monotone"
            dataKey="calories"
            stroke="#f97316"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </CardContent>
</Card>
			  
			  

              {weeklyData ? (
                <div className="h-[220px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData} barGap={4}>
                      <defs>
                        <linearGradient id="stepsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.3} />
                        </linearGradient>
                        <linearGradient id="calsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f97316" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#f97316" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="steps" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="cals" orientation="right" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} tickLine={false} axisLine={false} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: "rgba(10,15,30,0.9)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "8px" }}
                        itemStyle={{ color: "#fff" }}
                      />
                      <Bar yAxisId="steps" dataKey="steps" fill="url(#stepsGrad)" radius={[4,4,0,0]} name="Steps" />
                      <Bar yAxisId="cals"  dataKey="calories" fill="url(#calsGrad)" radius={[4,4,0,0]} name="Calories (kcal)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[220px] flex flex-col items-center justify-center gap-3 border border-dashed border-white/10 rounded-xl mt-4">
                  <Footprints className="w-10 h-10 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm text-center max-w-xs">
                    Set your daily steps goal in your profile to see your weekly chart.
                  </p>
                </div>
              )}

              {insights.length > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {insights.map((ins, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm bg-white/3 rounded-lg px-3 py-2">
                      <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${ins.color.replace("text-", "bg-")}`} />
                      <span className="text-muted-foreground text-xs leading-snug">{ins.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Health Score */}
          <Card className="glass-panel border-white/10">
            <CardContent className="p-6 flex flex-col h-full">
              <h3 className="text-xl font-bold text-white mb-4">Health Score</h3>

              {healthScore != null ? (
                <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                    <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
                    <circle cx="50" cy="50" r="40" stroke="url(#dashGrad)" strokeWidth="8" fill="none"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * (healthScore / 100))}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="dashGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#7C3AED" />
                        <stop offset="100%" stopColor="#06B6D4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-white">{healthScore}</span>
                    <span className="text-sm text-secondary font-medium mt-1">{healthLabel}</span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    <BrainCircuit className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm text-center">Complete your profile to see your health score.</p>
                </div>
              )}

              {/* Fitness Radar */}
              <div className="mt-4 flex-1">
                <p className="text-xs text-muted-foreground mb-2 text-center">Fitness Dimensions</p>
                <ResponsiveContainer width="100%" height={160}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                    <Radar dataKey="value" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.25} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
			  
			  {/* Additional Health Insights */}
<div className="mt-4 space-y-3">

  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs text-muted-foreground">
        Recovery Status
      </span>

      <span
        className={`text-xs font-semibold ${
          sleepVal >= 7
            ? "text-emerald-400"
            : "text-yellow-400"
        }`}
      >
        {sleepVal >= 7 ? "Optimal" : "Needs Improvement"}
      </span>
    </div>

    <Progress
      value={
        sleepVal
          ? Math.min(100, (sleepVal / 8) * 100)
          : 0
      }
      className="h-1.5 bg-black/30"
    />
  </div>

  <div className="grid grid-cols-2 gap-3">

    <div className="rounded-xl bg-primary/10 border border-primary/20 p-3">
      <p className="text-[11px] text-primary mb-1">
        Weekly Burn
      </p>

      <h4 className="text-lg font-bold text-white">
        {caloriesVal
          ? `${(caloriesVal * 7).toLocaleString()}`
          : "--"}
      </h4>

      <p className="text-[10px] text-muted-foreground">
        kcal / week
      </p>
    </div>

    <div className="rounded-xl bg-secondary/10 border border-secondary/20 p-3">
      <p className="text-[11px] text-secondary mb-1">
        Activity Level
      </p>

      <h4 className="text-lg font-bold text-white">
        {
          activeMinVal >= 60
            ? "High"
            : activeMinVal >= 30
            ? "Moderate"
            : "Low"
        }
      </h4>

      <p className="text-[10px] text-muted-foreground">
        daily movement
      </p>
    </div>

  </div>

  <div className="rounded-xl bg-white/5 border border-white/5 p-3">
    <div className="flex items-start gap-2">
      <BrainCircuit className="w-4 h-4 text-primary mt-0.5" />

      <p className="text-xs text-muted-foreground leading-relaxed">
        {
          healthScore >= 80
            ? "AI detected excellent fitness balance across activity, recovery, and calorie management."
            : healthScore >= 60
            ? "Your fitness pattern is stable, but sleep and activity consistency can improve."
            : "AI recommends increasing activity levels and improving recovery patterns."
        }
      </p>
    </div>
  </div>

</div>

              <Button className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white mt-2">
                View Detailed Insights
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Insights Row */}
        {(stepsVal != null || caloriesVal != null || sleepVal != null) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              stepsVal != null ? {
                icon: TrendingUp, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20",
                title: "Step Streak Potential",
                body: `At ${stepsVal.toLocaleString()} steps/day you'd cover ~${(stepsVal * 0.00075 * 7).toFixed(1)} km/week.`,
              } : null,
              caloriesVal != null ? {
                icon: Zap, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20",
                title: "Calorie Momentum",
                body: `${caloriesVal} kcal/day burns ~${(caloriesVal * 7).toLocaleString()} kcal/week — on target for your goal.`,
              } : null,
              sleepVal != null ? {
                icon: MoonStar, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20",
                title: "Sleep Score",
                body: sleepVal >= 7
                  ? `${Number(sleepVal).toFixed(1)} hrs is in the optimal 7–9 hr recovery zone.`
                  : `${Number(sleepVal).toFixed(1)} hrs is below 7 hrs — aim for more rest to improve recovery.`,
              } : null,
            ].filter(Boolean).map((item: any, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}>
                <Card className={`glass-panel border ${item.border} ${item.bg}`}>
                  <CardContent className="p-5 flex gap-4 items-start">
                    <div className={`p-2 rounded-lg bg-white/5 shrink-0`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white mb-1">{item.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
		
		{/* Advanced AI Insights */}
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

  {/* Recovery Score */}
  <Card className="glass-panel border-cyan-500/20 bg-cyan-500/5">
    <CardContent className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">
          Recovery Score
        </h3>
        <MoonStar className="w-5 h-5 text-cyan-400" />
      </div>

      <div className="text-3xl font-bold text-cyan-400 mb-2">
        {
          sleepVal >= 7
            ? "92%"
            : sleepVal >= 5
            ? "74%"
            : "48%"
        }
      </div>

      <p className="text-xs text-muted-foreground">
        {
          sleepVal >= 7
            ? "Excellent recovery detected from sleep and activity balance."
            : "Recovery could improve with better sleep consistency."
        }
      </p>
    </CardContent>
  </Card>

  {/* Workout Consistency */}
  <Card className="glass-panel border-purple-500/20 bg-purple-500/5">
    <CardContent className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">
          Workout Consistency
        </h3>
        <Activity className="w-5 h-5 text-purple-400" />
      </div>

      <div className="text-3xl font-bold text-purple-400 mb-2">
        {workoutsVal ? `${workoutsVal}/7` : "--"}
      </div>

      <p className="text-xs text-muted-foreground">
        {
          workoutsVal >= 5
            ? "Outstanding weekly workout discipline."
            : "Increase workout frequency for faster results."
        }
      </p>
    </CardContent>
  </Card>

  {/* Hydration Status */}
  <Card className="glass-panel border-blue-500/20 bg-blue-500/5">
    <CardContent className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">
          Hydration Status
        </h3>
        <Zap className="w-5 h-5 text-blue-400" />
      </div>

      <div className="text-3xl font-bold text-blue-400 mb-2">
        {profile?.water_intake_liters ?? "--"}L
      </div>

      <p className="text-xs text-muted-foreground">
        {
          profile?.water_intake_liters >= 3
            ? "Hydration level is optimal."
            : "Increase water intake for better performance."
        }
      </p>
    </CardContent>
  </Card>

  {/* Fitness Readiness */}
  <Card className="glass-panel border-emerald-500/20 bg-emerald-500/5">
    <CardContent className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">
          Fitness Readiness
        </h3>
        <TrendingUp className="w-5 h-5 text-emerald-400" />
      </div>

      <div className="text-3xl font-bold text-emerald-400 mb-2">
        {
          healthScore >= 80
            ? "High"
            : healthScore >= 60
            ? "Moderate"
            : "Low"
        }
      </div>

      <p className="text-xs text-muted-foreground">
        AI-estimated readiness based on sleep, workouts, stress, and recovery.
      </p>
    </CardContent>
  </Card>
</div>


        {/* AI Recommendation */}
        {(goal || preferredWorkout || activityPattern) && (
          <Card className="glass-panel border-primary/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-50" />
            <CardContent className="p-6 relative z-10 flex gap-6 items-center">
              <div className="w-16 h-16 shrink-0 rounded-full bg-black/40 border border-primary/50 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)] group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-secondary tracking-wider uppercase mb-1">AI Recommendation</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {preferredWorkout ? `Stay consistent with your ${preferredWorkout} sessions` : `Keep working toward: ${goal}`}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
  {
    profile?.bmi > 30
      ? "AI Insight: Your BMI indicates obesity risk. Focus on calorie deficit workouts, hydration, and daily walking."

      : profile?.bmi > 25
      ? "AI Insight: You're slightly overweight. Increase cardio sessions and maintain consistent sleep."

      : profile?.sleep_hours_avg < 6
      ? "AI Insight: Poor sleep recovery detected. Prioritize 7–8 hours of sleep for better performance."

      : profile?.stress_level === "High"
      ? "AI Insight: High stress detected. Include meditation, breathing exercises, and light workouts."

      : profile?.avg_daily_steps < 5000
      ? "AI Insight: Low activity pattern detected. Aim for at least 8,000 daily steps."

      : profile?.workout_days_per_week >= 5
      ? "AI Insight: Excellent workout consistency. Focus now on recovery and muscle optimization."

      : `AI Insight: Based on your ${activityPattern || "fitness"} profile, your overall health pattern looks balanced. Maintain consistency to achieve long-term fitness goals.`
  }
</p>
                <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white border-0">
                  View Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
