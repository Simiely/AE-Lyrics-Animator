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

**解决方案：** 开发阶段实现了 `showDebugDialog()` 函数，提供一个带多行文本框的窗口，支持全选复制（Ctrl+A, Ctrl+C）。发布后移除。

### 8. 逐字独立动画器方案（替代 textIndex）

**问题：** `textIndex` 表达式变量在 AE 2026 中不可用，无法在表达式中获取当前字符索引来创建独立的相位偏移。

**早期方案：** 单动画器 + Range Selector 扫描 + 时间基表达式 → 所有字符一起浮动，无法错落。

**最终方案：** 每个字符独立创建一个文字动画器，通过 Range Selector 锁定到单个字符：

```
字符1 → 动画器"歌词_高度_1" → Range [83.33, 100] → Position 表达式 idx=1
字符2 → 动画器"歌词_高度_2" → Range [66.67, 83.33] → Position 表达式 idx=2
...
```

**关键实现细节：**
1. Range Selector 的 Index Start/End 在 AE 2026 中是隐藏属性（3D 类型），`setValue()` 失败
2. 解决方案：先用 `addKey(startTime)` + `setValueAtKey()` 绕过隐藏限制
3. 再回退到 `expression = String(ci)` 用表达式返回常量值
4. Percent 模式精度不足以隔离单个字符，Index 模式是精确方案

### 9. 动画起始时间偏移

**需求：** 动画应从合成中播放头所在位置开始，而非固定从 0 秒。

**实现：** 读 `comp.time` 作为基准时间，所有关键帧时间偏移：

```javascript
var startTime = comp.time;
// 所有 addKey / setValueAtKey 都使用 startTime + offset
var k1 = entryStartProp.addKey(startTime);
entryStartProp.setValueAtKey(k1, 0);
var k2 = entryStartProp.addKey(startTime + pEntryDur / pSpeed);
entryStartProp.setValueAtKey(k2, 100);
```

受影响的 6 处关键帧：
- 入场 Start：`startTime` → `startTime + 入场持续时间`
- 出场 Start：`startTime + 出场开始` → `startTime + 出场结束`
- 高度 Index 锁定：`startTime`

### 10. 预设存储与持久化

**需求：** 用户保存的预设参数应随工程文件保存，换电脑打开仍可保留。

**方案：** 利用 `app.project.xmpPacket`（AE 工程的 XMP 元数据），用 XML 注释格式嵌入 JSON：

```javascript
<!--AE_Lyrics_Presets:{"1":{"d":"2.0","b":"40",...},"2":{...}}-->
```

**双缓存策略：**

```
保存 → 更新内存缓存 presetsCache → 异步写入 XMP（工程文件）
加载 → 直接从 presetsCache 读取（不依赖 XMP 回读）
初始化 → 从 XMP 读取到 presetsCache → 更新按钮状态
```

这种设计确保即使 XMP 写入失败（如无工程文件时），面板内功能依然正常。

## 架构设计

脚本采用单文件结构：

```
歌词逐字动画工具.jsx
  ├── UI 构建（ScriptUI Panel）
  │    ├── 入场参数（持续时间 / 模糊 / 偏移）
  │    ├── 出场参数（开始时间 / 持续时间 / 偏移）
  │    ├── 高度错落（幅度 / 频率 / 速度）
  │    ├── 预设管理（存储 1-4 / 使用 1-4 / 清除全部）
  │    └── 应用 / 清除按钮 + 状态栏
  ├── addAnimProperty() — 安全添加属性（多候选名 fallback）
  ├── clearAnimators() — 清除所有"歌词_"前缀动画器
  ├── XMP 存储
  │    ├── readPresets() / writePresets()
  │    └── presetsCache（内存缓存）
  └── applyAnimation() — 主流程（全部 keyframe 以 comp.time 偏移）
       ├── 查找 Text Animators 组（AE 2026 备选路径）
       ├── 创建 入场 动画器（Opacity + Blur + Position）
       ├── 创建 出场 动画器（Opacity + Blur + Position）
       └── 创建 N 个 高度错落 动画器（逐字 Index 锁定 + Position 表达式）
```

## 兼容性

测试环境：
- Adobe After Effects 2026 中文版
- Windows 系统

理论上兼容 AE CC 及以上版本（可能需要调整部分 matchName）。