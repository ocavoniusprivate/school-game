// Draws music notation as SVG strings: staff, clef, notes, rests, accidentals,
// time signatures and bar lines. Notes and rests are drawn as shapes (not font
// characters) so they look the same on every phone; only the G clef uses a
// music font character (Noto Music, loaded in index.html).

import type { Accidental, NoteValue } from "./theory";

const INK = "currentColor";
const GAP = 10; // distance between staff lines
const BOTTOM = 70; // y of the bottom line (E4)
const HEIGHT = 110;

/** y coordinate of a staff step (0 = bottom line, 1 = first space, …). */
export const stepY = (step: number) => BOTTOM - step * (GAP / 2);

export interface StaffNote {
  step: number;
  value?: NoteValue;
  accidental?: Accidental;
  dotted?: boolean;
  /** Draw this note in the highlight colour. */
  highlight?: boolean;
}

export type StaffItem =
  | ({ kind: "note" } & StaffNote)
  | { kind: "rest"; value: NoteValue }
  | { kind: "bar"; style?: "single" | "end" | "repeat" };

export interface StaffOptions {
  items?: StaffItem[];
  clef?: boolean;
  timeSignature?: [number, number];
  width?: number;
  /** Space between items. */
  spacing?: number;
  /** Labels drawn under the staff, keyed by item index. */
  labels?: Record<number, string>;
}

function lines(width: number): string {
  let out = "";
  for (let i = 0; i < 5; i++) {
    const y = BOTTOM - i * GAP;
    out += `<line x1="0" x2="${width}" y1="${y}" y2="${y}" stroke="${INK}" stroke-width="1.2"/>`;
  }
  return out;
}

function ledgerLines(x: number, step: number): string {
  let out = "";
  const line = (s: number) =>
    `<line x1="${x - 10}" x2="${x + 10}" y1="${stepY(s)}" y2="${stepY(s)}" stroke="${INK}" stroke-width="1.2"/>`;
  for (let s = -2; s >= step; s -= 2) out += line(s);
  for (let s = 10; s <= step; s += 2) out += line(s);
  return out;
}

/** A note head (+ stem, flags, dot) centred at x, y. */
export function noteShape(
  x: number,
  y: number,
  value: NoteValue,
  opts: { stemUp?: boolean; dotted?: boolean; onLine?: boolean; color?: string } = {},
): string {
  const color = opts.color ?? INK;
  const stemUp = opts.stemUp ?? true;
  const hollow = value === "whole" || value === "half";
  const rx = value === "whole" ? 7.5 : 6.2;
  let out = `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="4.6" transform="rotate(-20 ${x} ${y})" fill="${
    hollow ? "none" : color
  }" stroke="${color}" stroke-width="${hollow ? 2.2 : 1}"/>`;

  if (value !== "whole") {
    const sx = stemUp ? x + 5.6 : x - 5.6;
    const tip = stemUp ? y - 34 : y + 34;
    out += `<line x1="${sx}" x2="${sx}" y1="${y + (stemUp ? -1 : 1)}" y2="${tip}" stroke="${color}" stroke-width="1.6"/>`;
    const flags = value === "eighth" ? 1 : value === "sixteenth" ? 2 : 0;
    for (let i = 0; i < flags; i++) {
      const fy = tip + (stemUp ? i * 8 : -i * 8);
      const d = stemUp
        ? `M${sx},${fy} c 1,7 11,9 9,20 c 0,-7 -5,-10 -9,-12 z`
        : `M${sx},${fy} c 1,-7 11,-9 9,-20 c 0,7 -5,10 -9,12 z`;
      out += `<path d="${d}" fill="${color}"/>`;
    }
  }
  if (opts.dotted) {
    const dy = opts.onLine ? -GAP / 2 : 0;
    out += `<circle cx="${x + 12}" cy="${y + dy}" r="2" fill="${color}"/>`;
  }
  return out;
}

/** A rest drawn at its usual position on the staff, around x. */
export function restShape(x: number, value: NoteValue, color = INK): string {
  switch (value) {
    case "whole": // hangs below the 4th line
      return `<rect x="${x - 7}" y="${stepY(6)}" width="14" height="5" fill="${color}"/>`;
    case "half": // sits on the middle line
      return `<rect x="${x - 7}" y="${stepY(4) - 5}" width="14" height="5" fill="${color}"/>`;
    case "quarter":
      return `<path d="M${x - 2},${stepY(7)} l7,8 l-5,6 l6,8 c-5,-2 -8,1 -4,7 c-7,-3 -6,-10 0,-9 l-6,-7 l5,-6 z" fill="${color}" stroke="${color}" stroke-width="1" stroke-linejoin="round"/>`;
    case "eighth":
    case "sixteenth": {
      const flags = value === "eighth" ? 1 : 2;
      let out = `<line x1="${x + 5}" y1="${stepY(5)}" x2="${x - 2}" y2="${stepY(1)}" stroke="${color}" stroke-width="1.8"/>`;
      for (let i = 0; i < flags; i++) {
        const fy = stepY(5) + i * 9;
        const fx = x + 5 - i * 1.6;
        out += `<circle cx="${fx - 7}" cy="${fy - 1}" r="2.8" fill="${color}"/>`;
        out += `<path d="M${fx - 9},${fy + 1} q 5,3 ${9},-1" fill="none" stroke="${color}" stroke-width="1.6"/>`;
      }
      return out;
    }
  }
}

