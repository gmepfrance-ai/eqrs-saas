import { useState, useEffect } from "react";
import { GmepHeader } from "@/components/gmep-header";
import { GmepFooter } from "@/components/gmep-footer";
import { useAuth } from "@/lib/auth";
import { Globe, BarChart3, MapPin, Eye, TrendingUp, Calendar } from "lucide-react";

const API_BASE = "__PORT_5000__".startsWith("__") ? "" : "__PORT_5000__";

interface StatsData {
  total: number;
  byCountry: { country: string; count: number }[];
  byDate: { date: string; count: number }[];
  byCity: { city: string; count: number }[];
}

export default function StatsPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/stats`)
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <GmepHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
        <GmepFooter />
      </div>
    );
  }

  const maxCountry = stats?.byCountry?.[0]?.count || 1;
  const maxCity = stats?.byCity?.[0]?.count || 1;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GmepHeader />

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">
            Statistiques de consultation — EQRS Johnson &amp; Ettinger
          </h1>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Eye className="w-3.5 h-3.5" />
              Total des vues
            </div>
            <div className="text-3xl font-bold text-foreground">{stats?.total || 0}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Globe className="w-3.5 h-3.5" />
              Pays
            </div>
            <div className="text-3xl font-bold text-foreground">{stats?.byCountry?.length || 0}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <MapPin className="w-3.5 h-3.5" />
              Villes
            </div>
            <div className="text-3xl font-bold text-foreground">{stats?.byCity?.length || 0}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* By Country */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Vues par pays
            </h2>
            <div className="space-y-2">
              {stats?.byCountry?.map((c) => (
                <div key={c.country} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-32 truncate">{c.country}</span>
                  <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(5, (c.count / maxCountry) * 100)}%`,
                        background: "linear-gradient(90deg, #1a5276, #2ecc71)",
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-foreground w-10 text-right">{c.count}</span>
                </div>
              ))}
              {(!stats?.byCountry || stats.byCountry.length === 0) && (
                <p className="text-xs text-muted-foreground text-center py-4">Aucune donnée disponible</p>
              )}
            </div>
          </div>

          {/* By City */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Top 20 villes
            </h2>
            <div className="space-y-2">
              {stats?.byCity?.slice(0, 20).map((c) => (
                <div key={c.city} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-40 truncate">{c.city}</span>
                  <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/70"
                      style={{ width: `${Math.max(5, (c.count / maxCity) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-foreground w-10 text-right">{c.count}</span>
                </div>
              ))}
              {(!stats?.byCity || stats.byCity.length === 0) && (
                <p className="text-xs text-muted-foreground text-center py-4">Aucune donnée disponible</p>
              )}
            </div>
          </div>

          {/* By Date */}
          <div className="bg-card border border-border rounded-lg p-5 md:col-span-2">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Vues par jour
            </h2>
            <div className="flex items-end gap-1 h-32">
              {stats?.byDate?.slice(-30).map((d) => {
                const maxDate = Math.max(...(stats?.byDate?.map((x) => x.count) || [1]));
                const h = Math.max(4, (d.count / maxDate) * 100);
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1" title={`${d.date}: ${d.count} vues`}>
                    <span className="text-[9px] text-muted-foreground">{d.count}</span>
                    <div
                      className="w-full rounded-t"
                      style={{
                        height: `${h}%`,
                        background: "linear-gradient(180deg, #2ecc71, #1a5276)",
                        minHeight: "4px",
                      }}
                    />
                    <span className="text-[8px] text-muted-foreground -rotate-45 origin-left whitespace-nowrap">
                      {d.date.slice(5)}
                    </span>
                  </div>
                );
              })}
              {(!stats?.byDate || stats.byDate.length === 0) && (
                <p className="text-xs text-muted-foreground text-center py-4 w-full">Aucune donnée disponible</p>
              )}
            </div>
          </div>
        </div>

        <p className="text-[0.65rem] text-muted-foreground text-center mt-8">
          Statistiques mises à jour en temps réel — Données anonymisées (IP hashées)
        </p>
      </div>

      <GmepFooter />
    </div>
  );
}
