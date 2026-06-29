// ============================================================
// 歌词逐字散落动画工具  v3.0  —  for After Effects 2026
// ============================================================
// 功能：选中文本图层后，自动生成逐字动画
// - 入场方向可选（左/右/上/下）模糊进入 → 清晰
// - 出场方向与入场对称，文字渐隐消失并变模糊
// - 高度错落（波浪浮动）+ 散落分布（随机位置、随机大小、可控时间）
// - 随机模糊效果（部分字符模糊、部分清晰，基于种子可复现）
// - 种子参数控制随机分布位置，可复现
// - 所有参数可调
// - 预设存储/加载（XMP 工程持久化）
// ============================================================

// ---- 构建面板 ----
var pal = (this instanceof Panel) ? this : new Window("palette", "歌词逐字散落动画工具 v3.0", undefined);
pal.orientation = "column";
pal.alignChildren = "fill";
pal.spacing = 6;
pal.margins = [12, 10, 12, 10];
pal.minimumSize = [300, 520];

// 标题
var titleGrp = pal.add("group");
titleGrp.orientation = "row";
titleGrp.alignment = "center";
var titleText = titleGrp.add("statictext", undefined, "歌词逐字散落动画工具 v3.0");

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
g1.add("statictext", undefined, "持续时间 (秒)").preferredSize.width = 100;
var entryDur = g1.add("edittext", undefined, "2.0"); entryDur.characters = 6; entryDur.alignment = "fill";

var g2 = entryGrp.add("group"); g2.orientation = "row"; g2.alignChildren = "left";
g2.add("statictext", undefined, "最大模糊值").preferredSize.width = 100;
var entryBlur = g2.add("edittext", undefined, "40"); entryBlur.characters = 6; entryBlur.alignment = "fill";

var g3 = entryGrp.add("group"); g3.orientation = "row"; g3.alignChildren = "left";
g3.add("statictext", undefined, "入场偏移 (像素)").preferredSize.width = 100;
var entryOffset = g3.add("edittext", undefined, "80"); entryOffset.characters = 6; entryOffset.alignment = "fill";

// 方向选择
var gDir = entryGrp.add("group"); gDir.orientation = "row"; gDir.alignChildren = "left";
gDir.add("statictext", undefined, "入场方向").preferredSize.width = 100;
var entryDirection = gDir.add("dropdownlist", undefined, ["从左到右", "从右到左", "从上到下", "从下到上"]);
entryDirection.selection = 0;
entryDirection.preferredSize.width = 90;

// ---------- 出场参数 ----------
var exitGrp = tabGrp.add("panel");
exitGrp.text = "  出场参数（清晰 → 右侧模糊消失）";
exitGrp.orientation = "column";
exitGrp.alignChildren = "right";
exitGrp.spacing = 4;
exitGrp.margins = [10, 18, 10, 10];

var g4 = exitGrp.add("group"); g4.orientation = "row"; g4.alignChildren = "left";
g4.add("statictext", undefined, "出场开始 (秒)").preferredSize.width = 100;
var exitStart = g4.add("edittext", undefined, "3.5"); exitStart.characters = 6; exitStart.alignment = "fill";
g4.add("statictext", undefined, "（绝对时间）").preferredSize.width = 70;

var g5 = exitGrp.add("group"); g5.orientation = "row"; g5.alignChildren = "left";
g5.add("statictext", undefined, "出场持续时间 (秒)").preferredSize.width = 100;
var exitDur = g5.add("edittext", undefined, "2.0"); exitDur.characters = 6; exitDur.alignment = "fill";

var g6 = exitGrp.add("group"); g6.orientation = "row"; g6.alignChildren = "left";
g6.add("statictext", undefined, "出场偏移 (像素)").preferredSize.width = 100;
var exitOffset = g6.add("edittext", undefined, "80"); exitOffset.characters = 6; exitOffset.alignment = "fill";

// ---------- 高度错落参数 ----------
var heightGrp = tabGrp.add("panel");
heightGrp.text = "  高度错落（波浪浮动）";
heightGrp.orientation = "column";
heightGrp.alignChildren = "right";
heightGrp.spacing = 4;
heightGrp.margins = [10, 18, 10, 10];

var g7 = heightGrp.add("group"); g7.orientation = "row"; g7.alignChildren = "left";
g7.add("statictext", undefined, "波动幅度 (像素)").preferredSize.width = 100;
var heightAmp = g7.add("edittext", undefined, "30"); heightAmp.characters = 6; heightAmp.alignment = "fill";

