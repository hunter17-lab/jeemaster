import { useEffect, useRef, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, RefreshCw, Maximize2 } from "lucide-react";
import { getHubTool } from "@/data/jeeHub";
import { useSEO } from "@/hooks/useSEO";

const JeeHubFramePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const tool = slug ? getHubTool(slug) : undefined;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useSEO({
    title: tool ? `${tool.title} — JEE MASTER` : "JEE Hub",
    description: tool?.description || "",
  });

  useEffect(() => {
    setLoading(true);
    // Mask any splash for a moment after load fires
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, [slug, reloadKey]);

  if (!tool) return <Navigate to="/hub" replace />;

  const Icon = tool.icon;

  const goFullscreen = () => {
    const el = iframeRef.current as any;
    if (!el) return;
    (el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen)?.call(el);
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
          onClick={() => setReloadKey((k) => k + 1)}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="Reload"
        >
          <RefreshCw size={16} />
        </button>
        <button
          onClick={goFullscreen}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="Fullscreen"
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
      <div className="relative flex-1 bg-background">
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-background">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.accent} flex items-center justify-center text-white shadow-2xl animate-pulse`}>
              <Icon size={28} />
            </div>
            <div className="text-sm font-medium text-muted-foreground">Loading {tool.title}…</div>
            <div className="w-40 h-1 rounded-full bg-secondary overflow-hidden">
              <div className="h-full w-1/3 bg-primary animate-[loading_1.2s_ease-in-out_infinite]" />
            </div>
            <style>{`@keyframes loading { 0% { transform: translateX(-100%) } 100% { transform: translateX(400%) } }`}</style>
          </div>
        )}
        <iframe
          key={reloadKey}
          ref={iframeRef}
          src={tool.url}
          title={tool.title}
          onLoad={() => setLoading(false)}
          className="w-full h-full border-0 block"
          allow="camera; microphone; clipboard-read; clipboard-write; fullscreen; autoplay"
          allowFullScreen
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
};

export default JeeHubFramePage;
