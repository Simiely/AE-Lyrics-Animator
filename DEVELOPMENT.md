# 开发记录

## 概述

本项目是一个针对 Adobe After Effects 2026 中文版的歌词逐字动画工具脚本。开发过程中遇到了多个 AE API 跨版本兼容性问题，记录了解决方案。

## 关键技术节点

### 1. AE 2026 中文版的 API 差异

**问题：** AE 2026 中文版中，属性面板显示中文，但 matchName 仍然是英文。ScriptUI 操作 API 依赖 matchName 而非 displayName。且与标准英文文档描述的 matchName 存在差异。

**解决方案：** 所有属性访问均使用 matchName + 候选 fallback 列表，支持多版本兼容。关键 `addAnimProperty()` 函数对每个属性准备了多组候选名。

```javascript
// 典型 fallback 链
if (propType === "ADBE Text Position") candidates = [
    "ADBE Text Position", "ADBE Text Position 2D",
    "ADBE Text Position 3D", "Position", "位置"
];
```

### 2. Text Animators 组位置变化

**问题：** 标准 AE 文档中，Text Animators 作为图层的直接子属性访问（`layer.property("ADBE Text Animators")`）。但在 AE 2026 中文版中，Text Animators 位于 `ADBE Text Properties` 内部。

**解决方案：** 增加备选路径查找：

```javascript
var animatorsGroup = layer.property("ADBE Text Animators");
if (!animatorsGroup) {
    var textProps = layer.property("ADBE Text Properties");
    animatorsGroup = textProps.property("ADBE Text Animators");
}
```

### 3. Range Selector 的属性命名

**问题：** Range Selector 的 Start/End 有 4 套命名：
- `ADBE Text Percent Start / ADBE Text Percent End`（百分比模式）
- `ADBE Text Index Start / ADBE Text Index End`（索引模式）
- `ADBE Text Start / ADBE Text End`（通用简写，部分版本不支持）
- 显示名：`Start / End / 起始 / 结束`

**经验：** AE 2026 中 Index 模式的 Start/End 是隐藏属性（3D 类型），`setValue()` 会报错。Percent 模式可以正常使用。

### 4. Animator 属性组的 matchName

**问题：** Animator 内部有两个子组：`ADBE Text Selectors`（选择器）和 `ADBE Text Animator Properties`（动画属性）。在 AE 2026 中文版中，`ADBE Text Properties`（即 `ADBE Text Animator Properties`）有 103 个子属性，包含大量预置属性，`addProperty("ADBE Text Position")` 在某些情况下会失败。

**解决方案：** 先尝试 `addProperty` 创建新属性（避免触及隐藏的预置属性），失败后再回退到 `property()` 访问。

### 5. 3D 属性值类型

**问题：** Position 属性在某些版本中是 3D 属性（`propertyValueType === 6413`），需要传 3 个值 `[x, y, z]`，而普通 2D 属性只需要 `[x, y]`。

**解决方案：** 检测 `propertyValueType` 动态适配：

```javascript
if (pType === 6413) { // ThreeD
    entryPosProp.setValue([-pEntryOff, 0, 0]);
} else {
    entryPosProp.setValue([-pEntryOff, 0]);
}
```

### 6. textIndex 表达式变量不可用

**问题：** AE 中标准表达式变量 `textIndex`（返回当前字符在文本中的序号）在 AE 2026 中提示未定义。所有使用该变量的表达式被禁用。

**尝试过的方案：**
- 直接使用 `textIndex` — ReferenceError
- `typeof textIndex !== 'undefined'` 保护 — 始终为 undefined
- 使用 `textTotal` — 同样未定义

**最终方案：** 放弃表达式层的索引获取，改为**每个字符独立建一个文字动画器**，每个动画器的 Range Selector 锁定到单个字符（Percent 模式），Position 表达式中直接硬编码字符索引作为相位偏移：

```javascript
// 每个字符 ci 的表达式
"[0, Math.sin(time * freq * 2 + " + ci + " * 0.8) * amp]"
```

这避免了表达式引擎中的 `textIndex` 依赖，同时实现了真正的逐字错落效果。

### 7. 调试策略

**问题：** AE ExtendScript 的 `alert()` 弹窗内容不可复制，长调试信息无法完整获取。

**解决方案：** 开发阶段实现了 `showDebugDialog()` 函数，提供一个带多行文本框的窗口，支持全选复制（Ctrl+A, Ctrl+C），关闭后按 Shift 键可重新定位到问题行。

## 架构设计

脚本采用单文件结构：

```
歌词逐字动画工具.jsx
  ├── UI 构建（ScriptUI Panel）
  ├── 参数面板（入场 / 出场 / 高度错落）
  ├── clearAnimators() — 清除动画器
  ├── addAnimProperty() — 安全添加属性（多候选名）
  └── applyAnimation() — 主流程
       ├── 查找 Text Animators 组
       ├── 创建 入场 动画器（Opacity + Blur + Position）
       ├── 创建 出场 动画器（Opacity + Blur + Position）
       └── 创建 高度错落 动画器（逐字 Position 表达式）
```

## 兼容性

测试环境：
- Adobe After Effects 2026 中文版
- Windows 系统

理论上兼容 AE CC 及以上版本（可能需要调整部分 matchName）。