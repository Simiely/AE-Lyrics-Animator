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
4. ⚠️ **实测发现 Index 模式的问题**：Selector 默认 Units 为 Percent，仅设置 Index Start/End 而不切换 Units 会导致设置被忽略。Percent 模式可以精确隔离单个字符，无需改用 Index。

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

### 11. v1.1 修复：波浪效果失效（Index → Percent 回退）

**问题：** v1.0 将高度错落的 Selector 从 Percent 模式改为 Index 模式后，波浪效果完全失效。

**根因分析：** 有两个问题叠加导致失效：

1. **Units 未切换** — Selector 默认 Units 为 `Percent`，在此模式下 `Index Start/End` 属性被忽略，所有动画器均作用于全部字符
2. **属性访问脆弱** — 通过硬编码索引（`property(4)` / `property(5)`）访问 Index Start/End，在不同 AE 版本中属性顺序可能不同

**解决方案：** 回退到 Percent 模式：

```javascript
// 按字符数等分百分比范围，精确锁定单个字符
var pStart = ((ci - 1) / textLen) * 100;
var pEnd   = (ci / textLen) * 100;
hPStart.setValue(pStart);
hPEnd.setValue(pEnd);
```

**验证：** 对于 N 个字符的文本，每个字符获得 `100/N` 的百分比区间，AE 内部按字符均匀分配，不存在精度不足的问题。

**经验教训：** Index 模式需要额外设置 Selector 的 Units 属性（matchName 为 `ADBE Text Selector Units`），且在不同 AE 版本中兼容性更差。Percent 模式在所有版本中稳定可靠。

### 12. v2.0 散落分布：seedRandom + 逐字独立动画器

**需求：** 将每个字符随机散布在画面上，且大小不一，同时支持种子参数保证可复现性。

**实现方案：** 复用逐字独立动画器框架，每个字符一个动画器，Percent Range Selector 锁定单个字符。

**Position 表达式（随机位置）：**

```javascript
// ci = 字符索引, pSeed = 用户种子
seedRandom(pSeed + ci, true);
r = pScatterRange;
[random(-r, r), random(-r, r)]
```

`seedRandom(seed, true)` 的第二个参数 `true` 表示 timeless mode，确保每帧返回相同值。

**Scale 表达式（随机大小）：**

```javascript
seedRandom(pSeed + ci + 9999, true);
s = random(pMinScale, pMaxScale);  // 直接传百分比，如 50~200 表示 50%~200%
[s, s]
```

> ⚠️ **踩坑记录：** 初始版本错误地写了 `random(pMinScale / 100, pMaxScale / 100)`，返回 `[0.5, 0.5]`。但 **AE 的 Scale 属性值本身就是百分比**，`[0.5, 0.5]` 被理解为 0.5%，导致字符极小。修复后直接传入原始百分比值。

使用 `+ 9999` 作为种子偏移，使大小随机分布**独立于**位置随机分布。

**版本对比：**

| 版本 | 效果 | 表达式 |
|------|------|--------|
| v1.0 / v1.1 | 高度波浪 | `[0, sin(time * freq + ci * 0.8) * amp]` |
| v2.0 | 散落分布 | `[random(-r, r), random(-r, r)]` + 随机 Scale |

## 架构设计

### v1.x 架构（高度错落）

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
       └── 创建 N 个 高度错落 动画器（逐字 Percent 锁定 + Position 表达式）

### v2.0 架构（散落分布）

