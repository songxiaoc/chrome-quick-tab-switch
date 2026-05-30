const COMMAND_DIRECTIONS = {
    "switch-to-previous-tab": -1,
    "navigate-tab-history": 1
};

function getWrappedIndex(currentIndex, tabCount, direction) {
    return (currentIndex + direction + tabCount) % tabCount;
}

async function switchAdjacentTab(direction) {
    const [activeTab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    });

    if (!Number.isInteger(activeTab?.id) || !Number.isInteger(activeTab.windowId)) {
        return;
    }

    const tabs = await chrome.tabs.query({ windowId: activeTab.windowId });
    const orderedTabs = tabs
        .filter(tab => Number.isInteger(tab.id) && Number.isInteger(tab.index))
        .sort((left, right) => left.index - right.index);

    if (orderedTabs.length <= 1) {
        return;
    }

    const activeIndex = orderedTabs.findIndex(tab => tab.id === activeTab.id);

    if (activeIndex === -1) {
        return;
    }

    const targetIndex = getWrappedIndex(activeIndex, orderedTabs.length, direction);
    const targetTab = orderedTabs[targetIndex];

    await chrome.tabs.update(targetTab.id, { active: true });
    await chrome.windows.update(targetTab.windowId, { focused: true });
}

chrome.commands.onCommand.addListener((command) => {
    const direction = COMMAND_DIRECTIONS[command];

    if (!direction) {
        return;
    }

    switchAdjacentTab(direction).catch((error) => {
        console.error("Failed to switch adjacent tab:", error);
    });
});
