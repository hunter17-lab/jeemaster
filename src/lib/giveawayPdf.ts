import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Brand palette — JEE MASTER red/amber theme for giveaway docs
const BRAND_PRIMARY = "#dc2626"; // red-600
const BRAND_DARK = "#0f172a";    // slate-900
const BRAND_MUTED = "#475569";   // slate-600
const BRAND_ACCENT = "#f59e0b";  // amber-500

interface Giveaway {
  title: string;
  prize: string;
  description?: string | null;
  result_at: string;
  winner_count: number;
}
interface Entry { name: string; email: string; reason: string; created_at: string; }
interface Winner { winner_name: string; win_position: number; }

const drawHeader = (doc: jsPDF, giveaway: Giveaway) => {
  const w = doc.internal.pageSize.getWidth();
  // gradient-ish bar
  doc.setFillColor(BRAND_PRIMARY);
  doc.rect(0, 0, w, 28, "F");
  doc.setFillColor(BRAND_ACCENT);
  doc.rect(0, 28, w, 3, "F");

  doc.setTextColor("#ffffff");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("JEE MASTER", 14, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Giveaway Report", 14, 22);

  doc.setFontSize(9);
  const right = `Generated: ${new Date().toLocaleString()}`;
  doc.text(right, w - 14, 14, { align: "right" });
  doc.text(`Result: ${new Date(giveaway.result_at).toLocaleString()}`, w - 14, 22, { align: "right" });
};

const drawFooter = (doc: jsPDF) => {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setDrawColor(BRAND_PRIMARY);
  doc.setLineWidth(0.4);
  doc.line(14, h - 14, w - 14, h - 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(BRAND_MUTED);
  doc.text("Confidential — for internal admin use only.", 14, h - 8);
  const page = doc.getCurrentPageInfo().pageNumber;
  const total = (doc as any).internal.getNumberOfPages();
  doc.text(`Page ${page} / ${total}`, w - 14, h - 8, { align: "right" });
};

export function exportGiveawayPdf(
  giveaway: Giveaway,
  entries: Entry[],
  winners: Winner[] = []
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  drawHeader(doc, giveaway);

  // Title block
  let y = 42;
  doc.setTextColor(BRAND_DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  const titleLines = doc.splitTextToSize(giveaway.title, w - 28);
  doc.text(titleLines, 14, y);
  y += titleLines.length * 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(BRAND_PRIMARY);
  doc.text(`Prize: ${giveaway.prize}`, 14, y);
  y += 6;
  doc.setTextColor(BRAND_MUTED);
  doc.setFontSize(10);
  doc.text(`Total entries: ${entries.length}    Winners: ${winners.length} / ${giveaway.winner_count}`, 14, y);
  y += 8;

  if (giveaway.description) {
    const lines = doc.splitTextToSize(giveaway.description, w - 28);
    doc.setTextColor(BRAND_DARK);
    doc.text(lines, 14, y);
    y += lines.length * 5 + 4;
  }

  // Winners box
  if (winners.length) {
    doc.setFillColor("#fef2f2");
    doc.setDrawColor(BRAND_PRIMARY);
    doc.roundedRect(14, y, w - 28, 12 + winners.length * 6, 2, 2, "FD");
    doc.setTextColor(BRAND_PRIMARY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Winners", 18, y + 7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(BRAND_DARK);
    winners.forEach((wn, i) => {
      doc.text(`#${wn.win_position}  ${wn.winner_name}`, 18, y + 13 + i * 6);
    });
    y += 16 + winners.length * 6;
  }

  // Entries table
  autoTable(doc, {
    startY: y,
    head: [["#", "Name", "Email", "Reason", "Entered"]],
    body: entries.map((e, i) => [
      String(i + 1),
      e.name,
      e.email,
      e.reason.length > 120 ? e.reason.slice(0, 120) + "…" : e.reason,
      new Date(e.created_at).toLocaleDateString(),
    ]),
    styles: { fontSize: 9, cellPadding: 2, overflow: "linebreak", textColor: BRAND_DARK },
    headStyles: { fillColor: BRAND_PRIMARY, textColor: "#fff", fontStyle: "bold" },
    alternateRowStyles: { fillColor: "#fff7ed" },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 30 },
      2: { cellWidth: 50 },
      3: { cellWidth: 70 },
      4: { cellWidth: 22 },
    },
    margin: { left: 14, right: 14, bottom: 20 },
    didDrawPage: () => {
      drawHeader(doc, giveaway);
      drawFooter(doc);
    },
  });

  // Final footer pass
  const pages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    drawFooter(doc);
  }

  const safe = giveaway.title.replace(/[^a-z0-9]+/gi, "-").slice(0, 40);
  doc.save(`giveaway-${safe}-${Date.now()}.pdf`);
}

export function exportGiveawayCsv(giveaway: Giveaway, entries: Entry[]) {
  const rows = [
    ["Name", "Email", "Reason", "Entered"],
    ...entries.map((e) => [e.name, e.email, e.reason.replace(/\n/g, " "), new Date(e.created_at).toISOString()]),
  ];
  const csv = rows
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const safe = giveaway.title.replace(/[^a-z0-9]+/gi, "-").slice(0, 40);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `giveaway-${safe}-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