```
歌词逐字散落动画工具.jsx
  ├── UI 构建（ScriptUI Panel）
  │    ├── 入场参数（持续时间 / 模糊 / 偏移）
  │    ├── 出场参数（开始时间 / 持续时间 / 偏移）
  │    ├── 高度错落（幅度 / 频率 / 速度）
  │    ├── 散落分布（散布范围 / 种子 / 最小缩放 / 最大缩放）
  │    ├── 预设管理（存储 1-4 / 使用 1-4 / 清除全部）
  │    └── 应用 / 清除按钮 + 状态栏
  ├── addAnimProperty() — 安全添加属性（多候选名 fallback，含 Scale）
  ├── clearAnimators() — 清除所有"歌词_"前缀动画器
  ├── XMP 存储
  │    ├── readPresets() / writePresets()
  │    └── presetsCache（内存缓存）
  └── applyAnimation() — 主流程（全部 keyframe 以 comp.time 偏移）
       ├── 查找 Text Animators 组（AE 2026 备选路径）
       ├── 创建 入场 动画器（Opacity + Blur + Position）
       ├── 创建 出场 动画器（Opacity + Blur + Position）
       ├── 创建 N 个 散落 动画器（Position + Scale 随机表达式）
       └── 创建 N 个 高度 动画器（Position Y 正弦表达式）

### v3.0 架构（方向选择 + 随机模糊 + 时间控制）

```
歌词逐字散落动画工具.jsx
  ├── UI 构建（ScriptUI Panel）
  │    ├── 入场参数（持续时间 / 模糊 / 偏移 / **方向下拉框**）
  │    ├── 出场参数（开始时间 / 持续时间 / 偏移）— 方向联动
  │    ├── 高度错落（幅度 / 频率 / 速度）
  │    ├── 散落分布（散布范围 / 种子 / **散落开始 / 散落过渡** / 最小缩放 / 最大缩放）
  │    ├── 随机模糊（**模糊种子 / 模糊概率 / 最小模糊 / 最大模糊**）
  │    ├── 预设管理（存储 1-4 / 使用 1-4 / 清除全部）
  │    └── 应用 / 清除按钮 + 状态栏
  ├── addAnimProperty() — 安全添加属性（多候选名 fallback，含 Scale）
  ├── clearAnimators() — 清除所有"歌词_"前缀动画器
  ├── XMP 存储
  │    ├── readPresets() / writePresets() — 新增 5 个字段
  │    └── presetsCache（内存缓存）
  └── applyAnimation() — 主流程（全部 keyframe 以 comp.time 偏移）
       ├── 查找 Text Animators 组（AE 2026 备选路径）
       ├── 创建 入场 动画器（Opacity + Blur + **方向 Position**）
       ├── 创建 出场 动画器（Opacity + Blur + **方向 Position 对称**）
       ├── 创建 N 个 散落 动画器（Position **渐入** + Scale **渐入** + **随机 Blur**）
       └── 创建 N 个 高度 动画器（Position Y 正弦表达式）
