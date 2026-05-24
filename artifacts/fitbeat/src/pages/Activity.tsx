import { Layout } from "@/components/layout/Sidebar";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import {
  Footprints,
  Flame,
  Timer,
  Map,
  Clock,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Cell,
} from "recharts";


const PALETTE = [
  "#7C3AED",
  "#8B5CF6",
  "#6366F1",
  "#06B6D4",
  "#6366F1",
  "#7C3AED",
  "#06B6D4",
];

export default function Activity() {
  const { profile } = useUser();
  const [activityData, setActivityData] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchActivity = async () => {

    setLoading(true);

    const { data, error } = await supabase
      .from("master_fitness")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      console.error("Supabase Error:", error);
      setLoading(false);
      return;
    }
	
	setUserData(data);
    
	const weeklyData = [
      {
        name: "Mon",
        steps: Math.round(data.avg_daily_steps * 0.82),
        calories: Math.round(data.daily_calorie_burn * 0.78),
        minutes: Math.round(data.weekly_active_minutes / 7),
      },
      {
        name: "Tue",
        steps: Math.round(data.avg_daily_steps * 0.91),
        calories: Math.round(data.daily_calorie_burn * 0.84),
        minutes: Math.round(data.weekly_active_minutes / 6.8),
      },
      {
        name: "Wed",
        steps: Math.round(data.avg_daily_steps * 0.75),
        calories: Math.round(data.daily_calorie_burn * 0.72),
        minutes: Math.round(data.weekly_active_minutes / 7.2),
      },
      {
        name: "Thu",
        steps: Math.round(data.avg_daily_steps),
        calories: Math.round(data.daily_calorie_burn),
        minutes: Math.round(data.weekly_active_minutes / 7),
      },
      {
        name: "Fri",
        steps: Math.round(data.avg_daily_steps * 0.88),
        calories: Math.round(data.daily_calorie_burn * 0.80),
        minutes: Math.round(data.weekly_active_minutes / 7.5),
      },
      {
        name: "Sat",
        steps: Math.round(data.avg_daily_steps * 1.15),
        calories: Math.round(data.daily_calorie_burn * 1.10),
        minutes: Math.round(data.weekly_active_minutes / 5.5),
      },
      {
        name: "Sun",
        steps: Math.round(data.avg_daily_steps * 0.96),
        calories: Math.round(data.daily_calorie_burn * 0.92),
        minutes: Math.round(data.weekly_active_minutes / 6),
      },
    ];

    setActivityData(weeklyData);
    setLoading(false);
  };

  fetchActivity();
}, []);

const stepsVal = userData?.avg_daily_steps ?? null;

const caloriesVal = userData?.daily_calorie_burn ?? null;

const durationVal = userData?.avg_workout_duration_mins ?? null;

const weeklyMins = userData?.weekly_active_minutes ?? null;

const activityPattern = userData?.activity_pattern || null;

const preferredWorkout = userData?.preferred_workout || null;

const sedentaryHours = userData?.sedentary_hours_per_day || null;

const stepsFormatted =
  stepsVal != null ? stepsVal.toLocaleString() : "—";

const distKm =
  stepsVal != null
    ? (stepsVal * 0.00075).toFixed(2)
    : "—";

const dailyData = activityData;

const sedHrs =
  sedentaryHours
    ? parseFloat(String(sedentaryHours))
    : null;

const activeHrs =
  weeklyMins
    ? +(weeklyMins / 60 / 7).toFixed(1)
    : null;

const idleHrs =
  sedHrs && activeHrs
    ? Math.max(
        0,
        +(24 - sedHrs - activeHrs - 8).toFixed(1)
      )
    : null;

const timeBreakdown =
  sedHrs != null || activeHrs != null
    ? [
        {
          label: "Sedentary",
          hours: sedHrs ?? 0,
          color: "#9CA3AF",
        },
        {
          label: "Active",
          hours: activeHrs ?? 0,
          color: "#7C3AED",
        },
        {
          label: "Sleep",
          hours: userData?.sleep_hours_avg ?? 0,
          color: "#06B6D4",
        },
        {
          label: "Other",
          hours: idleHrs ?? 0,
          color: "#4B5563",
        },
      ]
    : null;

if (loading) {
  return (
    <Layout>
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-muted-foreground text-lg">
          Loading activity data...
        </p>
      </div>
    </Layout>
  );
}

