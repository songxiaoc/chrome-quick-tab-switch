# Quick Tab Switch

[English](README.md) | 中文

一个用于 Chrome 的轻量级标签页快速切换扩展。它可以通过快捷键在当前窗口内按标签栏顺序左右切换。

## 功能

- 使用 `Alt+Q` 切换到左侧相邻标签页。
- 使用 `Alt+W` 切换到右侧相邻标签页。
- 在当前窗口内循环切换：从最左侧继续向左会到最右侧，从最右侧继续向右会到最左侧。
- 切换后保持当前 Chrome 窗口聚焦。

## 快捷键

| 快捷键 | 功能 |
| --- | --- |
| `Alt+Q` | 切换到左侧标签页 |
| `Alt+W` | 切换到右侧标签页 |

如果快捷键和其他扩展或系统快捷键冲突，可以在 Chrome 的扩展快捷键设置页中修改：

```text
chrome://extensions/shortcuts
```

## 安装

1. 打开 Chrome 扩展管理页：

   ```text
   chrome://extensions
   ```

2. 开启右上角的「开发者模式」。
3. 点击「加载已解压的扩展程序」。
4. 选择本目录：

   ```text
   chrome-quick-tab-switch
   ```

5. 加载完成后即可使用 `Alt+Q` 和 `Alt+W`。

修改 `manifest.json` 或 `background.js` 后，需要在 `chrome://extensions` 中重新加载扩展。

## 权限说明

扩展使用以下权限：

- `tabs`：读取当前窗口的标签页顺序并切换标签页。

扩展不会访问网页内容，也不会收集或上传任何数据。

## 文件结构

```text
chrome-quick-tab-switch/
|-- background.js
|-- manifest.json
|-- README.md
`-- README.zh-CN.md
```

## 注意事项

- 切换依据当前 Chrome 窗口中的标签栏顺序。
- 固定标签页也会参与切换，因为 Chrome 会把它们放在同一套标签顺序中。
