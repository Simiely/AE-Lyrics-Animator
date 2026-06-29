// ============================================================
// 歌词逐字动画工具  v1.1  —  for After Effects 2026
// ============================================================
// 功能：选中文本图层后，自动生成逐字动画
// - 从左侧模糊进入 → 清晰 → 右侧模糊消失
// - 高低位置错落（逐字独立动画器 + Percent Range Selector）
// - 所有参数可调
// - 预设存储/加载（XMP 工程持久化）
// ============================================================

// ---- 构建面板 ----
var pal = (this instanceof Panel) ? this : new Window("palette", "歌词逐字动画工具 v1.1", undefined);
pal.orientation = "column";
pal.alignChildren = "fill";
pal.spacing = 6;
pal.margins = [12, 10, 12, 10];
pal.minimumSize = [320, 420];

// 标题
var titleGrp = pal.add("group");
titleGrp.orientation = "row";
titleGrp.alignment = "center";
var titleText = titleGrp.add("statictext", undefined, "歌词逐字动画工具");

// ---- 参数分类 ----
var tabGrp = pal.add("group");
tabGrp.orientation = "column";
tabGrp.alignChildren = "fill";
tabGrp.spacing = 4;

// ---------- 入场参数 ----------
var entryGrp = tabGrp.add("panel");
entryGrp.text = "  入场参数（左侧模糊 → 清晰）";
entryGrp.orientation = "column";
entryGrp.alignChildren = "right";
entryGrp.spacing = 4;
entryGrp.margins = [10, 18, 10, 10];

var g1 = entryGrp.add("group"); g1.orientation = "row"; g1.alignChildren = "left";
g1.add("statictext", undefined, "持续时间 (秒)").preferredSize.width = 110;
var entryDur = g1.add("edittext", undefined, "2.0"); entryDur.characters = 6; entryDur.alignment = "fill";

var g2 = entryGrp.add("group"); g2.orientation = "row"; g2.alignChildren = "left";
g2.add("statictext", undefined, "最大模糊值").preferredSize.width = 110;
var entryBlur = g2.add("edittext", undefined, "40"); entryBlur.characters = 6; entryBlur.alignment = "fill";

var g3 = entryGrp.add("group"); g3.orientation = "row"; g3.alignChildren = "left";
g3.add("statictext", undefined, "入场偏移 (像素)").preferredSize.width = 110;
var entryOffset = g3.add("edittext", undefined, "80"); entryOffset.characters = 6; entryOffset.alignment = "fill";

// ---------- 出场参数 ----------
var exitGrp = tabGrp.add("panel");
exitGrp.text = "  出场参数（清晰 → 右侧模糊消失）";
exitGrp.orientation = "column";
exitGrp.alignChildren = "right";
exitGrp.spacing = 4;
exitGrp.margins = [10, 18, 10, 10];

var g4 = exitGrp.add("group"); g4.orientation = "row"; g4.alignChildren = "left";
g4.add("statictext", undefined, "出场开始 (秒)").preferredSize.width = 110;
var exitStart = g4.add("edittext", undefined, "3.5"); exitStart.characters = 6; exitStart.alignment = "fill";
g4.add("statictext", undefined, "（绝对时间）").preferredSize.width = 70;

var g5 = exitGrp.add("group"); g5.orientation = "row"; g5.alignChildren = "left";
g5.add("statictext", undefined, "出场持续时间 (秒)").preferredSize.width = 110;
var exitDur = g5.add("edittext", undefined, "2.0"); exitDur.characters = 6; exitDur.alignment = "fill";

var g6 = exitGrp.add("group"); g6.orientation = "row"; g6.alignChildren = "left";
g6.add("statictext", undefined, "出场偏移 (像素)").preferredSize.width = 110;
var exitOffset = g6.add("edittext", undefined, "80"); exitOffset.characters = 6; exitOffset.alignment = "fill";

