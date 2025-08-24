# Active Context

This file tracks the project's current status, including recent changes, current goals, and open questions.
2025-05-13 15:03:39 - Log of updates made.

*

## Current Focus

* [2025-07-03 22:46:23] - 在 `js/data_table_modal.js` 中实现了在选择领域卡时显示当前职业领域的功能。
* [2025-07-04 11:15:03] - 修复了打印功能，通过在 CSS 中使用 zoom: 1.2 使内容在A4纸上默认以120%缩放，以更好地填充页面。
* [2025-07-04 10:28:50] - 将 js/url_map.js 中的 online 地址更新为新的 GitHub Pages 格式。
* [2025-06-26 17:16:31] - 开始在 js/custom.js 中添加对“种族”和“社群”卡牌类型的处理逻辑。
* [2025-06-26 17:23:35] - 完成在 js/custom.js 中添加对“种族”和“社群”卡牌类型的处理逻辑。
* [2025-06-24 16:56:17] - Further enhanced "Upload Character Avatar" feature: `clearForm` now also resets the avatar image.
* [2025-06-24 16:53:53] - Enhanced "Upload Character Avatar" feature: adjusted image display (contain & center) and integrated avatar image (Base64) into JSON import/export.
* [2025-06-15 18:18:00] - Implemented "Upload Custom Card Pack" feature.
* [2025-06-15 22:48:53] - Implemented a generic tooltip feature.

* [2025-06-27 13:25:20] - **[REFACTOR]** 重构了 `js/action.js` 中的 `clearForm` 函数，移除了设置HP和Stress插槽默认状态时的重复代码，使其更加简洁高效。
* [2025-06-27 13:22:02] - **[FEAT]** 根据用户最终修改，更新了 `js/action.js` 中的 `clearForm` 函数，现在它会将第一个“一把金币”(`HandfulGoldCheckbox1`)复选框的状态设置为默认选中。
* [2025-06-27 13:09:14] - **[FEAT]** 调整了 `js/TriStateCheckbox.js` 的逻辑，当复选框处于 "dashed" (state 2) 状态时，左键单击不再会将其切换为 "checked" (state 1)。
* [2025-06-27 13:02:24] - **[FEAT]** 增强了护甲选择逻辑：在 `js/data_table_modal.js` 中，选择护甲后会根据角色等级计算并填充伤害阈值，并更新护甲插槽。同时，在 `js/action.js` 的 `clearForm` 函数中增加了将等级重置为1的逻辑。
* [2025-06-27 12:50:12] - **[FEAT]** 在 `js/data_table_modal.js` 中实现了新功能：选择种族、社群或职业后，会自动填充角色表单上的相应字段（名称、闪避、生命值）。修复了在更新生命值插槽时因作用域问题导致的运行时错误。
## Recent Changes
* [2025-06-24 16:56:17] - **[FEAT]** Updated `clearForm` function in [`js/action.js`](js/action.js:1) to also clear the uploaded character avatar, reset the image source, hide the image container, and show the avatar textarea.
* [2025-06-24 16:53:53] - **[FEAT]** Enhanced character avatar functionality:
    *   Modified [`index.html`](index.html:1) to set `object-fit: contain` and `text-align: center` for the avatar image display, ensuring the entire image is visible and centered.
    *   Updated `exportFormState` and `importFormState` in [`js/action.js`](js/action.js:1) to include the avatar image (as Base64 data URI) in the JSON import/export process.
