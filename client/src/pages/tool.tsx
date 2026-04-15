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
    // Redirect directly to the tool page — avoids all iframe/sandbox/CSP issues
    window.location.href = `/api/tool?token=${token}`;
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

  // Fallback loading screen (redirect should happen before this renders)
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Chargement de l'outil EQRS...</p>
      </div>
    </div>
  );
}
