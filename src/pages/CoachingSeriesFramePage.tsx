import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCw, Maximize2, AlertTriangle, PlayCircle } from "lucide-react";
import useSEO from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";

const SPLASH_MASK_MS = 1600;
const LOAD_TIMEOUT_MS = 12000;

/** Full-screen CBT iframe for a single coaching-series test. */
const CoachingSeriesFramePage = () => {
  const { id, testId } = useParams<{ id: string; testId: string }>();
  const [name, setName] = useState("Test");
  const [url, setUrl] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.from("coaching_series_tests").select("name,url").eq("id", testId).eq("series_id", id).maybeSingle();
      if (!active) return;
      if (data) { setName((data as any).name); setUrl((data as any).url); }
      setReady(true);
    })();
    return () => { active = false; };
  }, [id, testId]);

  useSEO({ title: `${name} — Coaching Test Series — JEE MASTER`, description: "Attempt this coaching test series paper online." });

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    setErrored(false);
    loadedRef.current = false;
    const t = setTimeout(() => { if (!loadedRef.current) { setErrored(true); setLoading(false); } }, LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [url, reloadKey]);

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
          to={id ? `/coaching-series/${id}` : "/mock-hub"}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
        >
          <ArrowLeft size={16} /> <span className="hidden sm:inline">Back</span>
        </Link>
        <div className="w-px h-6 bg-border/60 mx-1" />
        <div className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center text-primary-foreground shadow-sm shrink-0">
          <PlayCircle size={14} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-display font-semibold truncate leading-tight">{name}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground leading-tight hidden sm:block">JEE MASTER · Coaching Test Series</div>
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
              <PlayCircle size={28} />
            </div>
            <div className="text-sm font-display font-semibold">{name}</div>
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
              <p className="text-sm text-muted-foreground mb-4">It may be temporarily unavailable or restricted from being embedded.</p>
              <button onClick={() => setReloadKey((k) => k + 1)} className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold">
                <RefreshCw size={14} className="inline mr-1" /> Retry
              </button>
            </div>
          </div>
        )}
        {url ? (
          <iframe
            key={reloadKey}
            ref={iframeRef}
            src={url}
            title={name}
            onLoad={() => { loadedRef.current = true; setTimeout(() => setLoading(false), SPLASH_MASK_MS); }}
            onError={() => setErrored(true)}
            className={`w-full h-full border-0 block transition-opacity duration-300 ${loading || errored ? "opacity-0" : "opacity-100"}`}
            allow="camera; microphone; clipboard-read; clipboard-write; fullscreen; autoplay"
            allowFullScreen
            referrerPolicy="no-referrer"
          />
        ) : ready ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">This test is no longer available.</div>
        ) : null}
      </div>
    </div>
  );
};

export default CoachingSeriesFramePage;
