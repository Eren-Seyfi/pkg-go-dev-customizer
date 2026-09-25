import { initBackground } from "./background/index.js";
import { initContentScript } from "./content/index.js";
import { initGeminiBridge } from "./gemini-bridge/index.js";

// ==========================================================================
// TEK GİRİŞ NOKTASI: Çalışma bağlamına göre doğru modülü başlatır.
// (Service worker'da `document` yoktur; content script'lerde ise sayfanın
// host'una bakarak pkg.go.dev mi yoksa gemini.google.com mı olduğu ayrılır.)
// ==========================================================================
if (typeof document === "undefined") {
  initBackground();
} else if (location.hostname.includes("gemini.google.com")) {
  initGeminiBridge();
} else {
  initContentScript();
}
