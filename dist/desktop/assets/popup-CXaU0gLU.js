//#region \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
//#endregion
//#region src/platform/settings-store.js
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
	const listeners = /* @__PURE__ */ new Set();
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
//#endregion
//#region src/popup/popup.js
(function initialisePopup() {
	const settingsStore = createSettingsStore({ chromeApi: globalThis.chrome });
	const controls = Object.keys(DEFAULT_SETTINGS).map((id) => document.getElementById(id));
	const status = document.getElementById("save-status");
	let statusTimer = null;
	function updateDependentState() {
		const enabled = document.getElementById("enabled").checked;
		document.getElementById("showPanel").disabled = !enabled;
		document.getElementById("showInlineBadges").disabled = !enabled;
	}
	function showStatus(message) {
		window.clearTimeout(statusTimer);
		status.textContent = message;
		statusTimer = window.setTimeout(() => {
			status.textContent = "";
		}, 1800);
	}
	function saveSetting(event) {
		const control = event.currentTarget;
		settingsStore.set({ [control.id]: control.checked }).then(() => {
			updateDependentState();
			showStatus("Saved.");
		}).catch(() => showStatus("Setting could not be saved."));
	}
	settingsStore.get(DEFAULT_SETTINGS).then((stored) => {
		controls.forEach((control) => {
			control.checked = Boolean(stored[control.id]);
			control.addEventListener("change", saveSetting);
		});
		updateDependentState();
	});
})();
//#endregion