var g8 = heightGrp.add("group"); g8.orientation = "row"; g8.alignChildren = "left";
g8.add("statictext", undefined, "波动频率").preferredSize.width = 100;
var heightFreq = g8.add("edittext", undefined, "0.7"); heightFreq.characters = 6; heightFreq.alignment = "fill";

var g9 = heightGrp.add("group"); g9.orientation = "row"; g9.alignChildren = "left";
g9.add("statictext", undefined, "流动速度").preferredSize.width = 100;
var speed = g9.add("edittext", undefined, "1.0"); speed.characters = 6; speed.alignment = "fill";

// ---------- 散落分布参数 ----------
var scatterGrp = tabGrp.add("panel");
scatterGrp.text = "  散落分布（随机位置 / 大小 / 模糊）";
scatterGrp.orientation = "column";
scatterGrp.alignChildren = "right";
scatterGrp.spacing = 4;
scatterGrp.margins = [10, 18, 10, 10];

var gS1 = scatterGrp.add("group"); gS1.orientation = "row"; gS1.alignChildren = "left";
gS1.add("statictext", undefined, "散布范围 (像素)").preferredSize.width = 100;
var scatterRange = gS1.add("edittext", undefined, "150"); scatterRange.characters = 6; scatterRange.alignment = "fill";

var gS2 = scatterGrp.add("group"); gS2.orientation = "row"; gS2.alignChildren = "left";
gS2.add("statictext", undefined, "随机种子").preferredSize.width = 100;
var seed = gS2.add("edittext", undefined, "1"); seed.characters = 6; seed.alignment = "fill";

var gS3 = scatterGrp.add("group"); gS3.orientation = "row"; gS3.alignChildren = "left";
gS3.add("statictext", undefined, "散落开始 (秒)").preferredSize.width = 100;
var scatterStart = gS3.add("edittext", undefined, "2.0"); scatterStart.characters = 6; scatterStart.alignment = "fill";
gS3.add("statictext", undefined, "（绝对时间）").preferredSize.width = 70;

var gS4 = scatterGrp.add("group"); gS4.orientation = "row"; gS4.alignChildren = "left";
gS4.add("statictext", undefined, "散落过渡 (秒)").preferredSize.width = 100;
var scatterTrans = gS4.add("edittext", undefined, "1.0"); scatterTrans.characters = 6; scatterTrans.alignment = "fill";

var gS5 = scatterGrp.add("group"); gS5.orientation = "row"; gS5.alignChildren = "left";
gS5.add("statictext", undefined, "最小缩放 (%)").preferredSize.width = 100;
var minScale = gS5.add("edittext", undefined, "50"); minScale.characters = 6; minScale.alignment = "fill";

var gS6 = scatterGrp.add("group"); gS6.orientation = "row"; gS6.alignChildren = "left";
gS6.add("statictext", undefined, "最大缩放 (%)").preferredSize.width = 100;
var maxScale = gS6.add("edittext", undefined, "200"); maxScale.characters = 6; maxScale.alignment = "fill";

// 随机模糊参数
var gS7 = scatterGrp.add("group"); gS7.orientation = "row"; gS7.alignChildren = "left";
gS7.add("statictext", undefined, "模糊随机种子").preferredSize.width = 100;
var blurSeed = gS7.add("edittext", undefined, "10"); blurSeed.characters = 6; blurSeed.alignment = "fill";

var gS8 = scatterGrp.add("group"); gS8.orientation = "row"; gS8.alignChildren = "left";
gS8.add("statictext", undefined, "模糊概率 (%)").preferredSize.width = 100;
var blurProb = gS8.add("edittext", undefined, "40"); blurProb.characters = 6; blurProb.alignment = "fill";

var gS9 = scatterGrp.add("group"); gS9.orientation = "row"; gS9.alignChildren = "left";
gS9.add("statictext", undefined, "最小模糊值").preferredSize.width = 100;
var blurMin = gS9.add("edittext", undefined, "0"); blurMin.characters = 6; blurMin.alignment = "fill";

