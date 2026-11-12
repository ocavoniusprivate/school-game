import { TOPICS } from "../topics";
import { getStars, resetProgress, totalStars } from "../progress";
import { sv } from "../i18n/sv";
import { h, starsText } from "./dom";
import { soundToggle } from "./sound";

/** The start screen: the islands to choose from. */
export function mapScreen(): HTMLElement {
  const ready = TOPICS.filter((t) => t.ready);
  const max = ready.length * 3;

  const islands = TOPICS.map((t) =>
    h(
      t.ready ? "a" : "div",
      {
        class: `island${t.ready ? "" : " soon"}`,
        href: t.ready ? `#/o/${t.id}` : undefined,
        style: { "--island": t.color },
        "aria-label": t.ready ? `${t.title} – ${getStars(t.id)} av 3 stjärnor` : `${t.title} – ${sv.comingSoon}`,
      },
      h("span", { class: "island-emoji", "aria-hidden": "true" }, t.emoji),
      h("span", { class: "island-title" }, t.title),
      h("span", { class: "island-tagline" }, t.tagline),
      h("span", { class: "island-stars" }, t.ready ? starsText(getStars(t.id)) : sv.comingSoon),
    ),
  );

  const final = h(
    "div",
    { class: "island final soon", "aria-label": `${sv.finalTitle} – ${sv.comingSoon}` },
    h("span", { class: "island-emoji", "aria-hidden": "true" }, "🏆"),
    h("span", { class: "island-title" }, sv.finalTitle),
    h("span", { class: "island-tagline" }, sv.finalTagline),
    h("span", { class: "island-stars" }, sv.comingSoon),
  );

  return h(
    "main",
    { class: "screen map" },
    h(
      "header",
      { class: "map-header" },
      h("div", {}, h("h1", {}, sv.appTitle), h("p", { class: "subtitle" }, sv.appSubtitle)),
      soundToggle(),
    ),
    h(
      "div",
      { class: "mascot" },
      h("div", { class: "mascot-face", "aria-hidden": "true" }, "🎵"),
      h("p", { class: "bubble" }, sv.mascotHello),
    ),
    h("p", { class: "total-stars" }, `⭐ ${sv.starsTotal(totalStars(), max)}`),
    h("nav", { class: "islands", "aria-label": sv.appTitle }, ...islands, final),
    h(
      "footer",
      { class: "footer" },
      h("span", {}, sv.footer),
      h(
        "button",
        {
          class: "link",
          onClick: () => {
            if (window.confirm(sv.resetConfirm)) {
              resetProgress();
              location.reload();
            }
          },
        },
        sv.resetProgress,
      ),
    ),
  );
}