* [2025-06-24 16:43:30] - **[FEAT]** Added character avatar upload functionality. This includes an upload button, an image display area, and logic to show the uploaded image, hide the avatar textarea, and a close button to revert. Modified [`index.html`](index.html:1) and [`js/action.js`](js/action.js:1).
* [2025-06-15 18:18:00] - **[FEAT]** Implemented the "Upload Custom Card Pack" feature. Added a button to `character_sheet_editor.html`, file handling logic in `action.js`, and a data processing function `add_custom_domain_card` in `script.js` that supports many-to-one key mapping and merges new domain cards into the `DOMAIN_CARDS` array.
* [2025-06-15 16:14:01] - **[FEAT]** Created `data_transformer.js` to process the raw `JOBS_DATA` into structured `CLASS_DATA` and `SUBCLASS_DATA` global variables. This standardizes the data structure for classes and subclasses, making it easier for other parts of the application to consume.
* [2025-06-15 11:47:43] - **[FIX]** Repaired the printing functionality by implementing a robust strategy. This involved dynamically creating a `#print-wrapper` in `action.js` to isolate printable content and rewriting the `@media print` rules in `style.css` to force all elements into a static document flow, ensuring correct page breaks and visibility for both the character sheet and skill cards.
* [2025-06-15 09:23:51] - **[FIX]** Repaired the "Clear Form" functionality by refactoring the `clearForm` function in `action.js` to correctly reset all form elements and clear local storage. Also refactored button setup logic by moving global action button setup from `script.js` to `action.js` to avoid duplicate definitions.
* [2025-06-15 12:57:19] - **[FIX]** Repaired the data table modal's filtering and row selection functionality. The fix involved refactoring `data_table_modal.js` to remove obsolete dynamic HTML fetching and modifying the `showDataTableModal` function signature to correctly accept and execute the `onRowSelected` callback.
* [2025-06-15 10:58:47] - **[FEAT]** Added the basic HTML structure and CSS styles for the new skill card feature. Modified `character_sheet_editor.html` to include a `#card-container` and added corresponding styles for the container, cards, and print view to `style.css`.
* [2025-06-15 11:00:59] - **[FEAT]** Implemented interactive skill card functionality in `script.js`. This includes creating cards from image URLs or JSON data, drag-and-drop movement, click-to-top (z-index management), and a close button to remove cards from the DOM.
* [2025-06-15 11:03:35] - **[FIX]** Fixed an issue where dragging image cards would trigger the browser's default image drag behavior instead of the custom card dragging logic. The fix involved setting `img.draggable = false` on the created image element in `script.js`.
* [2025-06-15 12:54:41] - **[FIX]** Resolved a persistent "variable is not defined" error by refactoring `script.js`. Replaced the generic `setupDataTableButtons` function with a specific event listener for `#add-secondary-weapon-btn` that directly references the `SECONDARY_WEAPON` global variable, avoiding scope issues. This robust solution ensures the data source is correctly accessed.
* [2025-06-15 00:08:28] - Enhanced `data_table_modal.js` to support column filtering, state persistence via localStorage, and column width synchronization. The `showDataTableModal` function now accepts `filterableColumns` and `storageKey` in its config to enable these features.
* [2025-06-14 22:08:00] - Added a floating action container with buttons for JSON import/export and PDF printing. Implemented the corresponding logic in `script.js`, including using `html2canvas` and `jspdf` for PDF generation. Refactored the HTML to wrap each character sheet page in a separate `div` for accurate printing.
* [2025-06-14 18:54:52] - Placed Armor, HP, and Stress slots into separate container divs (`armor-slots-container`, `hp-container`, `stress-container`). Styled the containers using Flexbox to create grid layouts (4x3 for armor, 1x12 for HP/Stress). Set default states for HP/Stress slots (first 6 empty, last 6 dashed) in JavaScript.
* [2025-06-14 18:27:00] - Refactored the checkbox implementation to remove the `.base-checkbox-wrapper` div. Merged positioning styles directly into the `.base-checkbox` label and updated all related HTML, CSS, and JavaScript files.
* [2025-06-14 18:24:00] - Implemented a reusable `TriStateCheckbox` base class in `script.js` to handle three states (normal, checked, dashed) for checkboxes like armor slots. Refactored HTML to remove hidden inputs and updated CSS to use state-based classes.
* [2025-06-14 18:02:33] - Refactored the checkbox implementation in `character_sheet_editor.html` and `style.css`. Created a reusable `base-checkbox` class and specific classes for different checkbox types (e.g., `armor-slot-checkbox`). Replaced the old `sampleCheckbox` with new, modular checkboxes for various game stats.
* [2025-06-14 13:04:02] - 在 `script.js` 中添加了事件监听器，以禁用用户通过 Ctrl+滚轮 或 Ctrl+/- 缩放网页的功能。
* [2025-06-14 13:48:36] - 修改了 [`style.css`](style.css:1) 中 `.image-container img` 的样式，将 `max-height` 和 `width: auto` 替换为固定的 `width: 1000px`，以防止图片随浏览器窗口缩放。
* [2025-06-14 11:01:32] - Summarized older entries in `decisionLog.md` to improve readability, retaining the last three full entries.
*
* [2025-05-13 15:34:10] - 创建了 character_creator 应用 (HTML, CSS, JS) 以根据 character_template.json 生成角色表单并支持JSON导出。
* ... (previous entries from before 2025-06-13 remain) ...
* [2025-06-13 15:23:13] - 修改 `character_creator/js/utility.js` 以从 `LOOT.items` 和 `LOOT.consumables` 构建 `ALL_ITEMS_DATA`。修改 `character_creator/js/json.js` 以使用新的字段名 (`name`, `desc`)。
* [2025-06-13 15:28:11] - 假设新的 `Daggerheart_Core_Rulebook_种族.js` 定义了 `RACES_DATA`。修改 `character_creator/js/race_job_community.js` 和 `character_creator/data/template.js` 以使用新的种族数据结构和字段名 (`name`, `trait1_name`, `trait1_desc`, etc.)。
* [2025-06-13 15:43:22] - 修改 `character_creator/js/race_job_community.js` 和 `character_creator/data/template.js` 以使用新的社群数据结构和字段名 (`name`, `trait_name`, `trait_desc`)，假设 `Daggerheart_Core_Rulebook_社群.js` 定义了 `GROUPS_DATA`。
* [2025-06-13 15:44:03] - 更新 `character_creator/index.html` 以引用新的装备数据JS文件 (`Daggerheart_Core_Rulebook_主武器表.js`, `_副武器表.js`, `_护甲表.js`) 并移除对旧 `equipment_data.js` 的引用。更新 `character_creator/js/weapon_armor_item.js` 以使用新的装备数据源 (`PRIMARY_WEAPON`, `ARMOR`, `SECONDARY_WEAPON`) 和新的英文字段名，调整了装备弹窗的筛选和数据显示逻辑。
* [2025-06-13 15:52:00] - 修改 `character_creator/js/race_job_community.js` 和 `character_creator/data/template.js` 以适配新的职业数据结构 (`Daggerheart_Core_Rulebook_职业.js` 定义的 `JOBS_DATA`)，更新了职业名称、希望特性、职业特性、领域和子职相关的字段引用及逻辑。
* [2025-06-13 16:01:00] - 更新 `character_creator/index.html` 以正确引用新的领域卡数据文件。更新 `character_creator/js/domain_card.js` 以处理扁平化的 `DOMAIN_CARDS` 数组结构。