// ---------- 高度错落参数 ----------
var heightGrp = tabGrp.add("panel");
heightGrp.text = "  高度错落";
heightGrp.orientation = "column";
heightGrp.alignChildren = "right";
heightGrp.spacing = 4;
heightGrp.margins = [10, 18, 10, 10];

var g7 = heightGrp.add("group"); g7.orientation = "row"; g7.alignChildren = "left";
g7.add("statictext", undefined, "波动幅度 (像素)").preferredSize.width = 110;
var heightAmp = g7.add("edittext", undefined, "30"); heightAmp.characters = 6; heightAmp.alignment = "fill";

var g8 = heightGrp.add("group"); g8.orientation = "row"; g8.alignChildren = "left";
g8.add("statictext", undefined, "波动频率").preferredSize.width = 110;
var heightFreq = g8.add("edittext", undefined, "0.7"); heightFreq.characters = 6; heightFreq.alignment = "fill";

var g9 = heightGrp.add("group"); g9.orientation = "row"; g9.alignChildren = "left";
g9.add("statictext", undefined, "流动速度").preferredSize.width = 110;
var speed = g9.add("edittext", undefined, "1.0"); speed.characters = 6; speed.alignment = "fill";

// ---------- 预设管理 ----------
var presetGrp = pal.add("panel");
presetGrp.text = "  预设管理";
presetGrp.orientation = "column";
presetGrp.alignChildren = "fill";
presetGrp.spacing = 4;
presetGrp.margins = [10, 18, 10, 8];

// 存储预设行
var saveRow = presetGrp.add("group");
saveRow.orientation = "row";
saveRow.alignChildren = "center";
saveRow.spacing = 2;
var saveLabel = saveRow.add("statictext", undefined, "存储");
saveLabel.preferredSize.width = 28;
var saveBtns = [];
for (var px = 1; px <= 4; px++) {
    var sBtn = saveRow.add("button", undefined, String(px));
    sBtn.preferredSize.width = 28;
    sBtn.preferredSize.height = 22;
    saveBtns.push(sBtn);
}
var clearPresetBtn = saveRow.add("button", undefined, "清除全部");
clearPresetBtn.preferredSize.width = 64;
clearPresetBtn.preferredSize.height = 22;

// 使用预设行
var loadRow = presetGrp.add("group");
loadRow.orientation = "row";
loadRow.alignChildren = "center";
loadRow.spacing = 2;
var loadLabel = loadRow.add("statictext", undefined, "使用");
loadLabel.preferredSize.width = 28;
var loadBtns = [];
for (var px = 1; px <= 4; px++) {
    var lBtn = loadRow.add("button", undefined, String(px));
    lBtn.preferredSize.width = 28;
    lBtn.preferredSize.height = 22;
    lBtn.enabled = false;
    loadBtns.push(lBtn);
}

// 复位按钮行
var resetRow = presetGrp.add("group");
resetRow.orientation = "row";
resetRow.alignChildren = "center";
resetRow.spacing = 2;
var resetBtn = resetRow.add("button", undefined, "复位");
resetBtn.preferredSize.width = 80;
resetBtn.preferredSize.height = 22;

// 绑定存储按钮
for (var px = 1; px <= 4; px++) {
    saveBtns[px - 1].onClick = (function(idx) {
        return function() { saveSlot(idx); };
    })(px);
}
// 绑定使用按钮
for (var px = 1; px <= 4; px++) {
    loadBtns[px - 1].onClick = (function(idx) {
        return function() { loadSlot(idx); };
    })(px);
}
clearPresetBtn.onClick = function() { clearAllPresets(); };
resetBtn.onClick = function() { resetParams(); };

// ---------- 按钮 ----------
var btnGrp = pal.add("group");
btnGrp.orientation = "row";
btnGrp.alignment = "center";
btnGrp.spacing = 20;
btnGrp.margins = [0, 6, 0, 0];

var applyBtn = btnGrp.add("button", undefined, "应用动画");
applyBtn.preferredSize.width = 130;
applyBtn.preferredSize.height = 28;

