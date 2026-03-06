import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Zap, Lightbulb, DollarSign, BarChart2, Clock } from "lucide-react";
import type { Trend } from "@shared/schema";

const SUGGESTIONS = ["Remote Work", "AI Agents", "Sustainable Fashion", "Creator Economy", "Pet Tech"];

function DifficultyBar({ score }: { score: number }) {
  const color = score <= 3 ? "bg-emerald-500" : score <= 6 ? "bg-amber-500" : "bg-red-500";
  const label = score <= 3 ? "Easy" : score <= 6 ? "Moderate" : "Hard";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score * 10}%` }} />
      </div>
      <span className="text-xs font-medium text-muted-foreground w-16">{score}/10 · {label}</span>
    </div>
  );
}

function TrendCard({ trend, index }: { trend: Trend; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="bg-card border border-border rounded-2xl p-6 space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">{trend.topic}</p>
          <h2 className="text-xl font-bold text-foreground leading-tight">{trend.trendName}</h2>
        </div>
        <div className="shrink-0 w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{trend.explanation}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-secondary p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Lightbulb className="w-3.5 h-3.5 text-primary" />
            Business Idea
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{trend.businessIdea}</p>
        </div>
        <div className="rounded-xl bg-secondary p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <DollarSign className="w-3.5 h-3.5 text-primary" />
            Monetization
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{trend.monetization}</p>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <BarChart2 className="w-3.5 h-3.5 text-primary" />
          Difficulty
        </div>
        <DifficultyBar score={trend.difficultyScore} />
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
        <Clock className="w-3 h-3" />
        {new Date(trend.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
      </div>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-muted rounded w-20" />
          <div className="h-6 bg-muted rounded w-3/4" />
        </div>
        <div className="w-10 h-10 bg-muted rounded-xl" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-5/6" />
        <div className="h-3 bg-muted rounded w-4/6" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-20 bg-muted rounded-xl" />
        <div className="h-20 bg-muted rounded-xl" />
      </div>
      <div className="h-4 bg-muted rounded w-full" />
    </div>
  );
}

export default function Home() {
  const [topic, setTopic] = useState("");
  const [latestTrends, setLatestTrends] = useState<any[]>([]);
const [submitError, setSubmitError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: trends = [] } = useQuery<Trend[]>({
    queryKey: ["/api/trends"],
  });

  const generateMutation = useMutation<Trend, Error, { topic: string }>({
  mutationFn: async (payload) => {
    
    const res = await fetch("/api/trends/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ topic: payload.topic }),
});

    const contentType = res.headers.get("content-type");

if (!contentType || !contentType.includes("application/json")) {
  throw new Error("Le serveur ne renvoie pas du JSON");
}

const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "Failed to generate trend");
    }

    return data;
  },
    
  onSuccess: (data) => {
  const items = Array.isArray((data as any)?.items) ? (data as any).items : [];

if (!items.length) {
  setSubmitError("Aucun résultat retourné");
  setLatestTrends([]);
  return;
}

setSubmitError(null);
setLatestTrends(items);

  queryClient.invalidateQueries({ queryKey: ["/api/trends"] });
  setTopic("");
},
    
  onError: (err: any) => {
    setSubmitError(err.message || "Erreur inconnue");
  },
});

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  const clean = topic.trim();
  if (!clean || generateMutation.isPending) return;
  generateMutation.mutate({ topic: clean });
};
  const handleSuggestion = (s: string) => {
    if (generateMutation.isPending) return;
    setTopic(s);
    generateMutation.mutate({ topic: s });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-14 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3 mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-accent text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
            <Zap className="w-3.5 h-3.5" />
            AI-Powered Market Intelligence
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
            TrendRadar <span className="text-gradient">AI</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto">
            Enter any topic and uncover emerging business opportunities before the market does.
          </p>
        </motion.div>

        <motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.1 }}
  className="space-y-4"
>
  <form onSubmit={handleSubmit}>
    <div className="flex items-center gap-2 bg-card border border-border rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/30 transition-all">
      <div className="flex items-center gap-2 flex-1 px-2">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          data-testid="input-topic"
          className="w-full bg-transparent py-2 text-foreground placeholder:text-muted-foreground outline-none text-sm"
          placeholder="e.g. Pet Care, Fintech, Local Tourism..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>

      <button
        data-testid="button-find-opportunities"
        type="submit"
        disabled={generateMutation.isPending || !topic.trim()}
        className="shrink-0 bg-primary text-primary-foreground rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50 transition-opacity"
      >
        {generateMutation.isPending ? "Analyzing..." : "Find opportunities"}
      </button>
    </div>
  </form>
</motion.div>

          {submitError && (
  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
    {submitError}
  </div>
)}

{generateMutation.isPending && (
  <div className="mt-6 text-center text-sm text-muted-foreground">
    Analyzing...
  </div>
)}

{latestTrends.length > 0 && (
  <div className="mt-6 space-y-4">
    {latestTrends.map((it, idx) => (
      <div key={idx} className="rounded-2xl border p-4 shadow-sm">
        <div className="text-lg font-semibold">
          {it.trendName}
        </div>

        <div className="mt-1 text-sm text-muted-foreground">
          {it.explanation}
        </div>

        <div className="mt-3 space-y-1 text-sm">
          <div><b>Business idea:</b> {it.businessIdea}</div>
          <div><b>Monetization:</b> {it.monetization}</div>
          <div><b>Difficulty:</b> {it.difficultyScore} / 10</div>
          <div><b>Startup potential:</b> {it.startupPotential} / 100</div>

          <button
  onClick={() =>
    navigator.clipboard.writeText(
      it.trendName +
        "\n\n" +
        it.explanation +
        "\n\nBusiness idea: " +
        it.businessIdea +
        "\nMonetization: " +
        it.monetization
    )
  }
  className="mt-3 text-xs border rounded-lg px-3 py-1 hover:bg-gray-100"
>
  Copy idea
</button>
        </div>
      </div>
    ))}

<div className="flex flex-wrap gap-2 justify-center">
  {SUGGESTIONS.map((s) => (
    <button
      data-testid={`button-suggestion-${s.toLowerCase().replace(/\s+/g, "-")}`}
      key={s}
      type="button"
      onClick={() => handleSuggestion(s)}
      disabled={generateMutation.isPending}
      className="text-xs border border-border rounded-full px-3 py-1.5 text-muted-foreground bg-card transition-colors disabled:opacity-40"
    >
      {s}
    </button>
  ))}
</div>
        {generateMutation.isError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl px-4 py-3"
          >
            {generateMutation.error.message}
          </motion.div>
        )}

        <div className="mt-10 space-y-4">
  <AnimatePresence>
    {generateMutation.isPending && (
      <motion.div
        key="loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <LoadingSkeleton />
      </motion.div>
    )}
  </AnimatePresence>

  {trends.length > 0 && (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Recent Opportunities
      </h3>

      {trends.map((trend, i) => (
        <TrendCard key={trend.id} trend={trend} index={i} />
      ))}
    </div>
  )}

  {trends.length === 0 &&
    !generateMutation.isPending &&
    latestTrends.length === 0 && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16 text-muted-foreground"
      >
        <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">
          Enter a topic above to discover your first opportunity.
        </p>
      </motion.div>
    )}
</div>
</div>
</div>
);
        }
