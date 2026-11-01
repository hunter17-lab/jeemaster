// Mathango 2027 QFT papers — one new paper unlocks every Sunday.
// Files are self-contained CBT papers served from /qft/.
export interface MathangoPaper {
  n: number;
  title: string;
  file: string;
  /** UTC instant from which this paper is unlocked */
  unlockAt: string;
}

const sunday = (iso: string) => iso; // dates chosen as Sundays (UTC)

export const MATHANGO_PAPERS: MathangoPaper[] = [
  { n: 1, title: "QFT 1", file: "/qft/mathango-qft-1.html", unlockAt: sunday("2026-10-11T00:00:00Z") },
  { n: 2, title: "QFT 2", file: "/qft/mathango-qft-2.html", unlockAt: sunday("2026-10-11T00:00:00Z") },
  { n: 3, title: "QFT 3", file: "/qft/mathango-qft-3.html", unlockAt: sunday("2026-10-18T00:00:00Z") },
  { n: 4, title: "QFT 4", file: "/qft/mathango-qft-4.html", unlockAt: sunday("2026-10-25T00:00:00Z") },
  { n: 5, title: "QFT 5", file: "/qft/mathango-qft-5.html", unlockAt: sunday("2026-11-01T00:00:00Z") },
  { n: 6, title: "QFT 6", file: "/qft/mathango-qft-6.html", unlockAt: sunday("2026-11-08T00:00:00Z") },
  { n: 7, title: "QFT 7", file: "/qft/mathango-qft-7.html", unlockAt: sunday("2026-11-15T00:00:00Z") },
  { n: 8, title: "QFT 8", file: "/qft/mathango-qft-8.html", unlockAt: sunday("2026-11-22T00:00:00Z") },
];

export const isPaperUnlocked = (p: MathangoPaper) => Date.now() >= Date.parse(p.unlockAt);

export const formatUnlockDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