return (
    <Layout>
      <div className="space-y-8 pb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">Daily Activity Tracking</h1>
          <p className="text-muted-foreground text-lg">Breakdown of your daily movement and energy expenditure.</p>
        </div>

        {/* Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 h-44">
          <img
            src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=1200&h=400&fit=crop&auto=format"
            alt="Activity tracking"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent" />
          <div className="relative z-10 p-8 h-full flex flex-col justify-center gap-2">
            <div className="text-xs font-bold tracking-widest text-secondary uppercase">Active Today</div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {stepsVal != null ? `${stepsFormatted} Steps Daily Goal` : "Track Your Activity"}
            </h2>
            <p className="text-white/60 text-sm max-w-md">
              {activityPattern ? `Activity pattern: ${activityPattern}.` : "Complete your profile to see personalized activity data."}
            </p>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Daily Steps Goal",    value: stepsFormatted,                               sub: stepsVal != null ? "steps/day" : "",    icon: Footprints,    color: "text-primary",    bg: "bg-primary/15" },
            { label: "Estimated Distance",  value: distKm !== "—" ? distKm : "—",               sub: distKm !== "—" ? "km/day" : "",          icon: Map,           color: "text-secondary",  bg: "bg-secondary/15" },
            { label: "Calorie Burn",        value: caloriesVal  != null ? String(caloriesVal) : "—", sub: caloriesVal != null ? "kcal/day" : "",  icon: Flame,         color: "text-orange-400", bg: "bg-orange-500/15" },
            { label: "Workout Duration",    value: durationVal  != null ? String(durationVal) : "—", sub: durationVal != null ? "min/session" : "",icon: Timer,        color: "text-emerald-400",bg: "bg-emerald-500/15" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-panel border-white/10">
                <CardContent className="p-5">
                  <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center mb-3`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <h3 className="text-muted-foreground text-sm font-medium mb-1">{stat.label}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">{stat.value}</span>
                    {stat.sub && <span className="text-xs text-muted-foreground">{stat.sub}</span>}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Weekly Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Steps Bar Chart */}
          <Card className="glass-panel border-white/10">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-white mb-1">Weekly Steps Projection</h3>
              <p className="text-xs text-muted-foreground mb-4">
                {stepsVal != null ? `Based on your ${stepsVal.toLocaleString()} steps/day goal` : "Set your steps goal in your profile"}
              </p>
              {dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dailyData} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: "rgba(10,15,30,0.9)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "8px" }}
                      formatter={(v: number) => [`${v.toLocaleString()} steps`, "Steps"]}
                    />
                    <Bar dataKey="steps" radius={[6,6,0,0]} name="Steps">
                      {dailyData.map((_, i) => <Cell key={i} fill={PALETTE[i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex flex-col items-center justify-center gap-3 border border-dashed border-white/10 rounded-xl">
                  <Footprints className="w-8 h-8 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm text-center">Enter steps goal in your profile</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Calorie + Active Minutes Area Chart */}
          <Card className="glass-panel border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-white">Calorie Burn Trend</h3>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-orange-400 inline-block" />Calories</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-primary inline-block" />Active min</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                {caloriesVal != null ? `Target ${caloriesVal} kcal/day` : "Set calorie goal in your profile"}
              </p>
              {dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={dailyData}>
                    <defs>
                      <linearGradient id="calAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#f97316" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="minAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: "rgba(10,15,30,0.9)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "8px" }}
                    />
                    <Area type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={2} fill="url(#calAreaGrad)" name="Calories (kcal)" />
                    <Area type="monotone" dataKey="minutes"  stroke="#7C3AED" strokeWidth={2} fill="url(#minAreaGrad)" name="Active min" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex flex-col items-center justify-center gap-3 border border-dashed border-white/10 rounded-xl">
                  <Flame className="w-8 h-8 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm text-center">Set calorie burn in your profile</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Day Breakdown + Lifestyle Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Time Breakdown */}
          <Card className="glass-panel border-white/10">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Daily Time Breakdown</h3>
              {timeBreakdown ? (
                <div className="space-y-3">
                  {timeBreakdown.map((seg) => (
                    <div key={seg.label}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                          <span className="text-sm text-muted-foreground">{seg.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-white">{seg.hours > 0 ? `${seg.hours} hrs` : "—"}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (seg.hours / 24) * 100)}%`, backgroundColor: seg.color }} />
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Total 24-hour cycle based on your profile values</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-8 border border-dashed border-white/10 rounded-xl">
                  <Clock className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground text-center">Enter sedentary hours and active minutes to see your day breakdown</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lifestyle Summary */}
          <Card className="glass-panel border-white/10">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Lifestyle Summary</h3>
              <div className="space-y-3">
                {[
  {
    label: "Preferred Workout",
    value: preferredWorkout || "—",
    color: "text-primary",
  },

  {
    label: "Activity Pattern",
    value: activityPattern || "—",
    color: "text-secondary",
  },

  {
    label: "Sedentary Hours / Day",
    value: sedentaryHours
      ? `${sedentaryHours} hrs`
      : "—",
    color: "text-orange-400",
  },

  {
    label: "Screen Time / Day",
    value: userData?.screen_time_hours
      ? `${userData.screen_time_hours} hrs`
      : "—",
    color: "text-yellow-400",
  },

  {
    label: "Workout Days / Week",
    value: userData?.workout_days_per_week
      ? `${userData.workout_days_per_week} days`
      : "—",
    color: "text-purple-400",
  },

  {
    label: "Weekly Active Minutes",
    value: userData?.weekly_active_minutes
      ? `${userData.weekly_active_minutes} min`
      : "—",
    color: "text-emerald-400",
  },
].map((item) => (
                  <div key={item.label} className="flex justify-between items-center bg-white/3 rounded-lg px-3 py-2.5">
                    <span className="text-muted-foreground text-sm">{item.label}</span>
                    <span className={`font-semibold text-sm ${item.value === "—" ? "text-white/30" : item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Context Banners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              img: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=300&h=200&fit=crop&auto=format",
              label: "Activity Pattern", value: activityPattern || "Not Set", sub: "Your movement style", color: "text-primary",
            },
            {
              img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=200&fit=crop&auto=format",
              label: "Preferred Workout", value: preferredWorkout || "Not Set", sub: "Your top choice", color: "text-secondary",
            },
            {
              img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&h=200&fit=crop&auto=format",
              label: "Diet Type", value: profile?.dietType || "Not Set", sub: "Your nutrition approach", color: "text-emerald-400",
            },
          ].map((ins) => (
            <div key={ins.label} className="relative rounded-xl overflow-hidden border border-white/5 h-28 group">
              <img src={ins.img} alt={ins.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 p-3">
                <div className={`text-[10px] font-bold tracking-wider ${ins.color} uppercase`}>{ins.label}</div>
                <div className="text-white text-sm font-bold leading-tight">{ins.value}</div>
                <div className="text-white/50 text-[10px]">{ins.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
