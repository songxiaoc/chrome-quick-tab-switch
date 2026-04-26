# Quick Tab Switch

[中文文档](README.zh-CN.md) | English

A lightweight Chrome extension for quickly switching between recently visited tabs. It keeps a short tab visit history and lets you move backward or forward through it with keyboard shortcuts.

## Features

- Quickly switch back to the previously visited tab.
- Move forward through the tab visit history.
- Switch across Chrome windows and focus the target window automatically.
- Keep the latest 20 visited tabs in history.
- Store session state with `chrome.storage.session` to handle Manifest V3 service worker suspension.
- Show a small auto-dismissing text toast when you reach the history boundary, without blocking your current workflow.
- Avoid treating Chrome startup/session restore activation events as user-driven tab history.

## Shortcuts

| Shortcut | Action |
| --- | --- |
| `Alt+Q` | Switch back to the previously visited tab |
| `Alt+W` | Move forward to a newer visited tab |

If a shortcut conflicts with another extension or system shortcut, change it in Chrome's extension shortcuts page:

```text
chrome://extensions/shortcuts
```

## Installation

1. Open Chrome's extensions page:

   ```text
   chrome://extensions
   ```

2. Enable "Developer mode".
3. Click "Load unpacked".
4. Select this directory:

   ```text
   chrome-quick-tab-switch
   ```

5. Use `Alt+Q` and `Alt+W` after the extension is loaded.

After changing `manifest.json` or `background.js`, reload the extension from `chrome://extensions`.

## Permissions

This extension uses the following permissions:

- `tabs`: Read and switch browser tabs.
- `storage`: Store the current session's tab visit history.
- `scripting`: Inject a short text toast into the current page when the history boundary is reached.
- `activeTab`: Allow the toast injection only after the user triggers a shortcut on the active tab.

The extension does not continuously access page content, and it does not collect or upload any data.

## File Structure

```text
chrome-quick-tab-switch/
|-- background.js
|-- manifest.json
|-- README.md
`-- README.zh-CN.md
```

## Notes

- Chrome restricts script injection on pages such as `chrome://`, the Chrome Web Store, and some extension pages. On those pages, boundary toasts are silently skipped.
- During browser startup/session restore, the extension briefly records only the current tab to avoid creating back history before the user manually switches tabs.
- Closed tabs are automatically removed from the visit history.