var gS10 = scatterGrp.add("group"); gS10.orientation = "row"; gS10.alignChildren = "left";
gS10.add("statictext", undefined, "最大模糊值").preferredSize.width = 100;
var blurMax = gS10.add("edittext", undefined, "25"); blurMax.characters = 6; blurMax.alignment = "fill";

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
saveRow.spacing = 1;
var saveLabel = saveRow.add("statictext", undefined, "存储");
saveLabel.size = {width: 24, height: 20};
var saveBtns = [];
for (var px = 1; px <= 4; px++) {
    var sBtn = saveRow.add("button", undefined, String(px));
    sBtn.size = {width: 24, height: 22};
    saveBtns.push(sBtn);
}
var clearPresetBtn = saveRow.add("button", undefined, "清除全部");
clearPresetBtn.size = {width: 60, height: 22};

// 使用预设行 + 复位按钮
var loadRow = presetGrp.add("group");
loadRow.orientation = "row";
loadRow.alignChildren = "center";
loadRow.spacing = 1;
var loadLabel = loadRow.add("statictext", undefined, "使用");
loadLabel.size = {width: 24, height: 20};
var loadBtns = [];
for (var px = 1; px <= 4; px++) {
    var lBtn = loadRow.add("button", undefined, String(px));
    lBtn.size = {width: 24, height: 22};
    lBtn.enabled = false;
    loadBtns.push(lBtn);
}
var resetBtn = loadRow.add("button", undefined, "复位");
resetBtn.size = {width: 55, height: 22};

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
var tipBar = pal.add("statictext", undefined, "提示：散落开始时间应 ≥ 入场持续时间，避免效果重叠");
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
    else if (propType === "ADBE Text Scale") candidates = ["ADBE Text Scale", "ADBE Text Scale 3D", "Scale", "缩放"];

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
        d: entryDur.text, b: entryBlur.text, o: entryOffset.text, dir: entryDirection.selection ? entryDirection.selection.index : 0,
        es: exitStart.text, ed: exitDur.text, eo: exitOffset.text,
        a: heightAmp.text, f: heightFreq.text, sp: speed.text,
        r: scatterRange.text, sd: seed.text,
        ss: scatterStart.text, st: scatterTrans.text,
        mn: minScale.text, mx: maxScale.text,
        bs: blurSeed.text, bp: blurProb.text, bmin: blurMin.text, bmax: blurMax.text
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
    if (entryDirection && p.dir !== undefined) entryDirection.selection = parseInt(p.dir);
    exitStart.text = p.es || "3.5";
    exitDur.text = p.ed || "2.0";
    exitOffset.text = p.eo || "80";
    heightAmp.text = p.a || "30";
    heightFreq.text = p.f || "0.7";
    speed.text = p.sp || "1.0";
    scatterRange.text = p.r || "150";
    seed.text = p.sd || "1";
    scatterStart.text = p.ss || "2.0";
    scatterTrans.text = p.st || "1.0";
    minScale.text = p.mn || "50";
    maxScale.text = p.mx || "200";
    blurSeed.text = p.bs || "10";
    blurProb.text = p.bp || "40";
    blurMin.text = p.bmin || "0";
    blurMax.text = p.bmax || "25";
    setStatus("已加载预设 " + idx);
}