## Open Questions/Issues

*
* [2025-05-16 17:54:36] - 完成了将用户提供的“奥术”领域卡片文本转换为 JSON 对象并更新到 `character_creator/data/domain_card.js` 文件中的 `DOMAIN_CARDS` JavaScript 对象。
* ... (previous entries remain) ...
* 新人引导中子职选择逻辑可能需要进一步调整以完全适配新的职业数据结构，当前仅更新了 `template.js` 中职业选择的字段。
* [2025-06-14 11:33:13] - 为 `character_sheet_editor.html` 添加了可交互文本输入框功能。创建了 `style.css` 和 `script.js`。`style.css` 包含基础页面布局和文本框调试样式。`script.js` 包含 `toggleDebugMode` 函数，用于切换文本框的调试边框并显示其CSS `top` 和 `left` 坐标。HTML中添加了文本框、坐标显示区域和调试切换按钮。
* [2025-06-14 11:43:00] - Debugging: Investigating issue where `sampleTextbox` does not appear after toggling debug mode in `character_sheet_editor.html`. Identified CSS specificity issue with `border` property.
* [2025-06-14 11:39:21] - 为 `character_sheet_editor.html` 添加了自定义Checkbox组件。在 `character_sheet_editor.html` 中添加了HTML结构和调试按钮。在 `style.css` 中添加了Checkbox的默认、选中状态样式以及调试边框样式。在 `script.js` 中添加了 `toggleCheckboxDebug` 函数以控制Checkbox的调试模式和坐标显示。
* [2025-06-14 12:08:39] - 根据用户反馈调整了 [`style.css`](style.css:1) 中 `.image-container img` 的样式，恢复 `max-height: 95vh;` 以使图片适配视口高度，同时保持 `width: auto;` 并移除 `max-width`。调试按钮和图片容器位置的更改保持不变。
* [2025-06-14 16:38:17] - Refactored `character_sheet_editor.html` and `style.css`. Removed all `control-container` divs and merged their inline styles directly into the child textboxes. In `style.css`, eliminated the `.control-container` class and moved its `position: absolute;` property to the `.base-textbox` class to simplify the DOM structure and styling.