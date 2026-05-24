import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, UserProfile } from "@/context/UserContext";
import { supabase } from "../lib/supabase";
import {
  Activity, ShieldCheck, CheckCircle2, ChevronRight, ChevronLeft,
  Watch, Moon, Droplets, Footprints, Flame, Brain,
  Dumbbell, Heart, Zap, Sparkles, Trophy, Star, Package,
  AlertCircle, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  "Basic Info",
  "Body Metrics",
  "Activity",
  "Lifestyle",
  "Health & Wellness",
  "AI Suggestions",
  "Review & Save",
];

const GOALS = [
  { label: "Muscle Gain",      icon: Dumbbell, color: "text-primary",     bg: "bg-primary/20 border-primary" },
  { label: "Weight Loss",      icon: Flame,    color: "text-orange-400",  bg: "bg-orange-500/20 border-orange-500" },
  { label: "Fat Loss",         icon: Zap,      color: "text-yellow-400",  bg: "bg-yellow-500/20 border-yellow-500" },
  { label: "Better Sleep",     icon: Moon,     color: "text-secondary",   bg: "bg-secondary/20 border-secondary" },
  { label: "Improve Stamina",  icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/20 border-emerald-500" },
  { label: "General Fitness",  icon: Heart,    color: "text-rose-400",    bg: "bg-rose-500/20 border-rose-500" },
  { label: "Stress Reduction", icon: Brain,    color: "text-violet-400",  bg: "bg-violet-500/20 border-violet-500" },
  { label: "Maintain Fitness", icon: Trophy,   color: "text-cyan-400",    bg: "bg-cyan-500/20 border-cyan-500" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcSleepDuration(wake: string, sleep: string): number {
  if (!wake || !sleep) return 0;
  const [wh, wm] = wake.split(":").map(Number);
  const [sh, sm] = sleep.split(":").map(Number);
  let diff = wh * 60 + wm - (sh * 60 + sm);
  if (diff < 0) diff += 1440;
  return Math.round((diff / 60) * 10) / 10;
}

function calcCalorieBurn(wt: string, steps: string, dur: string, level: string): number {
  const w = parseFloat(wt) || 0;
  const s = parseInt(steps) || 0;
  const d = parseInt(dur) || 0;
  const m = { beginner: 1.3, intermediate: 1.55, advanced: 1.75 }[level] ?? 1.4;
  return Math.round(w * 22 * m * 0.1 + s * 0.04 + d * w * 0.1);
}

function calcHydration(wt: string, level: string): number {
  const w = parseFloat(wt) || 0;
  const boost = level === "advanced" ? 0.7 : level === "intermediate" ? 0.4 : 0.2;
  return Math.round((w * 0.033 + boost) * 10) / 10;
}

function calcHealthScore(sq: string, stress: number, wDays: string, water: string, screen: string): number {
  const sleepScore   = ({ excellent: 25, good: 20, fair: 12, poor: 5 }[sq] ?? 15);
  const stressScore  = Math.round((10 - stress) * 2.5);
  const activityScore= Math.min(25, parseInt(wDays || "0") * 5);
  const waterScore   = Math.min(15, parseFloat(water || "0") * 4);
  const screenScore  = Math.max(0, 10 - parseInt(screen || "0"));
  return Math.min(100, sleepScore + stressScore + activityScore + waterScore + screenScore);
}

function calcRecoveryScore(sq: string, med: string, wDays: string): number {
  const sleepScore = ({ excellent: 40, good: 30, fair: 18, poor: 8 }[sq] ?? 20);
  const meditationScore = Math.min(35, parseInt(med || "0") * 2);
  const workoutScore = Math.max(0, 25 - parseInt(wDays || "0") * 2);
  return Math.min(100, sleepScore + meditationScore + workoutScore);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FloatWidget({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string; color: string;
}) {
  return (
    <div className="flex items-center gap-2 glass-panel px-3 py-2 rounded-xl border border-white/10 backdrop-blur-sm">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground leading-none">{label}</p>
        <p className="text-sm font-bold text-white leading-tight">{value || "–"}</p>
      </div>
    </div>
  );
}

function ScoreRing({ value, label, color }: { value: number; label: string; color: string }) {
  const r = 40; const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
          <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={circ - (value / 100) * circ} strokeLinecap="round"/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{value}</span>
          <span className="text-[9px] text-muted-foreground">/100</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground text-center">{label}</span>
    </div>
  );
}

// ─── AI Suggestion types ──────────────────────────────────────────────────────

interface AISuggestion {
  suggestion_title: string;
  goal_type: string;
  trigger_condition: string;
  suggestion_text: string;
  recommended_product: string;
  priority_level: "High" | "Medium" | "Low";
  ai_confidence_score: number;
  fitness_focus: string;
  daily_action_tip: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { setProfile } = useUser();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Credentials popup
  const [showCredPopup, setShowCredPopup] = useState(false);
  const [savedCreds,    setSavedCreds]    = useState<{ username: string; password: string } | null>(null);
  const [credCountdown, setCredCountdown] = useState(15);

  // ── Step 0 – Basic Info
  const [fullName,    setFullName]    = useState("");
  const [age,         setAge]         = useState("");
  const [gender,      setGender]      = useState("");
  const [city,        setCity]        = useState("");
  const [occupation,  setOccupation]  = useState("");
  const [healthGoal,  setHealthGoal]  = useState("");

  // ── Step 1 – Body Metrics
  const [height,     setHeight]    = useState("");
  const [weight,     setWeight]    = useState("");
  const [restingHR,  setRestingHR] = useState("");

  // ── Step 2 – Activity
  const [fitnessLevel,          setFitnessLevel]          = useState("");
  const [dailySteps,            setDailySteps]            = useState("");
  const [weeklyActiveMinutes,   setWeeklyActiveMinutes]   = useState("");
  const [workoutDays,           setWorkoutDays]           = useState("");
  const [preferredWorkout,      setPreferredWorkout]      = useState("");
  const [workoutDuration,       setWorkoutDuration]       = useState("");
  const [activityPattern,       setActivityPattern]       = useState("");

  // ── Step 3 – Lifestyle
  const [wakeUpTime,         setWakeUpTime]         = useState("");
  const [sleepTime,          setSleepTime]          = useState("");
  const [sleepQuality,       setSleepQuality]       = useState("");
  const [waterIntake,        setWaterIntake]        = useState("");
  const [dietType,           setDietType]           = useState("");
  const [sedentaryHours,     setSedentaryHours]     = useState("");
  const [screenTime,         setScreenTime]         = useState("");
  const [smokingStatus,      setSmokingStatus]      = useState("");
  const [alcoholConsumption, setAlcoholConsumption] = useState("");

  // ── Step 4 – Health & Wellness
  const [stressLevel,       setStressLevel]       = useState([5]);
  const [energyLevel,       setEnergyLevel]       = useState([5]);
  const [meditationMinutes, setMeditationMinutes] = useState("");
  const [smartwatchUser,    setSmartWatchUser]     = useState(false);
  const [mentalWellness,    setMentalWellness]     = useState([5]);
  const [productivityScore, setProductivityScore] = useState([5]);
  const [weekendActivity,   setWeekendActivity]   = useState([5]);

  // ── Step 5 – AI Suggestions
  const [aiSuggestions,    setAiSuggestions]    = useState<AISuggestion[]>([]);
  const [aiLoading,        setAiLoading]        = useState(false);
  const [aiError,          setAiError]          = useState("");
  const [aiGenerated,      setAiGenerated]      = useState(false);

  // ── Derived calculations
  const bmiRaw = parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2);
  const bmi    = isNaN(bmiRaw) ? "–" : bmiRaw.toFixed(1);
  const numBmi = parseFloat(bmi) || 0;
  let bmiStatus = "Normal"; let bmiColor = "#10b981";
  if      (numBmi > 0 && numBmi < 18.5) { bmiStatus = "Underweight"; bmiColor = "#06B6D4"; }
  else if (numBmi >= 25 && numBmi < 30) { bmiStatus = "Overweight";  bmiColor = "#f59e0b"; }
  else if (numBmi >= 30)                { bmiStatus = "Obese";       bmiColor = "#ef4444"; }

  const sleepDuration  = useMemo(() => calcSleepDuration(wakeUpTime, sleepTime), [wakeUpTime, sleepTime]);
  const calorieBurn    = useMemo(() => calcCalorieBurn(weight, dailySteps, workoutDuration, fitnessLevel), [weight, dailySteps, workoutDuration, fitnessLevel]);
  const hydrationRec   = useMemo(() => calcHydration(weight, fitnessLevel), [weight, fitnessLevel]);
  const healthScore    = useMemo(() => calcHealthScore(sleepQuality, stressLevel[0], workoutDays, waterIntake, screenTime), [sleepQuality, stressLevel, workoutDays, waterIntake, screenTime]);
  const recoveryScore  = useMemo(() => calcRecoveryScore(sleepQuality, meditationMinutes, workoutDays), [sleepQuality, meditationMinutes, workoutDays]);
  const lifestyleScore = useMemo(() => {
    const waterS  = Math.min(25, parseFloat(waterIntake || "0") * 6);
    const screenS = Math.max(0, 25 - parseInt(screenTime || "0") * 3);
    const sleepS  = sleepDuration >= 7 ? 25 : sleepDuration >= 6 ? 18 : 10;
    const sedS    = Math.max(0, 25 - parseInt(sedentaryHours || "0") * 2);
    return Math.min(100, Math.round(waterS + screenS + sleepS + sedS));
  }, [waterIntake, screenTime, sleepDuration, sedentaryHours]);

  const goalObj = GOALS.find(g => g.label === healthGoal);

  // ── AI Suggestion generation ──────────────────────────────────────────────
  const generateAISuggestions = async () => {
    setAiLoading(true);
    setAiError("");

    try {
      let goalType = "general fitness";
      let triggerCondition = "low activity";

      if (healthGoal?.toLowerCase().includes("weight") || healthGoal?.toLowerCase().includes("fat")) {
        goalType = "weight loss";
      } else if (healthGoal?.toLowerCase().includes("muscle")) {
        goalType = "muscle gain";
      } else if (healthGoal?.toLowerCase().includes("sleep")) {
        goalType = "better sleep";
      } else if (healthGoal?.toLowerCase().includes("stress")) {
        goalType = "stress management";
      } else if (healthGoal?.toLowerCase().includes("stamina")) {
        goalType = "endurance";
      }

      if (numBmi >= 30) {
        triggerCondition = "high bmi";
      } else if (sleepDuration < 6) {
        triggerCondition = "sleep";
      } else if (stressLevel[0] >= 7) {
        triggerCondition = "stress";
      } else if (parseInt(dailySteps) < 5000) {
        triggerCondition = "low activity";
      } else {
        triggerCondition = "joint pain";
      }

      const { data, error } = await supabase
        .from("ai_table")
        .select("*")
        .eq("goal_type", goalType)
        .eq("trigger_condition", triggerCondition)
        .limit(10);

      if (error) throw error;

      let finalSuggestions = data || [];

      if (finalSuggestions.length < 5) {
        const { data: fallbackData } = await supabase
          .from("ai_table")
          .select("*")
          .eq("goal_type", goalType)
          .limit(10);

        if (fallbackData) {
          finalSuggestions = [...finalSuggestions, ...fallbackData];
        }
      }

      finalSuggestions = finalSuggestions.sort(() => 0.5 - Math.random()).slice(0, 5);

      const mappedSuggestions: AISuggestion[] = finalSuggestions.map((item: any) => ({
        suggestion_title:    item.suggestion_title,
        goal_type:           item.goal_type,
        trigger_condition:   item.trigger_condition,
        suggestion_text:     item.suggestion_text,
        recommended_product: item.recommended_product,
        priority_level:      item.priority_level,
        ai_confidence_score: item.ai_confidence_score,
        fitness_focus:       item.fitness_focus,
        daily_action_tip:    item.daily_action_tip,
      }));

      setAiSuggestions(mappedSuggestions);
      setAiGenerated(true);
    } catch (err) {
      console.error("AI suggestion error:", err);
      setAiError("Failed to load AI recommendations");
    } finally {
      setAiLoading(false);
    }
  };

  // ── Save to Supabase ──────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    try {
      const currentYear      = new Date().getFullYear();
      const calculatedYear   = currentYear - parseInt(age || "0");
      const firstName        = fullName.trim().split(" ")[0].slice(0, 4);
      const formattedUsername = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
      const autoPassword     = `${formattedUsername}${calculatedYear}`;

      // 1. Save to master_fitness table
      const masterPayload = {
        name:                      fullName,
        username:                  formattedUsername,
        password:                  autoPassword,
        year:                      calculatedYear,
        age:                       parseInt(age) || null,
        gender:                    gender || null,
        city:                      city || null,
        occupation:                occupation || null,
        fitness_level:             fitnessLevel || null,
        height_cm:                 parseFloat(height) || null,
        weight_kg:                 parseFloat(weight) || null,
        bmi:                       isNaN(bmiRaw) ? null : parseFloat(bmiRaw.toFixed(1)),
        avg_daily_steps:           parseInt(dailySteps) || null,
        weekly_active_minutes:     parseInt(weeklyActiveMinutes) || null,
        workout_days_per_week:     parseInt(workoutDays) || null,
        preferred_workout:         preferredWorkout || null,
        avg_workout_duration_mins: parseInt(workoutDuration) || null,
        sleep_hours_avg:           sleepDuration > 0 ? sleepDuration : null,
        sleep_quality:             sleepQuality || null,
        wake_up_time:              wakeUpTime || null,
        sleep_time:                sleepTime || null,
        sedentary_hours_per_day:   parseFloat(sedentaryHours) || null,
        water_intake_liters:       parseFloat(waterIntake) || null,
        diet_type:                 dietType || null,
        daily_calorie_burn:        calorieBurn > 0 ? calorieBurn : null,
        stress_level:              stressLevel[0],
        screen_time_hours:         parseFloat(screenTime) || null,
        resting_heart_rate:        parseInt(restingHR) || null,
        energy_level_score:        energyLevel[0],
        productivity_score:        productivityScore[0],
        weekend_activity_score:    weekendActivity[0],
        mental_wellness_score:     mentalWellness[0],
        meditation_minutes_per_day:parseInt(meditationMinutes) || 0,
        smoking_status:            smokingStatus || null,
        alcohol_consumption_per_week: parseInt(alcoholConsumption) || 0,
        smartwatch_user:           smartwatchUser,
        health_goal:               healthGoal || null,
        activity_pattern:          activityPattern || null,
      };

      const { data: masterData, error: masterError } = await supabase
        .from("master_fitness")
        .insert(masterPayload)
        .select("user_id")
        .single();

      if (masterError) throw new Error(`master_fitness save failed: ${masterError.message}`);

      const newUserId = masterData.user_id;

      // 2. Save AI suggestions to ai_table
      const randomLimit = Math.floor(Math.random() * 4) + 4; // 4–7

      const { data: aiPool, error: aiFetchError } = await supabase
        .from("ai_table")
        .select("*")
        .limit(50);

      if (aiFetchError) {
        console.error(aiFetchError);
      } else if (aiPool && aiPool.length > 0) {
        const shuffled    = aiPool.sort(() => 0.5 - Math.random());
        const selectedRows = shuffled.slice(0, randomLimit);

        const aiRows = selectedRows.map((item) => ({
          user_id:             newUserId,
          brand:               item.brand,
          product_name:        item.product_name,
          category:            item.category,
          description:         item.description,
          match_score:         Math.floor(Math.random() * 15) + 80,
          rating:              item.rating,
          reviews:             item.reviews,
          price:               item.price,
          stock_status:        item.stock_status,
          suggestion_title:    item.suggestion_title,
          goal_type:           healthGoal || item.goal_type,
          trigger_condition:   item.trigger_condition,
          suggestion_text:     item.suggestion_text,
          recommended_product: item.recommended_product,
          priority_level:      item.priority_level,
          ai_confidence_score: Math.floor(Math.random() * 15) + 80,
          fitness_focus:       item.fitness_focus,
          daily_action_tip:    item.daily_action_tip,
        }));

        const { error: aiInsertError } = await supabase.from("ai_table").insert(aiRows);
        if (aiInsertError) console.error("AI insert error:", aiInsertError);
      }

      // 3. Update context
      const userProfile: UserProfile = {
        user_id:          newUserId,
        username:         formattedUsername,
        password:         autoPassword,
        name:             fullName,
        age,
        gender,
        city,
        occupation,
        height,
        weight,
        restingHR,
        bmi:              isNaN(bmiRaw) ? "0" : bmiRaw.toFixed(1),
        bmiStatus,
        fitnessLevel,
        dailySteps,
        weeklyActiveMinutes,
        workoutDays,
        preferredWorkout,
        workoutDuration,
        activityPattern,
        wakeUpTime,
        sleepTime,
        sleepQuality,
        waterIntake,
        dietType,
        sedentaryHours,
        screenTime,
        smokingStatus,
        alcoholConsumption,
        stressLevel:      stressLevel[0],
        energyLevel:      energyLevel[0],
        meditationMinutes,
        smartwatchUser,
        mentalWellness:   mentalWellness[0],
        productivityScore: productivityScore[0],
        weekendActivity:  weekendActivity[0],
        healthGoal,
        sleepDuration,
        calorieBurn,
        hydrationRec,
        healthScore,
        recoveryScore,
        lifestyleScore,
        recommendations: aiSuggestions.map((s) => ({
          name:  s.recommended_product,
          tag:   s.goal_type,
          color: "text-primary",
        })),
      };

      setProfile(userProfile);

      setSaving(false);
      setSaved(true);

      // ── Show credentials popup in-page for 15 seconds, then redirect to login ──
      setSavedCreds({ username: formattedUsername, password: autoPassword });
      setShowCredPopup(true);
      setCredCountdown(15);
      let secs = 15;
      const countdownId = setInterval(() => {
        secs -= 1;
        setCredCountdown(secs);
        if (secs <= 0) {
          clearInterval(countdownId);
          setShowCredPopup(false);
          setLocation("/");
        }
      }, 1000);

    } catch (err: any) {
      console.error("Save error:", err);
      setSaving(false);
      setErrors({ save: err.message || "Failed to save. Please try again." });
    }
  };

  // ── Validation ────────────────────────────────────────────────────────────

  const validateStep = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!fullName.trim())   e.fullName   = "Full name is required";
      if (!age.trim())        e.age        = "Age is required";
      if (!gender)            e.gender     = "Please select a gender";
      if (!healthGoal)        e.healthGoal = "Please select a health goal";
    }
    if (step === 1) {
      if (!height.trim())     e.height     = "Height is required";
      if (!weight.trim())     e.weight     = "Weight is required";
    }
    if (step === 2) {
      if (!fitnessLevel)      e.fitnessLevel = "Please select your fitness level";
      if (!workoutDays.trim())e.workoutDays  = "Workout days per week is required";
    }
    if (step === 3) {
      if (!wakeUpTime)        e.wakeUpTime = "Wake up time is required";
      if (!sleepTime)         e.sleepTime  = "Sleep time is required";
      if (!dietType)          e.dietType   = "Please select a diet type";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setErrors({});
    if (step === 4 && !aiGenerated) {
      setStep(5);
      generateAISuggestions();
      return;
    }
    if (step < STEPS.length - 1) setStep(s => s + 1);
  };

  const prevStep = () => { setErrors({}); if (step > 0) setStep(s => s - 1); };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden relative">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[130px]" />
      </div>

      {/* ── LEFT PANEL ── */}
      <div className="hidden md:flex w-[360px] xl:w-[420px] flex-col p-8 z-10 relative border-r border-white/5 glass-panel">
        <div className="flex items-center justify-between mb-10">
          <img src="/fitbeat-logo.png" alt="FitBeat" className="h-16 w-auto object-contain" />
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors group"
          >
            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Login
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white leading-tight mb-2">
            Create Your AI Fitness Profile
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Personalized recommendations powered by your lifestyle and health data.
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div className="relative w-full rounded-2xl overflow-hidden mb-2" style={{ height: "220px" }}>
            <img src="/signup-hero.png" alt="Fitness" className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          </div>
          <div className="w-full grid grid-cols-2 gap-2 mt-4">
            <FloatWidget icon={Footprints} label="Steps"      value={dailySteps    ? parseInt(dailySteps).toLocaleString() : ""} color="bg-primary/70" />
            <FloatWidget icon={Moon}       label="Sleep"      value={sleepDuration > 0 ? `${sleepDuration}h` : ""}               color="bg-secondary/70" />
            <FloatWidget icon={Flame}      label="Cal Burn"   value={calorieBurn   > 0 ? `${calorieBurn} kcal` : ""}             color="bg-orange-500/70" />
            <FloatWidget icon={Droplets}   label="Hydration"  value={hydrationRec  > 0 ? `${hydrationRec}L` : ""}                color="bg-cyan-500/70" />
            <FloatWidget icon={Heart}      label="Resting HR" value={restingHR     ? `${restingHR} bpm` : ""}                    color="bg-rose-500/70" />
          </div>
        </div>

        {fullName && (
          <div className="mt-4 p-4 glass-panel rounded-xl border border-primary/20 space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Profile</p>
            <p className="text-white font-semibold">{fullName}</p>
            {age && <p className="text-sm text-muted-foreground">{age} yrs · {gender} · {city}</p>}
            {healthGoal && <p className="text-xs text-primary mt-1">🎯 {healthGoal}</p>}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Your data is 100% secure and encrypted</span>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 z-10 overflow-y-auto">
        <div className="min-h-screen flex flex-col p-6 md:p-10">
          <div className="max-w-2xl w-full mx-auto flex flex-col flex-1">

            {/* Mobile back */}
            <div className="md:hidden flex justify-end mb-6">
              <button
                onClick={() => setLocation("/")}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors group"
              >
                <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                Back to Login
              </button>
            </div>

            {/* Progress bar */}
            <div className="mb-10">
              <div className="flex justify-between mb-3">
                {STEPS.map((label, idx) => (
                  <button
                    key={idx}
                    onClick={() => idx < step && setStep(idx)}
                    className={`text-[10px] font-semibold tracking-wide transition-colors truncate max-w-[60px] text-center ${
                      idx < step   ? "text-primary cursor-pointer hover:text-white" :
                      idx === step ? "text-white" : "text-muted-foreground/50"
                    }`}
                  >
                    {idx < step ? <CheckCircle2 className="w-3 h-3 mx-auto mb-0.5 text-primary" /> : null}
                    {label}
                  </button>
                ))}
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary shadow-[0_0_8px_rgba(124,58,237,0.6)]"
                  animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-right">
                Step {step + 1} of {STEPS.length}
              </p>
            </div>

            {/* Form Card */}
            <div className="glass-panel rounded-2xl border border-white/10 flex-1 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.28 }}
                  className="p-8 md:p-10"
                >

                  {/* ── STEP 0 – Basic Info ─────────────────────────────── */}
                  {step === 0 && (
                    <div className="space-y-7">
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-1">Let's Build Your Profile</h2>
                        <p className="text-muted-foreground text-sm">Tell us about yourself to personalize your experience.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[
                          { label: "Full Name",  errKey: "fullName",  value: fullName,   setter: setFullName,   placeholder: "Your name",     type: "text" },
                          { label: "Age",        errKey: "age",       value: age,        setter: setAge,        placeholder: "e.g. 28",       type: "number" },
                          { label: "City",       errKey: "",          value: city,       setter: setCity,       placeholder: "City, Country", type: "text" },
                          { label: "Occupation", errKey: "",          value: occupation, setter: setOccupation, placeholder: "e.g. Designer", type: "text" },
                        ].map(f => (
                          <div key={f.label} className="space-y-2">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                              {f.label}{f.errKey && <span className="text-red-400 ml-0.5">*</span>}
                            </Label>
                            <Input
                              type={f.type}
                              value={f.value}
                              onChange={e => {
                                f.setter(e.target.value);
                                if (f.errKey && errors[f.errKey]) setErrors(p => ({ ...p, [f.errKey]: "" }));
                              }}
                              placeholder={f.placeholder}
                              className={`bg-white/5 h-12 text-white focus:border-primary/50 transition-all ${
                                f.errKey && errors[f.errKey] ? "border-red-500/70" : "border-white/10"
                              }`}
                            />
                            {f.errKey && errors[f.errKey] && (
                              <p className="text-xs text-red-400 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {errors[f.errKey]}
                              </p>
                            )}
                          </div>
                        ))}

                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                            Gender <span className="text-red-400">*</span>
                          </Label>
                          <Select value={gender} onValueChange={v => { setGender(v); setErrors(p => ({ ...p, gender: "" })); }}>
                            <SelectTrigger className={`bg-white/5 h-12 text-white ${errors.gender ? "border-red-500/70" : "border-white/10"}`}>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              {["Female","Male","Non-binary","Prefer not to say"].map(v => (
                                <SelectItem key={v} value={v}>{v}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.gender && (
                            <p className="text-xs text-red-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> {errors.gender}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                            Health Goal <span className="text-red-400">*</span>
                          </Label>
                          <Select value={healthGoal} onValueChange={v => { setHealthGoal(v); setErrors(p => ({ ...p, healthGoal: "" })); }}>
                            <SelectTrigger className={`bg-white/5 h-12 text-white ${errors.healthGoal ? "border-red-500/70" : "border-white/10"}`}>
                              <SelectValue placeholder="Select goal" />
                            </SelectTrigger>
                            <SelectContent>
                              {GOALS.map(g => <SelectItem key={g.label} value={g.label}>{g.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          {errors.healthGoal && (
                            <p className="text-xs text-red-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> {errors.healthGoal}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Goal tiles */}
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Or tap to select a goal</p>
                        <div className="grid grid-cols-4 gap-3">
                          {GOALS.map(g => (
                            <button
                              key={g.label}
                              onClick={() => { setHealthGoal(g.label); setErrors(p => ({ ...p, healthGoal: "" })); }}
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                healthGoal === g.label
                                  ? `${g.bg} shadow-[0_0_12px_rgba(124,58,237,0.25)]`
                                  : "glass-panel border-white/10 hover:border-white/20"
                              }`}
                            >
                              <g.icon className={`w-4 h-4 mb-1.5 ${healthGoal === g.label ? g.color : "text-muted-foreground"}`} />
                              <p className={`text-[11px] font-semibold leading-tight ${healthGoal === g.label ? "text-white" : "text-muted-foreground"}`}>{g.label}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── STEP 1 – Body Metrics ───────────────────────────── */}
                  {step === 1 && (
                    <div className="space-y-7">
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-1">Body Metrics</h2>
                        <p className="text-muted-foreground text-sm">Essential data for accurate calculations and goal tracking.</p>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-5">
                          {[
                            { label: "Height (cm)",              errKey: "height",  value: height,    setter: setHeight,    placeholder: "e.g. 170" },
                            { label: "Weight (kg)",              errKey: "weight",  value: weight,    setter: setWeight,    placeholder: "e.g. 65" },
                            { label: "Resting Heart Rate (bpm)", errKey: "",        value: restingHR, setter: setRestingHR, placeholder: "e.g. 68" },
                          ].map(f => (
                            <div key={f.label} className="space-y-2">
                              <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                                {f.label}{f.errKey && <span className="text-red-400 ml-0.5">*</span>}
                              </Label>
                              <Input
                                type="number"
                                value={f.value}
                                onChange={e => {
                                  f.setter(e.target.value);
                                  if (f.errKey && errors[f.errKey]) setErrors(p => ({ ...p, [f.errKey]: "" }));
                                }}
                                placeholder={f.placeholder}
                                className={`bg-white/5 h-12 text-white focus:border-primary/50 transition-all ${
                                  f.errKey && errors[f.errKey] ? "border-red-500/70" : "border-white/10"
                                }`}
                              />
                              {f.errKey && errors[f.errKey] && (
                                <p className="text-xs text-red-400 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> {errors[f.errKey]}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* BMI ring */}
                        <div className="glass-panel rounded-xl border border-primary/20 p-6 flex flex-col items-center justify-center text-center space-y-3">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Calculated BMI</p>
                          <div className="relative w-32 h-32">
                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
                              {!isNaN(bmiRaw) && (
                                <circle cx="50" cy="50" r="40" fill="none" stroke={bmiColor} strokeWidth="8"
                                  strokeDasharray={251.2}
                                  strokeDashoffset={251.2 - (Math.min(numBmi, 40) / 40) * 251.2}
                                  strokeLinecap="round"/>
                              )}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-3xl font-bold text-white">{bmi}</span>
                            </div>
                          </div>
                          <p className="font-semibold text-lg" style={{ color: bmiColor }}>
                            {isNaN(bmiRaw) ? "Enter height & weight" : bmiStatus}
                          </p>
                          {!isNaN(bmiRaw) && <p className="text-xs text-muted-foreground">{height} cm · {weight} kg</p>}
                          {calorieBurn > 0 && (
                            <div className="w-full pt-3 border-t border-white/5 space-y-2 text-left">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Est. Cal Burn</span>
                                <span className="text-orange-400 font-semibold">{calorieBurn} kcal/day</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Hydration Target</span>
                                <span className="text-secondary font-semibold">{hydrationRec} L/day</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── STEP 2 – Activity ───────────────────────────────── */}
                  {step === 2 && (
                    <div className="space-y-7">
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-1">Activity Snapshot</h2>
                        <p className="text-muted-foreground text-sm">How active is your current lifestyle?</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                            Fitness Level <span className="text-red-400">*</span>
                          </Label>
                          <Select value={fitnessLevel} onValueChange={v => { setFitnessLevel(v); setErrors(p => ({ ...p, fitnessLevel: "" })); }}>
                            <SelectTrigger className={`bg-white/5 h-12 text-white ${errors.fitnessLevel ? "border-red-500/70" : "border-white/10"}`}>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              {["Beginner","Intermediate","Advanced"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          {errors.fitnessLevel && (
                            <p className="text-xs text-red-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> {errors.fitnessLevel}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Activity Pattern</Label>
                          <Select value={activityPattern} onValueChange={setActivityPattern}>
                            <SelectTrigger className="bg-white/5 border-white/10 h-12 text-white">
                              <SelectValue placeholder="Select pattern" />
                            </SelectTrigger>
                            <SelectContent>
                              {["Morning Active","Consistent","Weekend Warrior","Evening Active","Sedentary"].map(v => (
                                <SelectItem key={v} value={v}>{v}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Preferred Workout</Label>
                          <Select value={preferredWorkout} onValueChange={setPreferredWorkout}>
                            <SelectTrigger className="bg-white/5 border-white/10 h-12 text-white">
                              <SelectValue placeholder="Select workout" />
                            </SelectTrigger>
                            <SelectContent>
                              {["Gym","Home Workout","Cycling","Running","Yoga","Swimming","HIIT","Mixed"].map(v => (
                                <SelectItem key={v} value={v}>{v}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {[
                          { label: "Avg Daily Steps",            errKey: "",            value: dailySteps,          setter: setDailySteps,          placeholder: "e.g. 8000" },
                          { label: "Weekly Active Minutes",      errKey: "",            value: weeklyActiveMinutes, setter: setWeeklyActiveMinutes, placeholder: "e.g. 150" },
                          { label: "Workout Days / Week",        errKey: "workoutDays", value: workoutDays,         setter: setWorkoutDays,         placeholder: "e.g. 4" },
                          { label: "Avg Workout Duration (min)", errKey: "",            value: workoutDuration,     setter: setWorkoutDuration,     placeholder: "e.g. 45" },
                        ].map(f => (
                          <div key={f.label} className="space-y-2">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                              {f.label}{f.errKey && <span className="text-red-400 ml-0.5">*</span>}
                            </Label>
                            <Input
                              type="number"
                              value={f.value}
                              onChange={e => {
                                f.setter(e.target.value);
                                if (f.errKey && errors[f.errKey]) setErrors(p => ({ ...p, [f.errKey]: "" }));
                              }}
                              placeholder={f.placeholder}
                              className={`bg-white/5 h-12 text-white focus:border-primary/50 transition-all ${
                                f.errKey && errors[f.errKey] ? "border-red-500/70" : "border-white/10"
                              }`}
                            />
                            {f.errKey && errors[f.errKey] && (
                              <p className="text-xs text-red-400 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {errors[f.errKey]}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── STEP 3 – Lifestyle ──────────────────────────────── */}
                  {step === 3 && (
                    <div className="space-y-7">
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-1">Your Lifestyle</h2>
                        <p className="text-muted-foreground text-sm">Sleep, nutrition, and daily habits shape your recovery.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Sleep */}
                        <div className="col-span-full">
                          <p className="text-xs text-primary uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                            <Moon className="w-3 h-3" /> Sleep & Recovery
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label className="text-muted-foreground text-xs">Wake Up Time <span className="text-red-400">*</span></Label>
                              <Input type="time" value={wakeUpTime} onChange={e => { setWakeUpTime(e.target.value); setErrors(p => ({ ...p, wakeUpTime: "" })); }}
                                className={`bg-white/5 h-12 text-white ${errors.wakeUpTime ? "border-red-500/70" : "border-white/10"}`}/>
                              {errors.wakeUpTime && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.wakeUpTime}</p>}
                            </div>
                            <div className="space-y-2">
                              <Label className="text-muted-foreground text-xs">Sleep Time <span className="text-red-400">*</span></Label>
                              <Input type="time" value={sleepTime} onChange={e => { setSleepTime(e.target.value); setErrors(p => ({ ...p, sleepTime: "" })); }}
                                className={`bg-white/5 h-12 text-white ${errors.sleepTime ? "border-red-500/70" : "border-white/10"}`}/>
                              {errors.sleepTime && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.sleepTime}</p>}
                            </div>
                            <div className="space-y-2">
                              <Label className="text-muted-foreground text-xs">Sleep Quality</Label>
                              <Select value={sleepQuality} onValueChange={setSleepQuality}>
                                <SelectTrigger className="bg-white/5 border-white/10 h-12 text-white">
                                  <SelectValue placeholder="Quality" />
                                </SelectTrigger>
                                <SelectContent>
                                  {["Poor","Fair","Average","Good","Excellent"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-muted-foreground text-xs">Calc. Duration</Label>
                              <div className="h-12 bg-secondary/10 border border-secondary/20 rounded-lg flex items-center justify-center">
                                <span className="text-secondary font-bold text-lg">{sleepDuration > 0 ? `${sleepDuration}h` : "–"}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Nutrition */}
                        <div className="col-span-full">
                          <p className="text-xs text-secondary uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                            <Droplets className="w-3 h-3" /> Nutrition
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-muted-foreground text-xs">Water Intake (L/day)</Label>
                              <Input type="number" step="0.1" value={waterIntake} onChange={e => setWaterIntake(e.target.value)} placeholder="e.g. 2.5" className="bg-white/5 border-white/10 h-12 text-white"/>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-muted-foreground text-xs">Diet Type <span className="text-red-400">*</span></Label>
                              <Select value={dietType} onValueChange={v => { setDietType(v); setErrors(p => ({ ...p, dietType: "" })); }}>
                                <SelectTrigger className={`bg-white/5 h-12 text-white ${errors.dietType ? "border-red-500/70" : "border-white/10"}`}>
                                  <SelectValue placeholder="Select diet" />
                                </SelectTrigger>
                                <SelectContent>
                                  {["Balanced","High Protein","Keto","Vegan","Vegetarian","Mediterranean"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              {errors.dietType && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.dietType}</p>}
                            </div>
                          </div>
                        </div>

                        {/* Daily Habits */}
                        <div className="col-span-full">
                          <p className="text-xs text-orange-400 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                            <Zap className="w-3 h-3" /> Daily Habits
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                              { label: "Sedentary Hrs/Day",    value: sedentaryHours,     setter: setSedentaryHours,     placeholder: "e.g. 6" },
                              { label: "Screen Time (hrs)",    value: screenTime,         setter: setScreenTime,         placeholder: "e.g. 4" },
                              { label: "Alcohol/Week (units)", value: alcoholConsumption, setter: setAlcoholConsumption, placeholder: "e.g. 2" },
                            ].map(f => (
                              <div key={f.label} className="space-y-2">
                                <Label className="text-muted-foreground text-xs">{f.label}</Label>
                                <Input type="number" value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.placeholder} className="bg-white/5 border-white/10 h-12 text-white"/>
                              </div>
                            ))}
                            <div className="space-y-2">
                              <Label className="text-muted-foreground text-xs">Smoking Status</Label>
                              <Select value={smokingStatus} onValueChange={setSmokingStatus}>
                                <SelectTrigger className="bg-white/5 border-white/10 h-12 text-white">
                                  <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {["Non-smoker","Occasional","Former","Daily"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── STEP 4 – Health & Wellness ──────────────────────── */}
                  {step === 4 && (
                    <div className="space-y-7">
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-1">Health & Wellness</h2>
                        <p className="text-muted-foreground text-sm">Mental and physical wellness indicators for your AI profile.</p>
                      </div>
                      <div className="space-y-6">
                        {[
                          { label: "Stress Level",           value: stressLevel,       setter: setStressLevel,       color: "text-rose-400" },
                          { label: "Energy Level",           value: energyLevel,       setter: setEnergyLevel,       color: "text-yellow-400" },
                          { label: "Mental Wellness Score",  value: mentalWellness,    setter: setMentalWellness,    color: "text-secondary" },
                          { label: "Productivity Score",     value: productivityScore, setter: setProductivityScore, color: "text-primary" },
                          { label: "Weekend Activity Score", value: weekendActivity,   setter: setWeekendActivity,   color: "text-emerald-400" },
                        ].map(s => (
                          <div key={s.label} className="space-y-3">
                            <div className="flex justify-between items-center">
                              <Label className="text-sm text-white">{s.label}</Label>
                              <span className={`text-lg font-bold ${s.color}`}>
                                {s.value[0]}<span className="text-xs text-muted-foreground font-normal">/10</span>
                              </span>
                            </div>
                            <Slider value={s.value} onValueChange={s.setter} max={10} min={1} step={1} className="w-full"/>
                          </div>
                        ))}
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Meditation (min/day)</Label>
                            <Input type="number" value={meditationMinutes} onChange={e => setMeditationMinutes(e.target.value)} placeholder="e.g. 10" className="bg-white/5 border-white/10 h-12 text-white"/>
                          </div>
                          <div className="flex items-center justify-between p-4 glass-panel rounded-xl border border-white/10">
                            <div>
                              <p className="text-sm font-semibold text-white flex items-center gap-2">
                                <Watch className="w-4 h-4 text-secondary" /> Smartwatch
                              </p>
                              <p className="text-xs text-muted-foreground">Enable device sync</p>
                            </div>
                            <Switch checked={smartwatchUser} onCheckedChange={setSmartWatchUser}/>
                          </div>
                        </div>
                        {smartwatchUser && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                            className="p-4 glass-panel rounded-xl border border-secondary/30 bg-secondary/5 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                              <Watch className="w-4 h-4 text-secondary"/>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">Smartwatch Integration Ready</p>
                              <p className="text-xs text-secondary">FitBeat Sync Pro will be added to your recommendations</p>
                            </div>
                          </motion.div>
                        )}
                        <div className="p-4 glass-panel rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-3">
                          <Sparkles className="w-5 h-5 text-primary shrink-0"/>
                          <div>
                            <p className="text-sm font-semibold text-white">AI Suggestions Ready to Generate</p>
                            <p className="text-xs text-muted-foreground">Click Continue — Claude AI will analyse your full profile and create 5 personalised suggestions.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── STEP 5 – AI Suggestions ─────────────────────────── */}
                  {step === 5 && (
                    <div className="space-y-7">
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-1">AI Suggestions</h2>
                        <p className="text-muted-foreground text-sm">
                          {goalObj
                            ? <>Personalised for your goal: <span className={`font-semibold ${goalObj.color}`}>{healthGoal}</span></>
                            : "Analysing your complete profile…"}
                        </p>
                      </div>

                      {/* Loading state */}
                      {aiLoading && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center py-16 gap-6"
                        >
                          <div className="relative w-20 h-20">
                            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
                            <div className="absolute inset-2 rounded-full border-t-2 border-secondary animate-spin" style={{ animationDuration: "1.5s", animationDirection: "reverse" }} />
                            <Sparkles className="absolute inset-0 m-auto w-7 h-7 text-primary" />
                          </div>
                          <div className="text-center space-y-1">
                            <p className="text-white font-semibold">Claude AI is analysing your profile…</p>
                            <p className="text-xs text-muted-foreground">Generating 5 personalised fitness suggestions</p>
                          </div>
                          <div className="flex gap-2">
                            {["Goal","Activity","Sleep","Stress","Diet"].map((label, i) => (
                              <motion.span
                                key={label}
                                initial={{ opacity: 0.3 }}
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
                                className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                              >
                                {label}
                              </motion.span>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Error state */}
                      {aiError && !aiLoading && (
                        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-white">Generation Failed</p>
                            <p className="text-xs text-muted-foreground mt-1">{aiError}</p>
                          </div>
                          <Button
                            onClick={generateAISuggestions}
                            size="sm"
                            className="bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 text-xs"
                          >
                            Retry
                          </Button>
                        </div>
                      )}

                      {/* Suggestions list */}
                      {!aiLoading && aiSuggestions.length > 0 && (
                        <div className="space-y-4">
                          {aiSuggestions.map((s, i) => {
                            const priorityColor = s.priority_level === "High"
                              ? "text-rose-300 bg-rose-500/20 border-rose-500/30"
                              : s.priority_level === "Medium"
                              ? "text-yellow-300 bg-yellow-500/20 border-yellow-500/30"
                              : "text-emerald-300 bg-emerald-500/20 border-emerald-500/30";
                            const focusIcon =
                              s.fitness_focus === "Cardio Health"      ? Activity  :
                              s.fitness_focus === "Strength Building"  ? Dumbbell  :
                              s.fitness_focus === "Mental Wellness"    ? Brain     :
                              s.fitness_focus === "Weight Management"  ? Flame     : Star;
                            const FocusIcon = focusIcon;

                            return (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-panel rounded-xl border border-white/10 hover:border-primary/30 transition-all p-5 space-y-3"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                                      <FocusIcon className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                      <p className="text-white font-semibold text-sm">{s.suggestion_title}</p>
                                      <p className="text-xs text-muted-foreground capitalize">{s.goal_type}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className={`text-[10px] px-2 py-1 rounded-full border font-medium ${priorityColor}`}>
                                      {s.priority_level}
                                    </span>
                                    <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                                      {s.ai_confidence_score}% match
                                    </span>
                                  </div>
                                </div>

                                <p className="text-sm text-muted-foreground leading-relaxed">{s.suggestion_text}</p>

                                <div className="grid grid-cols-2 gap-2 pt-1">
                                  <div className="text-[11px] text-white/60 bg-white/5 rounded-lg px-3 py-2">
                                    <span className="text-white/40 block mb-0.5">Trigger</span>
                                    <span className="capitalize text-white/80">{s.trigger_condition}</span>
                                  </div>
                                  <div className="text-[11px] text-white/60 bg-white/5 rounded-lg px-3 py-2">
                                    <span className="text-white/40 block mb-0.5">Focus</span>
                                    <span className="text-white/80">{s.fitness_focus}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                  <Package className="w-3 h-3 text-cyan-400 shrink-0" />
                                  <span className="text-[11px] text-cyan-300">
                                    Recommended: <span className="font-medium">{s.recommended_product}</span>
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-3 h-3 text-yellow-400 shrink-0" />
                                  <span className="text-[11px] text-yellow-300/80">
                                    Daily tip: {s.daily_action_tip}
                                  </span>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}

                      {/* Regenerate */}
                      {!aiLoading && aiGenerated && (
                        <button
                          onClick={generateAISuggestions}
                          className="flex items-center gap-2 text-xs text-primary hover:text-white transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Regenerate suggestions
                        </button>
                      )}
                    </div>
                  )}

                  {/* ── STEP 6 – Review & Save ──────────────────────────── */}
                  {step === 6 && !saved && (
                    <div className="space-y-7">
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-1">Review & Save</h2>
                        <p className="text-muted-foreground text-sm">Your AI fitness profile is ready. Activate your journey.</p>
                      </div>

                      {/* Score rings */}
                      <div className="flex justify-around py-4 glass-panel rounded-xl border border-white/10">
                        <ScoreRing value={healthScore}    label="Health Score"    color="#7C3AED"/>
                        <ScoreRing value={recoveryScore}  label="Recovery Score"  color="#06B6D4"/>
                        <ScoreRing value={lifestyleScore} label="Lifestyle Score" color="#10b981"/>
                      </div>

                      {/* Summary grid */}
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Name",             value: fullName || "–" },
                          { label: "Goal",             value: healthGoal || "–" },
                          { label: "BMI",              value: isNaN(bmiRaw) ? "–" : `${bmi} (${bmiStatus})` },
                          { label: "Est. Cal Burn",    value: calorieBurn > 0 ? `${calorieBurn} kcal/day` : "–" },
                          { label: "Sleep Duration",   value: sleepDuration > 0 ? `${sleepDuration}h/night` : "–" },
                          { label: "Hydration Target", value: hydrationRec > 0 ? `${hydrationRec}L/day` : "–" },
                          { label: "Fitness Level",    value: fitnessLevel || "–" },
                          { label: "Workout Days",     value: workoutDays ? `${workoutDays}x/week` : "–" },
                        ].map(item => (
                          <div key={item.label} className="glass-panel p-3 rounded-lg border border-white/5">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                            <p className="text-sm font-semibold text-white mt-0.5">{item.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* AI suggestions summary */}
                      {aiSuggestions.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-primary" /> AI-Generated Suggestion Stack
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {aiSuggestions.map(s => (
                              <span key={s.suggestion_title} className="px-3 py-1.5 rounded-full text-xs font-medium border border-primary/40 text-primary glass-panel">
                                {s.recommended_product}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Fitness path */}
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                          <Trophy className="w-3 h-3 text-yellow-400" /> Recommended Fitness Path
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {(
                            healthGoal === "Muscle Gain"     ? ["Upper Body Power", "Progressive Overload", "Rest & Recover"] :
                            healthGoal === "Weight Loss" || healthGoal === "Fat Loss" ? ["HIIT Cardio Blast", "Resistance Circuit", "Active Recovery"] :
                            healthGoal === "Better Sleep"    ? ["Evening Yoga Flow", "Breathwork", "Light Walk"] :
                            healthGoal === "Stress Reduction"? ["Meditation Flow", "Light Yoga", "Nature Walk"] :
                            ["Full Body Strength", "Cardio Intervals", "Flexibility Flow"]
                          ).map(w => (
                            <div key={w} className="glass-panel p-3 rounded-lg border border-white/10 text-center">
                              <Dumbbell className="w-4 h-4 text-primary mx-auto mb-1"/>
                              <p className="text-xs text-white font-medium leading-tight">{w}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Save error */}
                      {errors.save && (
                        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-red-400 shrink-0"/>
                          <p className="text-sm text-red-300">{errors.save}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Saved state ─────────────────────────────────────── */}
                  {step === 6 && saved && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-16 text-center space-y-4"
                    >
                      <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400"/>
                      </div>
                      <h3 className="text-2xl font-bold text-white">Profile Saved!</h3>
                      <p className="text-muted-foreground text-sm max-w-xs">
                        Welcome to FitBeat{fullName ? `, ${fullName}` : ""}! Your login credentials are ready.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-emerald-400">
                        <CheckCircle2 className="w-3 h-3"/>
                        Saved to master_fitness & ai_table
                      </div>
                      {/* ── CHANGED: updated copy to say "login" not "dashboard" ── */}
                      <p className="text-xs text-primary animate-pulse">Taking you to login…</p>
                    </motion.div>
                  )}

                </motion.div>
              </AnimatePresence>

              {/* Navigation buttons */}
              {!saved && (
                <div className="flex items-center justify-between px-8 md:px-10 pb-8 pt-0">
                  <Button variant="ghost" onClick={prevStep} disabled={step === 0}
                    className="text-muted-foreground hover:text-white gap-2 disabled:opacity-30">
                    <ChevronLeft className="w-4 h-4"/> Back
                  </Button>

                  {step < STEPS.length - 1 ? (
                    <Button
                      onClick={nextStep}
                      disabled={step === 5 && aiLoading}
                      className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 border-0 text-white gap-2 shadow-[0_0_20px_rgba(124,58,237,0.35)] px-6 disabled:opacity-50"
                    >
                      {step === 5 && aiLoading
                        ? <><Loader2 className="w-4 h-4 animate-spin"/> Generating…</>
                        : <>Continue <ChevronRight className="w-4 h-4"/></>
                      }
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-gradient-to-r from-emerald-600 to-secondary hover:opacity-90 border-0 text-white gap-2 shadow-[0_0_20px_rgba(16,185,129,0.35)] px-6 disabled:opacity-50"
                    >
                      {saving
                        ? <><Loader2 className="w-4 h-4 animate-spin"/> Saving to Database…</>
                        : <><Sparkles className="w-4 h-4"/> Activate Profile</>
                      }
                    </Button>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── Credentials Popup ── */}
      {showCredPopup && savedCreds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative w-[360px] mx-4 glass-panel rounded-2xl border border-primary/30 p-8 text-center shadow-[0_0_60px_rgba(124,58,237,0.25)]"
          >
            {/* Close button */}
            <button
              onClick={() => { setShowCredPopup(false); setLocation("/"); }}
              className="absolute top-3 right-4 text-muted-foreground hover:text-white transition-colors text-lg leading-none"
            >
              ✕
            </button>

            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            <h3 className="text-xl font-bold text-white mb-1">Profile Created!</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Save these credentials — you'll need them to log in.
            </p>

            {/* Credentials */}
            <div className="space-y-3 text-left mb-6">
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Username</p>
                <p className="text-white font-bold text-xl tracking-wide">{savedCreds.username}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Password</p>
                <p className="text-white font-bold text-xl tracking-wide">{savedCreds.password}</p>
              </div>
            </div>

            {/* Countdown bar */}
            <div className="space-y-2">
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 15, ease: "linear" }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Redirecting to login in{" "}
                <span className="text-primary font-semibold">{credCountdown}s</span>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
