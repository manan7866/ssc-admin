"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { UserRound, CheckCircle2, XCircle, Clock, Loader2, RefreshCw, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface Reflection {
  id: string;
  surahNumber: number;
  surahName: string;
  reflectionText: string;
  isApproved: boolean;
  isRejected: boolean;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
  user: {
    name: string;
    avatarUrl: string | null;
  } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "text-[#C8A75E]", bg: "bg-[#C8A75E]/10 border-[#C8A75E]/20", icon: Clock },
  approved: { label: "Approved", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20", icon: XCircle },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function ReflectionsPage() {
  const [status, setStatus] = useState("pending");
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchReflections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reflections?status=all");
      const data = await res.json();
      setReflections(data.reflections || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReflections();
  }, [fetchReflections]);

  const filteredReflections = reflections.filter((r) => {
    if (status === "pending") return !r.isApproved && !r.isRejected;
    if (status === "approved") return r.isApproved;
    if (status === "rejected") return r.isRejected;
    return true;
  });

  const counts = {
    pending: reflections.filter((r) => !r.isApproved && !r.isRejected).length,
    approved: reflections.filter((r) => r.isApproved).length,
    rejected: reflections.filter((r) => r.isRejected).length,
  };

  async function handleAction(id: string, action: "approve" | "reject") {
    await fetch("/api/admin/reflections/action", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    setReflections((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, isApproved: action === "approve", isRejected: action === "reject" }
          : r
      )
    );
  }

  return (
    <div className="min-h-screen bg-[#08091A] text-[#F5F3EE]">
      <div className="border-b border-white/5 bg-[#0A0C18]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <Link href="/admin/login" className="inline-flex items-center gap-1.5 text-[#AAB0D6]/40 hover:text-[#C8A75E] transition-colors text-xs mb-1">
              <ArrowLeft className="w-3 h-3" />
              Admin
            </Link>
            <h1 className="text-xl font-serif font-bold text-[#F5F3EE]">Reflections</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchReflections} className="text-[#AAB0D6] hover:text-[#C8A75E] text-xs">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <button key={key} onClick={() => setStatus(key)} className={`glass-panel border rounded-xl p-4 flex items-center gap-3 transition-all ${status === key ? "border-[#C8A75E]/30" : "border-white/5 hover:border-white/10"}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cfg.bg}`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold" style={{ color: key === "pending" ? "#C8A75E" : key === "approved" ? "#27AE60" : "#E07070" }}>{counts[key as keyof typeof counts]}</p>
                  <p className="text-[10px] text-[#AAB0D6]/40 uppercase tracking-wide">{cfg.label}</p>
                </div>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[#C8A75E] animate-spin" />
          </div>
        ) : filteredReflections.length === 0 ? (
          <div className="text-center py-16 text-[#AAB0D6]/30 text-sm">No reflections found.</div>
        ) : (
          <div className="space-y-3">
            {filteredReflections.map((r) => {
              const isExpanded = expanded === r.id;
              return (
                <div key={r.id} className="glass-panel border border-white/5 hover:border-white/10 rounded-xl transition-all overflow-hidden">
                  <button className="w-full text-left px-5 py-4 flex items-center gap-4" onClick={() => setExpanded(isExpanded ? null : r.id)}>
                    <div className="flex-shrink-0">
                      {r.user?.avatarUrl ? (
                        <Image alt={r.user.name} width={40} height={40} src={r.user.avatarUrl} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#C8A75E]/10 flex items-center justify-center">
                          <UserRound className="w-5 h-5 text-[#C8A75E]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#F5F3EE] truncate">{r.user?.name || "Anonymous"}</p>
                      <p className="text-xs text-[#AAB0D6]/50">
                        {r.surahName} (#{r.surahNumber})
                      </p>
                    </div>
                    <div className="hidden sm:block text-right shrink-0">
                      <p className="text-xs text-[#AAB0D6]/40">{formatDate(r.createdAt)}</p>
                    </div>
                    {status === "pending" && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); handleAction(r.id, "approve"); }} className="bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 border border-emerald-400/20 text-xs px-3 h-7">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleAction(r.id, "reject"); }} className="text-red-400 hover:bg-red-400/10 text-xs px-3 h-7">
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 text-[#AAB0D6]/40 shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-white/5 px-5 pb-5 pt-4">
                      <p className="text-[10px] text-[#AAB0D6]/40 uppercase tracking-widest mb-2">Reflection</p>
                      <p className="text-sm text-[#AAB0D6] leading-relaxed">{r.reflectionText}</p>
                      {r.isApproved && r.approvedAt && (
                        <p className="text-xs text-emerald-400 mt-3">Approved on {formatDate(r.approvedAt)}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}