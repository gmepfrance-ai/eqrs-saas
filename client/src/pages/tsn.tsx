import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Loader2, ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function TsnPage() {
  const { token, user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (authLoading) return;
    if (!user || !token) {
      navigate("/login");
      return;
    }
    // Redirection directe vers l'outil TSN protégé
    window.location.href = `/api/tsn-tool?token=${token}`;
  }, [token, user, authLoading, navigate]);

  // Anti-copy
  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (e.ctrlKey && (e.key === "s" || e.key === "S" || e.key === "u" || e.key === "U" || e.key === "p" || e.key === "P")) {
        e.preventDefault();
        return false;
      }
    }
    function handleContextMenu(e: MouseEvent) { e.preventDefault(); }
    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#1e8449]" />
          <p className="text-sm text-[#6b6b66]">Chargement de l'outil Transfert Sol→Nappe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e8449]" />
        <p className="text-sm text-[#6b6b66]">Chargement de l'outil Transfert Sol→Nappe...</p>
      </div>
    </div>
  );
}
