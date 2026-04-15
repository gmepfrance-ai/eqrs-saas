import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function ToolPage() {
  const { token, user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [toolUrl, setToolUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !token) {
      navigate("/login");
      return;
    }
    // Use src URL instead of srcDoc to allow external scripts and PDF export
    setToolUrl(`/api/tool?token=${token}`);
    setLoading(false);
  }, [token, user, authLoading, navigate]);

  // Anti-copy on wrapper
  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (
        e.ctrlKey &&
        (e.key === "s" ||
          e.key === "S" ||
          e.key === "u" ||
          e.key === "U" ||
          e.key === "p" ||
          e.key === "P")
      ) {
        e.preventDefault();
        return false;
      }
    }

    function handleContextMenu(e: MouseEvent) {
      e.preventDefault();
    }

    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#1a5276]" />
          <p className="text-sm text-[#6b6b66]">
            Chargement de l'outil EQRS...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-sm text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
          <h2 className="text-base font-bold text-foreground mb-2">
            Accès restreint
          </h2>
          <p className="text-sm text-muted-foreground mb-6">{error}</p>
          <Button
            data-testid="button-back-dashboard"
            onClick={() =>
              (window.location.hash = `#/dashboard?token=${token}`)
            }
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#f5f5f0]">
      {/* Minimal toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b flex-shrink-0"
        style={{
          background: "linear-gradient(135deg, #0e2f44 0%, #1a5276 100%)",
          borderColor: "rgba(255,255,255,0.1)",
        }}
      >
        <button
          data-testid="button-back-to-dashboard"
          onClick={() =>
            (window.location.hash = `#/dashboard?token=${token}`)
          }
          className="text-white/80 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Tableau de bord
        </button>
        <div className="text-white/60 text-[0.65rem]">
          EQRS — Johnson &amp; Ettinger • G.M.E.P
        </div>
      </div>

      {/* Tool iframe */}
      {toolUrl && (
        <iframe
          ref={iframeRef}
          data-testid="iframe-eqrs-tool"
          src={toolUrl}
          className="flex-1 w-full border-0"
          title="Outil EQRS Johnson & Ettinger"
          allow="downloads"
        />
      )}
    </div>
  );
}
