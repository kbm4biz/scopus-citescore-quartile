(function loadCompiledRuntime() {
  "use strict";
  const parameters = new URLSearchParams(location.search);
  const mobile = parameters.get("mode") === "mobile";
  const shouldOpenMobilePanel = mobile && parameters.get("open") === "1";

  function openMobilePanelWhenReady() {
    const api = window.__SCSQ_MOBILE_LOADED__;
    const layer = document.getElementById("scsq-mobile-layer");
    if (!layer || !api || typeof api.openMobilePanel !== "function") {
      return false;
    }
    api.openMobilePanel();
    return true;
  }

  let openObserver = null;
  if (shouldOpenMobilePanel) {
    openObserver = new MutationObserver(() => {
      if (openMobilePanelWhenReady()) {
        openObserver.disconnect();
      }
    });
    openObserver.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (!mobile) {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "../../dist/desktop/styles.css";
    document.head.appendChild(stylesheet);
  }

  const script = document.createElement("script");
  script.async = false;
  script.src = mobile
    ? "../../dist/mobile/scopus-citescore-quartile.user.js"
    : "../../dist/desktop/content.js";
  script.addEventListener("load", () => {
    if (!shouldOpenMobilePanel || openMobilePanelWhenReady()) {
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