var clearBtn = btnGrp.add("button", undefined, "清除动画");
clearBtn.preferredSize.width = 130;
clearBtn.preferredSize.height = 28;

// 状态栏
var statusBar = pal.add("statictext", undefined, "就绪 - 选中一个文本图层后点击应用");
statusBar.alignment = "left";
statusBar.margins = [0, 4, 0, 0];

// 提示
var tipBar = pal.add("statictext", undefined, "提示：文字显示不全时，在末尾加空格即可");
tipBar.alignment = "left";
tipBar.margins = [0, 0, 0, 0];

// ============================================================
// 核心功能
// ============================================================

function getVal(ctrl, def) {
    var v = parseFloat(ctrl.text);
    return isNaN(v) ? def : v;
}

function setStatus(msg, isError) {
    statusBar.text = msg;
}

// ---- 清除动画 ----
function clearAnimators() {
    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) {
        setStatus("请先激活一个合成", true);
        return;
    }
    var layer = comp.selectedLayers[0];
    if (!layer || !(layer instanceof TextLayer)) {
        setStatus("请选中一个文本图层", true);
        return;
    }

    // 查找文字动画器组（兼容AE 2026中文版）
    var animatorsGroup = layer.property("ADBE Text Animators");
    if (!animatorsGroup) {
        var textProps = layer.property("ADBE Text Properties");
        if (textProps) animatorsGroup = textProps.property("ADBE Text Animators");
    }
    if (!animatorsGroup) {
        for (var di = 1; di <= layer.numProperties; di++) {
            var dp = layer.property(di);
            if (dp.matchName && dp.matchName.indexOf("ADBE") >= 0 && dp.matchName.indexOf("nimator") >= 0) {
                animatorsGroup = dp; break;
            }
        }
    }
    if (!animatorsGroup) { setStatus("该图层没有文字动画器", true); return; }

    // 删除以 "歌词_" 开头的动画器
    var removed = 0;
    for (var i = animatorsGroup.numProperties; i >= 1; i--) {
        var anim = animatorsGroup.property(i);
        if (anim.name && anim.name.indexOf("歌词_") === 0) {
            anim.remove();
            removed++;
        }
    }

    if (removed > 0) {
        setStatus("已清除 " + removed + " 个文字动画器");
    } else {
        setStatus("未找到需要清除的文字动画器");
    }
}

// ---- 安全添加属性（兼容 matchName 差异） ----
function addAnimProperty(propsGroup, propType) {
    // 候选名列表
    var candidates = [propType];
    if (propType === "ADBE Text Blur") candidates = ["ADBE Text Blur", "ADBE Text Blur 2D", "ADBE Text Blur 3D", "Blur", "模糊"];
    else if (propType === "ADBE Text Position") candidates = ["ADBE Text Position", "ADBE Text Position 2D", "ADBE Text Position 3D", "Position", "位置"];
    else if (propType === "ADBE Text Opacity") candidates = ["ADBE Text Opacity", "ADBE Text Opacity Percent", "Opacity", "不透明度"];

    // 优先用 addProperty 创建新属性（避免预置属性的隐藏问题）
    if (propsGroup.addProperty) {
        for (var ci = 0; ci < candidates.length; ci++) {
            try {
                var result = propsGroup.addProperty(candidates[ci]);
                if (result) return result;
            } catch (e) {}
        }
    }

    // 回退：用 property 访问预置属性
    for (var ci = 0; ci < candidates.length; ci++) {
        try {
            var result = propsGroup.property(candidates[ci]);
            if (result) return result;
        } catch (e) {}
    }

    setStatus("错误: 无法添加属性 " + propType);
    return null;
}

// ---- XMP 存储（随工程文件保存预设） ----
var XMP_MARKER = "<!--AE_Lyrics_Presets:";

