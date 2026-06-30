// ============================================================
// 歌词逐字散落动画工具  v3.4  —  for After Effects 2026
// ============================================================
// 功能：选中文本图层后，自动生成逐字动画
// - 入场方向可选（左/右/上/下），逐字/一起模式
// - 出场方向与入场对称，逐字/一起模式
// - 高度错落（波浪浮动）+ 散落分布（随机位置、随机大小、可控时间）
// - 随机模糊效果（部分字符模糊、部分清晰，基于种子可复现）
// - 字间距动态（初始→结束字间距线性变化）
// - 每个功能面板有独立总开关，可单独启用/关闭
// - 所有参数可调
// - 预设存储/加载（JSON 文件持久化，存于 .aep 同级目录）
// ============================================================

(function(thisObj) {

// ---- 构建面板 ----
var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", "歌词逐字散落动画工具 v3.4", undefined, {resizeable: true});
pal.orientation = "column";
pal.alignChildren = ["fill", "top"];
pal.spacing = 4;
pal.margins = [8, 8, 8, 8];

// 标题
var titleGrp = pal.add("group");
titleGrp.orientation = "row";
titleGrp.alignment = "center";
var titleText = titleGrp.add("statictext", undefined, "歌词逐字散落动画工具");

// ---- 参数容器 ----
var tabGrp = pal.add("group");
tabGrp.orientation = "column";
tabGrp.alignChildren = ["fill", "top"];
tabGrp.spacing = 4;
tabGrp.alignment = ["fill", "top"];

// ======================================================================
// 入场参数
// ======================================================================
var entryGrp = tabGrp.add("panel");
entryGrp.text = "  入场参数";
entryGrp.orientation = "column";
entryGrp.alignChildren = ["fill", "top"];
entryGrp.spacing = 3;
entryGrp.margins = [8, 14, 8, 8];
entryGrp.alignment = ["fill", "top"];

// 入场总开关
var gEntryEnable = entryGrp.add("group"); gEntryEnable.orientation = "row"; gEntryEnable.alignChildren = ["left", "center"];
var entryEnable = gEntryEnable.add("checkbox", undefined, "  启用入场动画");
entryEnable.value = true;

var g1 = entryGrp.add("group"); g1.orientation = "row"; g1.alignChildren = ["fill", "center"];
g1.add("statictext", undefined, "持续时间 (秒)").preferredSize.width = 110;
var entryDur = g1.add("edittext", undefined, "2.0"); entryDur.characters = 5; entryDur.alignment = ["fill", "center"];

var g2 = entryGrp.add("group"); g2.orientation = "row"; g2.alignChildren = ["fill", "center"];
g2.add("statictext", undefined, "最大模糊值").preferredSize.width = 110;
var entryBlur = g2.add("edittext", undefined, "40"); entryBlur.characters = 5; entryBlur.alignment = ["fill", "center"];

var g3 = entryGrp.add("group"); g3.orientation = "row"; g3.alignChildren = ["fill", "center"];
g3.add("statictext", undefined, "入场偏移 (像素)").preferredSize.width = 110;
var entryOffset = g3.add("edittext", undefined, "80"); entryOffset.characters = 5; entryOffset.alignment = ["fill", "center"];

var gDir = entryGrp.add("group"); gDir.orientation = "row"; gDir.alignChildren = ["fill", "center"];
gDir.add("statictext", undefined, "入场方向").preferredSize.width = 110;
var entryDirection = gDir.add("dropdownlist", undefined, ["从左到右", "从右到左", "从上到下", "从下到上"]);
entryDirection.selection = 0;
entryDirection.preferredSize.width = 100;

var gEntryMode = entryGrp.add("group"); gEntryMode.orientation = "row"; gEntryMode.alignChildren = ["fill", "center"];
gEntryMode.add("statictext", undefined, "入场模式").preferredSize.width = 110;
var entryMode = gEntryMode.add("dropdownlist", undefined, ["逐字出现", "一起出现"]);
entryMode.selection = 0;
entryMode.preferredSize.width = 100;

// ======================================================================
// 出场参数
// ======================================================================
var exitGrp = tabGrp.add("panel");
exitGrp.text = "  出场参数";
exitGrp.orientation = "column";
exitGrp.alignChildren = ["fill", "top"];
exitGrp.spacing = 3;
exitGrp.margins = [8, 14, 8, 8];
exitGrp.alignment = ["fill", "top"];

// 出场总开关
var gExitEnable = exitGrp.add("group"); gExitEnable.orientation = "row"; gExitEnable.alignChildren = ["left", "center"];
var exitEnable = gExitEnable.add("checkbox", undefined, "  启用出场动画");
exitEnable.value = true;

var g4 = exitGrp.add("group"); g4.orientation = "row"; g4.alignChildren = ["fill", "center"];
g4.add("statictext", undefined, "出场开始 (秒)").preferredSize.width = 110;
var exitStart = g4.add("edittext", undefined, "3.5"); exitStart.characters = 5; exitStart.alignment = ["fill", "center"];
g4.add("statictext", undefined, "(绝对时间)").preferredSize.width = 80;

var g5 = exitGrp.add("group"); g5.orientation = "row"; g5.alignChildren = ["fill", "center"];
g5.add("statictext", undefined, "出场持续时间 (秒)").preferredSize.width = 110;
var exitDur = g5.add("edittext", undefined, "2.0"); exitDur.characters = 5; exitDur.alignment = ["fill", "center"];

var g6 = exitGrp.add("group"); g6.orientation = "row"; g6.alignChildren = ["fill", "center"];
g6.add("statictext", undefined, "出场偏移 (像素)").preferredSize.width = 110;
var exitOffset = g6.add("edittext", undefined, "80"); exitOffset.characters = 5; exitOffset.alignment = ["fill", "center"];

var gExitMode = exitGrp.add("group"); gExitMode.orientation = "row"; gExitMode.alignChildren = ["fill", "center"];
gExitMode.add("statictext", undefined, "出场模式").preferredSize.width = 110;
var exitMode = gExitMode.add("dropdownlist", undefined, ["逐字消失", "一起消失"]);
exitMode.selection = 0;
exitMode.preferredSize.width = 100;

// ======================================================================
// 高度错落参数
// ======================================================================
var heightGrp = tabGrp.add("panel");
heightGrp.text = "  高度错落（波浪浮动）";
heightGrp.orientation = "column";
heightGrp.alignChildren = ["fill", "top"];
heightGrp.spacing = 3;
heightGrp.margins = [8, 14, 8, 8];
heightGrp.alignment = ["fill", "top"];

// 高度错落总开关
var gHeightEnable = heightGrp.add("group"); gHeightEnable.orientation = "row"; gHeightEnable.alignChildren = ["left", "center"];
var heightEnable = gHeightEnable.add("checkbox", undefined, "  启用高度错落");
heightEnable.value = true;

var g7 = heightGrp.add("group"); g7.orientation = "row"; g7.alignChildren = ["fill", "center"];
g7.add("statictext", undefined, "波动幅度 (像素)").preferredSize.width = 110;
var heightAmp = g7.add("edittext", undefined, "30"); heightAmp.characters = 5; heightAmp.alignment = ["fill", "center"];

var g8 = heightGrp.add("group"); g8.orientation = "row"; g8.alignChildren = ["fill", "center"];
g8.add("statictext", undefined, "波动频率").preferredSize.width = 110;
var heightFreq = g8.add("edittext", undefined, "0.7"); heightFreq.characters = 5; heightFreq.alignment = ["fill", "center"];

var g9 = heightGrp.add("group"); g9.orientation = "row"; g9.alignChildren = ["fill", "center"];
g9.add("statictext", undefined, "流动速度").preferredSize.width = 110;
var speed = g9.add("edittext", undefined, "1.0"); speed.characters = 5; speed.alignment = ["fill", "center"];

// ======================================================================
// 字间距动态参数
// ======================================================================
var spacingGrp = tabGrp.add("panel");
spacingGrp.text = "  字间距动态";
spacingGrp.orientation = "column";
spacingGrp.alignChildren = ["fill", "top"];
spacingGrp.spacing = 3;
spacingGrp.margins = [8, 14, 8, 8];
spacingGrp.alignment = ["fill", "top"];

// 字间距总开关
var gSpacingEnable = spacingGrp.add("group"); gSpacingEnable.orientation = "row"; gSpacingEnable.alignChildren = ["left", "center"];
var spacingEnable = gSpacingEnable.add("checkbox", undefined, "  启用字间距动画");
spacingEnable.value = false;

var gSp1 = spacingGrp.add("group"); gSp1.orientation = "row"; gSp1.alignChildren = ["fill", "center"];
gSp1.add("statictext", undefined, "初始字间距").preferredSize.width = 110;
var spacingStart = gSp1.add("edittext", undefined, "0"); spacingStart.characters = 5; spacingStart.alignment = ["fill", "center"];

var gSp2 = spacingGrp.add("group"); gSp2.orientation = "row"; gSp2.alignChildren = ["fill", "center"];
gSp2.add("statictext", undefined, "结束字间距").preferredSize.width = 110;
var spacingEnd = gSp2.add("edittext", undefined, "50"); spacingEnd.characters = 5; spacingEnd.alignment = ["fill", "center"];

var gSp3 = spacingGrp.add("group"); gSp3.orientation = "row"; gSp3.alignChildren = ["fill", "center"];
gSp3.add("statictext", undefined, "持续时间 (秒)").preferredSize.width = 110;
var spacingDur = gSp3.add("edittext", undefined, "2.0"); spacingDur.characters = 5; spacingDur.alignment = ["fill", "center"];

var gSp4 = spacingGrp.add("group"); gSp4.orientation = "row"; gSp4.alignChildren = ["fill", "center"];
gSp4.add("statictext", undefined, "开始时间 (秒)").preferredSize.width = 110;
var spacingStartTime = gSp4.add("edittext", undefined, "0"); spacingStartTime.characters = 5; spacingStartTime.alignment = ["fill", "center"];
gSp4.add("statictext", undefined, "(绝对时间)").preferredSize.width = 80;

// ======================================================================
// 散落分布参数
// ======================================================================
var scatterGrp = tabGrp.add("panel");
scatterGrp.text = "  散落分布（随机位置 / 大小 / 模糊）";
scatterGrp.orientation = "column";
scatterGrp.alignChildren = ["fill", "top"];
scatterGrp.spacing = 3;
scatterGrp.margins = [8, 14, 8, 8];
scatterGrp.alignment = ["fill", "top"];

// 散落分布总开关
var gScatterEnable = scatterGrp.add("group"); gScatterEnable.orientation = "row"; gScatterEnable.alignChildren = ["left", "center"];
var scatterEnable = gScatterEnable.add("checkbox", undefined, "  启用散落分布");
scatterEnable.value = true;

var gS1 = scatterGrp.add("group"); gS1.orientation = "row"; gS1.alignChildren = ["fill", "center"];
gS1.add("statictext", undefined, "散布范围 (像素)").preferredSize.width = 110;
var scatterRange = gS1.add("edittext", undefined, "150"); scatterRange.characters = 5; scatterRange.alignment = ["fill", "center"];

var gS2 = scatterGrp.add("group"); gS2.orientation = "row"; gS2.alignChildren = ["fill", "center"];
gS2.add("statictext", undefined, "随机种子").preferredSize.width = 110;
var seed = gS2.add("edittext", undefined, "1"); seed.characters = 5; seed.alignment = ["fill", "center"];

var gS3 = scatterGrp.add("group"); gS3.orientation = "row"; gS3.alignChildren = ["fill", "center"];
gS3.add("statictext", undefined, "散落开始 (秒)").preferredSize.width = 110;
var scatterStart = gS3.add("edittext", undefined, "2.0"); scatterStart.characters = 5; scatterStart.alignment = ["fill", "center"];
gS3.add("statictext", undefined, "(绝对时间)").preferredSize.width = 80;

var gS4 = scatterGrp.add("group"); gS4.orientation = "row"; gS4.alignChildren = ["fill", "center"];
gS4.add("statictext", undefined, "散落过渡 (秒)").preferredSize.width = 110;
var scatterTrans = gS4.add("edittext", undefined, "1.0"); scatterTrans.characters = 5; scatterTrans.alignment = ["fill", "center"];

var gS5 = scatterGrp.add("group"); gS5.orientation = "row"; gS5.alignChildren = ["fill", "center"];
gS5.add("statictext", undefined, "最小缩放 (%)").preferredSize.width = 110;
var minScale = gS5.add("edittext", undefined, "50"); minScale.characters = 5; minScale.alignment = ["fill", "center"];

var gS6 = scatterGrp.add("group"); gS6.orientation = "row"; gS6.alignChildren = ["fill", "center"];
gS6.add("statictext", undefined, "最大缩放 (%)").preferredSize.width = 110;
var maxScale = gS6.add("edittext", undefined, "200"); maxScale.characters = 5; maxScale.alignment = ["fill", "center"];

var gS7 = scatterGrp.add("group"); gS7.orientation = "row"; gS7.alignChildren = ["fill", "center"];
gS7.add("statictext", undefined, "模糊随机种子").preferredSize.width = 110;
var blurSeed = gS7.add("edittext", undefined, "10"); blurSeed.characters = 5; blurSeed.alignment = ["fill", "center"];

var gS8 = scatterGrp.add("group"); gS8.orientation = "row"; gS8.alignChildren = ["fill", "center"];
gS8.add("statictext", undefined, "模糊概率 (%)").preferredSize.width = 110;
var blurProb = gS8.add("edittext", undefined, "40"); blurProb.characters = 5; blurProb.alignment = ["fill", "center"];

var gS9 = scatterGrp.add("group"); gS9.orientation = "row"; gS9.alignChildren = ["fill", "center"];
gS9.add("statictext", undefined, "最小模糊值").preferredSize.width = 110;
var blurMin = gS9.add("edittext", undefined, "0"); blurMin.characters = 5; blurMin.alignment = ["fill", "center"];

var gS10 = scatterGrp.add("group"); gS10.orientation = "row"; gS10.alignChildren = ["fill", "center"];
gS10.add("statictext", undefined, "最大模糊值").preferredSize.width = 110;
var blurMax = gS10.add("edittext", undefined, "25"); blurMax.characters = 5; blurMax.alignment = ["fill", "center"];

// ======================================================================
// 预设管理
// ======================================================================
var presetGrp = pal.add("panel");
presetGrp.text = "  预设管理";
presetGrp.orientation = "column";
presetGrp.alignChildren = ["fill", "top"];
presetGrp.spacing = 3;
presetGrp.margins = [8, 14, 8, 6];
presetGrp.alignment = ["fill", "top"];

var saveRow = presetGrp.add("group");
saveRow.orientation = "row";
saveRow.alignChildren = ["left", "center"];
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

var loadRow = presetGrp.add("group");
loadRow.orientation = "row";
loadRow.alignChildren = ["left", "center"];
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

for (var px = 1; px <= 4; px++) {
    saveBtns[px - 1].onClick = (function(idx) {
        return function() { saveSlot(idx); };
    })(px);
}
for (var px = 1; px <= 4; px++) {
    loadBtns[px - 1].onClick = (function(idx) {
        return function() { loadSlot(idx); };
    })(px);
}
clearPresetBtn.onClick = function() { clearAllPresets(); };
resetBtn.onClick = function() { resetParams(); };

// ======================================================================
// 按钮
// ======================================================================
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

var statusBar = pal.add("statictext", undefined, "就绪 - 选中一个文本图层后点击应用");
statusBar.alignment = ["fill", "top"];
statusBar.margins = [0, 4, 0, 0];

var tipBar = pal.add("statictext", undefined, "提示：各面板可通过复选框独立开关；散落开始时间应 ≥ 入场持续时间");
tipBar.alignment = ["fill", "top"];
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

    var animatorsGroup = findAnimatorsGroup(layer);
    if (!animatorsGroup) { setStatus("该图层没有文字动画器", true); return; }

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

// ---- 安全添加属性 ----
function addAnimProperty(propsGroup, propType) {
    var candidates = [propType];
    if (propType === "ADBE Text Blur") candidates = ["ADBE Text Blur", "ADBE Text Blur 2D", "ADBE Text Blur 3D", "Blur", "模糊"];
    else if (propType === "ADBE Text Position") candidates = ["ADBE Text Position", "ADBE Text Position 2D", "ADBE Text Position 3D", "Position", "位置"];
    else if (propType === "ADBE Text Opacity") candidates = ["ADBE Text Opacity", "ADBE Text Opacity Percent", "Opacity", "不透明度"];
    else if (propType === "ADBE Text Scale") candidates = ["ADBE Text Scale", "ADBE Text Scale 3D", "Scale", "缩放"];
    else if (propType === "ADBE Text Tracking Amount") candidates = ["ADBE Text Tracking Amount", "ADBE Text Tracking"];

    if (propsGroup.addProperty) {
        for (var ai = 0; ai < candidates.length; ai++) {
            try {
                var result = propsGroup.addProperty(candidates[ai]);
                if (result) return result;
            } catch (e) {}
        }
    }

    for (var ai = 0; ai < candidates.length; ai++) {
        try {
            var result = propsGroup.property(candidates[ai]);
            if (result) return result;
        } catch (e) {}
    }

    setStatus("错误: 无法添加属性 " + propType);
    return null;
}

// ---- 预设存储（双层：工程目录 JSON + app.settings 全局保底） ----

// JSON polyfill（ExtendScript 可能没有内置 JSON 对象）
if (typeof JSON === "undefined") { JSON = {}; }
if (typeof JSON.stringify !== "function") {
    JSON.stringify = function(obj) {
        var t = typeof obj;
        if (t === "undefined") return undefined;
        if (t === "function" || obj === null) return "null";
        if (t === "boolean" || t === "number") return String(obj);
        if (t === "string") return '"' + obj.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t") + '"';
        if (obj instanceof Array) {
            var arr = [];
            for (var i = 0; i < obj.length; i++) { arr.push(JSON.stringify(obj[i])); }
            return "[" + arr.join(",") + "]";
        }
        if (t === "object") {
            var pairs = [];
            for (var k in obj) {
                if (obj.hasOwnProperty(k)) {
                    var v = JSON.stringify(obj[k]);
                    if (v !== undefined) pairs.push('"' + k + '":' + v);
                }
            }
            return "{" + pairs.join(",") + "}";
        }
        return "null";
    };
}
if (typeof JSON.parse !== "function") {
    JSON.parse = function(text) {
        // 简易解析：用 eval（ExtendScript 环境安全）
        if (typeof text !== "string" || text.length === 0) return null;
        return eval("(" + text + ")");
    };
}

var SETTINGS_SECTION = "AE_Lyrics_Anim";
var SETTINGS_KEY_PREFIX = "preset_";
var PRESET_FILENAME = "歌词动画预设.json";

// ===== 工程目录 JSON 文件 =====

// 获取工程目录下的预设 JSON 文件路径
function getProjectPresetFile() {
    try {
        var projFile = app.project.file;
        if (!projFile) return null;
        var projFolder = projFile.parent;
        if (!projFolder) return null;
        var f = new File(projFolder.fsName + "/" + PRESET_FILENAME);
        return f;
    } catch (e) { return null; }
}

// 从工程目录 JSON 读取所有预设
function readFromProjectFile() {
    try {
        var f = getProjectPresetFile();
        if (!f || !f.exists) return null;
        f.open("r");
        var text = f.read();
        f.close();
        if (!text || text.length === 0) return null;
        var parsed = JSON.parse(text);
        if (parsed && typeof parsed === "object") return parsed;
    } catch (e) {}
    return null;
}

// 写入预设到工程目录 JSON（带详细诊断）
function writeToProjectFile(data) {
    var diag = ""; // 诊断信息

    try {
        var f = getProjectPresetFile();
        if (!f) {
            alert("JSON 写入失败：工程未保存\n\n请先保存 .aep 工程文件，预设才能跟工程走。\n本次已保存到全局设置（app.settings）。");
            return false;
        }
        diag += "路径: " + f.fsName + "\n";

        // 确保目录存在
        var dir = f.parent;
        if (dir) {
            diag += "目录存在: " + dir.exists + "\n";
        }

        // 序列化
        var content = JSON.stringify(data);
        diag += "内容长度: " + content.length + "\n";

        if (!content || content.length === 0) {
            alert("JSON 写入失败：内容为空\n" + diag);
            return false;
        }

        // 打开文件
        var opened = f.open("w");
        diag += "open 结果: " + opened + "\n";
        if (!opened) {
            alert("JSON 写入失败：无法打开文件\n" + diag + "\n请检查权限:\n编辑 → 首选项 → 脚本和表达式 → 允许脚本写入文件和访问网络");
            return false;
        }

        // 写入
        var wrote = f.write(content);
        diag += "write 结果: " + wrote + "\n";
        f.close();

        if (!wrote) {
            alert("JSON 写入失败：write 返回 false\n" + diag);
            return false;
        }

        // 验证
        f.open("r");
        var verify = f.read();
        f.close();
        diag += "验证读回长度: " + (verify ? verify.length : 0) + "\n";

        if (verify && verify.length > 0) {
            return true;
        } else {
            alert("JSON 写入失败：验证读回为空\n" + diag);
            return false;
        }
    } catch (ex) {
        alert("JSON 写入异常:\n" + ex.toString() + "\n" + diag);
        return false;
    }
}

// 删除工程目录 JSON 文件
function deleteProjectFile() {
    try {
        var f = getProjectPresetFile();
        if (f && f.exists) { f.remove(); }
    } catch (e) {}
}

// ===== app.settings 全局保底 =====

function readFromSettings(idx) {
    try {
        if (app.settings.haveSetting(SETTINGS_SECTION, SETTINGS_KEY_PREFIX + idx)) {
            var text = app.settings.getSetting(SETTINGS_SECTION, SETTINGS_KEY_PREFIX + idx);
            if (text && text.length > 0) return JSON.parse(text);
        }
    } catch (e) {}
    return null;
}

function writeToSettings(idx, params) {
    try {
        app.settings.saveSetting(SETTINGS_SECTION, SETTINGS_KEY_PREFIX + idx, JSON.stringify(params));
        return true;
    } catch (e) { return false; }
}

function deleteFromSettings(idx) {
    try {
        if (app.settings.haveSetting(SETTINGS_SECTION, SETTINGS_KEY_PREFIX + idx)) {
            app.settings.saveSetting(SETTINGS_SECTION, SETTINGS_KEY_PREFIX + idx, "");
        }
    } catch (e) {}
}

// ===== 统一接口 =====

// 读取所有预设：优先工程目录 JSON，回退 app.settings
var presetsCache = (function() {
    // 1. 先读工程目录 JSON
    var fromFile = readFromProjectFile();
    if (fromFile) return fromFile;

    // 2. 回退到 app.settings
    var cache = {};
    for (var i = 1; i <= 4; i++) {
        var p = readFromSettings(i);
        if (p) cache[String(i)] = p;
    }
    return cache;
})();

// 保存预设：同时写工程 JSON 和 app.settings
function saveSlot(idx) {
    var params = {
        d: entryDur.text, b: entryBlur.text, o: entryOffset.text,
        dir: entryDirection.selection ? entryDirection.selection.index : 0,
        emode: entryMode.selection ? entryMode.selection.index : 0,
        enbl: entryEnable.value,
        es: exitStart.text, ed: exitDur.text, eo: exitOffset.text,
        xmode: exitMode.selection ? exitMode.selection.index : 0,
        xenbl: exitEnable.value,
        a: heightAmp.text, f: heightFreq.text, sp: speed.text,
        henbl: heightEnable.value,
        ss1: spacingStart.text, ss2: spacingEnd.text, ss3: spacingDur.text, ss4: spacingStartTime.text,
        spenbl: spacingEnable.value,
        r: scatterRange.text, sd: seed.text,
        ss: scatterStart.text, st: scatterTrans.text,
        mn: minScale.text, mx: maxScale.text,
        bs: blurSeed.text, bp: blurProb.text, bmin: blurMin.text, bmax: blurMax.text,
        scnbl: scatterEnable.value
    };
    presetsCache[String(idx)] = params;

    // 1. 全局保底（始终执行）
    var globalOk = writeToSettings(idx, params);

    // 2. 工程目录 JSON（跟工程走）
    var fileOk = writeToProjectFile(presetsCache);

    updateLoadButtons();
    if (fileOk) {
        setStatus("已保存到预设 " + idx + "（工程目录 JSON）");
    } else if (globalOk) {
        setStatus("已保存到预设 " + idx + "（全局设置）");
    } else {
        setStatus("保存预设 " + idx + " 失败");
    }
}

function clearAllPresets() {
    for (var i = 1; i <= 4; i++) { deleteFromSettings(i); }
    deleteProjectFile();
    presetsCache = {};
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
    if (entryMode && p.emode !== undefined) entryMode.selection = parseInt(p.emode);
    if (entryEnable) entryEnable.value = (p.enbl !== undefined) ? p.enbl : true;
    exitStart.text = p.es || "3.5";
    exitDur.text = p.ed || "2.0";
    exitOffset.text = p.eo || "80";
    if (exitMode && p.xmode !== undefined) exitMode.selection = parseInt(p.xmode);
    if (exitEnable) exitEnable.value = (p.xenbl !== undefined) ? p.xenbl : true;
    heightAmp.text = p.a || "30";
    heightFreq.text = p.f || "0.7";
    speed.text = p.sp || "1.0";
    if (heightEnable) heightEnable.value = (p.henbl !== undefined) ? p.henbl : true;
    spacingStart.text = p.ss1 || "0";
    spacingEnd.text = p.ss2 || "50";
    spacingDur.text = p.ss3 || "2.0";
    spacingStartTime.text = p.ss4 || "0";
    if (spacingEnable) spacingEnable.value = (p.spenbl !== undefined) ? p.spenbl : false;
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
    if (scatterEnable) scatterEnable.value = (p.scnbl !== undefined) ? p.scnbl : true;
    setStatus("已加载预设 " + idx);
}

function resetParams() {
    entryDur.text = "2.0";
    entryBlur.text = "40";
    entryOffset.text = "80";
    if (entryDirection) entryDirection.selection = 0;
    if (entryMode) entryMode.selection = 0;
    if (entryEnable) entryEnable.value = true;
    exitStart.text = "3.5";
    exitDur.text = "2.0";
    exitOffset.text = "80";
    if (exitMode) exitMode.selection = 0;
    if (exitEnable) exitEnable.value = true;
    heightAmp.text = "30";
    heightFreq.text = "0.7";
    speed.text = "1.0";
    if (heightEnable) heightEnable.value = true;
    spacingStart.text = "0";
    spacingEnd.text = "50";
    spacingDur.text = "2.0";
    spacingStartTime.text = "0";
    if (spacingEnable) spacingEnable.value = false;
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
    if (scatterEnable) scatterEnable.value = true;
    setStatus("参数已复位");
}

// ---- 辅助函数：安全设置 Blur 值（兼容 2D/1D） ----
function setBlurValue(prop, val) {
    try {
        if (prop.propertyValueType === PropertyValueType.TwoD) {
            prop.setValue([val, val]);
        } else {
            prop.setValue(val);
        }
    } catch (e) {}
}
function setBlurValueAtKey(prop, key, val) {
    try {
        if (prop.propertyValueType === PropertyValueType.TwoD) {
            prop.setValueAtKey(key, [val, val]);
        } else {
            prop.setValueAtKey(key, val);
        }
    } catch (e) {}
}

// ---- 辅助函数：根据方向计算 Position 偏移 ----
function getDirectionPos(offset, direction, is3D) {
    if (is3D) {
        if (direction === 1) return [offset, 0, 0];        // 从右到左
        else if (direction === 2) return [0, -offset, 0];   // 从上到下
        else if (direction === 3) return [0, offset, 0];    // 从下到上
        else return [-offset, 0, 0];                        // 从左到右
    } else {
        if (direction === 1) return [offset, 0];
        else if (direction === 2) return [0, -offset];
        else if (direction === 3) return [0, offset];
        else return [-offset, 0];
    }
}

function getExitDirectionPos(offset, direction, is3D) {
    // 出场方向与入场对称
    if (is3D) {
        if (direction === 1) return [-offset, 0, 0];        // 入场右→出场左
        else if (direction === 2) return [0, offset, 0];     // 入场上一出场下
        else if (direction === 3) return [0, -offset, 0];    // 入场下一出场
        else return [offset, 0, 0];                          // 入场左→出场右
    } else {
        if (direction === 1) return [-offset, 0];
        else if (direction === 2) return [0, offset];
        else if (direction === 3) return [0, -offset];
        else return [offset, 0];
    }
}

// ---- 辅助函数：查找 Selector Start/End 属性 ----
function findSelectorStartEnd(sel) {
    var startProp = sel.property("ADBE Text Start");
    var endProp = sel.property("ADBE Text End");
    if (!startProp) startProp = sel.property("Start");
    if (!endProp) endProp = sel.property("End");
    if (!startProp && sel.numProperties >= 1) startProp = sel.property(1);
    if (!endProp && sel.numProperties >= 2) endProp = sel.property(2);
    return { start: startProp, end: endProp };
}

// ---- 辅助函数：查找 Animator 属性组 ----
function findAnimatorProps(anim) {
    var props = anim.property("ADBE Text Properties");
    if (!props) {
        for (var si = 1; si <= anim.numProperties; si++) {
            var sp = anim.property(si);
            if (sp.matchName && sp.matchName.indexOf("ADBE") >= 0 && sp.matchName.indexOf("Property") >= 0 && sp.matchName.indexOf("Select") < 0) {
                props = sp; break;
            }
        }
        if (!props) props = anim.property(anim.numProperties);
    }
    return props;
}

// ---- 查找 Animators 组 ----
function findAnimatorsGroup(layer) {
    var ag = layer.property("ADBE Text Animators");
    if (!ag) {
        var tp = layer.property("ADBE Text Properties");
        if (tp) ag = tp.property("ADBE Text Animators");
    }
    if (!ag) {
        for (var di = 1; di <= layer.numProperties; di++) {
            var dp = layer.property(di);
            if (dp.matchName && dp.matchName.indexOf("ADBE") >= 0 && dp.matchName.indexOf("nimator") >= 0) {
                ag = dp; break;
            }
        }
    }
    return ag;
}

// ---- 获取文本长度 ----
function getTextLen(layer) {
    var textProp = layer.property("ADBE Text Properties");
    var sourceText = textProp.property("ADBE Text Source Text");
    if (!sourceText) sourceText = textProp.property("ADBE Text Document");
    var textDoc = sourceText.value;
    if (typeof textDoc === "string") return Math.max(1, textDoc.length);
    else if (textDoc && textDoc.text) return Math.max(1, textDoc.text.length);
    return 1;
}

// ---- 设置单个字符的 Percent Range ----
function lockCharRange(sel, ci, textLen) {
    var se = findSelectorStartEnd(sel);
    if (se.start && se.end) {
        se.start.setValue(((ci - 1) / textLen) * 100);
        se.end.setValue((ci / textLen) * 100);
    }
}

// ============================================================
// 应用动画
// ============================================================
function applyAnimation() {
    try {
        setStatus("执行中...");

        // ---- 读取参数 ----
        var pEntryEnbl   = entryEnable.value;
        var pEntryDur    = Math.max(0.1, getVal(entryDur, 2.0));
        var pEntryBlur   = Math.max(0, getVal(entryBlur, 40));
        var pEntryOff    = getVal(entryOffset, 80);
        var pDirection   = entryDirection && entryDirection.selection ? entryDirection.selection.index : 0;
        var pEntryMode   = entryMode && entryMode.selection ? entryMode.selection.index : 0;  // 0=逐字, 1=一起

        var pExitEnbl    = exitEnable.value;
        var pExitStart   = Math.max(0, getVal(exitStart, 3.5));
        var pExitDur     = Math.max(0.1, getVal(exitDur, 2.0));
        var pExitOff     = getVal(exitOffset, 80);
        var pExitBlur    = pEntryBlur;  // 出场模糊复用入场模糊值
        var pExitMode    = exitMode && exitMode.selection ? exitMode.selection.index : 0;  // 0=逐字, 1=一起

        var pHeightEnbl  = heightEnable.value;
        var pHeightAmp   = Math.max(0, getVal(heightAmp, 30));
        var pHeightFreq  = Math.max(0.01, getVal(heightFreq, 0.7));
        var pSpeed       = Math.max(0.01, getVal(speed, 1.0));

        var pScatterEnbl = scatterEnable.value;
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

        var pSpacingEnbl  = spacingEnable.value;
        var pSpacingStartVal = getVal(spacingStart, 0);
        var pSpacingEndVal   = getVal(spacingEnd, 50);
        var pSpacingDur      = Math.max(0.1, getVal(spacingDur, 2.0));
        var pSpacingStartTime = Math.max(0, getVal(spacingStartTime, 0));

        // ---- 验证选区 ----
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            setStatus("错误: 请先激活一个合成"); return;
        }
        var layer = comp.selectedLayers[0];
        if (!layer || !(layer instanceof TextLayer)) {
            setStatus("错误: 请选中一个文本图层"); return;
        }

        var startTime = comp.time;
        var animatorsGroup = findAnimatorsGroup(layer);
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

        var textLen = getTextLen(layer);

        // ============================================================
        // Animator 1: 入场
        // ============================================================
        if (pEntryEnbl) {
            var entryAnim = animatorsGroup.addProperty("ADBE Text Animator");
            entryAnim.name = "歌词_入场";

            var entrySel = entryAnim.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
            var entrySE = findSelectorStartEnd(entrySel);
            if (!entrySE.start || !entrySE.end) {
                setStatus("错误: 找不到入场 Selector Start/End"); return;
            }
            entrySE.end.setValue(100);

            if (pEntryMode === 0) {
                // 逐字出现：Start 从 0 → 100 扫描
                var ek1 = entrySE.start.addKey(startTime);
                entrySE.start.setValueAtKey(ek1, 0);
                var ek2 = entrySE.start.addKey(startTime + pEntryDur / pSpeed);
                entrySE.start.setValueAtKey(ek2, 100);
            } else {
                // 一起出现：整个文字一起出现，用 Opacity 从 0→100 关键帧
                // Range Selector 始终覆盖全部字符
                entrySE.start.setValue(0);
                entrySE.end.setValue(100);
            }

            var entryProps = findAnimatorProps(entryAnim);
            if (!entryProps) { setStatus("错误: 找不到入场 Animator 属性组"); return; }

            // Opacity
            var entryOpProp = addAnimProperty(entryProps, "ADBE Text Opacity");
            if (entryOpProp) {
                if (pEntryMode === 1) {
                    // 一起出现：用 Opacity 关键帧控制淡入
                    try { entryOpProp.setValue(0); } catch(e) {}
                    var eok1 = entryOpProp.addKey(startTime);
                    entryOpProp.setValueAtKey(eok1, 0);
                    var eok2 = entryOpProp.addKey(startTime + pEntryDur / pSpeed);
                    entryOpProp.setValueAtKey(eok2, 100);
                } else {
                    // 逐字出现：Opacity=0 配合 Range Selector 扫描
                    try { entryOpProp.setValue(0); } catch(e) {}
                }
            }

            // Blur
            var entryBlurProp = addAnimProperty(entryProps, "ADBE Text Blur");
            if (entryBlurProp) {
                if (pEntryMode === 1) {
                    // 一起出现：Blur 从最大值 → 0 关键帧
                    setBlurValue(entryBlurProp, pEntryBlur);
                    var ebk1 = entryBlurProp.addKey(startTime);
                    setBlurValueAtKey(entryBlurProp, ebk1, pEntryBlur);
                    var ebk2 = entryBlurProp.addKey(startTime + pEntryDur / pSpeed);
                    setBlurValueAtKey(entryBlurProp, ebk2, 0);
                } else {
                    setBlurValue(entryBlurProp, pEntryBlur);
                }
            }

            // Position
            var entryPosProp = addAnimProperty(entryProps, "ADBE Text Position");
            if (entryPosProp) {
                var is3D = (entryPosProp.propertyValueType === 6413);
                var entryPosVal = getDirectionPos(pEntryOff, pDirection, is3D);
                if (pEntryMode === 1) {
                    // 一起出现：Position 从偏移 → 0 关键帧
                    try { entryPosProp.setValue(entryPosVal); } catch(e) {}
                    var epk1 = entryPosProp.addKey(startTime);
                    entryPosProp.setValueAtKey(epk1, entryPosVal);
                    var epk2 = entryPosProp.addKey(startTime + pEntryDur / pSpeed);
                    entryPosProp.setValueAtKey(epk2, is3D ? [0,0,0] : [0,0]);
                } else {
                    try { entryPosProp.setValue(entryPosVal); } catch(e) {}
                }
            }
        }

        // ============================================================
        // Animator 2: 出场
        // ============================================================
        if (pExitEnbl) {
            var exitStartTime = pExitStart;
            var exitEndTime   = exitStartTime + pExitDur / pSpeed;

            var exitAnim = animatorsGroup.addProperty("ADBE Text Animator");
            exitAnim.name = "歌词_出场";

            var exitSel = exitAnim.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
            var exitSE = findSelectorStartEnd(exitSel);
            if (!exitSE.start || !exitSE.end) {
                setStatus("错误: 找不到出场 Selector Start/End"); return;
            }
            exitSE.end.setValue(100);

            if (pExitMode === 0) {
                // 逐字消失：Start 从 100 → 0 扫描
                var xk1 = exitSE.start.addKey(startTime + exitStartTime);
                exitSE.start.setValueAtKey(xk1, 100);
                var xk2 = exitSE.start.addKey(startTime + exitEndTime);
                exitSE.start.setValueAtKey(xk2, 0);
            } else {
                // 一起消失：Range Selector 始终覆盖全部
                exitSE.start.setValue(0);
                exitSE.end.setValue(100);
            }

            var exitProps = findAnimatorProps(exitAnim);
            if (!exitProps) { setStatus("错误: 找不到出场 Animator 属性组"); return; }

            // Opacity
            var exitOpProp = addAnimProperty(exitProps, "ADBE Text Opacity");
            if (exitOpProp) {
                if (pExitMode === 1) {
                    // 一起消失：Opacity 从 100 → 0 关键帧
                    try { exitOpProp.setValue(100); } catch(e) {}
                    var xok1 = exitOpProp.addKey(startTime + exitStartTime);
                    exitOpProp.setValueAtKey(xok1, 100);
                    var xok2 = exitOpProp.addKey(startTime + exitEndTime);
                    exitOpProp.setValueAtKey(xok2, 0);
                } else {
                    exitOpProp.setValue(0);
                }
            }

            // Blur
            var exitBlurProp = addAnimProperty(exitProps, "ADBE Text Blur");
            if (exitBlurProp) {
                if (pExitMode === 1) {
                    setBlurValue(exitBlurProp, 0);
                    var xbk1 = exitBlurProp.addKey(startTime + exitStartTime);
                    setBlurValueAtKey(exitBlurProp, xbk1, 0);
                    var xbk2 = exitBlurProp.addKey(startTime + exitEndTime);
                    setBlurValueAtKey(exitBlurProp, xbk2, pExitBlur);
                } else {
                    setBlurValue(exitBlurProp, pExitBlur);
                }
            }

            // Position
            var exitPosProp = addAnimProperty(exitProps, "ADBE Text Position");
            if (exitPosProp) {
                var eis3D = (exitPosProp.propertyValueType === 6413);
                var exitPosVal = getExitDirectionPos(pExitOff, pDirection, eis3D);
                if (pExitMode === 1) {
                    // 一起消失：Position 从 0 → 偏移 关键帧
                    try { exitPosProp.setValue(eis3D ? [0,0,0] : [0,0]); } catch(e) {}
                    var xpk1 = exitPosProp.addKey(startTime + exitStartTime);
                    exitPosProp.setValueAtKey(xpk1, eis3D ? [0,0,0] : [0,0]);
                    var xpk2 = exitPosProp.addKey(startTime + exitEndTime);
                    exitPosProp.setValueAtKey(xpk2, exitPosVal);
                } else {
                    exitPosProp.setValue(exitPosVal);
                }
            }
        }

        // ============================================================
        // Animator 3: 散落分布（逐字随机位置 + 随机大小 + 随机模糊 + 时间渐入）
        // ============================================================
        if (pScatterEnbl) {
            for (var ci = 1; ci <= textLen; ci++) {
                var sAnim = animatorsGroup.addProperty("ADBE Text Animator");
                sAnim.name = "歌词_散落_" + ci;

                var sProps = findAnimatorProps(sAnim);
                if (!sProps) continue;

                var sSel = sAnim.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
                lockCharRange(sSel, ci, textLen);

                // Position
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

                // Scale
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

                // 随机模糊
                if (pBlurProb > 0) {
                    var sBlur = addAnimProperty(sProps, "ADBE Text Blur");
                    if (sBlur) {
                        var blurExpr = "seedRandom(" + pBlurSeed + " + " + ci + ", true);\n";
                        blurExpr += "r = random(0, 100);\n";
                        blurExpr += "t = time - " + startTime.toFixed(3) + ";\n";
                        blurExpr += "fade = linear(t, " + pScatterStart.toFixed(3) + ", " + (pScatterStart + pScatterTrans).toFixed(3) + ", 0, 1);\n";
                        blurExpr += "if (r < " + pBlurProb + ") {\n";
                        blurExpr += "    seedRandom(" + pBlurSeed + " + " + ci + " + 5555, true);\n";
                        blurExpr += "    v = random(" + pBlurMin + ", " + pBlurMax + ") * fade;\n";
                        blurExpr += "} else { v = 0; }\n";
                        blurExpr += "[v, v]";
                        sBlur.expressionEnabled = true;
                        sBlur.expression = blurExpr;
                    }
                }
            }
        }

        // ============================================================
        // Animator 4: 高度错落（波浪浮动）
        // ============================================================
        if (pHeightEnbl) {
            for (var ci = 1; ci <= textLen; ci++) {
                var hAnim = animatorsGroup.addProperty("ADBE Text Animator");
                hAnim.name = "歌词_高度_" + ci;

                var hProps = findAnimatorProps(hAnim);
                if (!hProps) continue;

                var hSel = hAnim.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
                lockCharRange(hSel, ci, textLen);

                var hPos = addAnimProperty(hProps, "ADBE Text Position");
                if (hPos) {
                    var hExpr = "amp = " + pHeightAmp + ";\n";
                    hExpr += "freq = " + pHeightFreq + ";\n";
                    hExpr += "[0, Math.sin(time * freq * 2 + " + ci + " * 0.8) * amp]";
                    hPos.expressionEnabled = true;
                    hPos.expression = hExpr;
                }
            }
        }

        // ============================================================
        // Animator 5: 字间距动态（逐字线性变化）
        // ============================================================
        if (pSpacingEnbl) {
            for (var ci = 1; ci <= textLen; ci++) {
                var spAnim = animatorsGroup.addProperty("ADBE Text Animator");
                spAnim.name = "歌词_字间距_" + ci;

                var spProps = findAnimatorProps(spAnim);
                if (!spProps) continue;

                var spSel = spAnim.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
                lockCharRange(spSel, ci, textLen);

                var spTrack = addAnimProperty(spProps, "ADBE Text Tracking Amount");
                if (spTrack) {
                    var is2D = (spTrack.propertyValueType === PropertyValueType.TwoD);
                    var spExpr = "t = time - " + startTime.toFixed(3) + ";\n";
                    spExpr += "st = " + pSpacingStartTime.toFixed(3) + ";\n";
                    spExpr += "dur = " + pSpacingDur.toFixed(3) + ";\n";
                    spExpr += "s = " + pSpacingStartVal + ";\n";
                    spExpr += "e = " + pSpacingEndVal + ";\n";
                    spExpr += "v = linear(t, st, st + dur, s, e) * 0.1;\n";
                    spExpr += is2D ? "[v, v]" : "v";
                    spTrack.expressionEnabled = true;
                    spTrack.expression = spExpr;
                }
            }
        }

        // ============================================================
        // 完成
        // ============================================================
        var dirNames = ["左→右", "右→左", "上→下", "下→上"];
        var dirName = dirNames[pDirection] || "左→右";
        var parts = [];
        if (pEntryEnbl) parts.push("入场" + (pEntryDur / pSpeed).toFixed(1) + "s(" + dirName + ")");
        if (pExitEnbl) parts.push("出场" + pExitStart.toFixed(1) + "-" + (pExitStart + pExitDur / pSpeed).toFixed(1) + "s");
        if (pScatterEnbl) parts.push("散落" + textLen + "字符");
        if (pHeightEnbl) parts.push("波浪");
        if (pSpacingEnbl) parts.push("字间距" + pSpacingStartVal + "→" + pSpacingEndVal);
        var msg = parts.length > 0 ? parts.join(" ") : "无动画（全部关闭）";
        setStatus("完成! " + msg);
        $.writeln("歌词散落动画v3.4已应用成功: " + msg);

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
pal.layout.layout(true);
pal.onResizing = pal.onResize = function () { this.layout.resize(); };
if (pal instanceof Window) {
    pal.center();
    pal.show();
}
try { updateLoadButtons(); } catch (e) {}

})(this);
