"use strict";

import * as calculator from "./quartile-calculator.js";

  const CATEGORY_LABEL = /^(?:in\s+categor(?:y|ies)|subject\s+(?:category|field)|category)$/i;
  const PERCENTILE_LABEL = /^(?:citescore\s+)?percentile$/i;
  const RANK_LABEL = /^(?:citescore\s+)?rank$/i;

  function sanitizeText(value, maxLength = 500) {
    if (value === null || value === undefined) {
      return "";
    }

    return String(value)
      .normalize("NFKC")
      .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2060-\u206f]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength);
  }

  function elementText(element, maxLength = 2000) {
    if (!element) {
      return "";
    }
    if (element.querySelector && element.querySelector("[data-scsq-owned]")) {
      const clone = element.cloneNode(true);
      clone.querySelectorAll("[data-scsq-owned]").forEach((owned) => owned.remove());
      return sanitizeText(clone.textContent || "", maxLength);
    }
    return sanitizeText(element.innerText || element.textContent || "", maxLength);
  }

  function isVisible(element) {
    if (!element || element.nodeType !== 1) {
      return false;
    }
    if (element.closest("[data-scsq-owned], [hidden], [aria-hidden='true'], template, script, style, noscript")) {
      return false;
    }
    const view = element.ownerDocument && element.ownerDocument.defaultView;
    if (view && typeof view.getComputedStyle === "function") {
      const style = view.getComputedStyle(element);
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
        return false;
      }
    }
    return true;
  }

  function semanticElementText(element, maxLength = 2500) {
    const parts = [elementText(element, maxLength)];
    if (element && element.querySelectorAll) {
      element.querySelectorAll("[aria-label], [title]").forEach((candidate) => {
        if (!isVisible(candidate)) {
          return;
        }
        parts.push(candidate.getAttribute("aria-label") || candidate.getAttribute("title") || "");
      });
    }
    return sanitizeText(parts.join(" "), maxLength);
  }

  function parsePercentileFromText(value) {
    const text = sanitizeText(value, 1000);
    const patterns = [
      /\bpercentile\s*:?\s*(100|\d{1,2})(?:st|nd|rd|th)?\s*%?/i,
      /\b(100|\d{1,2})(?:st|nd|rd|th)?\s*%?\s*(?:citescore\s+)?percentile\b/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return calculator.parsePercentile(match[1]);
      }
    }
    return null;
  }

  function parseRankFromText(value) {
    const text = sanitizeText(value, 1000);
    const match = text.match(
      /\b(?:rank\s*:?\s*#?\s*)?(\d+)\s*(?:\/|out\s+of|of)\s*(\d+)\b/i
    );
    return match ? calculator.validateRank(Number(match[1]), Number(match[2])) : null;
  }

  function directLabelText(element) {
    const ariaLabel = sanitizeText(element && element.getAttribute && element.getAttribute("aria-label"), 120);
    if (ariaLabel) {
      return ariaLabel;
    }
    const title = sanitizeText(element && element.getAttribute && element.getAttribute("title"), 120);
    if (title) {
      return title;
    }
    return elementText(element, 120);
  }

  function findSemanticRegion(documentRef) {
    const headingCandidates = Array.from(
      documentRef.querySelectorAll("h1, h2, h3, h4, h5, h6, [role='heading'], [aria-label]")
    ).filter(isVisible);

    for (const heading of headingCandidates) {
      const label = directLabelText(heading);
      if (!/(?:citescore\s+rank|rank\s*&\s*trend)/i.test(label)) {
        continue;
      }

      let current = heading;
      let fallback = heading.parentElement;
      for (let depth = 0; current && depth < 8; depth += 1, current = current.parentElement) {
        const text = elementText(current, 50000);
        if (/in\s+category|subject\s+(?:category|field)/i.test(text) && /percentile|\brank\b/i.test(text)) {
          return current;
        }
        if (current.matches && current.matches("section, article, [role='region']")) {
          fallback = current;
        }
      }
      if (fallback) {
        return fallback;
      }
    }

    const tables = Array.from(documentRef.querySelectorAll("table, [role='table']")).filter(isVisible);
    for (const table of tables) {
      const text = elementText(table, 10000);
      if (/percentile/i.test(text) && /(?:in\s+category|subject\s+(?:category|field))/i.test(text)) {
        return table.closest("section, article, [role='region']") || table;
      }
    }

    return null;
  }

  function findExactLabel(root, pattern) {
    const candidates = root.querySelectorAll(
      "dt, th, label, [role='columnheader'], [role='rowheader'], span, strong, p, div, [aria-label]"
    );
    return Array.from(candidates).find((element) => {
      if (!isVisible(element)) {
        return false;
      }
      const text = directLabelText(element);
      return text.length <= 80 && pattern.test(text);
    }) || null;
  }

  function valueBesideLabel(labelElement) {
    if (!labelElement) {
      return { text: "", element: null };
    }

    if (labelElement.tagName === "DT" && labelElement.nextElementSibling) {
      return {
        text: elementText(labelElement.nextElementSibling, 300),
        element: labelElement.nextElementSibling
      };
    }

    if (labelElement.tagName === "LABEL") {
      const controlId = labelElement.getAttribute("for");
      const control = controlId ? labelElement.ownerDocument.getElementById(controlId) : null;
      if (control) {
        const value = control.selectedOptions && control.selectedOptions.length
          ? elementText(control.selectedOptions[0], 300)
          : sanitizeText(control.value || elementText(control, 300), 300);
        return { text: value, element: control };
      }
    }

    if (labelElement.nextElementSibling) {
      return {
        text: elementText(labelElement.nextElementSibling, 300),
        element: labelElement.nextElementSibling
      };
    }

    const parent = labelElement.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter((child) => child !== labelElement && isVisible(child));
      if (siblings.length) {
        return { text: elementText(siblings[0], 300), element: siblings[0] };
      }
    }

    return { text: "", element: null };
  }

  function extractCategoryFromBlock(block) {
    const exactLabel = findExactLabel(block, CATEGORY_LABEL);
    const beside = valueBesideLabel(exactLabel);
    if (beside.text && !CATEGORY_LABEL.test(beside.text)) {
      return sanitizeText(beside.text, 240);
    }

    const text = elementText(block, 2000);
    const match = text.match(
      /(?:in\s+categor(?:y|ies)|subject\s+(?:category|field)|category)\s*:?\s*(.+?)(?=\s+(?:(?:citescore\s+)?percentile|(?:citescore\s+)?rank)\b|$)/i
    );
    return match ? sanitizeText(match[1], 240) : "";
  }

  function findValueElement(block, type, expectedValue) {
    const candidates = [block, ...block.querySelectorAll("td, dd, output, span, strong, p, div, [aria-label]")];
    for (const element of candidates) {
      if (!isVisible(element)) {
        continue;
      }
      const text = directLabelText(element);
      if (!text || text.length > 140) {
        continue;
      }
      if (type === "percentile") {
        const parsed = parsePercentileFromText(text) ?? calculator.parsePercentile(text);
        if (parsed !== null && parsed === expectedValue) {
          return element;
        }
      } else {
        const parsed = parseRankFromText(text) || calculator.parseRank(text);
        if (parsed && parsed.rank === expectedValue.rank && parsed.total === expectedValue.total) {
          return element;
        }
      }
    }
    return null;
  }

  function tableHeaderIndex(headers, pattern, excludedPattern) {
    return headers.findIndex((header) => pattern.test(header) && (!excludedPattern || !excludedPattern.test(header)));
  }

  function extractFromTables(root) {
    const categories = [];
    const tables = root.matches && root.matches("table, [role='table']")
      ? [root, ...root.querySelectorAll("table, [role='table']")]
      : Array.from(root.querySelectorAll("table, [role='table']"));

    for (const table of tables) {
      if (!isVisible(table)) {
        continue;
      }
      const rows = Array.from(table.querySelectorAll("tr, [role='row']")).filter(isVisible);
      if (rows.length < 2) {
        continue;
      }
      const headers = Array.from(rows[0].querySelectorAll("th, td, [role='columnheader'], [role='cell']"))
        .map((cell) => elementText(cell, 160).toLowerCase());
      const categoryIndex = tableHeaderIndex(headers, /in\s+category|subject\s+(?:category|field)|^category$/);
      const percentileIndex = tableHeaderIndex(headers, /percentile/);
      const rankIndex = tableHeaderIndex(headers, /rank/, /percentile/);
      if (categoryIndex < 0 || (percentileIndex < 0 && rankIndex < 0)) {
        continue;
      }

      for (const row of rows.slice(1)) {
        const cells = Array.from(row.querySelectorAll("th, td, [role='rowheader'], [role='cell']"));
        const categoryCell = cells[categoryIndex];
        if (!categoryCell) {
          continue;
        }
        const category = elementText(categoryCell, 240);
        if (!category || CATEGORY_LABEL.test(category)) {
          continue;
        }
        const percentileCell = percentileIndex >= 0 ? cells[percentileIndex] : null;
        const rankCell = rankIndex >= 0 ? cells[rankIndex] : null;
        const percentileText = percentileCell ? elementText(percentileCell, 160) : "";
        const rankText = rankCell ? elementText(rankCell, 160) : "";
        const percentile = calculator.parsePercentile(percentileText) ?? parsePercentileFromText(percentileText);
        const rank = calculator.parseRank(rankText) || parseRankFromText(rankText);
        categories.push({
          category: sanitizeText(category, 240),
          percentile,
          rank,
          percentileElement: percentileCell,
          rankElement: rankCell,
          sourceElement: row
        });
      }
    }
    return categories;
  }

  function extractFromBlocks(root) {
    const selector = "section, article, li, dl, fieldset, [role='listitem'], [role='group'], div";
    const candidates = Array.from(root.querySelectorAll(selector)).filter((element) => {
      if (!isVisible(element)) {
        return false;
      }
      const text = semanticElementText(element, 2500);
      return text.length <= 2000 &&
        /(?:in\s+categor(?:y|ies)|subject\s+(?:category|field))/i.test(text) &&
        /(?:percentile|\brank\b)/i.test(text);
    });

    const minimalCandidates = candidates.filter((candidate) =>
      !candidates.some((other) => other !== candidate && candidate.contains(other))
    );

    return minimalCandidates.map((block) => {
      const text = semanticElementText(block, 2500);
      const category = extractCategoryFromBlock(block);
      const percentileLabel = findExactLabel(block, PERCENTILE_LABEL);
      const percentileBeside = valueBesideLabel(percentileLabel);
      const percentile = calculator.parsePercentile(percentileBeside.text) ?? parsePercentileFromText(text);
      const rankLabel = findExactLabel(block, RANK_LABEL);
      const rankBeside = valueBesideLabel(rankLabel);
      const rank = calculator.parseRank(rankBeside.text) || parseRankFromText(text);
      return {
        category,
        percentile,
        rank,
        percentileElement: percentile !== null
          ? (percentileBeside.element || findValueElement(block, "percentile", percentile))
          : (percentileBeside.element || null),
        rankElement: rank
          ? (rankBeside.element || findValueElement(block, "rank", rank))
          : (rankBeside.element || null),
        sourceElement: block
      };
    }).filter((item) => item.category);
  }

  function deduplicateCategories(categories) {
    const merged = new Map();
    for (const item of categories) {
      const key = sanitizeText(item.category, 240).toLocaleLowerCase();
      if (!key) {
        continue;
      }
      const current = merged.get(key);
      if (!current) {
        merged.set(key, item);
        continue;
      }

      const currentHasPercentile = current.percentile !== null && current.percentile !== undefined;
      const itemHasPercentile = item.percentile !== null && item.percentile !== undefined;
      if (!currentHasPercentile && itemHasPercentile) {
        merged.set(key, { ...current, ...item, rank: item.rank || current.rank });
      } else if (!current.rank && item.rank) {
        merged.set(key, { ...current, rank: item.rank, rankElement: item.rankElement || current.rankElement });
      }
    }
    return Array.from(merged.values());
  }

  function extractTitle(documentRef) {
    const candidates = [
      documentRef.querySelector("main h1"),
      documentRef.querySelector("h1"),
      documentRef.querySelector("[role='main'] [role='heading'][aria-level='1']"),
      documentRef.querySelector("meta[property='og:title']")
    ];
    for (const element of candidates) {
      if (!element) {
        continue;
      }
      const raw = element.tagName === "META" ? element.getAttribute("content") : elementText(element, 300);
      const title = sanitizeText(raw, 300).replace(/\s*[|–-]\s*Scopus\s*$/i, "");
      if (title && !/^scopus$/i.test(title)) {
        return title;
      }
    }
    return "Source title unavailable";
  }

  function extractYear(root, documentRef) {
    const selects = Array.from(documentRef.querySelectorAll("select")).filter(isVisible);
    for (const select of selects) {
      const aria = sanitizeText(select.getAttribute("aria-label"), 160);
      const id = select.id;
      const label = id ? documentRef.querySelector(`label[for="${CSS.escape(id)}"]`) : null;
      const context = `${aria} ${elementText(label, 160)}`;
      if (/citescore.*year|rank.*year|^year$/i.test(context)) {
        const value = select.selectedOptions && select.selectedOptions.length
          ? elementText(select.selectedOptions[0], 80)
          : sanitizeText(select.value, 80);
        const match = value.match(/\b(19|20)\d{2}\b/);
        if (match) {
          return match[0];
        }
      }
    }

    const selectedYears = Array.from(
      root.querySelectorAll("[aria-selected='true'], [aria-pressed='true'], option:checked")
    ).filter(isVisible);
    for (const element of selectedYears) {
      const match = elementText(element, 100).match(/\b(19|20)\d{2}\b/);
      if (match) {
        return match[0];
      }
    }

    const text = elementText(root, 50000);
    const match = text.match(/(?:citescore(?:\s+rank)?\s+year|citescore)\s*:?\s*((?:19|20)\d{2})\b/i);
    return match ? match[1] : "Unavailable";
  }

  function extractCiteScore(documentRef) {
    const labels = Array.from(documentRef.querySelectorAll("dt, label, h2, h3, h4, span, strong, p, div"))
      .filter(isVisible);
    for (const label of labels) {
      const text = elementText(label, 80);
      if (!/^citescore(?:\s+value)?$/i.test(text)) {
        continue;
      }
      const beside = valueBesideLabel(label);
      const match = beside.text.match(/^\s*(\d+(?:\.\d+)?)\s*$/);
      if (match) {
        return match[1];
      }
    }
    return "Unavailable";
  }

  function parseDocument(documentRef) {
    if (!documentRef || typeof documentRef.querySelectorAll !== "function") {
      return {
        title: "Source title unavailable",
        year: "Unavailable",
        citeScore: "Unavailable",
        categories: [],
        anchor: null
      };
    }

    const region = findSemanticRegion(documentRef);
    const categories = region
      ? deduplicateCategories([...extractFromTables(region), ...extractFromBlocks(region)])
      : [];

    return {
      title: extractTitle(documentRef),
      year: region ? extractYear(region, documentRef) : "Unavailable",
      citeScore: extractCiteScore(documentRef),
      categories,
      anchor: region,
      hasCiteScoreContext: Boolean(region)
    };
  }

export {
  sanitizeText,
  isVisible,
  semanticElementText,
  parsePercentileFromText,
  parseRankFromText,
  parseDocument
};