function readPresets() {
    try {
        var xmp = app.project.xmpPacket;
        if (!xmp) return null;
        var s = xmp.indexOf(XMP_MARKER);
        if (s < 0) return null;
        var d = s + XMP_MARKER.length;
        var e = xmp.indexOf("-->", d);
        return e < 0 ? null : JSON.parse(xmp.substring(d, e));
    } catch (ex) { return null; }
}

function writePresets(data) {
    try {
        var tag = XMP_MARKER + JSON.stringify(data) + "-->";
        var xmp = app.project.xmpPacket || "";
        var s = xmp.indexOf(XMP_MARKER);
        if (s >= 0) {
            var e = xmp.indexOf("-->", s);
            xmp = xmp.substring(0, s) + tag + (e >= 0 ? xmp.substring(e + 3) : "");
        } else {
            var pe = xmp.indexOf('<?xpacket end');
            xmp = pe >= 0 ? xmp.substring(0, pe) + tag + "\n" + xmp.substring(pe) : xmp + "\n" + tag;
        }
        app.project.xmpPacket = xmp;
    } catch (ex) { /* XMP写入非关键，内存缓存保证功能 */ }
}

// 内存缓存，避免依赖 XMP 读取
var presetsCache = readPresets() || {};

function saveSlot(idx) {
    var params = {
        d: entryDur.text, b: entryBlur.text, o: entryOffset.text,
        es: exitStart.text, ed: exitDur.text, eo: exitOffset.text,
        a: heightAmp.text, f: heightFreq.text, sp: speed.text
    };
    presetsCache[String(idx)] = params;
    writePresets(presetsCache);
    updateLoadButtons();
    setStatus("已保存到预设 " + idx);
}

function loadSlot(idx) {
    if (!presetsCache || !presetsCache[String(idx)]) {
        setStatus("预设 " + idx + " 没有数据");
        return;
    }
    var p = presetsCache[String(idx)];
    entryDur.text = p.d || "2.0";
    entryBlur.text = p.b || "40";
    entryOffset.text = p.o || "80";
    exitStart.text = p.es || "3.5";
    exitDur.text = p.ed || "2.0";
    exitOffset.text = p.eo || "80";
    heightAmp.text = p.a || "30";
    heightFreq.text = p.f || "0.7";
    speed.text = p.sp || "1.0";
    setStatus("已加载预设 " + idx);
}

function resetParams() {
    entryDur.text = "2.0";
    entryBlur.text = "40";
    entryOffset.text = "80";
    exitStart.text = "3.5";
    exitDur.text = "2.0";
    exitOffset.text = "80";
    heightAmp.text = "30";
    heightFreq.text = "0.7";
    speed.text = "1.0";
    setStatus("参数已复位");
}

function clearAllPresets() {
    presetsCache = {};
    writePresets(presetsCache);
    updateLoadButtons();
    setStatus("已清除所有预设");
}

function updateLoadButtons() {
    for (var pi = 1; pi <= 4; pi++) {
        if (loadBtns && loadBtns[pi - 1]) {
            loadBtns[pi - 1].enabled = (presetsCache && presetsCache[String(pi)]) ? true : false;
        }
    }
}

