import { useEffect, useRef, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Maximize2, AlertTriangle, Unlock } from "lucide-react";
import { MATHANGO_PAPERS, isPaperUnlocked, formatUnlockDate } from "@/data/mathangoQft";
import useSEO from "@/hooks/useSEO";

const MathangoFramePage = () => {
  const { n } = useParams<{ n: string }>();
  const paper = MATHANGO_PAPERS.find((p) => p.n === Number(n));
  useSEO({
    title: paper ? `${paper.title} — Mathango 2027 QFT — JEE MASTER` : "Mathango 2027 QFTs",
    description: paper ? `Attempt ${paper.title} of the Mathango 2027 Question Fortnightly Tests on JEE MASTER.` : "",
  });

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setErrored(false);
    const t = setTimeout(() => setErrored((e) => (document.querySelector("iframe")?.matches("[data-loaded]") ? e : true)), 12000);
    return () => clearTimeout(t);
  }, [n, reloadKey]);

  if (!paper || !isPaperUnlocked(paper)) return <Navigate to="/mock-hub" replace />;

  const goFullscreen = async () => {
    const el = (iframeRef.current as any)?.parentElement;
    try {
      if (document.fullscreenElement) return void (await document.exitFullscreen());
      await el?.requestFullscreen?.();
    } catch { /* noop */ }
  };

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-background">
      <header className="h-12 sm:h-14 px-3 sm:px-4 flex items-center gap-2 border-b border-border/60 bg-card/90 backdrop-blur-xl">
        <Link
          to="/mock-hub"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
        >
          <ArrowLeft size={16} /> <span className="hidden sm:inline">Mock Hub</span>
        </Link>
        <div className="w-px h-6 bg-border/60 mx-1" />
        <div className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center text-primary-foreground shadow-sm shrink-0">
          <Unlock size={14} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-display font-semibold truncate leading-tight">{paper.title} · Mathango 2027 QFT</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground leading-tight hidden sm:block">JEE MASTER · Weekly Question Test</div>
        </div>
        <button onClick={() => setReloadKey((k) => k + 1)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary" title="Reload">
          <RefreshCw size={16} />
        </button>
        <button onClick={goFullscreen} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary" title="Fullscreen">
          <Maximize2 size={16} />
        </button>
      </header>

      <div className="relative flex-1 bg-background overflow-hidden">
        {loading && !errored && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground shadow-2xl animate-pulse">
              <Unlock size={28} />
            </div>
            <div className="text-sm font-display font-semibold">{paper.title} · Mathango 2027 QFT</div>
            <div className="w-44 h-1 rounded-full bg-secondary overflow-hidden">
              <div className="h-full w-1/3 bg-primary jeehub-loading-bar" />
            </div>
            <div className="text-xs text-muted-foreground">Preparing your test…</div>
            <style>{`@keyframes jeehub-loading-bar { 0% { transform: translateX(-120%) } 100% { transform: translateX(420%) } }
            .jeehub-loading-bar { animation: jeehub-loading-bar 1.2s ease-in-out infinite; }`}</style>
          </div>
        )}
        {errored && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-background">
            <div className="glass-card p-6 max-w-md text-center">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive mx-auto mb-3 flex items-center justify-center">
                <AlertTriangle size={22} />
              </div>
              <h3 className="font-display font-semibold text-lg mb-1">Couldn't load this test</h3>
              <p className="text-sm text-muted-foreground mb-4">Please retry, or reload the page if it keeps failing.</p>
              <button onClick={() => setReloadKey((k) => k + 1)} className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold">
                <RefreshCw size={14} className="inline mr-1" /> Retry
              </button>
            </div>
          </div>
        )}
        <iframe
          key={reloadKey}
          ref={iframeRef}
          src={paper.file}
          title={paper.title}
          onLoad={() => setTimeout(() => setLoading(false), 500)}
          onError={() => setErrored(true)}
          data-loaded="true"
          className={`w-full h-full border-0 block transition-opacity duration-300 ${loading || errored ? "opacity-0" : "opacity-100"}`}
          allow="fullscreen; autoplay"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default MathangoFramePage;
