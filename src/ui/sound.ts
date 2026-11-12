import { isMuted, setMuted } from "../music/audio";
import { sv } from "../i18n/sv";
import { h } from "./dom";

const KEY = "notlara-muted";

/** Restore the saved sound setting on start-up. */
export function initSound() {
  try {
    setMuted(localStorage.getItem(KEY) === "1");
  } catch {
    // storage unavailable
  }
}

/** A round button that turns sound on and off. */
export function soundToggle(): HTMLElement {
  const button = h("button", { class: "round-button", "aria-label": sv.sound });
  const update = () => {
    button.textContent = isMuted() ? sv.soundOff : sv.soundOn;
    button.setAttribute("aria-pressed", String(!isMuted()));
  };
  button.addEventListener("click", () => {
    setMuted(!isMuted());
    try {
      localStorage.setItem(KEY, isMuted() ? "1" : "0");
    } catch {
      // storage unavailable
    }
    update();
  });
  update();
  return button;
}
