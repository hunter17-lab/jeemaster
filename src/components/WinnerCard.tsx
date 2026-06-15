import { useRef } from "react";
import { Trophy, Download, Sparkles } from "lucide-react";

interface Props {
  giveawayTitle: string;
  prize: string;
  winnerName: string;
  position: number;
}

/** Decorative downloadable winner card. */
const WinnerCard = ({ giveawayTitle, prize, winnerName, position }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  const download = async () => {
    const node = ref.current;
    if (!node) return;
    // SVG-based snapshot for crisp output
    const w = 1200, h = 630;
    const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>
        <defs>
          <linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0' stop-color='#7f1d1d'/>
            <stop offset='0.5' stop-color='#dc2626'/>
            <stop offset='1' stop-color='#f59e0b'/>
          </linearGradient>
          <radialGradient id='spot' cx='0.5' cy='0' r='0.8'>
            <stop offset='0' stop-color='#ffffff' stop-opacity='0.35'/>
            <stop offset='1' stop-color='#ffffff' stop-opacity='0'/>
          </radialGradient>
        </defs>
        <rect width='${w}' height='${h}' fill='url(#bg)'/>
        <rect width='${w}' height='${h}' fill='url(#spot)'/>
        <text x='60' y='90' font-family='Inter,Helvetica,Arial,sans-serif' font-size='28' fill='#fde68a' font-weight='700' letter-spacing='6'>JEE MASTER · GIVEAWAY</text>
        <text x='60' y='200' font-family='Georgia,serif' font-size='56' fill='#fff' font-weight='800'>🏆 Winner #${position}</text>
        <text x='60' y='320' font-family='Inter,Helvetica,Arial,sans-serif' font-size='84' fill='#fff' font-weight='900'>${escapeXml(winnerName)}</text>
        <text x='60' y='400' font-family='Inter,Helvetica,Arial,sans-serif' font-size='32' fill='#fee2e2'>${escapeXml(giveawayTitle)}</text>
        <text x='60' y='460' font-family='Inter,Helvetica,Arial,sans-serif' font-size='28' fill='#fde68a'>🎁 ${escapeXml(prize)}</text>
        <text x='60' y='560' font-family='Inter,Helvetica,Arial,sans-serif' font-size='20' fill='#ffffff' opacity='0.85'>Congratulations from the JEE MASTER team — keep grinding 🚀</text>
      </svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    // convert to PNG via canvas
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    await new Promise((res) => { img.onload = res; });
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    canvas.toBlob((b) => {
      if (!b) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = `winner-${winnerName.replace(/\s+/g, "-")}.png`;
      a.click();
    }, "image/png");
  };

  return (
    <div className="space-y-3">
      <div ref={ref} className="relative aspect-[1200/630] rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "linear-gradient(135deg,#7f1d1d 0%,#dc2626 50%,#f59e0b 100%)" }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.35),transparent_60%)]" />
        <div className="relative p-6 md:p-8 h-full flex flex-col text-white">
          <div className="flex items-center gap-2 text-amber-200 tracking-[0.3em] text-[10px] md:text-xs font-bold">
            <Sparkles size={14} /> JEE MASTER · GIVEAWAY
          </div>
          <div className="mt-4 md:mt-6 flex items-center gap-2 text-2xl md:text-4xl font-display font-extrabold">
            <Trophy /> Winner #{position}
          </div>
          <div className="mt-2 md:mt-4 text-3xl md:text-5xl font-display font-black break-words leading-tight">{winnerName}</div>
          <div className="mt-3 text-sm md:text-lg text-red-100">{giveawayTitle}</div>
          <div className="mt-1 text-amber-200 text-sm md:text-lg font-semibold">🎁 {prize}</div>
          <div className="mt-auto text-xs md:text-sm opacity-80">Congratulations — keep grinding 🚀</div>
        </div>
      </div>
      <button onClick={download} className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold">
        <Download size={16} /> Download winner card
      </button>
    </div>
  );
};

const escapeXml = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!));

export default WinnerCard;