```

---

### 13. v3.0 入场/出场方向选择

**需求：** 支持文字从横向（左↔右）或竖向（上↔下）出现和消失。

**实现：** UI 增加 `dropdownlist`，4 个选项对应 4 种方向。入场 Position 初始值和出场 Position 最终值根据方向计算：

| 方向索引 | 方向 | 入场 Position | 出场 Position |
|---------|------|-------------|-------------|
| 0 | 从左到右 | `[-offset, 0]` | `[+offset, 0]` |
| 1 | 从右到左 | `[+offset, 0]` | `[-offset, 0]` |
| 2 | 从上到下 | `[0, -offset]` | `[0, +offset]` |
| 3 | 从下到上 | `[0, +offset]` | `[0, -offset]` |

3D 属性值类型（`propertyValueType === 6413`）时第三维填 0。

### 14. v3.0 散落时间控制（修复"散布范围控不住"）

**问题根因：** v2.0 散落 Position 表达式是恒定的随机偏移 `[random(-r,r), random(-r,r)]`，从第 0 帧就完全生效。当入场动画也在用 Position 偏移时，两个 Animator 的 Position 值叠加，导致：
- 散落效果与入场动画同时存在，视觉上不可控
- 用户调整散布范围参数，但入场 Position 也在同时作用，效果被稀释

**解决方案：** 散落 Position 和 Scale 表达式增加基于时间的**渐入因子** `fade`：

```javascript
// 改进后的 Position 表达式
seedRandom(pSeed + ci, true);
r = pScatterRange;
t = time - startTime;
fade = linear(t, scatterStart, scatterStart + scatterTrans, 0, 1);
[random(-r, r) * fade, random(-r, r) * fade]
```

- `scatterStart`：散落开始时间（绝对时间），建议 ≥ 入场持续时间
- `scatterTrans`：散落过渡时间，控制从无到完全散开的渐变时长
- `fade`：使用 AE `linear()` 函数，0→1 线性渐变

Scale 同样增加渐入，从 100% 渐变到目标值：
```javascript
base = 100;
[base + (s - base) * fade, base + (s - base) * fade]
```

### 15. v3.0 随机模糊效果

**需求：** 基于随机种子，让部分文字模糊、部分清晰，增加视觉层次感。

**实现：** 在散落 Animator 中为每个字符添加 Blur 属性，表达式逻辑：

```javascript
seedRandom(blurSeed + ci, true);
r = random(0, 100);
if (r < blurProb) {
    seedRandom(blurSeed + ci + 5555, true);  // 独立种子
    random(minBlur, maxBlur) * fade;          // 带渐入的模糊值
} else {
    0;  // 不模糊
}
```

关键设计：
- 第一层 `seedRandom` 决定"是否模糊"（概率判断）
- 第二层 `seedRandom`（偏移 5555）独立决定"模糊多少"
- 模糊值也受 `fade` 渐入因子控制，与散落同步过渡
- `blurProb = 0` 时完全关闭随机模糊

**预设兼容性：** 新增 5 个字段（dir, ss, st, bs, bp, bmin, bmax），旧预设缺失时使用合理默认值。

---

### 16. v3.1 入场/出场模式：逐字 vs 一起

**需求：** 支持文字逐字出现/消失，或整段一起出现/消失。

**逐字模式（默认）：** Range Selector Start 关键帧扫描（0→100 或 100→0），配合 Opacity/Blur/Position 静态值。

**一起模式：** Range Selector 覆盖全部字符，Opacity/Blur/Position 用关键帧驱动整段文字统一动画。

### 17. v3.1 面板独立总开关

每个功能面板新增 `checkbox` 总开关，取消勾选跳过该动画器生成。灵活组合（如只要散落+波浪，关闭入场出场）。

### 18. v3.2 UI 迭代与 v3.3 最终布局

**v3.2 经历多次 UI 调整**，最终在 v3.3 稳定：

| 元素 | 宽度 | 说明 |
|------|------|------|
| 标签 | 110px | 中文标签完整显示 |
| 输入框 | `["fill","center"]` | 双轴 fill 撑满剩余空间 |
| 下拉菜单 | 100px | 选项文字完整 |
| 时间提示 | 80px | 半角括号 `(绝对时间)` |
| 按钮 | 130px × 2 | 间距 20px，380px 内一行放下 |

**关键发现：**
- AE dockable Panel 宽度由 AE 主 UI 控制（约 380px），脚本无法改变。`minimumSize`/`maximumSize`/`preferredSize` 在 Panel 模式下不影响实际面板宽度。
- edittext `alignment = "fill"` 单字符串在 row 容器中只作用垂直轴，必须用 `["fill", "center"]` 双轴格式才能在水平方向撑满。
- 面板 `alignChildren = "fill"` + 行 group `alignChildren = "fill"` 形成三层 fill 体系，确保输入框自动适应面板宽度。

---

### 19. v3.4 代码重构

**目标：** 消除重复代码，提高可维护性。

**改动：**
1. `clearAnimators()` 复用 `findAnimatorsGroup()` — 去掉 13 行重复的 Animators 组查找逻辑
2. 提取 `setBlurValue(prop, val)` 和 `setBlurValueAtKey(prop, key, val)` — 封装 2D/1D 类型判断，入场/出场 Blur 设置从各 20+ 行缩到 8 行
3. `addAnimProperty()` 循环变量 `ci` → `ai` — 避免与外层散落/高度循环的 `ci` 混淆
4. 出场模糊变量 `pEntryBlur` → `pExitBlur` — 语义正确

**效果：** 净减少 32 行（966→934），无功能变更。

## 兼容性

测试环境：
- Adobe After Effects 2026 中文版
- Windows 系统

理论上兼容 AE CC 及以上版本（可能需要调整部分 matchName）。