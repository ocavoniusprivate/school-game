import type { LearnBlock, Topic } from "../topics/types";
import { getStars } from "../progress";
import { sv } from "../i18n/sv";
import { h, rich, starsText, svg } from "./dom";

function block(b: LearnBlock): HTMLElement {
  switch (b.kind) {
    case "text":
      return rich(b.text, "p", "learn-text");
    case "tip":
      return h("div", { class: "tip" }, h("span", { "aria-hidden": "true" }, "💡"), rich(b.text, "p"));
    case "visual": {
      const figure = h("figure", { class: "learn-visual" }, svg(b.svg));
      if (b.caption) figure.append(rich(b.caption, "div", "caption"));
      if (b.play) figure.append(h("button", { class: "listen", onClick: b.play }, sv.listen));
      return figure;
    }
    case "table":
      return h(
        "div",
        { class: "learn-table" },
        ...b.rows.map((row) =>
          h(
            row.play ? "button" : "div",
            { class: "learn-row", onClick: row.play },
            row.svg ? svg(row.svg, "row-symbol") : null,
            h("span", { class: "row-label" }, row.label),
            row.detail ? h("span", { class: "row-detail" }, row.detail) : null,
            row.play ? h("span", { class: "row-play", "aria-hidden": "true" }, "🔊") : null,
          ),
        ),
      );
  }
}

/** An island: learn first, then a big "play" button. */
export function topicScreen(topic: Topic): HTMLElement {
  return h(
    "main",
    { class: "screen topic", style: { "--island": topic.color } },
    h(
      "header",
      { class: "topic-header" },
      h("a", { class: "back", href: "#/" }, `← ${sv.backToMap}`),
      h("div", { class: "topic-emoji", "aria-hidden": "true" }, topic.emoji),
      h("h1", {}, topic.title),
      h("p", { class: "topic-stars" }, starsText(getStars(topic.id))),
    ),
    h("section", { class: "learn" }, h("h2", {}, `📖 ${sv.learn}`), ...topic.learn.map(block)),
    h("div", { class: "play-bar" }, h("a", { class: "play-button", href: `#/o/${topic.id}/spela` }, `▶ ${sv.play}`)),
  );
}
