import { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { Layout } from "@/components/layout/Sidebar";
import { motion } from "framer-motion";
import {
  Sparkles,
  Heart,
  ChevronRight,
  Shield,
  Star,
  MessageCircle,
  Target,
  Activity,
  Dumbbell,
  Salad,
  MoonStar,
  SlidersHorizontal,
  Flame,
  TrendingUp,
  Zap,
  Award,
  BarChart3,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  Brain,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ─── Static config ────────────────────────────────────────────────────────────

const whyReasons = [
  {
    icon: Sparkles,
    label: "AI analyzes 50+ factors",
    desc: "Workout, goals, diet, recovery & more",
    color: "text-primary",
  },
  {
    icon: Shield,
    label: "Expert-approved picks",
    desc: "Curated by fitness professionals",
    color: "text-cyan-400",
  },
  {
    icon: Star,
    label: "Top rated & trusted brands",
    desc: "Quality, results & customer reviews",
    color: "text-yellow-400",
  },
  {
    icon: Target,
    label: "Personalized for you",
    desc: "Products tailored to your needs",
    color: "text-emerald-400",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  "protein supplement": "bg-violet-500/20 text-violet-300",
  "running gear": "bg-cyan-500/20 text-cyan-300",
  "gym accessories": "bg-orange-500/20 text-orange-300",
  "cardio equipment": "bg-red-500/20 text-red-300",
  activewear: "bg-pink-500/20 text-pink-300",
  "healthy food": "bg-emerald-500/20 text-emerald-300",
  "yoga equipment": "bg-purple-500/20 text-purple-300",
  "fitness wearable": "bg-sky-500/20 text-sky-300",
  "health monitoring": "bg-blue-500/20 text-blue-300",
  supplement: "bg-yellow-500/20 text-yellow-300",
  footwear: "bg-indigo-500/20 text-indigo-300",
  "fitness equipment": "bg-rose-500/20 text-rose-300",
  sportswear: "bg-fuchsia-500/20 text-fuchsia-300",
  "recovery & sleep": "bg-teal-500/20 text-teal-300",
  "gym equipment": "bg-amber-500/20 text-amber-300",
  "home workout": "bg-lime-500/20 text-lime-300",
};

function getCategoryColor(category?: string): string {
  if (!category) return "bg-white/10 text-white/60";
  return CATEGORY_COLORS[category.toLowerCase()] ?? "bg-white/10 text-white/60";
}

const PRIORITY_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: typeof Zap }
> = {
  High: {
    label: "High Priority",
    color: "text-rose-300",
    bg: "bg-rose-500/20 border-rose-500/30",
    icon: Flame,
  },
  Medium: {
    label: "Medium Priority",
    color: "text-yellow-300",
    bg: "bg-yellow-500/20 border-yellow-500/30",
    icon: TrendingUp,
  },
  Low: {
    label: "Low Priority",
    color: "text-emerald-300",
    bg: "bg-emerald-500/20 border-emerald-500/30",
    icon: CheckCircle2,
  },
};

const STOCK_CONFIG: Record<
  string,
  { color: string; bg: string; dot: string }
> = {
  "In Stock": {
    color: "text-emerald-300",
    bg: "bg-emerald-500/20 border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  "Out of Stock": {
    color: "text-red-300",
    bg: "bg-red-500/20 border-red-500/30",
    dot: "bg-red-400",
  },
  "Almost Sold Out": {
    color: "text-orange-300",
    bg: "bg-orange-500/20 border-orange-500/30",
    dot: "bg-orange-400",
  },
  "Fast Moving": {
    color: "text-cyan-300",
    bg: "bg-cyan-500/20 border-cyan-500/30",
    dot: "bg-cyan-400",
  },
};

function getStockConfig(status?: string) {
  return (
    STOCK_CONFIG[status ?? ""] ?? {
      color: "text-emerald-300",
      bg: "bg-emerald-500/20 border-emerald-500/30",
      dot: "bg-emerald-400",
    }
  );
}

const FITNESS_FOCUS_COLORS: Record<string, string> = {
  "Cardio Health": "text-red-400",
  "Lifestyle Improvement": "text-cyan-400",
  "Mental Wellness": "text-purple-400",
  "Strength Building": "text-orange-400",
  "Weight Management": "text-yellow-400",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Recommendation() {
  const [activeTab, setActiveTab] = useState("All Products");
  const [wishlisted, setWishlisted] = useState<Set<string | number>>(new Set());
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  const PRODUCT_TABS = useMemo(
    () => [
      "All Products",
      ...Array.from(
        new Set(products.map((p) => p.category).filter(Boolean))
      ).sort(),
    ],
    [products]
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUser = localStorage.getItem("fitbeat_user");
        if (!storedUser) return;

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        const { data: productData, error } = await supabase
          .from("ai_table")
          .select("*")
          .eq("user_id", parsedUser.user_id);

        if (error) {
          console.error("Supabase Error:", error);
          return;
        }

        if (productData) setProducts(productData);
      } catch (err) {
        console.error("Load Data Error:", err);
      }
    };

    loadData();
  }, []);

  const toggleWishlist = (id: string | number) => {
    setWishlisted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Derived stats ────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = products.length;
    const avgMatch =
      total > 0
        ? Math.round(
            products.reduce((s, p) => s + Number(p.match_score || 0), 0) /
              total
          )
        : 0;
    const avgConfidence =
      total > 0
        ? Math.round(
            products.reduce(
              (s, p) => s + Number(p.ai_confidence_score || 0),
              0
            ) / total
          )
        : 0;
    const highPriority = products.filter(
      (p) => p.priority_level === "High"
    ).length;
    const inStock = products.filter(
      (p) => p.stock_status === "In Stock" || p.stock_status === "Fast Moving"
    ).length;
    const topRated = products.filter((p) => Number(p.rating) >= 4.5).length;
    const avgPrice =
      total > 0
        ? Math.round(
            products.reduce((s, p) => s + Number(p.price || 0), 0) / total
          )
        : 0;

    // Category distribution
    const catMap: Record<string, number> = {};
    products.forEach((p) => {
      if (p.category) catMap[p.category] = (catMap[p.category] || 0) + 1;
    });
    const topCategory = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];

    // Goal types
    const goalMap: Record<string, number> = {};
    products.forEach((p) => {
      if (p.goal_type) goalMap[p.goal_type] = (goalMap[p.goal_type] || 0) + 1;
    });
    const topGoal = Object.entries(goalMap).sort((a, b) => b[1] - a[1])[0];

    // Fitness focus distribution
    const focusMap: Record<string, number> = {};
    products.forEach((p) => {
      if (p.fitness_focus)
        focusMap[p.fitness_focus] = (focusMap[p.fitness_focus] || 0) + 1;
    });
    const focusBreakdown = Object.entries(focusMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    return {
      total,
      avgMatch,
      avgConfidence,
      highPriority,
      inStock,
      topRated,
      avgPrice,
      topCategory,
      topGoal,
      focusBreakdown,
    };
  }, [products]);

  const profileSnapshot = [
    {
      label: "Fitness Goal",
      value: user?.health_goal || "Not Set",
      icon: Target,
      color: "text-primary",
    },
    {
      label: "Activity Level",
      value: user?.activity_pattern || "Moderate",
      icon: Activity,
      color: "text-secondary",
    },
    {
      label: "Workout Frequency",
      value:
        user?.workout_days_per_week > 0
          ? `${user.workout_days_per_week} Days / Week`
          : "Beginner Level",
      icon: Dumbbell,
      color: "text-purple-400",
    },
    {
      label: "Diet Preference",
      value: user?.diet_type || "Balanced",
      icon: Salad,
      color: "text-emerald-400",
    },
    {
      label: "Sleep Quality",
      value:
        user?.sleep_hours_avg >= 7
          ? "Good"
          : user?.sleep_hours_avg >= 5
          ? "Moderate"
          : "Poor",
      icon: MoonStar,
      color: "text-blue-400",
    },
  ];

  const filtered =
    activeTab === "All Products"
      ? products.slice(0, 10)
      : products
          .filter(
            (p) => p.category?.toLowerCase() === activeTab.toLowerCase()
          )
          .slice(0, 10);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="space-y-8 pb-10">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
            Recommendation
          </h1>
          <p className="text-muted-foreground text-lg">
            Personalized fitness products recommended just for you.
          </p>
        </div>

        {/* ── Quick Stats Row ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          {[
            {
              icon: ShoppingBag,
              label: "Total Picks",
              value: stats.total,
              color: "text-primary",
              bg: "from-primary/20 to-primary/5",
            },
            {
              icon: Sparkles,
              label: "Avg Match",
              value: `${stats.avgMatch}%`,
              color: "text-cyan-400",
              bg: "from-cyan-500/20 to-cyan-500/5",
            },
            {
              icon: Brain,
              label: "AI Confidence",
              value: `${stats.avgConfidence}%`,
              color: "text-purple-400",
              bg: "from-purple-500/20 to-purple-500/5",
            },
            {
              icon: Flame,
              label: "High Priority",
              value: stats.highPriority,
              color: "text-rose-400",
              bg: "from-rose-500/20 to-rose-500/5",
            },
            {
              icon: CheckCircle2,
              label: "In Stock",
              value: stats.inStock,
              color: "text-emerald-400",
              bg: "from-emerald-500/20 to-emerald-500/5",
            },
            {
              icon: Trophy,
              label: "Top Rated",
              value: stats.topRated,
              color: "text-yellow-400",
              bg: "from-yellow-500/20 to-yellow-500/5",
            },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="glass-panel border-white/10 hover:border-white/20 transition-all">
                <CardContent className="p-4">
                  <div
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.bg} flex items-center justify-center mb-2`}
                  >
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {s.label}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-primary/30 h-52"
        >
          <img
            src="https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1400&h=500&fit=crop&auto=format"
            alt="AI recommendation background"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050816]/95 via-[#050816]/75 to-[#050816]/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-transparent to-secondary/10 pointer-events-none" />
          <div className="relative z-10 h-full flex flex-col justify-center px-8 max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                AI-Powered Picks
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Products Picked Just For You
            </h2>
            <p className="text-muted-foreground mb-5 text-sm">
              We analyze your goals, activities, and preferences to recommend
              the best products for you.
            </p>
            <Button className="w-fit bg-gradient-to-r from-primary to-secondary text-white border-0 shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center gap-2">
              How It Works <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* ── Insight Strip ───────────────────────────────────────────────── */}
        {stats.total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {/* Top Goal Insight */}
            <Card className="glass-panel border-white/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent pointer-events-none" />
              <CardContent className="p-5 relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Target className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Top Goal Type
                  </p>
                </div>
                <p className="text-white font-bold text-lg capitalize">
                  {stats.topGoal?.[0] ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.topGoal?.[1] ?? 0} products aligned to this goal
                </p>
                <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
                    style={{
                      width: `${
                        stats.total > 0
                          ? Math.round(
                              ((stats.topGoal?.[1] ?? 0) / stats.total) * 100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Top Category Insight */}
            <Card className="glass-panel border-white/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/8 to-transparent pointer-events-none" />
              <CardContent className="p-5 relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Top Category
                  </p>
                </div>
                <p className="text-white font-bold text-lg capitalize">
                  {stats.topCategory?.[0] ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.topCategory?.[1] ?? 0} products recommended
                </p>
                <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
                    style={{
                      width: `${
                        stats.total > 0
                          ? Math.round(
                              ((stats.topCategory?.[1] ?? 0) / stats.total) *
                                100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Avg Price Insight */}
            <Card className="glass-panel border-white/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 to-transparent pointer-events-none" />
              <CardContent className="p-5 relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Avg Product Price
                  </p>
                </div>
                <p className="text-white font-bold text-lg">
                  ₹{stats.avgPrice.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {stats.total} curated picks
                </p>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Budget-friendly range
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Products Section ──────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {PRODUCT_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-primary to-secondary text-white shadow-[0_0_12px_rgba(124,58,237,0.3)]"
                      : "glass-panel border border-white/10 text-muted-foreground hover:text-white"
                  }`}
                  data-testid={`tab-rec-${tab.toLowerCase().replace(" ", "-")}`}
                >
                  {tab}
                </button>
              ))}
              <button className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl glass-panel border border-white/10 text-muted-foreground hover:text-white text-sm transition-all">
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
            </div>

            {/* Product Cards */}
            <div className="space-y-4">
              {filtered.map((product, i) => {
                const priorityCfg =
                  PRIORITY_CONFIG[product.priority_level ?? "Low"] ??
                  PRIORITY_CONFIG["Low"];
                const PriorityIcon = priorityCfg.icon;
                const stockCfg = getStockConfig(product.stock_status);
                const focusColor =
                  FITNESS_FOCUS_COLORS[product.fitness_focus ?? ""] ??
                  "text-white/70";

                return (
                  <motion.div
                    key={product.id ?? i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card
                      className="glass-panel border-white/10 hover:border-primary/30 transition-all group"
                      data-testid={`card-product-${product.id}`}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4 w-full">
                          {/* Product Image */}
                          <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 group-hover:border-primary/40 transition-all shrink-0 bg-white/5">
                            <img
                              src="/ai-image.png"
                              alt="AI Recommended Product"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>

                          {/* Middle column */}
                          <div className="flex-1 min-w-0 w-full">
                            <div className="flex items-start justify-between gap-2 w-full">
                              <div className="min-w-0">
                                <h3 className="font-semibold text-white text-lg truncate">
                                  {product.product_name ||
                                    product.category ||
                                    "AI Fitness Product"}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Brand:{" "}
                                  <span className="text-white/80 font-medium">
                                    {product.brand || "FitBeat"}
                                  </span>
                                </p>
                              </div>

                              {/* Wishlist */}
                              <button
                                onClick={() => toggleWishlist(product.id)}
                                className="p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors shrink-0"
                                data-testid={`button-wishlist-${product.id}`}
                              >
                                <Heart
                                  className={`w-4 h-4 ${
                                    wishlisted.has(product.id)
                                      ? "fill-rose-500 text-rose-500"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              </button>
                            </div>

                            {/* Badges row */}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span
                                className={`text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${getCategoryColor(
                                  product.category
                                )}`}
                              >
                                {product.category || "General"}
                              </span>

                              {/* Priority badge */}
                              <span
                                className={`text-[10px] font-medium px-2 py-1 rounded-full border inline-flex items-center gap-1 ${priorityCfg.bg} ${priorityCfg.color}`}
                              >
                                <PriorityIcon className="w-2.5 h-2.5" />
                                {priorityCfg.label}
                              </span>

                              {/* Fitness focus */}
                              {product.fitness_focus && (
                                <span
                                  className={`text-[10px] font-medium px-2 py-1 rounded-full border border-white/10 bg-white/5 inline-flex items-center gap-1 ${focusColor}`}
                                >
                                  <Zap className="w-2.5 h-2.5" />
                                  {product.fitness_focus}
                                </span>
                              )}
                            </div>

                            {/* Price + Stock */}
                            <div className="flex items-center gap-3 mt-3 flex-wrap">
                              <p className="text-sm font-semibold text-white">
                                ₹{Number(product.price || 999).toLocaleString()}
                              </p>
                              <span
                                className={`text-[10px] px-2 py-1 rounded-full border inline-flex items-center gap-1.5 ${stockCfg.bg} ${stockCfg.color}`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${stockCfg.dot} animate-pulse`}
                                />
                                {product.stock_status || "In Stock"}
                              </span>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-muted-foreground mt-3 leading-relaxed line-clamp-2">
                              {product.description ||
                                "AI recommended fitness product"}
                            </p>

                            {/* AI Suggestion box */}
                            <div className="mt-4 w-full rounded-xl border border-primary/20 bg-primary/5 p-4">
                              <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-primary">
                                  {product.suggestion_title ||
                                    "AI Recommendation"}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                                    {product.match_score || 95}% Match
                                  </span>
                                  <span className="text-[10px] px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                                    {product.ai_confidence_score || 90}% AI
                                    Confidence
                                  </span>
                                </div>
                              </div>

                              {/* Suggestion text from actual column */}
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {product.suggestion_text ||
                                  "AI-powered fitness recommendation for your lifestyle."}
                              </p>

                              {/* Trigger condition tag */}
                              {product.trigger_condition && (
                                <div className="mt-2 flex items-center gap-1.5">
                                  <AlertTriangle className="w-3 h-3 text-yellow-400" />
                                  <span className="text-[10px] text-yellow-300 capitalize">
                                    Triggered by: {product.trigger_condition}
                                  </span>
                                </div>
                              )}

                              {/* Recommended product cross-sell */}
                              {product.recommended_product && (
                                <div className="mt-2 flex items-center gap-1.5">
                                  <Award className="w-3 h-3 text-cyan-400" />
                                  <span className="text-[10px] text-cyan-300">
                                    Pairs well with:{" "}
                                    <span className="font-medium">
                                      {product.recommended_product}
                                    </span>
                                  </span>
                                </div>
                              )}

                              {/* Daily tip */}
                              {product.daily_action_tip && (
                                <div className="mt-3 text-[11px] text-cyan-300 flex items-start gap-1.5">
                                  <Clock className="w-3 h-3 mt-0.5 shrink-0" />
                                  <span>
                                    Daily tip: {product.daily_action_tip}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          {/* END middle column */}

                          {/* Right column: Match Score + CTA */}
                          <div className="flex flex-col items-center justify-center gap-4 shrink-0 w-[140px]">
                            <div className="flex flex-col items-center">
                              <span className="text-xs text-muted-foreground mb-1">
                                Match Score
                              </span>
                              <div className="relative w-16 h-16">
                                <svg
                                  viewBox="0 0 64 64"
                                  className="w-full h-full -rotate-90"
                                >
                                  <circle
                                    cx="32"
                                    cy="32"
                                    r="26"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.05)"
                                    strokeWidth="5"
                                  />
                                  <circle
                                    cx="32"
                                    cy="32"
                                    r="26"
                                    fill="none"
                                    stroke="#7C3AED"
                                    strokeWidth="5"
                                    strokeDasharray={`${
                                      (Number(product.match_score || 95) /
                                        100) *
                                      163.4
                                    } 163.4`}
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-sm font-bold text-white">
                                    {Number(product.match_score || 95)}%
                                  </span>
                                </div>
                              </div>
                            </div>

                            <Button
                              className="bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-400 text-white border-0 text-xs px-4 py-2 h-auto rounded-xl shadow-[0_0_18px_rgba(124,58,237,0.35)] hover:scale-105 transition-all duration-300"
                              data-testid={`button-view-product-${product.id}`}
                            >
                              View Product{" "}
                              <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>

                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-xs text-white font-medium">
                                {product.rating || 4.5}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({Number(product.reviews || 0).toLocaleString()}
                                )
                              </span>
                            </div>
                          </div>
                          {/* END right column */}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
          {/* END products section */}

          {/* ── Right Panel ───────────────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Profile Snapshot */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-panel border-white/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-white text-base">
                    Your Profile Snapshot
                  </CardTitle>
                  <button className="text-xs text-primary hover:underline">
                    Edit
                  </button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profileSnapshot.map((p) => (
                    <div
                      key={p.label}
                      className="flex items-center gap-3 py-1 border-b border-white/5 last:border-0"
                    >
                      <p.icon className={`w-4 h-4 ${p.color} shrink-0`} />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">
                          {p.label}
                        </p>
                        <p className="text-sm font-medium text-white">
                          {p.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Fitness Focus Breakdown ─────────────────────────────────── */}
            {stats.focusBreakdown.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Card className="glass-panel border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-base flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      Fitness Focus Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {stats.focusBreakdown.map(([focus, count]) => {
                      const pct = Math.round((count / stats.total) * 100);
                      const col =
                        FITNESS_FOCUS_COLORS[focus] ?? "text-white/70";
                      return (
                        <div key={focus}>
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`text-xs font-medium ${col}`}
                            >
                              {focus}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {count} products · {pct}%
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ delay: 0.3, duration: 0.6 }}
                              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ── Goal Alignment Card ─────────────────────────────────────── */}
            {stats.topGoal && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
              >
                <Card className="glass-panel border-white/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
                  <CardContent className="p-5 relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                      </div>
                      <p className="font-semibold text-white text-sm">
                        Goal Alignment
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Your top goal type across all recommendations
                    </p>
                    <div className="space-y-2">
                      {Object.entries(
                        products.reduce<Record<string, number>>((acc, p) => {
                          if (p.goal_type)
                            acc[p.goal_type] = (acc[p.goal_type] || 0) + 1;
                          return acc;
                        }, {})
                      )
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 4)
                        .map(([goal, count]) => (
                          <div
                            key={goal}
                            className="flex items-center justify-between"
                          >
                            <span className="text-xs text-white/80 capitalize">
                              {goal}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1 rounded-full bg-white/5 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-400"
                                  style={{
                                    width: `${Math.round(
                                      (count / stats.total) * 100
                                    )}%`,
                                  }}
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground w-4 text-right">
                                {count}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Why These Products */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-panel border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-base">
                    Why These Products?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {whyReasons.map((r) => (
                    <div key={r.label} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        <r.icon className={`w-4 h-4 ${r.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {r.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Need Help */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-panel border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
                <CardContent className="relative z-10 p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Need Help?</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Our fitness experts are here to help you choose the
                        right products.
                      </p>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white border-0 shadow-[0_0_15px_rgba(124,58,237,0.3)] flex items-center justify-center gap-2"
                    data-testid="button-chat-expert"
                  >
                    Chat with Expert <ChevronRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