function resetParams() {
    entryDur.text = "2.0";
    entryBlur.text = "40";
    entryOffset.text = "80";
    if (entryDirection) entryDirection.selection = 0;
    exitStart.text = "3.5";
    exitDur.text = "2.0";
    exitOffset.text = "80";
    heightAmp.text = "30";
    heightFreq.text = "0.7";
    speed.text = "1.0";
    scatterRange.text = "150";
    seed.text = "1";
    scatterStart.text = "2.0";
    scatterTrans.text = "1.0";
    minScale.text = "50";
    maxScale.text = "200";
    blurSeed.text = "10";
    blurProb.text = "40";
    blurMin.text = "0";
    blurMax.text = "25";
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
        var pEntryDur    = Math.max(0.1, getVal(entryDur, 2.0));
        var pEntryBlur   = Math.max(0, getVal(entryBlur, 40));
        var pEntryOff    = getVal(entryOffset, 80);
        var pDirection   = entryDirection && entryDirection.selection ? entryDirection.selection.index : 0;
        var pExitStart   = Math.max(0, getVal(exitStart, 3.5));
        var pExitDur     = Math.max(0.1, getVal(exitDur, 2.0));
        var pExitOff     = getVal(exitOffset, 80);
        var pHeightAmp   = Math.max(0, getVal(heightAmp, 30));
        var pHeightFreq  = Math.max(0.01, getVal(heightFreq, 0.7));
        var pSpeed       = Math.max(0.01, getVal(speed, 1.0));
        var pScatterRange = Math.max(0, getVal(scatterRange, 150));
        var pSeed        = Math.max(0, getVal(seed, 1));
        var pScatterStart = Math.max(0, getVal(scatterStart, 2.0));
        var pScatterTrans = Math.max(0.01, getVal(scatterTrans, 1.0));
        var pMinScale    = Math.max(1, getVal(minScale, 50));
        var pMaxScale    = Math.max(1, getVal(maxScale, 200));
        var pBlurSeed    = Math.max(0, getVal(blurSeed, 10));
        var pBlurProb    = Math.max(0, Math.min(100, getVal(blurProb, 40)));
        var pBlurMin     = Math.max(0, getVal(blurMin, 0));
        var pBlurMax     = Math.max(0, getVal(blurMax, 25));

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
        var k2 = entryStartProp.addKey(startTime + pEntryDur / pSpeed);
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
            // 根据方向计算入场 Position 初始偏移
            var entryPosVal;
            var pType = entryPosProp.propertyValueType;
            if (pType === 6413) { // ThreeD
                if (pDirection === 1) entryPosVal = [pEntryOff, 0, 0];       // 从右到左
                else if (pDirection === 2) entryPosVal = [0, -pEntryOff, 0];  // 从上到下
                else if (pDirection === 3) entryPosVal = [0, pEntryOff, 0];   // 从下到上
                else entryPosVal = [-pEntryOff, 0, 0];                        // 从左到右（默认）
            } else {
                if (pDirection === 1) entryPosVal = [pEntryOff, 0];           // 从右到左
                else if (pDirection === 2) entryPosVal = [0, -pEntryOff];     // 从上到下
                else if (pDirection === 3) entryPosVal = [0, pEntryOff];      // 从下到上
                else entryPosVal = [-pEntryOff, 0];                           // 从左到右（默认）
            }
            try {
                entryPosProp.setValue(entryPosVal);
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
        if (exitPosProp) {
            // 出场方向与入场对称
            var exitPosVal;
            var epType = exitPosProp.propertyValueType;
            if (epType === 6413) { // ThreeD
                if (pDirection === 1) exitPosVal = [-pExitOff, 0, 0];        // 入场从右→出场向左
                else if (pDirection === 2) exitPosVal = [0, pExitOff, 0];     // 入场从上→出场向下
                else if (pDirection === 3) exitPosVal = [0, -pExitOff, 0];    // 入场从下→出场向上
                else exitPosVal = [pExitOff, 0, 0];                           // 入场从左→出场向右
            } else {
                if (pDirection === 1) exitPosVal = [-pExitOff, 0];            // 入场从右→出场向左
                else if (pDirection === 2) exitPosVal = [0, pExitOff];        // 入场从上→出场向下
                else if (pDirection === 3) exitPosVal = [0, -pExitOff];       // 入场从下→出场向上
                else exitPosVal = [pExitOff, 0];                              // 入场从左→出场向右
            }
            exitPosProp.setValue(exitPosVal);
        }

        // ============================================================
        // Animator 3: 散落分布（逐字随机位置 + 随机大小 + 随机模糊 + 时间渐入）
        // ============================================================
        // 每个字符独立一个动画器，Percent Range Selector 锁定单个字符
        // 用 seedRandom() 做可复现的随机分布
        // Position 表达式增加时间渐入因子，让散落从 0 渐变到目标偏移
        for (var ci = 1; ci <= textLen; ci++) {
            var sAnim = animatorsGroup.addProperty("ADBE Text Animator");
            sAnim.name = "歌词_散落_" + ci;

            // 获取属性组
            var sProps = sAnim.property("ADBE Text Properties");
            if (!sProps) {
                for (var si = 1; si <= sAnim.numProperties; si++) {
                    var sp = sAnim.property(si);
                    if (sp.matchName && sp.matchName.indexOf("ADBE") >= 0 && sp.matchName.indexOf("Property") >= 0 && sp.matchName.indexOf("Select") < 0) {
                        sProps = sp; break;
                    }
                }
                if (!sProps) sProps = sAnim.property(sAnim.numProperties);
            }
            if (!sProps) continue;

            // 添加 Selector，仅影响当前字符（Percent 模式）
            var sSel = sAnim.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
            var sPStart = sSel.property("ADBE Text Percent Start");
            if (!sPStart) sPStart = sSel.property("ADBE Text Start");
            if (!sPStart) sPStart = sSel.property("Start");
            if (!sPStart && sSel.numProperties >= 1) sPStart = sSel.property(1);
            var sPEnd = sSel.property("ADBE Text Percent End");
            if (!sPEnd) sPEnd = sSel.property("ADBE Text End");
            if (!sPEnd) sPEnd = sSel.property("End");
            if (!sPEnd && sSel.numProperties >= 2) sPEnd = sSel.property(2);
            if (sPStart && sPEnd) {
                var pStart = ((ci - 1) / textLen) * 100;
                var pEnd = (ci / textLen) * 100;
                sPStart.setValue(pStart);
                sPEnd.setValue(pEnd);
            }

            // Position: seedRandom + random + 时间渐入因子
            var sPos = addAnimProperty(sProps, "ADBE Text Position");
            if (sPos) {
                var posExpr = "seedRandom(" + pSeed + " + " + ci + ", true);\n";
                posExpr += "r = " + pScatterRange + ";\n";
                posExpr += "t = time - " + startTime.toFixed(3) + ";\n";
                posExpr += "fade = linear(t, " + pScatterStart.toFixed(3) + ", " + (pScatterStart + pScatterTrans).toFixed(3) + ", 0, 1);\n";
                posExpr += "[random(-r, r) * fade, random(-r, r) * fade]";
                sPos.expressionEnabled = true;
                sPos.expression = posExpr;
            }

            // Scale: seedRandom（不同种子偏移）+ random 生成随机缩放
            var sScale = addAnimProperty(sProps, "ADBE Text Scale");
            if (sScale) {
                var scaleExpr = "seedRandom(" + pSeed + " + " + ci + " + 9999, true);\n";
                scaleExpr += "t = time - " + startTime.toFixed(3) + ";\n";
                scaleExpr += "fade = linear(t, " + pScatterStart.toFixed(3) + ", " + (pScatterStart + pScatterTrans).toFixed(3) + ", 0, 1);\n";
                scaleExpr += "s = random(" + pMinScale + ", " + pMaxScale + ");\n";
                scaleExpr += "base = 100;\n";
                scaleExpr += "[base + (s - base) * fade, base + (s - base) * fade]";
                sScale.expressionEnabled = true;
                sScale.expression = scaleExpr;
            }

            // 随机模糊：基于 blurSeed 决定该字符是否模糊
            if (pBlurProb > 0) {
                var sBlur = addAnimProperty(sProps, "ADBE Text Blur");
                if (sBlur) {
                    var blurExpr = "seedRandom(" + pBlurSeed + " + " + ci + ", true);\n";
                    blurExpr += "r = random(0, 100);\n";
                    blurExpr += "t = time - " + startTime.toFixed(3) + ";\n";
                    blurExpr += "fade = linear(t, " + pScatterStart.toFixed(3) + ", " + (pScatterStart + pScatterTrans).toFixed(3) + ", 0, 1);\n";
                    blurExpr += "if (r < " + pBlurProb + ") {\n";
                    blurExpr += "    seedRandom(" + pBlurSeed + " + " + ci + " + 5555, true);\n";
                    blurExpr += "    random(" + pBlurMin + ", " + pBlurMax + ") * fade;\n";
                    blurExpr += "} else { 0; }";
                    sBlur.expressionEnabled = true;
                    sBlur.expression = blurExpr;
                }
            }
        }

        // ============================================================
        // Animator 4: 高度错落（波浪浮动，逐字 Position 表达式）
        // ============================================================
        for (var ci = 1; ci <= textLen; ci++) {
            var hAnim = animatorsGroup.addProperty("ADBE Text Animator");
            hAnim.name = "歌词_高度_" + ci;

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
                var pStart = ((ci - 1) / textLen) * 100;
                var pEnd = (ci / textLen) * 100;
                hPStart.setValue(pStart);
                hPEnd.setValue(pEnd);
            }

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
        var dirNames = ["左→右", "右→左", "上→下", "下→上"];
        var dirName = dirNames[pDirection] || "左→右";
        setStatus("完成! 入场" + (pEntryDur / pSpeed).toFixed(1) +
            "s(" + dirName + ") 出场" + exitStartTime.toFixed(1) + "-" + exitEndTime.toFixed(1) +
            "s 散落" + textLen + "字符 种子=" + pSeed);
        $.writeln("歌词散落动画v3.0已应用成功: " + textLen + "字符 方向=" + dirName + " 种子=" + pSeed);

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