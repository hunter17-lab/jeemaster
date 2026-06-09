import { useEffect, useRef, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, RefreshCw, Maximize2, AlertTriangle } from "lucide-react";
import { getHubTool } from "@/data/jeeHub";
import useSEO from "@/hooks/useSEO";

const buildEmbedUrl = (raw: string) => {
  try {
    const u = new URL(raw);
    u.searchParams.set("embed", "1");
    u.searchParams.set("hideHeader", "1");
    u.searchParams.set("hideNav", "1");
    return u.toString();
  } catch {
    return raw + (raw.includes("?") ? "&" : "?") + "embed=1&hideHeader=1&hideNav=1";
  }
};

const SPLASH_MASK_MS = 1600; // keep loader visible briefly after onLoad to hide source splash
const LOAD_TIMEOUT_MS = 12000; // if onLoad never fires, show error fallback

const JeeHubFramePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const tool = slug ? getHubTool(slug) : undefined;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const loadedRef = useRef(false);

  useSEO({
    title: tool ? `${tool.title} — JEE MASTER` : "JEE Hub",
    description: tool?.description || "",
  });

  useEffect(() => {
    setLoading(true);
    setErrored(false);
    loadedRef.current = false;
    const errTimer = setTimeout(() => {
      if (!loadedRef.current) {
        setErrored(true);
        setLoading(false);
      }
    }, LOAD_TIMEOUT_MS);
    return () => clearTimeout(errTimer);
  }, [slug, reloadKey]);

  if (!tool) return <Navigate to="/hub" replace />;

  const Icon = tool.icon;
  const embedUrl = buildEmbedUrl(tool.url);

  const handleLoad = () => {
    loadedRef.current = true;
    // Keep loader on briefly to mask the source's own splash flash.
    setTimeout(() => setLoading(false), SPLASH_MASK_MS);
  };

  const handleError = () => {
    setErrored(true);
    setLoading(false);
  };

  const reload = () => {
    setReloadKey((k) => k + 1);
  };

  const goFullscreen = async () => {
    const el = (wrapperRef.current || iframeRef.current) as any;
    if (!el) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
      await req?.call(el);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background z-30">
      {/* Minimal branded top bar */}
      <header className="h-12 sm:h-14 px-3 sm:px-4 flex items-center gap-2 border-b border-border/60 bg-card/90 backdrop-blur-xl">
        <Link
          to="/hub"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Back to JEE Hub"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Hub</span>
        </Link>
        <div className="w-px h-6 bg-border/60 mx-1" />
        <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${tool.accent} flex items-center justify-center text-white shadow-sm shrink-0`}>
          <Icon size={14} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-display font-semibold truncate leading-tight">{tool.title}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground leading-tight hidden sm:block">
            JEE MASTER · {tool.tagline}
          </div>
        </div>
        <button
          onClick={reload}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="Reload this tool"
        >
          <RefreshCw size={16} />
        </button>
        <button
          onClick={goFullscreen}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="Toggle fullscreen"
        >
          <Maximize2 size={16} />
        </button>
        <a
          href={tool.url}
          target="_blank"
          rel="noreferrer"
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors hidden sm:inline-flex"
          title="Open in new tab"
        >
          <ExternalLink size={16} />
        </a>
      </header>

      {/* Iframe stage */}
      <div ref={wrapperRef} className="relative flex-1 bg-background overflow-hidden">
        {/* Skeleton / loading overlay (covers source splash flash) */}
        {loading && !errored && (
          <div className="absolute inset-0 z-20 flex flex-col bg-background animate-in fade-in duration-200">
            {/* Fake header skeleton */}
            <div className="h-14 border-b border-border/40 flex items-center gap-3 px-4">
              <div className="w-9 h-9 rounded-lg bg-secondary animate-pulse" />
              <div className="h-3 w-40 rounded bg-secondary animate-pulse" />
              <div className="ml-auto flex gap-2">
                <div className="h-3 w-16 rounded bg-secondary animate-pulse" />
                <div className="h-3 w-16 rounded bg-secondary animate-pulse" />
              </div>
            </div>
            {/* Body skeleton grid */}
            <div className="flex-1 p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-hidden">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-secondary/60 animate-pulse h-40 sm:h-44"
                  style={{ animationDelay: `${i * 60}ms` }}
                />
              ))}
            </div>
            {/* Centered branded status */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.accent} flex items-center justify-center text-white shadow-2xl animate-pulse`}
              >
                <Icon size={28} />
              </div>
              <div className="text-sm font-display font-semibold">{tool.title}</div>
              <div className="w-44 h-1 rounded-full bg-secondary overflow-hidden">
                <div className="h-full w-1/3 bg-primary jeehub-loading-bar" />
              </div>
              <div className="text-xs text-muted-foreground">Preparing your workspace…</div>
            </div>
            <style>{`
              @keyframes jeehub-loading-bar { 0% { transform: translateX(-120%) } 100% { transform: translateX(420%) } }
              .jeehub-loading-bar { animation: jeehub-loading-bar 1.2s ease-in-out infinite; }
            `}</style>
          </div>
        )}

        {/* Error fallback */}
        {errored && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-background">
            <div className="glass-card p-6 max-w-md text-center">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive mx-auto mb-3 flex items-center justify-center">
                <AlertTriangle size={22} />
              </div>
              <h3 className="font-display font-semibold text-lg mb-1">Couldn't load this tool here</h3>
              <p className="text-sm text-muted-foreground mb-4">
                It may be temporarily unavailable, blocked by your network, or restricted from being embedded.
                You can retry or open it in a new tab.
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={reload}
                  className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium inline-flex items-center gap-1"
                >
                  <RefreshCw size={14} /> Retry
                </button>
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold inline-flex items-center gap-1"
                >
                  <ExternalLink size={14} /> Open in new tab
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Branded corner sticker — covers the source's own back button so users don't see two */}
        <div
          aria-hidden
          className={`absolute top-2 left-2 z-10 select-none flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-gradient-to-br ${tool.accent} text-white shadow-lg border border-white/20 backdrop-blur-sm`}
          style={{ minWidth: 56, minHeight: 40 }}
        >
          <Icon size={16} />
          <span className="text-[11px] font-display font-bold uppercase tracking-wider hidden sm:inline">
            JEE MASTER
          </span>
        </div>

        {/* Iframe */}
        <iframe
          key={reloadKey}
          ref={iframeRef}
          src={embedUrl}
          title={tool.title}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full border-0 block transition-opacity duration-300 ${loading || errored ? "opacity-0" : "opacity-100"}`}
          allow="camera; microphone; clipboard-read; clipboard-write; fullscreen; autoplay"
          allowFullScreen
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
};

export default JeeHubFramePage;