function accidentalShape(x: number, y: number, accidental: Accidental, color = INK): string {
  if (!accidental) return "";
  const glyph = accidental === "sharp" ? "♯" : accidental === "flat" ? "♭" : "♮";
  const dy = accidental === "flat" ? 4 : 6;
  return `<text x="${x - 15}" y="${y + dy}" font-size="19" text-anchor="middle" fill="${color}" font-family="'Noto Music','Segoe UI Symbol',serif">${glyph}</text>`;
}

function barShape(x: number, style: "single" | "end" | "repeat"): string {
  const top = stepY(8);
  const bottom = stepY(0);
  const thin = (bx: number) => `<line x1="${bx}" x2="${bx}" y1="${top}" y2="${bottom}" stroke="${INK}" stroke-width="1.4"/>`;
  const thick = (bx: number) => `<rect x="${bx}" y="${top}" width="4.5" height="${bottom - top}" fill="${INK}"/>`;
  if (style === "single") return thin(x);
  const dots =
    style === "repeat"
      ? `<circle cx="${x - 6}" cy="${stepY(5)}" r="2.3" fill="${INK}"/><circle cx="${x - 6}" cy="${stepY(3)}" r="2.3" fill="${INK}"/>`
      : "";
  return dots + thin(x) + thick(x + 4);
}

/** G clef from the music font, sized to the staff. */
function clefShape(): string {
  return `<text x="2" y="${stepY(0) + 9}" font-size="58" fill="${INK}" font-family="'Noto Music','Segoe UI Symbol',serif">𝄞</text>`;
}

function timeSigShape(x: number, [top, bottom]: [number, number]): string {
  const style = `font-size="22" font-weight="800" text-anchor="middle" fill="${INK}" font-family="Georgia,'Times New Roman',serif"`;
  return `<text x="${x}" y="${stepY(4) - 2}" ${style}>${top}</text><text x="${x}" y="${stepY(0) - 2}" ${style}>${bottom}</text>`;
}

/** A complete staff with optional clef, time signature and items. */
export function staffSvg(opts: StaffOptions = {}): string {
  const items = opts.items ?? [];
  const spacing = opts.spacing ?? 46;
  let x = opts.clef === false ? 18 : 62;
  let body = opts.clef === false ? "" : clefShape();
  if (opts.timeSignature) {
    body += timeSigShape(x, opts.timeSignature);
    x += 30;
  }
  items.forEach((item, i) => {
    if (item.kind === "bar") {
      body += barShape(x - spacing / 2 + 8, item.style ?? "single");
      x += 10;
      return;
    }
    const cx = x + (item.kind === "note" && item.accidental ? 14 : 0);
    if (item.kind === "note") {
      const color = item.highlight ? "var(--highlight)" : INK;
      const y = stepY(item.step);
      body += ledgerLines(cx, item.step);
      body += accidentalShape(cx, y, item.accidental ?? null, color);
      body += noteShape(cx, y, item.value ?? "quarter", {
        stemUp: item.step < 4,
        dotted: item.dotted,
        onLine: item.step % 2 === 0,
        color,
      });
    } else {
      body += restShape(cx, item.value);
    }
    const label = opts.labels?.[i];
    if (label) {
      body += `<text x="${cx}" y="${HEIGHT - 4}" font-size="13" font-weight="700" text-anchor="middle" fill="${INK}">${label}</text>`;
    }
    x = cx + spacing;
  });
  const width = opts.width ?? Math.max(x + 6, 140);
  return `<svg class="staff" viewBox="0 0 ${width} ${HEIGHT}" role="img" aria-hidden="true">${lines(width)}${body}</svg>`;
}

/** A single note value on its own (no staff), for symbol questions. */
export function noteSymbolSvg(value: NoteValue, dotted = false): string {
  return `<svg class="symbol" viewBox="0 0 44 60" aria-hidden="true">${noteShape(18, 48, value, { stemUp: true, dotted })}</svg>`;
}

/** A rest on a small staff (rests only make sense against the lines). */
export function restSymbolSvg(value: NoteValue): string {
  return `<svg class="symbol" viewBox="0 20 50 60" aria-hidden="true">${lines(50)}${restShape(25, value)}</svg>`;
}

/** Dynamics marking in the classic italic style, e.g. "mf". */
export function dynamicSvg(mark: string): string {
  return `<svg class="symbol" viewBox="0 0 70 40" aria-hidden="true"><text x="35" y="28" text-anchor="middle" font-size="26" font-style="italic" font-weight="700" fill="${INK}" font-family="Georgia,'Times New Roman',serif">${mark}</text></svg>`;
}

/** Crescendo (<) or diminuendo (>) hairpin. */
export function hairpinSvg(kind: "cresc" | "dim"): string {
  const d = kind === "cresc" ? "M6,20 L64,8 M6,20 L64,32" : "M6,8 L64,20 M6,32 L64,20";
  return `<svg class="symbol" viewBox="0 0 70 40" aria-hidden="true"><path d="${d}" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>`;
}
