# Quick Tab Switch

[中文文档](README.zh-CN.md) | English

A lightweight Chrome extension for quickly switching to the adjacent tabs in the current Chrome window.

## Features

- Switch one tab to the left with `Alt+Q`.
- Switch one tab to the right with `Alt+W`.
- Wrap around inside the current window: left from the first tab goes to the last tab, and right from the last tab goes to the first tab.
- Keep the current Chrome window focused after switching.

## Shortcuts

| Shortcut | Action |
| --- | --- |
| `Alt+Q` | Switch to the tab on the left |
| `Alt+W` | Switch to the tab on the right |

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

- `tabs`: Read the current window's tab order and switch browser tabs.

The extension does not access page content, and it does not collect or upload any data.

## File Structure

```text
chrome-quick-tab-switch/
|-- background.js
|-- manifest.json
|-- README.md
`-- README.zh-CN.md
```

## Notes

- Switching is based on the tab bar order in the current Chrome window.
- Pinned tabs are included because Chrome keeps them in the same tab order.
