const MAX_HISTORY = 20;
const STATE_KEY = "tabHistoryState";
const STARTUP_ACTIVATION_GRACE_MS = 3000;

let recentTabs = [];
let currentHistoryIndex = -1;
let isNavigatingHistory = false;
let stateLoaded = false;
let ignoreActivationUntil = 0;

const stateReady = loadState();

function clampHistoryIndex() {
    if (recentTabs.length === 0) {
        currentHistoryIndex = -1;
        return;
    }

    currentHistoryIndex = Math.max(0, Math.min(currentHistoryIndex, recentTabs.length - 1));
}

async function saveState() {
    if (!stateLoaded) {
        return;
    }

    await chrome.storage.session.set({
        [STATE_KEY]: {
            recentTabs,
            currentHistoryIndex
        }
    });
}

async function loadState() {
    try {
        const stored = await chrome.storage.session.get(STATE_KEY);
        const state = stored[STATE_KEY];

        if (state && Array.isArray(state.recentTabs)) {
            recentTabs = state.recentTabs.filter(Number.isInteger);
            currentHistoryIndex = Number.isInteger(state.currentHistoryIndex)
                ? state.currentHistoryIndex
                : recentTabs.length - 1;
            clampHistoryIndex();
        }
    } catch (error) {
        console.error("Failed to load tab history:", error);
    } finally {
        stateLoaded = true;
    }

    if (recentTabs.length === 0) {
        await initializeActiveTab();
    }
}

async function ensureStateReady() {
    await stateReady;

    if (recentTabs.length === 0) {
        await initializeActiveTab();
    }
}

async function addTabToHistory(tabId) {
    if (!Number.isInteger(tabId) || isNavigatingHistory) {
        return;
    }

    if (currentHistoryIndex !== -1) {
        recentTabs = recentTabs.slice(0, currentHistoryIndex + 1);
    }

    if (recentTabs[recentTabs.length - 1] !== tabId) {
        recentTabs.push(tabId);
    }

    if (recentTabs.length > MAX_HISTORY) {
        recentTabs.shift();
    }

    currentHistoryIndex = recentTabs.length - 1;
    await saveState();
}

async function removeTabFromHistory(tabId) {
    const removedIndex = recentTabs.indexOf(tabId);

    if (removedIndex === -1) {
        return;
    }

    recentTabs = recentTabs.filter(id => id !== tabId);

    if (removedIndex <= currentHistoryIndex) {
        currentHistoryIndex--;
    }

    clampHistoryIndex();
    await saveState();
}

async function initializeActiveTab() {
    try {
        isNavigatingHistory = false;
        const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

        if (Number.isInteger(activeTab?.id)) {
            recentTabs = [activeTab.id];
            currentHistoryIndex = 0;
            await saveState();
        }
    } catch (error) {
        console.error("Failed to initialize active tab:", error);
    }
}

async function seedHistoryWithTab(tabId) {
    if (!Number.isInteger(tabId)) {
        return;
    }

    recentTabs = [tabId];
    currentHistoryIndex = 0;
    await saveState();
}

async function initializeAfterBrowserStartup() {
    ignoreActivationUntil = Date.now() + STARTUP_ACTIVATION_GRACE_MS;
    await initializeActiveTab();
}

async function switchToTab(tabId) {
    try {
        isNavigatingHistory = true;
        const tab = await chrome.tabs.get(tabId);

        await chrome.tabs.update(tabId, { active: true });
        await chrome.windows.update(tab.windowId, { focused: true });
        await saveState();
        return true;
    } catch (error) {
        await removeTabFromHistory(tabId);
        return false;
    } finally {
        setTimeout(() => {
            isNavigatingHistory = false;
        }, 100);
    }
}

async function showToast(message) {
    try {
        const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

        if (!Number.isInteger(activeTab?.id)) {
            return;
        }

        await chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            args: [message],
            func: (toastMessage) => {
                const hostId = "quick-tab-switch-toast";
                let host = document.getElementById(hostId);

                if (!host) {
                    host = document.createElement("div");
                    host.id = hostId;
                    host.style.position = "fixed";
                    host.style.top = "20px";
                    host.style.left = "50%";
                    host.style.zIndex = "2147483647";
                    host.style.pointerEvents = "none";
                    host.style.transform = "translate(-50%, -8px)";
                    host.style.opacity = "0";
                    host.style.transition = "opacity 160ms ease, transform 160ms ease";

                    const text = document.createElement("div");
                    text.style.boxSizing = "border-box";
                    text.style.maxWidth = "min(420px, calc(100vw - 32px))";
                    text.style.padding = "10px 14px";
                    text.style.borderRadius = "8px";
                    text.style.background = "rgba(28, 28, 30, 0.92)";
                    text.style.color = "#fff";
                    text.style.font = "13px/1.4 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
                    text.style.textAlign = "center";
                    text.style.boxShadow = "0 10px 28px rgba(0, 0, 0, 0.22)";
                    text.style.wordBreak = "break-word";
                    host.append(text);
                    document.documentElement.append(host);
                }

                host.firstElementChild.textContent = toastMessage;
                clearTimeout(window.__quickTabSwitchToastTimer);

                requestAnimationFrame(() => {
                    host.style.opacity = "1";
                    host.style.transform = "translate(-50%, 0)";
                });

                window.__quickTabSwitchToastTimer = setTimeout(() => {
                    host.style.opacity = "0";
                    host.style.transform = "translate(-50%, -8px)";
                    setTimeout(() => host.remove(), 180);
                }, 1600);
            }
        });
    } catch (error) {
        // Some browser pages, extension pages, and restricted URLs cannot receive injected scripts.
    }
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    await ensureStateReady();

    if (Date.now() < ignoreActivationUntil) {
        await seedHistoryWithTab(activeInfo.tabId);
        return;
    }

    await addTabToHistory(activeInfo.tabId);
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
    await ensureStateReady();
    await removeTabFromHistory(tabId);
});

chrome.tabs.onCreated.addListener(async (tab) => {
    if (tab.openerTabId) {
        await ensureStateReady();

        if (Date.now() < ignoreActivationUntil) {
            return;
        }

        await addTabToHistory(tab.id);
    }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.active) {
        await ensureStateReady();

        if (Date.now() < ignoreActivationUntil) {
            await seedHistoryWithTab(tabId);
            return;
        }

        await addTabToHistory(tabId);
    }
});

chrome.commands.onCommand.addListener(async (command) => {
    await ensureStateReady();

    if (command === "switch-to-previous-tab") {
        if (currentHistoryIndex > 0) {
            currentHistoryIndex--;
            await saveState();

            const success = await switchToTab(recentTabs[currentHistoryIndex]);

            if (!success && currentHistoryIndex > 0) {
                currentHistoryIndex--;
                await saveState();
                await switchToTab(recentTabs[currentHistoryIndex]);
            }
        } else {
            await showToast("已经是最后一个访问的标签页啦");
        }
    } else if (command === "navigate-tab-history") {
        if (currentHistoryIndex < recentTabs.length - 1) {
            currentHistoryIndex++;
            await saveState();

            const success = await switchToTab(recentTabs[currentHistoryIndex]);

            if (!success && currentHistoryIndex < recentTabs.length - 1) {
                currentHistoryIndex++;
                await saveState();
                await switchToTab(recentTabs[currentHistoryIndex]);
            }
        } else {
            await showToast("已经回到最新访问的标签页啦");
        }
    }
});

chrome.runtime.onStartup.addListener(initializeAfterBrowserStartup);
chrome.runtime.onInstalled.addListener(initializeActiveTab);
