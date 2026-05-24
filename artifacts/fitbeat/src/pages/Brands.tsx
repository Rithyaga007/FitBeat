import { useState } from "react";
import { Layout } from "@/components/layout/Sidebar";
import { motion } from "framer-motion";
import { Search, Star, Package, ExternalLink, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";

const CATEGORY_TABS = ["All", "Supplements", "Sportswear", "Wearables", "Equipment", "Footwear", "Nutrition"];

const BRANDS = [
  { id: 1,  name: "Nike",              featuredProduct: "Nike Air Max 270",              category: "Sportswear",  products: 12, rating: 4.7, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop&auto=format", tag: "Most Popular",      tagColor: "bg-primary/20 text-primary border-primary/30" },
  { id: 2,  name: "Adidas",            featuredProduct: "Adidas Ultraboost 22",          category: "Sportswear",  products: 10, rating: 4.5, img: "https://images.unsplash.com/photo-1556906781-9a412961a28c?w=600&h=400&fit=crop&auto=format", tag: "Top Rated",         tagColor: "bg-secondary/20 text-secondary border-secondary/30" },
  { id: 3,  name: "Puma",              featuredProduct: "Puma RS-X Training Shoes",      category: "Sportswear",  products: 9,  rating: 4.4, img: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=400&fit=crop&auto=format", tag: "Trending",          tagColor: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { id: 4,  name: "Under Armour",      featuredProduct: "UA HOVR Phantom 3",             category: "Sportswear",  products: 8,  rating: 4.6, img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&auto=format", tag: "Premium",           tagColor: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { id: 5,  name: "Reebok",            featuredProduct: "Reebok Nano X3 Cross Trainer",  category: "Sportswear",  products: 7,  rating: 4.3, img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=400&fit=crop&auto=format", tag: "Classic",           tagColor: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { id: 6,  name: "Lululemon",         featuredProduct: "Lululemon Align Leggings 28\"", category: "Sportswear",  products: 6,  rating: 4.8, img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop&auto=format", tag: "Luxury",            tagColor: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
  { id: 7,  name: "Optimum Nutrition", featuredProduct: "ON Gold Standard Whey 5lb",    category: "Supplements", products: 11, rating: 4.9, img: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&h=400&fit=crop&auto=format", tag: "Best Seller",       tagColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { id: 8,  name: "MuscleBlaze",       featuredProduct: "MuscleBlaze Biozyme Whey",      category: "Supplements", products: 9,  rating: 4.7, img: "https://images.unsplash.com/photo-1584466977773-e625c37cdd50?w=600&h=400&fit=crop&auto=format", tag: "Top Rated",         tagColor: "bg-secondary/20 text-secondary border-secondary/30" },
  { id: 9,  name: "MyProtein",         featuredProduct: "MyProtein Impact Whey Isolate", category: "Supplements", products: 8,  rating: 4.6, img: "https://images.unsplash.com/photo-1567529692333-de9fd6772897?w=600&h=400&fit=crop&auto=format", tag: "Popular",           tagColor: "bg-primary/20 text-primary border-primary/30" },
  { id: 10, name: "Dymatize",          featuredProduct: "Dymatize ISO100 Hydrolyzed",    category: "Supplements", products: 7,  rating: 4.5, img: "https://images.unsplash.com/photo-1544991936-9464fa57a25e?w=600&h=400&fit=crop&auto=format", tag: "Trusted",           tagColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { id: 11, name: "BSN",               featuredProduct: "BSN Syntha-6 Protein Powder",   category: "Supplements", products: 6,  rating: 4.4, img: "https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=600&h=400&fit=crop&auto=format", tag: "Pro Choice",        tagColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  { id: 12, name: "PowerMax",          featuredProduct: "PowerMax Whey Protein 2kg",     category: "Supplements", products: 5,  rating: 4.3, img: "https://images.unsplash.com/photo-1616279969856-759f316a5ac1?w=600&h=400&fit=crop&auto=format", tag: "Value Pick",        tagColor: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { id: 13, name: "Pintola",           featuredProduct: "Pintola High Protein Peanut Butter", category: "Nutrition", products: 6, rating: 4.5, img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop&auto=format", tag: "Healthy",        tagColor: "bg-lime-500/20 text-lime-400 border-lime-500/30" },
  { id: 14, name: "GNC",               featuredProduct: "GNC AMP Pure Isolate",          category: "Nutrition",   products: 8,  rating: 4.4, img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop&auto=format", tag: "Legacy Brand",      tagColor: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { id: 15, name: "Fitbit",            featuredProduct: "Fitbit Charge 6 Fitness Tracker", category: "Wearables", products: 8, rating: 4.6, img: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&h=400&fit=crop&auto=format", tag: "Smart Tech",       tagColor: "bg-secondary/20 text-secondary border-secondary/30" },
  { id: 16, name: "Garmin",            featuredProduct: "Garmin Forerunner 265",          category: "Wearables",   products: 7,  rating: 4.8, img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop&auto=format", tag: "Premium GPS",       tagColor: "bg-primary/20 text-primary border-primary/30" },
  { id: 17, name: "Amazfit",           featuredProduct: "Amazfit GTR 4 Smart Watch",     category: "Wearables",   products: 9,  rating: 4.7, img: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&h=400&fit=crop&auto=format", tag: "Top Rated",         tagColor: "bg-secondary/20 text-secondary border-secondary/30" },
  { id: 18, name: "Samsung",           featuredProduct: "Samsung Galaxy Watch 6",        category: "Wearables",   products: 6,  rating: 4.5, img: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=400&fit=crop&auto=format", tag: "Tech Giant",        tagColor: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { id: 19, name: "Xiaomi",            featuredProduct: "Xiaomi Smart Band 8 Pro",       category: "Wearables",   products: 5,  rating: 4.4, img: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&h=400&fit=crop&auto=format", tag: "Value Tech",        tagColor: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { id: 20, name: "Whoop",             featuredProduct: "Whoop 4.0 Recovery Tracker",    category: "Wearables",   products: 4,  rating: 4.3, img: "https://images.unsplash.com/photo-1588361861040-ac9b1018f6d5?w=600&h=400&fit=crop&auto=format", tag: "Athlete Pick",      tagColor: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
  { id: 21, name: "Decathlon",         featuredProduct: "Decathlon Corength Dumbbell Set", category: "Equipment", products: 10, rating: 4.6, img: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&h=400&fit=crop&auto=format", tag: "Best Value",       tagColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { id: 22, name: "Boldfit",           featuredProduct: "Boldfit Pro Resistance Bands",  category: "Equipment",   products: 8,  rating: 4.7, img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop&auto=format", tag: "Rising Star",       tagColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { id: 23, name: "Cultsport",         featuredProduct: "Cultsport Adjustable Kettlebell", category: "Equipment", products: 7,  rating: 4.5, img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop&auto=format", tag: "Popular",          tagColor: "bg-primary/20 text-primary border-primary/30" },
  { id: 24, name: "ASICS",             featuredProduct: "ASICS Gel-Kayano 30",           category: "Footwear",    products: 9,  rating: 4.6, img: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&h=400&fit=crop&auto=format", tag: "Runner's Choice",   tagColor: "bg-secondary/20 text-secondary border-secondary/30" },
  { id: 25, name: "New Balance",       featuredProduct: "New Balance Fresh Foam 1080v13", category: "Footwear",   products: 7,  rating: 4.5, img: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&h=400&fit=crop&auto=format", tag: "Classic",          tagColor: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { id: 26, name: "Brooks",            featuredProduct: "Brooks Ghost 15 Running Shoe",  category: "Footwear",    products: 6,  rating: 4.7, img: "https://images.unsplash.com/photo-1526401485004-46910ecc8e51?w=600&h=400&fit=crop&auto=format", tag: "Pro Running",       tagColor: "bg-primary/20 text-primary border-primary/30" },
  { id: 27, name: "Saucony",           featuredProduct: "Saucony Endorphin Speed 3",     category: "Footwear",    products: 5,  rating: 4.4, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop&auto=format&crop=right", tag: "Trusted", tagColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { id: 28, name: "ON Running",        featuredProduct: "On Cloudmonster 2 Shoe",        category: "Footwear",    products: 5,  rating: 4.8, img: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600&h=400&fit=crop&auto=format", tag: "Swiss Precision",   tagColor: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { id: 29, name: "Patagonia",         featuredProduct: "Patagonia Airshed Pro Pullover", category: "Sportswear", products: 5,  rating: 4.7, img: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&fit=crop&auto=format", tag: "Eco Friendly",     tagColor: "bg-lime-500/20 text-lime-400 border-lime-500/30" },
  { id: 30, name: "The North Face",    featuredProduct: "TNF Fleece 100 Glacier Jacket", category: "Sportswear",  products: 6,  rating: 4.6, img: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=600&h=400&fit=crop&auto=format", tag: "Outdoor Pro",      tagColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  { id: 31, name: "2XU",               featuredProduct: "2XU MCS Run Compression Tights", category: "Sportswear", products: 4, rating: 4.5, img: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=600&h=400&fit=crop&auto=format", tag: "Compression",     tagColor: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { id: 32, name: "Columbia",          featuredProduct: "Columbia Titan Pass Fleece Jacket", category: "Sportswear", products: 5, rating: 4.4, img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&auto=format", tag: "Outdoor",        tagColor: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Sportswear:  "text-primary bg-primary/10 border-primary/20",
  Supplements: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  Wearables:   "text-secondary bg-secondary/10 border-secondary/20",
  Equipment:   "text-orange-400 bg-orange-500/10 border-orange-500/20",
  Footwear:    "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Nutrition:   "text-lime-400 bg-lime-500/10 border-lime-500/20",
};

export default function Brands() {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = BRANDS.filter(b => {
    const matchTab = activeTab === "All" || b.category === activeTab;
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
                        b.category.toLowerCase().includes(search.toLowerCase()) ||
                        b.country.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <Layout>
      <div className="space-y-8 pb-10">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">Brands</h1>
          <p className="text-muted-foreground text-lg">Explore top fitness brands trusted by athletes worldwide.</p>
        </div>

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl h-48"
        >
          <img
            src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1400&h=400&fit=crop&auto=format"
            alt="Brands"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050816]/90 via-[#050816]/50 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-8">
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-2">Partner Brands</p>
            <h2 className="text-3xl font-bold text-white mb-1">{BRANDS.length}+ Premium Brands</h2>
            <p className="text-muted-foreground text-sm">Curated fitness brands — from protein to performance gear</p>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 flex gap-3">
            {[
              { val: "32+", label: "Brands" },
              { val: "200+", label: "Products" },
              { val: "6", label: "Categories" },
            ].map(s => (
              <div key={s.label} className="text-center glass-panel px-4 py-3 rounded-xl border border-white/10">
                <div className="text-xl font-bold text-white">{s.val}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Search + Tabs */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {CATEGORY_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  activeTab === tab
                    ? "bg-primary text-white border-primary shadow-[0_0_12px_rgba(124,58,237,0.4)]"
                    : "glass-panel border-white/10 text-muted-foreground hover:text-white hover:border-white/20"
                }`}
              >
                {tab}
                {tab !== "All" && (
                  <span className="ml-1.5 text-xs opacity-60">
                    {BRANDS.filter(b => b.category === tab).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search brands..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-sm h-10 rounded-full text-white focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Brand count */}
        <p className="text-xs text-muted-foreground">
          Showing <span className="text-white font-semibold">{filtered.length}</span> brands
        </p>

        {/* Brand Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((brand, i) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group relative rounded-2xl overflow-hidden border border-white/10 glass-panel hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(124,58,237,0.15)] cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={brand.img}
                  alt={brand.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050816]/95 via-[#050816]/30 to-transparent" />

                {/* Tag badge */}
                <div className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded-full border backdrop-blur-sm ${brand.tagColor}`}>
                  {brand.tag}
                </div>

                {/* Category badge */}
                <div className={`absolute top-3 right-3 text-[10px] font-medium px-2 py-1 rounded-full border backdrop-blur-sm ${CATEGORY_COLORS[brand.category]}`}>
                  {brand.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-base leading-tight group-hover:text-primary transition-colors">{brand.name}</h3>
                    <p className="text-muted-foreground text-xs mt-0.5 truncate" title={brand.featuredProduct}>{brand.featuredProduct}</p>
                  </div>
                  <button className="w-7 h-7 rounded-full bg-white/5 hover:bg-primary/20 flex items-center justify-center transition-colors mt-0.5">
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-white text-sm font-semibold">{brand.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Package className="w-3.5 h-3.5" />
                    {brand.products} products
                  </div>
                  <button className="flex items-center gap-1 text-xs text-primary font-medium hover:text-white transition-colors">
                    View <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium text-white">No brands found</p>
            <p className="text-sm mt-1">Try a different category or search term</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