// ---- 应用动画 ----
function applyAnimation() {
    try {
        setStatus("执行中...");

        // 获取参数
        var pEntryDur   = Math.max(0.1, getVal(entryDur, 2.0));
        var pEntryBlur  = Math.max(0, getVal(entryBlur, 40));
        var pEntryOff   = getVal(entryOffset, 80);
        var pExitStart  = Math.max(0, getVal(exitStart, 3.5));
        var pExitDur    = Math.max(0.1, getVal(exitDur, 2.0));
        var pExitOff    = getVal(exitOffset, 80);
        var pHeightAmp  = Math.max(0, getVal(heightAmp, 30));
        var pHeightFreq = Math.max(0.01, getVal(heightFreq, 0.7));
        var pSpeed      = Math.max(0.01, getVal(speed, 1.0));

        // 验证选区
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            setStatus("错误: 请先激活一个合成"); return;
        }
        var layer = comp.selectedLayers[0];
        if (!layer || !(layer instanceof TextLayer)) {
            setStatus("错误: 请选中一个文本图层"); return;
        }

        // ---- 获取播放头位置作为动画起始时间 ----
        var startTime = comp.time;

        // ---- 查找文字动画器组（兼容不同AE版本） ----
        // AE 2026 中文版中，Text Animators 位于 Text Properties 内部
        var animatorsGroup = layer.property("ADBE Text Animators");
        if (!animatorsGroup) {
            var textProps = layer.property("ADBE Text Properties");
            if (textProps) {
                animatorsGroup = textProps.property("ADBE Text Animators");
            }
        }
        // 最终尝试：按名称搜索
        if (!animatorsGroup) {
            for (var di = 1; di <= layer.numProperties; di++) {
                var dp = layer.property(di);
                if (dp.matchName && dp.matchName.indexOf("ADBE") >= 0 && dp.matchName.indexOf("nimator") >= 0) {
                    animatorsGroup = dp; break;
                }
            }
        }
        if (!animatorsGroup) {
            setStatus("错误: 找不到文字动画器组"); return;
        }
        // 清除旧的歌词动画器
        for (var i = animatorsGroup.numProperties; i >= 1; i--) {
            var a = animatorsGroup.property(i);
            if (a.name && a.name.indexOf("歌词_") === 0) {
                a.remove();
            }
        }

        // ---- 检查文本长度 ----
        var textProp = layer.property("ADBE Text Properties");
        var sourceText = textProp.property("ADBE Text Source Text");
        if (!sourceText) sourceText = textProp.property("ADBE Text Document");
        var textDoc = sourceText.value;
        var textLen = 1;
        if (typeof textDoc === "string") textLen = textDoc.length;
        else if (textDoc && textDoc.text) textLen = textDoc.text.length;

        // ============================================================
        // Animator 1: 入场
        // ============================================================
        var entryAnim = animatorsGroup.addProperty("ADBE Text Animator");
        entryAnim.name = "歌词_入场";

        var entrySel = entryAnim.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
        // 查找 Selector 的 Start/End 属性（兼容 matchName 差异）
        var entryStartProp = entrySel.property("ADBE Text Start");
        var entryEndProp   = entrySel.property("ADBE Text End");
        if (!entryStartProp || !entryEndProp) {
            // 尝试按显示名称查找
            if (!entryStartProp) entryStartProp = entrySel.property("Start");
            if (!entryEndProp) entryEndProp = entrySel.property("End");
            // 再尝试按索引查找（通常是 [1]=Start, [2]=End）
            if (!entryStartProp && entrySel.numProperties >= 1) entryStartProp = entrySel.property(1);
            if (!entryEndProp && entrySel.numProperties >= 2) entryEndProp = entrySel.property(2);
            if (!entryStartProp || !entryEndProp) {
                setStatus("错误: 找不到 Selector Start/End"); return;
            }
        }
        entryEndProp.setValue(100);

        var k1 = entryStartProp.addKey(startTime);
        entryStartProp.setValueAtKey(k1, 0);
        var k2 = entryStartProp.addKey(startTime + (pEntryDur / pSpeed));
        entryStartProp.setValueAtKey(k2, 100);

        var entryProps = entryAnim.property("ADBE Text Properties");
        if (!entryProps) {
            // 尝试按名称查找属性组
            for (var si = 1; si <= entryAnim.numProperties; si++) {
                var sp = entryAnim.property(si);
                if (sp.matchName && sp.matchName.indexOf("ADBE") >= 0 && (sp.matchName.indexOf("Property") >= 0 || sp.matchName.indexOf("属性") >= 0)) {
                    // 跳过 Selectors 组
                    if (sp.matchName.indexOf("Select") < 0) {
                        entryProps = sp; break;
                    }
                }
            }
            if (!entryProps) entryProps = entryAnim.property(entryAnim.numProperties); // 最后一个通常是属性组
            if (!entryProps) { setStatus("错误: 找不到 Animator 属性组"); return; }
        }
        // Opacity=0: 未露出的字符完全不可见
        var entryOpProp = addAnimProperty(entryProps, "ADBE Text Opacity");
        if (entryOpProp) { try { entryOpProp.setValue(0); } catch(e) {} }

        var entryBlurProp = addAnimProperty(entryProps, "ADBE Text Blur");
        if (entryBlurProp) {
            try {
                if (entryBlurProp.propertyValueType === PropertyValueType.TwoD) {
                    entryBlurProp.setValue([pEntryBlur, pEntryBlur]);
                } else {
                    entryBlurProp.setValue(pEntryBlur);
                }
            } catch (e2) {
                try { entryBlurProp.setValue(pEntryBlur); } catch (e) {}
            }
        }

        var entryPosProp = addAnimProperty(entryProps, "ADBE Text Position");
        if (entryPosProp) {
            // 根据属性值类型适配（可能是2D或3D）
            try {
                var pType = entryPosProp.propertyValueType;
                if (pType === 6413) { // ThreeD
                    entryPosProp.setValue([-pEntryOff, 0, 0]);
                } else {
                    entryPosProp.setValue([-pEntryOff, 0]);
                }
            } catch (e3) {
                setStatus("错误: Position 属性设置失败");
            }
        }

        // ============================================================
        // Animator 2: 出场
        // ============================================================
        var exitStartTime = pExitStart;
        var exitEndTime   = exitStartTime + pExitDur / pSpeed;

        var exitAnim = animatorsGroup.addProperty("ADBE Text Animator");
        exitAnim.name = "歌词_出场";

        var exitSel = exitAnim.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
        // 查找 Selector 的 Start/End 属性（兼容 matchName 差异）
        var exitStartProp = exitSel.property("ADBE Text Start");
        var exitEndProp   = exitSel.property("ADBE Text End");
        if (!exitStartProp || !exitEndProp) {
            if (!exitStartProp) exitStartProp = exitSel.property("Start");
            if (!exitEndProp) exitEndProp = exitSel.property("End");
            if (!exitStartProp && exitSel.numProperties >= 1) exitStartProp = exitSel.property(1);
            if (!exitEndProp && exitSel.numProperties >= 2) exitEndProp = exitSel.property(2);
            if (!exitStartProp || !exitEndProp) {
                setStatus("错误: 找不到出场 Selector Start/End"); return;
            }
        }
        exitEndProp.setValue(100);

        var k3 = exitStartProp.addKey(startTime + exitStartTime);
        exitStartProp.setValueAtKey(k3, 100);
        var k4 = exitStartProp.addKey(startTime + exitEndTime);
        exitStartProp.setValueAtKey(k4, 0);

        var exitProps = exitAnim.property("ADBE Text Properties");
        if (!exitProps) {
            for (var si = 1; si <= exitAnim.numProperties; si++) {
                var sp = exitAnim.property(si);
                if (sp.matchName && sp.matchName.indexOf("ADBE") >= 0 && sp.matchName.indexOf("Property") >= 0 && sp.matchName.indexOf("Select") < 0) {
                    exitProps = sp; break;
                }
            }
            if (!exitProps) exitProps = exitAnim.property(exitAnim.numProperties);
            if (!exitProps) { setStatus("错误: 找不到出场 Animator 属性组"); return; }
        }

        var exitOpProp = addAnimProperty(exitProps, "ADBE Text Opacity");
        if (exitOpProp) exitOpProp.setValue(0);

        var exitBlurProp = addAnimProperty(exitProps, "ADBE Text Blur");
        if (exitBlurProp) {
            try {
                if (exitBlurProp.propertyValueType === PropertyValueType.TwoD) {
                    exitBlurProp.setValue([pEntryBlur, pEntryBlur]);
                } else {
                    exitBlurProp.setValue(pEntryBlur);
                }
            } catch (e2) {
                try { exitBlurProp.setValue(pEntryBlur); } catch (e) {}
            }
        }

        var exitPosProp = addAnimProperty(exitProps, "ADBE Text Position");
        if (exitPosProp) exitPosProp.setValue([pExitOff, 0]);

        // ============================================================
        // Animator 3: 高度错落（逐字独立动画器）
        // ============================================================
        // 每个字符单独建一个动画器，用 Percent Range Selector 锁定单个字符范围，表达式做相位偏移
        for (var ci = 1; ci <= textLen; ci++) {
            var hAnim = animatorsGroup.addProperty("ADBE Text Animator");
            hAnim.name = "歌词_高度_" + ci;

            // 获取属性组
            var hProps = hAnim.property("ADBE Text Properties");
            if (!hProps) {
                for (var si = 1; si <= hAnim.numProperties; si++) {
                    var sp = hAnim.property(si);
                    if (sp.matchName && sp.matchName.indexOf("ADBE") >= 0 && sp.matchName.indexOf("Property") >= 0 && sp.matchName.indexOf("Select") < 0) {
                        hProps = sp; break;
                    }
                }
                if (!hProps) hProps = hAnim.property(hAnim.numProperties);
            }
            if (!hProps) continue;

            // 添加 Selector，仅影响当前字符（Percent 模式，已验证在所有 AE 2026 版本生效）
            var hSel = hAnim.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
            var hPStart = hSel.property("ADBE Text Percent Start");
            if (!hPStart) hPStart = hSel.property("ADBE Text Start");
            if (!hPStart) hPStart = hSel.property("Start");
            if (!hPStart && hSel.numProperties >= 1) hPStart = hSel.property(1);
            var hPEnd = hSel.property("ADBE Text Percent End");
            if (!hPEnd) hPEnd = hSel.property("ADBE Text End");
            if (!hPEnd) hPEnd = hSel.property("End");
            if (!hPEnd && hSel.numProperties >= 2) hPEnd = hSel.property(2);
            if (hPStart && hPEnd) {
                // 按百分比划分单个字符的范围
                var pStart = ((ci - 1) / textLen) * 100;
                var pEnd = (ci / textLen) * 100;
                hPStart.setValue(pStart);
                hPEnd.setValue(pEnd);
            }

            // 添加 Position + 表达式（ci 做相位偏移）
            var hPos = addAnimProperty(hProps, "ADBE Text Position");
            if (hPos) {
                var hExpr = "amp = " + pHeightAmp + ";\n";
                hExpr += "freq = " + pHeightFreq + ";\n";
                hExpr += "[0, Math.sin(time * freq * 2 + " + ci + " * 0.8) * amp]";
                hPos.expressionEnabled = true;
                hPos.expression = hExpr;
            }
        }

        // ============================================================
        // 完成
        // ============================================================
        setStatus("完成! 入场" + (pEntryDur / pSpeed).toFixed(1) +
            "s 出场" + exitStartTime.toFixed(1) + "-" + exitEndTime.toFixed(1) +
            "s " + textLen + "字符");
        $.writeln("歌词动画已应用成功");

    } catch (err) {
        var errLine = err.line || err.lineNumber || "?";
        var errMsg = err.toString() + " (行" + errLine + ")";
        setStatus("出错: " + errMsg);
        $.writeln("歌词动画出错: " + err.toString() + " line:" + errLine);
    }
}

// ---- 绑定按钮 ----
applyBtn.onClick = function() { applyAnimation(); };
clearBtn.onClick = function() { clearAnimators(); };

// ---- 打开/刷新面板 ----
if (pal instanceof Window) {
    pal.center();
    pal.show();
}
pal.layout.layout(true);
if (pal instanceof Panel) {
    try { pal.layout.resize(); } catch (e) {}
}
// 加载已有预设状态
try { updateLoadButtons(); } catch (e) {}