(function loadCompiledRuntime() {
  "use strict";
  const parameters = new URLSearchParams(location.search);
  const userscript = ["userscript", "mobile"].includes(parameters.get("mode"));
  const shouldOpenUserscriptPanel = userscript && parameters.get("open") === "1";

  function openUserscriptPanelWhenReady() {
    const api = window.__SCSQ_MOBILE_LOADED__;
    const layer = document.getElementById("scsq-mobile-layer");
    if (!layer || !api || typeof api.openMobilePanel !== "function") {
      return false;
    }
    api.openMobilePanel();
    return true;
  }

  let openObserver = null;
  if (shouldOpenUserscriptPanel) {
    openObserver = new MutationObserver(() => {
      if (openUserscriptPanelWhenReady()) {
        openObserver.disconnect();
      }
    });
    openObserver.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (!userscript) {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "../../dist/desktop/styles.css";
    document.head.appendChild(stylesheet);
  }

  const script = document.createElement("script");
  script.async = false;
  script.src = userscript
    ? "../../dist/mobile/scopus-citescore-quartile.user.js"
    : "../../dist/desktop/content.js";
  script.addEventListener("load", () => {
    if (!shouldOpenUserscriptPanel || openUserscriptPanelWhenReady()) {
      openObserver?.disconnect();
      return;
    }
    let attempts = 0;
    const openWhenReady = window.setInterval(() => {
      attempts += 1;
      const api = window.__SCSQ_MOBILE_LOADED__;
      if (api && typeof api.openMobilePanel === "function") {
        window.clearInterval(openWhenReady);
        api.openMobilePanel();
      } else if (attempts > 30) {
        window.clearInterval(openWhenReady);
      }
    }, 50);
  });
  document.body.appendChild(script);
})();
