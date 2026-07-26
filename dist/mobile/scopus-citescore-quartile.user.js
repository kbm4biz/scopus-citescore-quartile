// ==UserScript==
// @name         Scopus CiteScore Quartile
// @namespace    scopus-citescore-quartile
// @version      2.0.1
// @author       Local build
// @description  Shows category-specific Scopus CiteScore Quartiles with a mobile floating panel.
// @homepage     https://kbm4biz.github.io/scopus-citescore-quartile/
// @homepageURL  https://kbm4biz.github.io/scopus-citescore-quartile/
// @source       https://github.com/kbm4biz/scopus-citescore-quartile
// @match        https://www.scopus.com/sourceid/*
// @grant        GM_addStyle
// @grant        GM_addValueChangeListener
// @grant        GM_getValue
// @grant        GM_removeValueChangeListener
// @grant        GM_setClipboard
// @grant        GM_setValue
// @run-at       document-idle
// @noframes
// ==/UserScript==

(function() {
	"use strict";
	var s = new Set();
	var _css = async (t) => {
		if (s.has(t)) return;
		s.add(t);
		((c) => {
			if (typeof GM_addStyle === "function") GM_addStyle(c);
			else (document.head || document.documentElement).appendChild(document.createElement("style")).append(c);
		})(t);
	};
	var _GM_addValueChangeListener = (() => typeof GM_addValueChangeListener != "undefined" ? GM_addValueChangeListener : void 0)();
	var _GM_getValue = (() => typeof GM_getValue != "undefined" ? GM_getValue : void 0)();
	var _GM_removeValueChangeListener = (() => typeof GM_removeValueChangeListener != "undefined" ? GM_removeValueChangeListener : void 0)();
	var _GM_setClipboard = (() => typeof GM_setClipboard != "undefined" ? GM_setClipboard : void 0)();
	var _GM_setValue = (() => typeof GM_setValue != "undefined" ? GM_setValue : void 0)();
	var package_default = {
		name: "scopus-citescore-quartile",
		version: "2.0.1",
		"private": true,
		type: "module",
		description: "One Vite codebase that builds a Manifest V3 Chrome extension and a mobile userscript.",
		homepage: "https://kbm4biz.github.io/scopus-citescore-quartile/",
		repository: {
			"type": "git",
			"url": "https://github.com/kbm4biz/scopus-citescore-quartile"
		},
		packageManager: "pnpm@11.9.0",
		engines: { "node": ">=20.19.0" },
		scripts: {
			"build": "pnpm run build:desktop && pnpm run build:mobile",
			"build:desktop": "vite build --config vite.desktop.config.js && node scripts/finish-desktop-build.mjs",
			"build:mobile": "vite build --config vite.mobile.config.js && node scripts/write-mobile-index.mjs",
			"test": "pnpm run build && node --test tests/*.test.js && node tests/browser-tests.mjs",
			"test:unit": "node --test tests/*.test.js",
			"test:browser": "node tests/browser-tests.mjs"
		},
		devDependencies: {
			"vite": "8.1.5",
			"vite-plugin-monkey": "8.1.0"
		}
	};
	_css(".scsq-panel,.scsq-panel *,.scsq-badge{box-sizing:border-box}.scsq-panel{--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light;direction:inherit;color:#172b35;border:1px solid #b8ccd4;text-align:start;background:#fff;border-inline-start:5px solid #006b73;border-radius:10px;max-inline-size:100%;margin-block-start:1.25rem;margin-block-end:1.25rem;margin-inline-start:0;margin-inline-end:0;padding:1.25rem;font-family:Arial,Segoe UI,Tahoma,sans-serif;font-size:14px;line-height:1.45;display:block;box-shadow:0 4px 16px #1034401f}.scsq-panel__header{flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:1rem;margin-block-end:1rem;display:flex}.scsq-panel__heading-group{flex:20rem;min-inline-size:0}.scsq-panel__title{color:#0f3c47;margin:0;font:700 1.25rem/1.3 Arial,Segoe UI,Tahoma,sans-serif}.scsq-panel__source-title{overflow-wrap:anywhere;color:#3a5059;unicode-bidi:plaintext;margin-block-start:.3rem;margin-block-end:0;margin-inline-start:0;margin-inline-end:0;font-weight:600}.scsq-best{background:#edf7f6;border:1px solid #a7d7d2;border-radius:8px;align-items:center;gap:.5rem;padding-block-start:.55rem;padding-block-end:.55rem;padding-inline-start:.7rem;padding-inline-end:.7rem;display:inline-flex}.scsq-best__label{font-weight:700}.scsq-metadata{background:#f3f7f8;border-radius:7px;grid-template-columns:max-content minmax(4rem,auto) max-content minmax(4rem,auto);gap:.35rem .65rem;margin-block-start:0;margin-block-end:1rem;margin-inline-start:0;margin-inline-end:0;padding:.65rem;display:grid}.scsq-metadata__label{color:#425961;font-weight:700}.scsq-metadata__value{unicode-bidi:plaintext;margin:0}.scsq-table-wrap{border:1px solid #cedde2;border-radius:8px;max-inline-size:100%;overflow-x:auto}.scsq-table{width:100%;border-collapse:collapse;color:#172b35;min-inline-size:46rem;font:400 .9rem/1.4 Arial,Segoe UI,Tahoma,sans-serif}.scsq-table th,.scsq-table td{text-align:start;vertical-align:middle;unicode-bidi:plaintext;border-block-end:1px solid #dce7ea;padding-block-start:.65rem;padding-block-end:.65rem;padding-inline-start:.7rem;padding-inline-end:.7rem}.scsq-table thead th{color:#fff;background:#155766;font-weight:700}.scsq-table tbody tr:last-child>*{border-block-end:0}.scsq-table tbody tr:nth-child(2n){background:#f6f9fa}.scsq-table__category{min-inline-size:15rem;font-weight:600}.scsq-calculation{color:#30474f;min-inline-size:12rem}.scsq-quartile-type,.scsq-calculation__detail{margin-block-start:.3rem;font-size:.75rem;line-height:1.25;display:block}.scsq-quartile-type{color:#6b4300;font-weight:700}.scsq-calculation__source{font-weight:600}.scsq-calculation__detail{color:#594514}.scsq-calculation--estimated{color:#6b4300;font-weight:600}.scsq-badge{color:#fff;letter-spacing:.02em;white-space:nowrap;vertical-align:middle;border:2px solid #0000;border-radius:999px;justify-content:center;align-items:center;min-block-size:1.75rem;min-inline-size:2.55rem;padding-block-start:.2rem;padding-block-end:.2rem;padding-inline-start:.55rem;padding-inline-end:.55rem;font:700 .82rem/1 Arial,Segoe UI,Tahoma,sans-serif;display:inline-flex}.scsq-badge--q1{background:#12663a}.scsq-badge--q2{background:#0b5cab}.scsq-badge--q3{background:#8a4b00}.scsq-badge--q4{background:#b42318}.scsq-badge--unknown{background:#5f6368}.scsq-inline-badge{min-block-size:1.55rem;min-inline-size:2.2rem;margin-inline-start:.45rem;padding-inline-start:.42rem;padding-inline-end:.42rem;font-size:.75rem}.scsq-badge:focus-visible{outline-offset:2px;outline:3px solid #111}.scsq-copy-button:focus-visible{outline-offset:2px;outline:3px solid #111}.scsq-actions{align-items:center;gap:.75rem;margin-block-start:1rem;display:flex}.scsq-copy-button{-webkit-appearance:none;appearance:none;color:#fff;cursor:pointer;background:#006b73;border:2px solid #006b73;border-radius:7px;min-block-size:2.5rem;padding-block-start:.55rem;padding-block-end:.55rem;padding-inline-start:.9rem;padding-inline-end:.9rem;font:700 .9rem/1 Arial,Segoe UI,Tahoma,sans-serif}.scsq-copy-button:hover{background:#004f56;border-color:#004f56}.scsq-copy-status{color:#30474f;min-block-size:1.25rem}.scsq-note,.scsq-empty{color:#3f3600;unicode-bidi:plaintext;background:#fff8d8;border-inline-start:4px solid #8a6200;border-radius:5px;margin-block-start:1rem;margin-block-end:0;margin-inline-start:0;margin-inline-end:0;padding-block-start:.7rem;padding-block-end:.7rem;padding-inline-start:.8rem;padding-inline-end:.8rem}.scsq-empty{color:#3f4c52;background:#f1f4f5;border-inline-start-color:#6b7d85}.scsq-visually-hidden{clip:rect(0, 0, 0, 0)!important;white-space:nowrap!important;border:0!important;block-size:1px!important;inline-size:1px!important;margin:-1px!important;padding:0!important;position:absolute!important;overflow:hidden!important}.scsq-copy-fallback{position:fixed;top:0}.scsq-copy-fallback:not(:-webkit-any(:lang(ae),:lang(ar),:lang(arc),:lang(bcc),:lang(bqi),:lang(ckb),:lang(dv),:lang(fa),:lang(glk),:lang(he),:lang(ku),:lang(mzn),:lang(nqo),:lang(pnb),:lang(ps),:lang(sd),:lang(ug),:lang(ur),:lang(yi))){left:-9999px}.scsq-copy-fallback:not(:is(:lang(ae),:lang(ar),:lang(arc),:lang(bcc),:lang(bqi),:lang(ckb),:lang(dv),:lang(fa),:lang(glk),:lang(he),:lang(ku),:lang(mzn),:lang(nqo),:lang(pnb),:lang(ps),:lang(sd),:lang(ug),:lang(ur),:lang(yi))){left:-9999px}.scsq-copy-fallback:-webkit-any(:lang(ae),:lang(ar),:lang(arc),:lang(bcc),:lang(bqi),:lang(ckb),:lang(dv),:lang(fa),:lang(glk),:lang(he),:lang(ku),:lang(mzn),:lang(nqo),:lang(pnb),:lang(ps),:lang(sd),:lang(ug),:lang(ur),:lang(yi)){right:-9999px}.scsq-copy-fallback:is(:lang(ae),:lang(ar),:lang(arc),:lang(bcc),:lang(bqi),:lang(ckb),:lang(dv),:lang(fa),:lang(glk),:lang(he),:lang(ku),:lang(mzn),:lang(nqo),:lang(pnb),:lang(ps),:lang(sd),:lang(ug),:lang(ur),:lang(yi)){right:-9999px}@media (max-width:680px){.scsq-panel{padding:.9rem}.scsq-panel__header{display:block}.scsq-best{margin-block-start:.8rem}.scsq-metadata{grid-template-columns:max-content 1fr}}@media (prefers-reduced-motion:reduce){.scsq-panel *,.scsq-badge{scroll-behavior:auto!important;transition:none!important}}.scsq-mobile-layer,.scsq-mobile-layer *{box-sizing:border-box}.scsq-mobile-fab{z-index:2147483600;color:#fff;cursor:pointer;background:#064f58;border:2px solid #fff;border-radius:999px;align-items:center;gap:.55rem;min-block-size:3.25rem;padding-block-start:.45rem;padding-block-end:.45rem;padding-inline-start:.55rem;padding-inline-end:.85rem;font:700 .9rem/1 Arial,Segoe UI,Tahoma,sans-serif;display:inline-flex;position:fixed;bottom:max(18px, env(safe-area-inset-bottom));box-shadow:0 6px 22px #00000052}.scsq-mobile-fab:not(:-webkit-any(:lang(ae),:lang(ar),:lang(arc),:lang(bcc),:lang(bqi),:lang(ckb),:lang(dv),:lang(fa),:lang(glk),:lang(he),:lang(ku),:lang(mzn),:lang(nqo),:lang(pnb),:lang(ps),:lang(sd),:lang(ug),:lang(ur),:lang(yi))){right:max(16px, env(safe-area-inset-right))}.scsq-mobile-fab:not(:is(:lang(ae),:lang(ar),:lang(arc),:lang(bcc),:lang(bqi),:lang(ckb),:lang(dv),:lang(fa),:lang(glk),:lang(he),:lang(ku),:lang(mzn),:lang(nqo),:lang(pnb),:lang(ps),:lang(sd),:lang(ug),:lang(ur),:lang(yi))){right:max(16px, env(safe-area-inset-right))}.scsq-mobile-fab:-webkit-any(:lang(ae),:lang(ar),:lang(arc),:lang(bcc),:lang(bqi),:lang(ckb),:lang(dv),:lang(fa),:lang(glk),:lang(he),:lang(ku),:lang(mzn),:lang(nqo),:lang(pnb),:lang(ps),:lang(sd),:lang(ug),:lang(ur),:lang(yi)){left:max(16px, env(safe-area-inset-right))}.scsq-mobile-fab:is(:lang(ae),:lang(ar),:lang(arc),:lang(bcc),:lang(bqi),:lang(ckb),:lang(dv),:lang(fa),:lang(glk),:lang(he),:lang(ku),:lang(mzn),:lang(nqo),:lang(pnb),:lang(ps),:lang(sd),:lang(ug),:lang(ur),:lang(yi)){left:max(16px, env(safe-area-inset-right))}.scsq-mobile-fab__quartile{color:#fff;border-radius:1rem;flex-direction:column;justify-content:center;align-items:center;gap:.12rem;min-block-size:2.75rem;min-inline-size:2.75rem;padding-inline-start:.35rem;padding-inline-end:.35rem;font-weight:800;display:inline-flex}.scsq-mobile-fab__quartile-value{font-size:.92rem;line-height:1}.scsq-mobile-fab__version{color:inherit;letter-spacing:0;font-size:.56rem;font-weight:700;line-height:1}.scsq-mobile-fab__quartile--q1{background:#12663a}.scsq-mobile-fab__quartile--q2{background:#0b5cab}.scsq-mobile-fab__quartile--q3{background:#8a4b00}.scsq-mobile-fab__quartile--q4{background:#b42318}.scsq-mobile-fab__quartile--unknown{background:#5f6368}.scsq-mobile-fab:focus-visible{outline-offset:3px;outline:3px solid #111}.scsq-mobile-close:focus-visible{outline-offset:3px;outline:3px solid #111}.scsq-mobile-setting input:focus-visible{outline-offset:3px;outline:3px solid #111}.scsq-mobile-backdrop{z-index:2147483601;opacity:0;pointer-events:none;background:#07191f8a;border:0;block-size:100%;inline-size:100%;padding:0;transition:opacity .18s;display:block;position:fixed;top:0;bottom:0;left:0;right:0}.scsq-mobile-backdrop.is-open{opacity:1;pointer-events:auto}.scsq-mobile-drawer{z-index:2147483602;block-size:100vh;inline-size:min(94vw,500px);color:#172b35;text-align:start;visibility:hidden;background:#f3f7f8;border:0;flex-direction:column;block-size:100dvh;font-family:Arial,Segoe UI,Tahoma,sans-serif;transition:transform .2s,visibility 0s linear .2s;display:flex;position:fixed;top:0;bottom:0;transform:translate(105%);box-shadow:-8px 0 28px #00000047}.scsq-mobile-drawer:not(:-webkit-any(:lang(ae),:lang(ar),:lang(arc),:lang(bcc),:lang(bqi),:lang(ckb),:lang(dv),:lang(fa),:lang(glk),:lang(he),:lang(ku),:lang(mzn),:lang(nqo),:lang(pnb),:lang(ps),:lang(sd),:lang(ug),:lang(ur),:lang(yi))){right:0}.scsq-mobile-drawer:not(:is(:lang(ae),:lang(ar),:lang(arc),:lang(bcc),:lang(bqi),:lang(ckb),:lang(dv),:lang(fa),:lang(glk),:lang(he),:lang(ku),:lang(mzn),:lang(nqo),:lang(pnb),:lang(ps),:lang(sd),:lang(ug),:lang(ur),:lang(yi))){right:0}.scsq-mobile-drawer:-webkit-any(:lang(ae),:lang(ar),:lang(arc),:lang(bcc),:lang(bqi),:lang(ckb),:lang(dv),:lang(fa),:lang(glk),:lang(he),:lang(ku),:lang(mzn),:lang(nqo),:lang(pnb),:lang(ps),:lang(sd),:lang(ug),:lang(ur),:lang(yi)){left:0}.scsq-mobile-drawer:is(:lang(ae),:lang(ar),:lang(arc),:lang(bcc),:lang(bqi),:lang(ckb),:lang(dv),:lang(fa),:lang(glk),:lang(he),:lang(ku),:lang(mzn),:lang(nqo),:lang(pnb),:lang(ps),:lang(sd),:lang(ug),:lang(ur),:lang(yi)){left:0}:-webkit-any(:lang(ae),:lang(ar),:lang(arc),:lang(bcc),:lang(bqi),:lang(ckb),:lang(dv),:lang(fa),:lang(glk),:lang(he),:lang(ku),:lang(mzn),:lang(nqo),:lang(pnb),:lang(ps),:lang(sd),:lang(ug),:lang(ur),:lang(yi)) .scsq-mobile-drawer{transform:translate(-105%);box-shadow:8px 0 28px #00000047}:is(:lang(ae),:lang(ar),:lang(arc),:lang(bcc),:lang(bqi),:lang(ckb),:lang(dv),:lang(fa),:lang(glk),:lang(he),:lang(ku),:lang(mzn),:lang(nqo),:lang(pnb),:lang(ps),:lang(sd),:lang(ug),:lang(ur),:lang(yi)) .scsq-mobile-drawer{transform:translate(-105%);box-shadow:8px 0 28px #00000047}.scsq-mobile-drawer.is-open{visibility:visible;transition:transform .2s;transform:translate(0)}.scsq-mobile-drawer__header{padding-block:max(.8rem, env(safe-area-inset-top)) .8rem;color:#fff;background:#0f5663;justify-content:space-between;align-items:center;gap:.75rem;padding-inline-start:1rem;padding-inline-end:1rem;display:flex}.scsq-mobile-drawer__title{color:inherit;margin:0;font:700 1.05rem/1.3 Arial,Segoe UI,Tahoma,sans-serif}.scsq-mobile-close{color:#0f3c47;cursor:pointer;background:#fff;border:2px solid #fff;border-radius:7px;min-block-size:2.5rem;padding-block-start:.45rem;padding-block-end:.45rem;padding-inline-start:.75rem;padding-inline-end:.75rem;font:700 .86rem/1 Arial,Segoe UI,Tahoma,sans-serif}.scsq-mobile-drawer__scroll{overscroll-behavior:contain;padding-block:.75rem max(1rem, env(safe-area-inset-bottom));flex:auto;padding-inline-start:.75rem;padding-inline-end:.75rem;overflow-y:auto}.scsq-mobile-setting{color:#19343d;background:#fff;border:1px solid #c7d9df;border-radius:8px;justify-content:space-between;align-items:center;gap:1rem;margin-block-end:.75rem;padding-block-start:.7rem;padding-block-end:.7rem;padding-inline-start:.85rem;padding-inline-end:.85rem;font:600 .9rem/1.3 Arial,Segoe UI,Tahoma,sans-serif;display:flex}.scsq-mobile-setting input{accent-color:#006b73;block-size:1.35rem;inline-size:1.35rem}.scsq-panel--mobile{box-shadow:none;border-inline-start-width:4px;border-radius:8px;margin:0;padding:.85rem}.scsq-panel--mobile .scsq-panel__header{display:block}.scsq-panel--mobile .scsq-best{margin-block-start:.7rem}.scsq-panel--mobile .scsq-metadata{grid-template-columns:max-content 1fr}.scsq-panel--mobile .scsq-table{min-inline-size:42rem}@media (max-width:540px){.scsq-mobile-fab__label{display:none}.scsq-mobile-fab{padding-inline-start:.45rem;padding-inline-end:.45rem}.scsq-mobile-drawer{inline-size:100vw}.scsq-panel--mobile .scsq-table-wrap{border:0;overflow:visible}.scsq-panel--mobile .scsq-table,.scsq-panel--mobile .scsq-table tbody,.scsq-panel--mobile .scsq-table tr,.scsq-panel--mobile .scsq-table th,.scsq-panel--mobile .scsq-table td{inline-size:100%;min-inline-size:0;display:block}.scsq-panel--mobile .scsq-table thead{display:none}.scsq-panel--mobile .scsq-table tbody tr{background:#fff;border:1px solid #cedde2;border-radius:8px;margin-block-end:.75rem;overflow:hidden}.scsq-panel--mobile .scsq-table tbody tr:last-child{margin-block-end:0}.scsq-panel--mobile .scsq-table__category{color:#fff;background:#155766;border:0;padding-block-start:.75rem;padding-block-end:.75rem;padding-inline-start:.8rem;padding-inline-end:.8rem}.scsq-panel--mobile .scsq-table td{grid-template-columns:minmax(7.5rem,42%) minmax(0,1fr);align-items:center;gap:.65rem;padding-block-start:.6rem;padding-block-end:.6rem;padding-inline-start:.8rem;padding-inline-end:.8rem;display:grid}.scsq-panel--mobile .scsq-table td:before{content:attr(data-label);color:#425961;font-weight:700}.scsq-panel--mobile .scsq-table td>.scsq-badge{justify-self:start}}@media (prefers-reduced-motion:reduce){.scsq-mobile-backdrop,.scsq-mobile-drawer{transition:none}}");
	var SOURCE_PERCENTILE = "Scopus percentile";
	var SOURCE_RANK = "Estimated from rank";
	function parsePercentile(value) {
		if (typeof value === "number") return Number.isFinite(value) && value >= 0 && value <= 100 ? value : null;
		if (typeof value !== "string") return null;
		const text = value.trim();
		if (!text) return null;
		for (const pattern of [/^(100|\d{1,2})(?:st|nd|rd|th)?\s*(?:%|percentile)?$/i, /^percentile\s*:?[\s\u00a0]*(100|\d{1,2})(?:st|nd|rd|th)?\s*%?$/i]) {
			const match = text.match(pattern);
			if (match) {
				const percentile = Number(match[1]);
				return percentile >= 0 && percentile <= 100 ? percentile : null;
			}
		}
		return null;
	}
	function quartileFromPercentile(value) {
		const percentile = parsePercentile(value);
		if (percentile === null) return null;
		if (percentile >= 75) return "Q1";
		if (percentile >= 50) return "Q2";
		if (percentile >= 25) return "Q3";
		return "Q4";
	}
	function validateRank(rank, total) {
		const parsedRank = typeof rank === "number" ? rank : Number(rank);
		const parsedTotal = typeof total === "number" ? total : Number(total);
		if (!Number.isInteger(parsedRank) || !Number.isInteger(parsedTotal) || parsedRank < 1 || parsedTotal < 1 || parsedRank > parsedTotal) return null;
		return {
			rank: parsedRank,
			total: parsedTotal
		};
	}
	function parseRank(value) {
		if (typeof value !== "string") return null;
		const match = value.trim().match(/^(?:rank\s*:?[\s\u00a0]*#?\s*)?(\d+)\s*(?:\/|out\s+of|of)\s*(\d+)$/i);
		return match ? validateRank(Number(match[1]), Number(match[2])) : null;
	}
	function estimatedPercentileFromRank(rank, total) {
		const validRank = validateRank(rank, total);
		if (!validRank) return null;
		const estimated = Math.floor((validRank.total - validRank.rank + .5) / validRank.total * 100);
		return Math.max(0, Math.min(100, estimated));
	}
	function calculateCategory(input) {
		const category = input && typeof input.category === "string" ? input.category : "";
		const displayedPercentile = parsePercentile(input && input.percentile);
		if (displayedPercentile !== null) return {
			category,
			quartile: quartileFromPercentile(displayedPercentile),
			percentile: displayedPercentile,
			displayedPercentile,
			rank: input && input.rank ? validateRank(input.rank.rank, input.rank.total) : null,
			estimated: false,
			label: "CiteScore Quartile",
			source: SOURCE_PERCENTILE
		};
		const validRank = input && input.rank ? validateRank(input.rank.rank, input.rank.total) : null;
		const estimatedPercentile = validRank ? estimatedPercentileFromRank(validRank.rank, validRank.total) : null;
		if (estimatedPercentile !== null) return {
			category,
			quartile: quartileFromPercentile(estimatedPercentile),
			percentile: estimatedPercentile,
			displayedPercentile: null,
			rank: validRank,
			estimated: true,
			label: "Estimated CiteScore Quartile",
			source: SOURCE_RANK
		};
		return {
			category,
			quartile: null,
			percentile: null,
			displayedPercentile: null,
			rank: null,
			estimated: false,
			label: "Unable to calculate",
			source: "Unavailable"
		};
	}
	function bestQuartile(results) {
		if (!Array.isArray(results)) return null;
		const valid = results.map((result) => result && /^Q[1-4]$/.test(result.quartile) ? result.quartile : null).filter(Boolean).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
		return valid.length ? valid[0] : null;
	}
	var CATEGORY_LABEL = /^(?:in\s+categor(?:y|ies)|subject\s+(?:category|field)|category)$/i;
	var PERCENTILE_LABEL = /^(?:citescore\s+)?percentile$/i;
	var RANK_LABEL = /^(?:citescore\s+)?rank$/i;
	function sanitizeText(value, maxLength = 500) {
		if (value === null || value === void 0) return "";
		return String(value).normalize("NFKC").replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2060-\u206f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
	}
	function elementText(element, maxLength = 2e3) {
		if (!element) return "";
		if (element.querySelector && element.querySelector("[data-scsq-owned]")) {
			const clone = element.cloneNode(true);
			clone.querySelectorAll("[data-scsq-owned]").forEach((owned) => owned.remove());
			return sanitizeText(clone.textContent || "", maxLength);
		}
		return sanitizeText(element.innerText || element.textContent || "", maxLength);
	}
	function isVisible(element) {
		if (!element || element.nodeType !== 1) return false;
		if (element.closest("[data-scsq-owned], [hidden], [aria-hidden='true'], template, script, style, noscript")) return false;
		const view = element.ownerDocument && element.ownerDocument.defaultView;
		if (view && typeof view.getComputedStyle === "function") {
			const style = view.getComputedStyle(element);
			if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
		}
		return true;
	}
	function semanticElementText(element, maxLength = 2500) {
		const parts = [elementText(element, maxLength)];
		if (element && element.querySelectorAll) element.querySelectorAll("[aria-label], [title]").forEach((candidate) => {
			if (!isVisible(candidate)) return;
			parts.push(candidate.getAttribute("aria-label") || candidate.getAttribute("title") || "");
		});
		return sanitizeText(parts.join(" "), maxLength);
	}
	function parsePercentileFromText(value) {
		const text = sanitizeText(value, 1e3);
		for (const pattern of [/\bpercentile\s*:?\s*(100|\d{1,2})(?:st|nd|rd|th)?\s*%?/i, /\b(100|\d{1,2})(?:st|nd|rd|th)?\s*%?\s*(?:citescore\s+)?percentile\b/i]) {
			const match = text.match(pattern);
			if (match) return parsePercentile(match[1]);
		}
		return null;
	}
	function parseRankFromText(value) {
		const match = sanitizeText(value, 1e3).match(/\b(?:rank\s*:?\s*#?\s*)?(\d+)\s*(?:\/|out\s+of|of)\s*(\d+)\b/i);
		return match ? validateRank(Number(match[1]), Number(match[2])) : null;
	}
	function directLabelText(element) {
		const ariaLabel = sanitizeText(element && element.getAttribute && element.getAttribute("aria-label"), 120);
		if (ariaLabel) return ariaLabel;
		const title = sanitizeText(element && element.getAttribute && element.getAttribute("title"), 120);
		if (title) return title;
		return elementText(element, 120);
	}
	function findSemanticRegion(documentRef) {
		const headingCandidates = Array.from(documentRef.querySelectorAll("h1, h2, h3, h4, h5, h6, [role='heading'], [aria-label]")).filter(isVisible);
		for (const heading of headingCandidates) {
			const label = directLabelText(heading);
			if (!/(?:citescore\s+rank|rank\s*&\s*trend)/i.test(label)) continue;
			let current = heading;
			let fallback = heading.parentElement;
			for (let depth = 0; current && depth < 8; depth += 1, current = current.parentElement) {
				const text = elementText(current, 5e4);
				if (/in\s+category|subject\s+(?:category|field)/i.test(text) && /percentile|\brank\b/i.test(text)) return current;
				if (current.matches && current.matches("section, article, [role='region']")) fallback = current;
			}
			if (fallback) return fallback;
		}
		const tables = Array.from(documentRef.querySelectorAll("table, [role='table']")).filter(isVisible);
		for (const table of tables) {
			const text = elementText(table, 1e4);
			if (/percentile/i.test(text) && /(?:in\s+category|subject\s+(?:category|field))/i.test(text)) return table.closest("section, article, [role='region']") || table;
		}
		return null;
	}
	function findExactLabel(root, pattern) {
		const candidates = root.querySelectorAll("dt, th, label, [role='columnheader'], [role='rowheader'], span, strong, p, div, [aria-label]");
		return Array.from(candidates).find((element) => {
			if (!isVisible(element)) return false;
			const text = directLabelText(element);
			return text.length <= 80 && pattern.test(text);
		}) || null;
	}
	function valueBesideLabel(labelElement) {
		if (!labelElement) return {
			text: "",
			element: null
		};
		if (labelElement.tagName === "DT" && labelElement.nextElementSibling) return {
			text: elementText(labelElement.nextElementSibling, 300),
			element: labelElement.nextElementSibling
		};
		if (labelElement.tagName === "LABEL") {
			const controlId = labelElement.getAttribute("for");
			const control = controlId ? labelElement.ownerDocument.getElementById(controlId) : null;
			if (control) return {
				text: control.selectedOptions && control.selectedOptions.length ? elementText(control.selectedOptions[0], 300) : sanitizeText(control.value || elementText(control, 300), 300),
				element: control
			};
		}
		if (labelElement.nextElementSibling) return {
			text: elementText(labelElement.nextElementSibling, 300),
			element: labelElement.nextElementSibling
		};
		const parent = labelElement.parentElement;
		if (parent) {
			const siblings = Array.from(parent.children).filter((child) => child !== labelElement && isVisible(child));
			if (siblings.length) return {
				text: elementText(siblings[0], 300),
				element: siblings[0]
			};
		}
		return {
			text: "",
			element: null
		};
	}
	function extractCategoryFromBlock(block) {
		const beside = valueBesideLabel(findExactLabel(block, CATEGORY_LABEL));
		if (beside.text && !CATEGORY_LABEL.test(beside.text)) return sanitizeText(beside.text, 240);
		const match = elementText(block, 2e3).match(/(?:in\s+categor(?:y|ies)|subject\s+(?:category|field)|category)\s*:?\s*(.+?)(?=\s+(?:(?:citescore\s+)?percentile|(?:citescore\s+)?rank)\b|$)/i);
		return match ? sanitizeText(match[1], 240) : "";
	}
	function findValueElement(block, type, expectedValue) {
		const candidates = [block, ...block.querySelectorAll("td, dd, output, span, strong, p, div, [aria-label]")];
		for (const element of candidates) {
			if (!isVisible(element)) continue;
			const text = directLabelText(element);
			if (!text || text.length > 140) continue;
			if (type === "percentile") {
				const parsed = parsePercentileFromText(text) ?? parsePercentile(text);
				if (parsed !== null && parsed === expectedValue) return element;
			} else {
				const parsed = parseRankFromText(text) || parseRank(text);
				if (parsed && parsed.rank === expectedValue.rank && parsed.total === expectedValue.total) return element;
			}
		}
		return null;
	}
	function tableHeaderIndex(headers, pattern, excludedPattern) {
		return headers.findIndex((header) => pattern.test(header) && (!excludedPattern || !excludedPattern.test(header)));
	}
	function extractFromTables(root) {
		const categories = [];
		const tables = root.matches && root.matches("table, [role='table']") ? [root, ...root.querySelectorAll("table, [role='table']")] : Array.from(root.querySelectorAll("table, [role='table']"));
		for (const table of tables) {
			if (!isVisible(table)) continue;
			const rows = Array.from(table.querySelectorAll("tr, [role='row']")).filter(isVisible);
			if (rows.length < 2) continue;
			const headers = Array.from(rows[0].querySelectorAll("th, td, [role='columnheader'], [role='cell']")).map((cell) => elementText(cell, 160).toLowerCase());
			const categoryIndex = tableHeaderIndex(headers, /in\s+category|subject\s+(?:category|field)|^category$/);
			const percentileIndex = tableHeaderIndex(headers, /percentile/);
			const rankIndex = tableHeaderIndex(headers, /rank/, /percentile/);
			if (categoryIndex < 0 || percentileIndex < 0 && rankIndex < 0) continue;
			for (const row of rows.slice(1)) {
				const cells = Array.from(row.querySelectorAll("th, td, [role='rowheader'], [role='cell']"));
				const categoryCell = cells[categoryIndex];
				if (!categoryCell) continue;
				const category = elementText(categoryCell, 240);
				if (!category || CATEGORY_LABEL.test(category)) continue;
				const percentileCell = percentileIndex >= 0 ? cells[percentileIndex] : null;
				const rankCell = rankIndex >= 0 ? cells[rankIndex] : null;
				const percentileText = percentileCell ? elementText(percentileCell, 160) : "";
				const rankText = rankCell ? elementText(rankCell, 160) : "";
				const percentile = parsePercentile(percentileText) ?? parsePercentileFromText(percentileText);
				const rank = parseRank(rankText) || parseRankFromText(rankText);
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
		const candidates = Array.from(root.querySelectorAll("section, article, li, dl, fieldset, [role='listitem'], [role='group'], div")).filter((element) => {
			if (!isVisible(element)) return false;
			const text = semanticElementText(element, 2500);
			return text.length <= 2e3 && /(?:in\s+categor(?:y|ies)|subject\s+(?:category|field))/i.test(text) && /(?:percentile|\brank\b)/i.test(text);
		});
		return candidates.filter((candidate) => !candidates.some((other) => other !== candidate && candidate.contains(other))).map((block) => {
			const text = semanticElementText(block, 2500);
			const category = extractCategoryFromBlock(block);
			const percentileBeside = valueBesideLabel(findExactLabel(block, PERCENTILE_LABEL));
			const percentile = parsePercentile(percentileBeside.text) ?? parsePercentileFromText(text);
			const rankBeside = valueBesideLabel(findExactLabel(block, RANK_LABEL));
			const rank = parseRank(rankBeside.text) || parseRankFromText(text);
			return {
				category,
				percentile,
				rank,
				percentileElement: percentile !== null ? percentileBeside.element || findValueElement(block, "percentile", percentile) : percentileBeside.element || null,
				rankElement: rank ? rankBeside.element || findValueElement(block, "rank", rank) : rankBeside.element || null,
				sourceElement: block
			};
		}).filter((item) => item.category);
	}
	function deduplicateCategories(categories) {
		const merged = new Map();
		for (const item of categories) {
			const key = sanitizeText(item.category, 240).toLocaleLowerCase();
			if (!key) continue;
			const current = merged.get(key);
			if (!current) {
				merged.set(key, item);
				continue;
			}
			const currentHasPercentile = current.percentile !== null && current.percentile !== void 0;
			const itemHasPercentile = item.percentile !== null && item.percentile !== void 0;
			if (!currentHasPercentile && itemHasPercentile) merged.set(key, {
				...current,
				...item,
				rank: item.rank || current.rank
			});
			else if (!current.rank && item.rank) merged.set(key, {
				...current,
				rank: item.rank,
				rankElement: item.rankElement || current.rankElement
			});
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
			if (!element) continue;
			const title = sanitizeText(element.tagName === "META" ? element.getAttribute("content") : elementText(element, 300), 300).replace(/\s*[|–-]\s*Scopus\s*$/i, "");
			if (title && !/^scopus$/i.test(title)) return title;
		}
		return "Source title unavailable";
	}
	function extractYear(root, documentRef) {
		const selects = Array.from(documentRef.querySelectorAll("select")).filter(isVisible);
		for (const select of selects) {
			const aria = sanitizeText(select.getAttribute("aria-label"), 160);
			const id = select.id;
			const context = `${aria} ${elementText(id ? documentRef.querySelector(`label[for="${CSS.escape(id)}"]`) : null, 160)}`;
			if (/citescore.*year|rank.*year|^year$/i.test(context)) {
				const match = (select.selectedOptions && select.selectedOptions.length ? elementText(select.selectedOptions[0], 80) : sanitizeText(select.value, 80)).match(/\b(19|20)\d{2}\b/);
				if (match) return match[0];
			}
		}
		const selectedYears = Array.from(root.querySelectorAll("[aria-selected='true'], [aria-pressed='true'], option:checked")).filter(isVisible);
		for (const element of selectedYears) {
			const match = elementText(element, 100).match(/\b(19|20)\d{2}\b/);
			if (match) return match[0];
		}
		const match = elementText(root, 5e4).match(/(?:citescore(?:\s+rank)?\s+year|citescore)\s*:?\s*((?:19|20)\d{2})\b/i);
		return match ? match[1] : "Unavailable";
	}
	function extractCiteScore(documentRef) {
		const labels = Array.from(documentRef.querySelectorAll("dt, label, h2, h3, h4, span, strong, p, div")).filter(isVisible);
		for (const label of labels) {
			const text = elementText(label, 80);
			if (!/^citescore(?:\s+value)?$/i.test(text)) continue;
			const match = valueBesideLabel(label).text.match(/^\s*(\d+(?:\.\d+)?)\s*$/);
			if (match) return match[1];
		}
		return "Unavailable";
	}
	function parseDocument(documentRef) {
		if (!documentRef || typeof documentRef.querySelectorAll !== "function") return {
			title: "Source title unavailable",
			year: "Unavailable",
			citeScore: "Unavailable",
			categories: [],
			anchor: null
		};
		const region = findSemanticRegion(documentRef);
		const categories = region ? deduplicateCategories([...extractFromTables(region), ...extractFromBlocks(region)]) : [];
		return {
			title: extractTitle(documentRef),
			year: region ? extractYear(region, documentRef) : "Unavailable",
			citeScore: extractCiteScore(documentRef),
			categories,
			anchor: region,
			hasCiteScoreContext: Boolean(region)
		};
	}
	var DEFAULT_SETTINGS = Object.freeze({
		enabled: true,
		showPanel: true,
		showInlineBadges: true
	});
	var STORAGE_PREFIX = "scsq:";
	function normaliseSettings(values, defaults = DEFAULT_SETTINGS) {
		const output = {};
		for (const [key, fallback] of Object.entries(defaults)) output[key] = typeof values?.[key] === "boolean" ? values[key] : fallback;
		return output;
	}
	function createChromeStore(chromeApi) {
		return {
			kind: "chrome.storage",
			get(defaults = DEFAULT_SETTINGS) {
				return new Promise((resolve) => {
					chromeApi.storage.sync.get(defaults, (stored) => {
						resolve(normaliseSettings(stored, defaults));
					});
				});
			},
			set(patch) {
				return new Promise((resolve, reject) => {
					chromeApi.storage.sync.set(patch, () => {
						const error = chromeApi.runtime?.lastError;
						if (error) reject(new Error(error.message || "Chrome storage write failed."));
						else resolve();
					});
				});
			},
			subscribe(listener) {
				if (!chromeApi.storage.onChanged?.addListener) return () => {};
				const handler = (changes, areaName) => {
					if (areaName !== "sync") return;
					const patch = {};
					for (const [key, change] of Object.entries(changes)) if (Object.prototype.hasOwnProperty.call(DEFAULT_SETTINGS, key)) patch[key] = change.newValue;
					if (Object.keys(patch).length) listener(patch);
				};
				chromeApi.storage.onChanged.addListener(handler);
				return () => chromeApi.storage.onChanged.removeListener?.(handler);
			}
		};
	}
	function createGmStore(gmApi) {
		return {
			kind: "GM_setValue",
			async get(defaults = DEFAULT_SETTINGS) {
				const entries = await Promise.all(Object.entries(defaults).map(async ([key, fallback]) => [key, await Promise.resolve(gmApi.getValue(`${STORAGE_PREFIX}${key}`, fallback))]));
				return normaliseSettings(Object.fromEntries(entries), defaults);
			},
			async set(patch) {
				await Promise.all(Object.entries(patch).map(([key, value]) => Promise.resolve(gmApi.setValue(`${STORAGE_PREFIX}${key}`, Boolean(value)))));
			},
			subscribe(listener) {
				if (typeof gmApi.addValueChangeListener !== "function") return () => {};
				const listenerIds = Object.keys(DEFAULT_SETTINGS).map((key) => gmApi.addValueChangeListener(`${STORAGE_PREFIX}${key}`, (_name, _oldValue, newValue) => {
					listener({ [key]: Boolean(newValue) });
				}));
				return () => {
					if (typeof gmApi.removeValueChangeListener === "function") listenerIds.forEach((id) => gmApi.removeValueChangeListener(id));
				};
			}
		};
	}
	function createLocalStore(storage = globalThis.localStorage) {
		const listeners = new Set();
		return {
			kind: "localStorage fallback",
			async get(defaults = DEFAULT_SETTINGS) {
				const values = {};
				for (const [key, fallback] of Object.entries(defaults)) try {
					const stored = storage?.getItem(`${STORAGE_PREFIX}${key}`);
					values[key] = stored === null || stored === void 0 ? fallback : stored === "true";
				} catch {
					values[key] = fallback;
				}
				return normaliseSettings(values, defaults);
			},
			async set(patch) {
				for (const [key, value] of Object.entries(patch)) try {
					storage?.setItem(`${STORAGE_PREFIX}${key}`, String(Boolean(value)));
				} catch {}
				listeners.forEach((listener) => listener(patch));
			},
			subscribe(listener) {
				listeners.add(listener);
				return () => listeners.delete(listener);
			}
		};
	}
	function createSettingsStore({ chromeApi = globalThis.chrome, gmApi = null, localStorageApi } = {}) {
		if (chromeApi?.storage?.sync) return createChromeStore(chromeApi);
		if (typeof gmApi?.getValue === "function" && typeof gmApi?.setValue === "function") return createGmStore(gmApi);
		return createLocalStore(localStorageApi);
	}
	function initialiseScopusApp({ settingsStore, mode = "desktop", clipboardWriter = null, version = "" }) {
		const globalScope = window;
		const loadedKey = mode === "mobile" ? "__SCSQ_MOBILE_LOADED__" : "__SCSQ_DESKTOP_LOADED__";
		if (globalScope[loadedKey]) return globalScope[loadedKey];
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
			if (className) element.className = className;
			if (text !== void 0) element.textContent = text;
			return element;
		}
		function removeExtensionUi() {
			document.querySelectorAll(OWNED_SELECTOR).forEach((element) => element.remove());
		}
		function removePanels() {
			document.querySelectorAll(`[data-scsq-panel='true'], #${PANEL_ID}, #${MOBILE_LAYER_ID}`).forEach((element) => element.remove());
		}
		function removeInlineBadges() {
			document.querySelectorAll(INLINE_SELECTOR).forEach((element) => element.remove());
		}
		function resultTooltip(result, category, year) {
			const safeCategory = sanitizeText(category, 240) || "this subject category";
			const safeYear = sanitizeText(year, 20) || "unavailable";
			if (!result.quartile) return `Unable to calculate a CiteScore quartile for ${safeCategory}, CiteScore year ${safeYear}.`;
			if (result.estimated && result.rank) return `Estimated CiteScore ${result.quartile} calculated from rank ${result.rank.rank}/${result.rank.total} (estimated percentile ${result.percentile}) for ${safeCategory}, CiteScore year ${safeYear}.`;
			return `CiteScore ${result.quartile} calculated from percentile ${result.percentile} for ${safeCategory}, CiteScore year ${safeYear}.`;
		}
		function makeBadge(result, category, year, inline = false) {
			const badge = createElement("span", `scsq-badge scsq-badge--${result.quartile ? result.quartile.toLowerCase() : "unknown"}`);
			badge.textContent = result.quartile || "N/A";
			badge.title = resultTooltip(result, category, year);
			badge.setAttribute("aria-label", badge.title);
			badge.dataset.scsqOwned = "true";
			if (inline) {
				badge.classList.add("scsq-inline-badge");
				badge.dataset.scsqInline = "true";
			}
			return badge;
		}
		function copyText(data, calculatedCategories) {
			const best = bestQuartile(calculatedCategories.map((item) => item.result));
			const lines = [
				"Scopus CiteScore Quartile",
				`Source: ${data.title}`,
				`CiteScore year: ${data.year}`,
				`CiteScore value: ${data.citeScore}`,
				`Best CiteScore Quartile: ${best || "Unable to calculate"}`,
				""
			];
			calculatedCategories.forEach(({ category, result }) => {
				const percentile = result.displayedPercentile !== null ? `${result.displayedPercentile}%` : "Not displayed";
				const rank = result.rank ? `${result.rank.rank}/${result.rank.total}` : "Not displayed";
				const estimatedDetail = result.estimated ? ` | Estimated percentile: ${result.percentile}` : "";
				lines.push(`${category} | Percentile: ${percentile} | Rank: ${rank}${estimatedDetail} | ${result.label}: ${result.quartile || "Unable to calculate"} | Source: ${result.source}`);
			});
			lines.push("", "This is a CiteScore-based quartile calculated from Scopus percentile data. It is not a JCR or SCImago/SJR quartile. Quartiles may differ by subject category.");
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
			if (!succeeded) throw new Error("Clipboard access was unavailable.");
		}
		function buildPanel(data, calculatedCategories, { mobile = false } = {}) {
			const panel = createElement(mobile ? "section" : "aside", mobile ? "scsq-panel scsq-panel--mobile" : "scsq-panel");
			panel.id = mobile ? `${PANEL_ID}-mobile-content` : PANEL_ID;
			panel.dataset.scsqOwned = "true";
			if (!mobile) panel.dataset.scsqPanel = "true";
			panel.setAttribute("aria-labelledby", `${panel.id}-title`);
			panel.setAttribute("role", "region");
			const header = createElement("div", "scsq-panel__header");
			const headingGroup = createElement("div", "scsq-panel__heading-group");
			const heading = createElement("h2", "scsq-panel__title", "Scopus CiteScore Quartile");
			heading.id = `${panel.id}-title`;
			headingGroup.appendChild(heading);
			headingGroup.appendChild(createElement("p", "scsq-panel__source-title", data.title));
			const best = bestQuartile(calculatedCategories.map((item) => item.result));
			const bestBox = createElement("div", "scsq-best");
			bestBox.appendChild(createElement("span", "scsq-best__label", "Best CiteScore Quartile:"));
			const bestBadge = makeBadge({
				quartile: best,
				percentile: null,
				estimated: false,
				rank: null
			}, "all displayed subject categories", data.year);
			bestBadge.title = best ? `Best CiteScore Quartile across the displayed subject categories: ${best}. CiteScore year ${data.year}.` : `Best CiteScore Quartile could not be calculated. CiteScore year ${data.year}.`;
			bestBadge.setAttribute("aria-label", bestBadge.title);
			bestBox.appendChild(bestBadge);
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
				[
					"Subject category",
					"Displayed percentile",
					"Rank",
					"Quartile",
					"Calculation source"
				].forEach((label) => {
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
					const percentileCell = createElement("td", "", result.displayedPercentile !== null ? `${result.displayedPercentile}%` : "Not displayed");
					percentileCell.dataset.label = "Displayed percentile";
					const rankCell = createElement("td", "", result.rank ? `${result.rank.rank}/${result.rank.total}` : "Not displayed");
					rankCell.dataset.label = "Rank";
					const quartileCell = document.createElement("td");
					quartileCell.dataset.label = "Quartile";
					quartileCell.appendChild(makeBadge(result, category, data.year));
					if (result.estimated) quartileCell.appendChild(createElement("span", "scsq-quartile-type", "Estimated CiteScore Quartile"));
					const calculationCell = createElement("td", result.estimated ? "scsq-calculation scsq-calculation--estimated" : "scsq-calculation");
					calculationCell.dataset.label = "Calculation source";
					calculationCell.appendChild(createElement("span", "scsq-calculation__source", result.source));
					if (result.estimated) calculationCell.appendChild(createElement("small", "scsq-calculation__detail", `Estimated percentile: ${result.percentile}`));
					row.append(categoryCell, percentileCell, rankCell, quartileCell, calculationCell);
					body.appendChild(row);
				});
				table.append(caption, head, body);
				tableWrapper.appendChild(table);
				panel.appendChild(tableWrapper);
			} else panel.appendChild(createElement("p", "scsq-empty", "No visible subject-category percentile or rank information could be read on this page."));
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
			panel.appendChild(createElement("p", "scsq-note", "This is a CiteScore-based quartile calculated from Scopus percentile data. It is not a JCR or SCImago/SJR quartile. Quartiles may differ by subject category."));
			return panel;
		}
		function setMobileDrawerOpen(open, layer = document.getElementById(MOBILE_LAYER_ID)) {
			if (!layer) return;
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
			} else if (lastFocusedElement instanceof HTMLElement && lastFocusedElement.isConnected) lastFocusedElement.focus();
		}
		function buildMobileLayer(data, calculatedCategories) {
			const layer = createElement("div", "scsq-mobile-layer");
			layer.id = MOBILE_LAYER_ID;
			layer.dataset.scsqOwned = "true";
			layer.dataset.scsqPanel = "true";
			const best = bestQuartile(calculatedCategories.map((item) => item.result));
			const fab = createElement("button", "scsq-mobile-fab");
			fab.type = "button";
			fab.setAttribute("aria-controls", MOBILE_DRAWER_ID);
			fab.setAttribute("aria-expanded", String(mobileDrawerOpen));
			fab.setAttribute("aria-label", `Open category-specific CiteScore quartile results. Best result: ${best || "unavailable"}.${version ? ` Version ${version}.` : ""}`);
			const fabQuartile = createElement("span", `scsq-mobile-fab__quartile scsq-mobile-fab__quartile--${best ? best.toLowerCase() : "unknown"}`);
			fabQuartile.append(createElement("span", "scsq-mobile-fab__quartile-value", best || "Q?"), createElement("small", "scsq-mobile-fab__version", version ? `v${version}` : ""));
			fab.append(fabQuartile, createElement("span", "scsq-mobile-fab__label", "CiteScore"));
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
			settingsRow.append(createElement("span", "scsq-mobile-setting__label", "Show inline badges"), inlineToggle);
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
				if (typeof anchor.insertAdjacentElement === "function") anchor.insertAdjacentElement("afterend", panel);
				else anchor.parentNode.insertBefore(panel, anchor.nextSibling);
				return;
			}
			(document.querySelector("main, [role='main']") || document.body).appendChild(panel);
		}
		function insertMobileLayer(layer) {
			(document.body || document.documentElement).appendChild(layer);
		}
		function insertInlineBadge(target, badge) {
			if (!target || !target.isConnected) return false;
			if (target.matches("td, th, dd, [role='cell']")) target.appendChild(badge);
			else if (typeof target.insertAdjacentElement === "function") target.insertAdjacentElement("afterend", badge);
			else if (target.parentNode) target.parentNode.insertBefore(badge, target.nextSibling);
			else return false;
			return true;
		}
		function inlineTargetFor(item) {
			return item.result.estimated ? item.original.rankElement || item.original.percentileElement : item.original.percentileElement || item.original.rankElement;
		}
		function signatureFor(data, calculatedCategories) {
			return JSON.stringify({
				mode,
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
			if (document.querySelectorAll(`[data-scsq-panel='true']`).length !== (mode === "mobile" ? 1 : settings.showPanel ? 1 : 0)) return false;
			const expectedBadges = settings.showInlineBadges ? calculatedCategories.filter((item) => inlineTargetFor(item)).length : 0;
			return document.querySelectorAll(INLINE_SELECTOR).length === expectedBadges;
		}
		function updatePage(force = false) {
			if (rendering) return;
			rendering = true;
			try {
				if (!settings.enabled) {
					removeExtensionUi();
					lastSignature = "disabled";
					return;
				}
				const data = parseDocument(document);
				if (!data.hasCiteScoreContext) {
					removeExtensionUi();
					lastSignature = "no-context";
					return;
				}
				const calculatedCategories = data.categories.map((category) => ({
					category: sanitizeText(category.category, 240),
					original: category,
					result: calculateCategory(category)
				}));
				const signature = signatureFor(data, calculatedCategories);
				if (!force && signature === lastSignature && uiIsHealthy(calculatedCategories)) return;
				removePanels();
				removeInlineBadges();
				if (mode === "mobile") insertMobileLayer(buildMobileLayer(data, calculatedCategories));
				else if (settings.showPanel) insertPanel(buildPanel(data, calculatedCategories), data.anchor);
				if (settings.showInlineBadges) calculatedCategories.forEach((item) => {
					const { category, result } = item;
					insertInlineBadge(inlineTargetFor(item), makeBadge(result, category, data.year, true));
				});
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
				if (mutations.some((mutation) => {
					const target = mutation.target.nodeType === 1 ? mutation.target : mutation.target.parentElement;
					return !target || !target.closest || !target.closest(OWNED_SELECTOR);
				})) scheduleUpdate();
			});
			observer.observe(document.documentElement, {
				childList: true,
				subtree: true,
				characterData: true,
				attributes: true,
				attributeFilter: [
					"aria-selected",
					"aria-pressed",
					"aria-expanded",
					"selected",
					"value"
				]
			});
			document.addEventListener("change", scheduleUpdate, true);
			document.addEventListener("click", scheduleUpdate, true);
			document.addEventListener("keydown", (event) => {
				if (mode === "mobile" && event.key === "Escape" && mobileDrawerOpen) setMobileDrawerOpen(false);
			}, true);
			settingsStore.subscribe((changes) => {
				for (const key of Object.keys(DEFAULT_SETTINGS)) if (Object.prototype.hasOwnProperty.call(changes, key)) settings[key] = changes[key];
				lastSignature = "";
				updatePage(true);
			});
			updatePage(true);
		}
		loadSettings(() => {
			if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
			else start();
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
	var gmApi = {
		getValue: typeof _GM_getValue === "function" ? _GM_getValue : null,
		setValue: typeof _GM_setValue === "function" ? _GM_setValue : null,
		addValueChangeListener: typeof _GM_addValueChangeListener === "function" ? _GM_addValueChangeListener : null,
		removeValueChangeListener: typeof _GM_removeValueChangeListener === "function" ? _GM_removeValueChangeListener : null
	};
	var clipboardWriter = typeof _GM_setClipboard === "function" ? async (text) => {
		await Promise.resolve(_GM_setClipboard(text, "text"));
	} : null;
	initialiseScopusApp({
		mode: "mobile",
		settingsStore: createSettingsStore({
			chromeApi: null,
			gmApi
		}),
		clipboardWriter,
		version: package_default.version
	});
})();
