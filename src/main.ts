import "./style.css";
import { getTopic } from "./topics";
import { stopAll, unlockAudio } from "./music/audio";
import { sv } from "./i18n/sv";
import { h } from "./ui/dom";
import { mapScreen } from "./ui/map";
import { topicScreen } from "./ui/topic";
import { quizScreen } from "./ui/quiz";
import { initSound } from "./ui/sound";

// Hash routes work on GitHub Pages without any server setup:
//   #/            the map
//   #/o/<id>      an island: learn
//   #/o/<id>/spela  an island: play

const app = document.getElementById("app")!;

function route() {
  stopAll();
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  let screen: HTMLElement;
  if (parts.length === 0) {
    screen = mapScreen();
  } else if (parts[0] === "o" && parts[1]) {
    const topic = getTopic(parts[1]);
    if (topic?.ready) screen = parts[2] === "spela" ? quizScreen(topic) : topicScreen(topic);
    else screen = notFound();
  } else {
    screen = notFound();
  }
  app.replaceChildren(screen);
  window.scrollTo({ top: 0 });
}

function notFound(): HTMLElement {
  return h("main", { class: "screen" }, h("p", {}, sv.notFound), h("a", { class: "back", href: "#/" }, `← ${sv.backToMap}`));
}

initSound();
// Wake up sound on the first tap anywhere (phones only allow audio after a
// tap; see src/music/audio.ts). iOS needs it on touchend/click specifically.
for (const event of ["touchend", "click", "keydown"]) {
  window.addEventListener(event, unlockAudio, { capture: true, passive: true });
}
window.addEventListener("hashchange", route);
route();
