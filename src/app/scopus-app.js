"use strict";

import * as calculator from "../core/quartile-calculator.js";
import * as parser from "../core/scopus-parser.js";
import { DEFAULT_SETTINGS } from "../platform/settings-store.js";

export function initialiseScopusApp({
  settingsStore,
  mode = "desktop",
  clipboardWriter = null,
  version = ""
}) {
  const globalScope = window;
  const isUserscript = mode === "userscript" || mode === "mobile";
  const loadedKey = isUserscript ? "__SCSQ_MOBILE_LOADED__" : "__SCSQ_DESKTOP_LOADED__";
  if (globalScope[loadedKey]) {
    return globalScope[loadedKey];
  }
  globalScope[loadedKey] = Object.freeze({ loading: true });

  const PANEL_ID = "scsq-citescore-quartile-panel";
  const MOBILE_LAYER_ID = "scsq-mobile-layer";
  const MOBILE_DRAWER_ID = "scsq-mobile-drawer";
  const OWNED_SELECTOR = "[data-scsq-owned='true']";
  const INLINE_SELECTOR = "[data-scsq-inline='true']";
  const DEBOUNCE_MS = 280;

  let settings = { ...DEFAULT_SETTINGS };
  let debounceTimer = null;
  let observer = null;
  let lastSignature = "";
  let rendering = false;
  let mobileDrawerOpen = false;
  let lastFocusedElement = null;

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    if (text !== undefined) {
      element.textContent = text;
    }
    return element;
  }

  function removeExtensionUi() {
    document.querySelectorAll(OWNED_SELECTOR).forEach((element) => element.remove());
  }

  function removePanels() {
    document.querySelectorAll(
      `[data-scsq-panel='true'], #${PANEL_ID}, #${MOBILE_LAYER_ID}`
    ).forEach((element) => element.remove());
  }

  function removeInlineBadges() {
    document.querySelectorAll(INLINE_SELECTOR).forEach((element) => element.remove());
  }

  function proximityFor(result) {
    return result?.proximity || calculator.proximityToBetterQuartile(result?.percentile);
  }

  function compactProximityText(result) {
    const proximity = proximityFor(result);
    if (!proximity) {
      return "unavailable";
    }
    if (proximity.isHighest) {
      return result.estimated ? "≈ highest" : "highest";
    }
    return `${result.estimated ? "≈" : ""}${proximity.pointsToNext} pt to ${proximity.nextQuartile}`;
  }

  function proximitySummary(result) {
    const proximity = proximityFor(result);
    if (!proximity) {
      return "Quartile proximity unavailable";
    }
    if (proximity.isHighest) {
      return result.estimated
        ? "Estimated to be in the highest CiteScore quartile"
        : "Already in the highest CiteScore quartile";
    }
    const pointsLabel = proximity.pointsToNext === 1 ? "point" : "points";
    const estimateLabel = result.estimated ? "Estimated distance: " : "";
    return `${estimateLabel}${proximity.pointsToNext} percentile ${pointsLabel} to ${proximity.nextQuartile} (threshold ${proximity.nextThreshold})`;
  }

  function bestCategoryItem(calculatedCategories) {
    const bestResult = calculator.bestQuartileResult(
      calculatedCategories.map((item) => item.result)
    );
    return bestResult
      ? calculatedCategories.find((item) => item.result === bestResult) || null
      : null;
  }

  function resultTooltip(result, category, year) {
    const safeCategory = parser.sanitizeText(category, 240) || "this subject category";
    const safeYear = parser.sanitizeText(year, 20) || "unavailable";
    if (!result.quartile) {
      return `Unable to calculate a CiteScore quartile for ${safeCategory}, CiteScore year ${safeYear}.`;
    }
    const proximitySentence = `${proximitySummary(result)}.`;
    if (result.estimated && result.rank) {
      return `Estimated CiteScore ${result.quartile} calculated from rank ${result.rank.rank}/${result.rank.total} (estimated percentile ${result.percentile}) for ${safeCategory}, CiteScore year ${safeYear}. ${proximitySentence}`;
    }
    return `CiteScore ${result.quartile} calculated from percentile ${result.percentile} for ${safeCategory}, CiteScore year ${safeYear}. ${proximitySentence}`;
  }

  function makeBadge(result, category, year, inline = false) {
    const badge = createElement("span", `scsq-badge scsq-badge--${result.quartile ? result.quartile.toLowerCase() : "unknown"}`);
    badge.appendChild(createElement("span", "scsq-badge__quartile", result.quartile || "N/A"));
    if (result.quartile) {
      badge.appendChild(createElement("small", "scsq-badge__proximity", compactProximityText(result)));
    }
    badge.title = resultTooltip(result, category, year);
    badge.setAttribute("aria-label", badge.title);
    badge.dataset.scsqOwned = "true";
    if (inline) {
      badge.classList.add("scsq-inline-badge");
      badge.dataset.scsqInline = "true";
    }
    return badge;
  }

  function makePercentileScale(result, category, { compact = false } = {}) {
    const percentile = calculator.parsePercentile(result?.percentile);
    const scale = createElement(
      "span",
      `scsq-percentile-scale${compact ? " scsq-percentile-scale--compact" : ""}${result?.estimated ? " is-estimated" : ""}`
    );
    scale.dataset.scsqScale = "true";
    scale.dir = "ltr";

    const safeCategory = parser.sanitizeText(category, 240) || "this subject category";
    if (percentile === null || !result?.quartile) {
      scale.classList.add("is-unavailable");
      scale.textContent = "Percentile position unavailable";
      scale.setAttribute("role", "img");
      scale.setAttribute("aria-label", `Percentile position unavailable for ${safeCategory}.`);
      return scale;
    }

    const estimatedLabel = result.estimated ? "Estimated " : "";
    const accessibleText = `${estimatedLabel}Scopus percentile ${percentile}, ${result.quartile}, ${proximitySummary(result)}, for ${safeCategory}.`;
    scale.style.setProperty("--scsq-percentile-position", `${percentile}%`);
    scale.setAttribute("role", "img");
    scale.setAttribute("aria-label", accessibleText);
    scale.title = accessibleText;

    const track = createElement("span", "scsq-percentile-scale__track");
    [
      ["Q4", "q4", "Percentile 0 to 24"],
      ["Q3", "q3", "Percentile 25 to 49"],
      ["Q2", "q2", "Percentile 50 to 74"],
      ["Q1", "q1", "Percentile 75 to 100"]
    ].forEach(([quartile, className, range]) => {
      const segment = createElement(
        "span",
        `scsq-percentile-scale__segment scsq-percentile-scale__segment--${className}`,
        quartile
      );
      segment.title = `${quartile}: ${range}`;
      segment.setAttribute("aria-hidden", "true");
      track.appendChild(segment);
    });
    const marker = createElement("span", "scsq-percentile-scale__marker");
    marker.setAttribute("aria-hidden", "true");
    track.appendChild(marker);
    scale.appendChild(track);

    if (!compact) {
      const ticks = createElement("span", "scsq-percentile-scale__ticks");
      ["0", "25", "50", "75", "100"].forEach((tick) => {
        ticks.appendChild(createElement("span", "", tick));
      });
      ticks.setAttribute("aria-hidden", "true");
      scale.appendChild(ticks);
    }

    const percentilePrefix = result.estimated ? "≈P" : "P";
    scale.appendChild(createElement(
      "small",
      "scsq-percentile-scale__summary",
      compact
        ? `${percentilePrefix}${percentile}`
        : `${result.estimated ? "Estimated percentile" : "Percentile"} ${percentile} · ${compactProximityText(result)}`
    ));
    return scale;
  }

  function copyText(data, calculatedCategories) {
    const bestItem = bestCategoryItem(calculatedCategories);
    const best = bestItem?.result || null;
    const lines = [
      "Scopus CiteScore Quartile",
      `Source: ${data.title}`,
      `CiteScore year: ${data.year}`,
      `CiteScore value: ${data.citeScore}`,
      `Best CiteScore Quartile: ${best ? `${best.quartile} | ${proximitySummary(best)} | Category: ${bestItem.category}` : "Unable to calculate"}`,
      ""
    ];

    calculatedCategories.forEach(({ category, result }) => {
      const percentile = result.displayedPercentile !== null
        ? `${result.displayedPercentile}%`
        : "Not displayed";
      const rank = result.rank ? `${result.rank.rank}/${result.rank.total}` : "Not displayed";
      const estimatedDetail = result.estimated ? ` | Estimated percentile: ${result.percentile}` : "";
      lines.push(
        `${category} | Percentile: ${percentile} | Rank: ${rank}${estimatedDetail} | ${result.label}: ${result.quartile || "Unable to calculate"} | Position: ${proximitySummary(result)} | Source: ${result.source}`
      );
    });

    lines.push(
      "",
      "This is a CiteScore-based quartile calculated from Scopus percentile data. It is not a JCR or SCImago/SJR quartile. Quartiles may differ by subject category."
    );
    return lines.join("\n");
  }

  async function writeClipboard(text) {
    if (clipboardWriter) {
      await clipboardWriter(text);
      return;
    }
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(text);
      return;
    }
    const textarea = createElement("textarea", "scsq-copy-fallback");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.dataset.scsqOwned = "true";
    document.body.appendChild(textarea);
    textarea.select();
    const succeeded = document.execCommand && document.execCommand("copy");
    textarea.remove();
    if (!succeeded) {
      throw new Error("Clipboard access was unavailable.");
    }
  }

  function buildPanel(data, calculatedCategories, { mobile = false } = {}) {
    const panel = createElement(mobile ? "section" : "aside", mobile ? "scsq-panel scsq-panel--mobile" : "scsq-panel");
    panel.id = mobile ? `${PANEL_ID}-mobile-content` : PANEL_ID;
    panel.dataset.scsqOwned = "true";
    if (!mobile) {
      panel.dataset.scsqPanel = "true";
    }
    panel.setAttribute("aria-labelledby", `${panel.id}-title`);
    panel.setAttribute("role", "region");

    const header = createElement("div", "scsq-panel__header");
    const headingGroup = createElement("div", "scsq-panel__heading-group");
    const heading = createElement("h2", "scsq-panel__title", "Scopus CiteScore Quartile");
    heading.id = `${panel.id}-title`;
    headingGroup.appendChild(heading);
    headingGroup.appendChild(createElement("p", "scsq-panel__source-title", data.title));

    const bestItem = bestCategoryItem(calculatedCategories);
    const best = bestItem?.result || null;
    const bestBox = createElement("div", "scsq-best");
    bestBox.appendChild(createElement("span", "scsq-best__label", "Best CiteScore Quartile:"));
    const bestBadge = makeBadge(
      {
        ...(best || {
          quartile: null,
          percentile: null,
          estimated: false,
          rank: null,
          proximity: null
        })
      },
      bestItem?.category || "all displayed subject categories",
      data.year
    );
    bestBadge.title = best
      ? `Best CiteScore Quartile across the displayed subject categories: ${best.quartile}, from ${bestItem.category}. ${proximitySummary(best)}. CiteScore year ${data.year}.`
      : `Best CiteScore Quartile could not be calculated. CiteScore year ${data.year}.`;
    bestBadge.setAttribute("aria-label", bestBadge.title);
    bestBox.appendChild(bestBadge);
    if (best) {
      bestBox.appendChild(makePercentileScale(best, `Best category: ${bestItem.category}`, { compact: true }));
    }
    header.append(headingGroup, bestBox);
    panel.appendChild(header);

    const metadata = createElement("dl", "scsq-metadata");
    const yearLabel = createElement("dt", "scsq-metadata__label", "CiteScore year");
    const yearValue = createElement("dd", "scsq-metadata__value", data.year);
    const scoreLabel = createElement("dt", "scsq-metadata__label", "CiteScore value");
    const scoreValue = createElement("dd", "scsq-metadata__value", data.citeScore);
    metadata.append(yearLabel, yearValue, scoreLabel, scoreValue);
    panel.appendChild(metadata);

    if (calculatedCategories.length) {
      const tableWrapper = createElement("div", "scsq-table-wrap");
      const table = createElement("table", "scsq-table");
      const caption = createElement("caption", "scsq-visually-hidden", "Category-specific CiteScore quartiles");
      const head = document.createElement("thead");
      const headerRow = document.createElement("tr");
      ["Subject category", "Displayed percentile", "Rank", "Quartile", "Calculation source"].forEach((label) => {
        const cell = createElement("th", "", label);
        cell.scope = "col";
        headerRow.appendChild(cell);
      });
      head.appendChild(headerRow);
      const body = document.createElement("tbody");

      calculatedCategories.forEach(({ category, result }) => {
        const row = document.createElement("tr");
        const categoryCell = createElement("th", "scsq-table__category", category);
        categoryCell.scope = "row";
        const percentileText = result.displayedPercentile !== null
          ? `${result.displayedPercentile}%`
          : "Not displayed";
        const percentileCell = createElement("td", "", percentileText);
        percentileCell.dataset.label = "Displayed percentile";
        const rankCell = createElement(
          "td",
          "",
          result.rank ? `${result.rank.rank}/${result.rank.total}` : "Not displayed"
        );
        rankCell.dataset.label = "Rank";
        const quartileCell = document.createElement("td");
        quartileCell.className = "scsq-table__quartile";
        quartileCell.dataset.label = "Quartile";
        quartileCell.appendChild(makeBadge(result, category, data.year));
        if (result.estimated) {
          quartileCell.appendChild(createElement("span", "scsq-quartile-type", "Estimated CiteScore Quartile"));
        }
        quartileCell.appendChild(makePercentileScale(result, category));
        const calculationCell = createElement(
          "td",
          result.estimated ? "scsq-calculation scsq-calculation--estimated" : "scsq-calculation"
        );
        calculationCell.dataset.label = "Calculation source";
        calculationCell.appendChild(createElement("span", "scsq-calculation__source", result.source));
        if (result.estimated) {
          calculationCell.appendChild(createElement(
            "small",
            "scsq-calculation__detail",
            `Estimated percentile: ${result.percentile}`
          ));
        }
        row.append(categoryCell, percentileCell, rankCell, quartileCell, calculationCell);
        body.appendChild(row);
      });

      table.append(caption, head, body);
      tableWrapper.appendChild(table);
      panel.appendChild(tableWrapper);
    } else {
      panel.appendChild(createElement(
        "p",
        "scsq-empty",
        "No visible subject-category percentile or rank information could be read on this page."
      ));
    }

    const actions = createElement("div", "scsq-actions");
    const copyButton = createElement("button", "scsq-copy-button", "Copy results");
    copyButton.type = "button";
    copyButton.setAttribute("aria-label", "Copy all category-specific CiteScore quartile results");
    const copyStatus = createElement("span", "scsq-copy-status");
    copyStatus.setAttribute("role", "status");
    copyStatus.setAttribute("aria-live", "polite");
    copyButton.addEventListener("click", async () => {
      try {
        await writeClipboard(copyText(data, calculatedCategories));
        copyStatus.textContent = "Copied.";
      } catch (_error) {
        copyStatus.textContent = "Could not copy. Check browser clipboard permission.";
      }
      globalScope.setTimeout(() => {
        copyStatus.textContent = "";
      }, 2500);
    });
    actions.append(copyButton, copyStatus);
    panel.appendChild(actions);

    panel.appendChild(createElement(
      "p",
      "scsq-proximity-note",
      "Distance to the next better quartile is the percentile-point gap from the displayed percentile to that quartile's threshold. Rank-based distances are estimates and do not predict future movement."
    ));

    panel.appendChild(createElement(
      "p",
      "scsq-note",
      "This is a CiteScore-based quartile calculated from Scopus percentile data. It is not a JCR or SCImago/SJR quartile. Quartiles may differ by subject category."
    ));
    return panel;
  }

  function setMobileDrawerOpen(open, layer = document.getElementById(MOBILE_LAYER_ID)) {
    if (!layer) {
      return;
    }
    const drawer = layer.querySelector(`#${MOBILE_DRAWER_ID}`);
    const backdrop = layer.querySelector(".scsq-mobile-backdrop");
    const fab = layer.querySelector(".scsq-mobile-fab");
    const closeButton = layer.querySelector(".scsq-mobile-close");
    mobileDrawerOpen = Boolean(open);
    drawer?.classList.toggle("is-open", mobileDrawerOpen);
    backdrop?.classList.toggle("is-open", mobileDrawerOpen);
    drawer?.setAttribute("aria-hidden", String(!mobileDrawerOpen));
    fab?.setAttribute("aria-expanded", String(mobileDrawerOpen));
    if (mobileDrawerOpen) {
      lastFocusedElement = document.activeElement;
      globalScope.requestAnimationFrame(() => closeButton?.focus());
    } else if (lastFocusedElement instanceof HTMLElement && lastFocusedElement.isConnected) {
      lastFocusedElement.focus();
    }
  }

  function buildMobileLayer(data, calculatedCategories) {
    const layer = createElement("div", "scsq-mobile-layer");
    layer.id = MOBILE_LAYER_ID;
    layer.dataset.scsqOwned = "true";
    layer.dataset.scsqPanel = "true";

    const bestItem = bestCategoryItem(calculatedCategories);
    const best = bestItem?.result || null;
    const fab = createElement("button", "scsq-mobile-fab");
    fab.type = "button";
    fab.setAttribute("aria-controls", MOBILE_DRAWER_ID);
    fab.setAttribute("aria-expanded", String(mobileDrawerOpen));
    fab.setAttribute(
      "aria-label",
      `Open category-specific CiteScore quartile results. Best result: ${best ? `${best.quartile}. ${proximitySummary(best)}.` : "unavailable."}${version ? ` Version ${version}.` : ""}`
    );
    const fabQuartile = createElement(
      "span",
      `scsq-mobile-fab__quartile scsq-mobile-fab__quartile--${best ? best.quartile.toLowerCase() : "unknown"}`
    );
    fabQuartile.append(
      createElement("span", "scsq-mobile-fab__quartile-value", best?.quartile || "Q?"),
      createElement("small", "scsq-mobile-fab__proximity", best ? compactProximityText(best) : "unavailable"),
      createElement("small", "scsq-mobile-fab__version", version ? `v${version}` : "")
    );
    const fabSummary = createElement("span", "scsq-mobile-fab__summary");
    fabSummary.appendChild(createElement("span", "scsq-mobile-fab__label", "Best category"));
    if (best) {
      fabSummary.appendChild(makePercentileScale(best, `Best category: ${bestItem.category}`, { compact: true }));
    } else {
      fabSummary.appendChild(createElement("small", "scsq-mobile-fab__unavailable", "No percentile"));
    }
    fab.append(fabQuartile, fabSummary);

    const backdrop = createElement("button", "scsq-mobile-backdrop");
    backdrop.type = "button";
    backdrop.tabIndex = -1;
    backdrop.setAttribute("aria-label", "Close CiteScore quartile results");
    backdrop.classList.toggle("is-open", mobileDrawerOpen);

    const drawer = createElement("aside", "scsq-mobile-drawer");
    drawer.id = MOBILE_DRAWER_ID;
    drawer.classList.toggle("is-open", mobileDrawerOpen);
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.setAttribute("aria-hidden", String(!mobileDrawerOpen));
    drawer.setAttribute("aria-labelledby", `${MOBILE_DRAWER_ID}-title`);

    const drawerHeader = createElement("header", "scsq-mobile-drawer__header");
    const drawerTitle = createElement("h2", "scsq-mobile-drawer__title", "CiteScore quartile results");
    drawerTitle.id = `${MOBILE_DRAWER_ID}-title`;
    const closeButton = createElement("button", "scsq-mobile-close", "Close");
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Close CiteScore quartile results");
    drawerHeader.append(drawerTitle, closeButton);

    const settingsRow = createElement("label", "scsq-mobile-setting");
    const inlineToggle = document.createElement("input");
    inlineToggle.type = "checkbox";
    inlineToggle.checked = settings.showInlineBadges;
    inlineToggle.setAttribute("aria-label", "Show inline CiteScore quartile badges");
    settingsRow.append(
      createElement("span", "scsq-mobile-setting__label", "Show inline badges"),
      inlineToggle
    );

    const scrollArea = createElement("div", "scsq-mobile-drawer__scroll");
    scrollArea.append(settingsRow, buildPanel(data, calculatedCategories, { mobile: true }));
    drawer.append(drawerHeader, scrollArea);
    layer.append(backdrop, fab, drawer);

    fab.addEventListener("click", () => setMobileDrawerOpen(true, layer));
    closeButton.addEventListener("click", () => setMobileDrawerOpen(false, layer));
    backdrop.addEventListener("click", () => setMobileDrawerOpen(false, layer));
    inlineToggle.addEventListener("change", async () => {
      inlineToggle.disabled = true;
      try {
        await settingsStore.set({ showInlineBadges: inlineToggle.checked });
        settings.showInlineBadges = inlineToggle.checked;
        lastSignature = "";
        updatePage(true);
      } finally {
        inlineToggle.disabled = false;
      }
    });
    drawer.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileDrawerOpen(false, layer);
      }
    });
    return layer;
  }

  function insertPanel(panel, anchor) {
    if (anchor && anchor.parentNode) {
      if (typeof anchor.insertAdjacentElement === "function") {
        anchor.insertAdjacentElement("afterend", panel);
      } else {
        anchor.parentNode.insertBefore(panel, anchor.nextSibling);
      }
      return;
    }
    const fallback = document.querySelector("main, [role='main']") || document.body;
    fallback.appendChild(panel);
  }

  function insertMobileLayer(layer) {
    (document.body || document.documentElement).appendChild(layer);
  }

  function insertInlineBadge(target, badge) {
    if (!target || !target.isConnected) {
      return false;
    }
    if (target.matches("td, th, dd, [role='cell']")) {
      target.appendChild(badge);
    } else if (typeof target.insertAdjacentElement === "function") {
      target.insertAdjacentElement("afterend", badge);
    } else if (target.parentNode) {
      target.parentNode.insertBefore(badge, target.nextSibling);
    } else {
      return false;
    }
    return true;
  }

  function inlineTargetFor(item) {
    return item.result.estimated
      ? (item.original.rankElement || item.original.percentileElement)
      : (item.original.percentileElement || item.original.rankElement);
  }

  function signatureFor(data, calculatedCategories) {
    return JSON.stringify({
      mode: isUserscript ? "userscript" : "desktop",
      settings,
      title: data.title,
      year: data.year,
      citeScore: data.citeScore,
      categories: calculatedCategories.map(({ category, result }) => ({
        category,
        percentile: result.displayedPercentile,
        rank: result.rank,
        quartile: result.quartile,
        source: result.source
      }))
    });
  }

  function uiIsHealthy(calculatedCategories) {
    const panelCount = document.querySelectorAll(`[data-scsq-panel='true']`).length;
    const expectedPanelCount = isUserscript ? 1 : (settings.showPanel ? 1 : 0);
    if (panelCount !== expectedPanelCount) {
      return false;
    }
    const expectedBadges = settings.showInlineBadges
      ? calculatedCategories.filter((item) => inlineTargetFor(item)).length
      : 0;
    return document.querySelectorAll(INLINE_SELECTOR).length === expectedBadges;
  }

  function updatePage(force = false) {
    if (rendering) {
      return;
    }
    rendering = true;
    try {
      if (!settings.enabled) {
        removeExtensionUi();
        lastSignature = "disabled";
        return;
      }

      const data = parser.parseDocument(document);
      if (!data.hasCiteScoreContext) {
        removeExtensionUi();
        lastSignature = "no-context";
        return;
      }

      const calculatedCategories = data.categories.map((category) => ({
        category: parser.sanitizeText(category.category, 240),
        original: category,
        result: calculator.calculateCategory(category)
      }));
      const signature = signatureFor(data, calculatedCategories);
      if (!force && signature === lastSignature && uiIsHealthy(calculatedCategories)) {
        return;
      }

      removePanels();
      removeInlineBadges();
      if (isUserscript) {
        insertMobileLayer(buildMobileLayer(data, calculatedCategories));
      } else if (settings.showPanel) {
        insertPanel(buildPanel(data, calculatedCategories), data.anchor);
      }
      if (settings.showInlineBadges) {
        calculatedCategories.forEach((item) => {
          const { category, result } = item;
          const target = inlineTargetFor(item);
          insertInlineBadge(target, makeBadge(result, category, data.year, true));
        });
      }
      lastSignature = signature;
    } finally {
      rendering = false;
    }
  }

  function scheduleUpdate() {
    globalScope.clearTimeout(debounceTimer);
    debounceTimer = globalScope.setTimeout(() => updatePage(false), DEBOUNCE_MS);
  }

  async function loadSettings(callback) {
    settings = await settingsStore.get(DEFAULT_SETTINGS);
    callback();
  }

  function start() {
    observer = new MutationObserver((mutations) => {
      const hasPageMutation = mutations.some((mutation) => {
        const target = mutation.target.nodeType === 1 ? mutation.target : mutation.target.parentElement;
        return !target || !target.closest || !target.closest(OWNED_SELECTOR);
      });
      if (hasPageMutation) {
        scheduleUpdate();
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["aria-selected", "aria-pressed", "aria-expanded", "selected", "value"]
    });
    document.addEventListener("change", scheduleUpdate, true);
    document.addEventListener("click", scheduleUpdate, true);
    document.addEventListener("keydown", (event) => {
      if (isUserscript && event.key === "Escape" && mobileDrawerOpen) {
        setMobileDrawerOpen(false);
      }
    }, true);

    settingsStore.subscribe((changes) => {
      for (const key of Object.keys(DEFAULT_SETTINGS)) {
        if (Object.prototype.hasOwnProperty.call(changes, key)) {
          settings[key] = changes[key];
        }
      }
      lastSignature = "";
      updatePage(true);
    });
    updatePage(true);
  }

  void loadSettings(() => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
      start();
    }
  });

  const api = Object.freeze({
    refresh: () => updatePage(true),
    scheduleUpdate,
    openMobilePanel: () => setMobileDrawerOpen(true),
    closeMobilePanel: () => setMobileDrawerOpen(false)
  });
  globalScope[loadedKey] = api;
  return api;
}
