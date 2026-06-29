export function initializeArabicAsciiApp() {
const elements = {
  appShell: document.querySelector(".app-shell"),
  languageToggle: document.querySelector("#languageToggle"),
  languageButtons: Array.from(document.querySelectorAll("[data-lang]")),
  canvasShell: document.querySelector("#canvasShell"),
  canvasStage: document.querySelector("#canvasStage"),
  canvasContent: document.querySelector("#canvasContent"),
  artboard: document.querySelector("#artboard"),
  artboardMenu: document.querySelector("#artboardMenu"),
  artboardMenuToggle: document.querySelector("#artboardMenuToggle"),
  artboardPresetButtons: Array.from(document.querySelectorAll("[data-artboard-preset]")),
  zoomOut: document.querySelector("#zoomOut"),
  zoomIn: document.querySelector("#zoomIn"),
  zoomReadout: document.querySelector("#zoomReadout"),
  charReadout: document.querySelector("#charReadout"),
  sidebarToggle: document.querySelector("#sidebarToggle"),
  sourceModeButtons: document.querySelector("#sourceModeButtons"),
  randomizeText: document.querySelector("#randomizeText"),
  accordionButtons: Array.from(document.querySelectorAll(".accordion-header")),
  sourceText: document.querySelector("#sourceText"),
  textSourceField: document.querySelector(".text-source-field"),
  imageSourcePanel: document.querySelector("#imageSourcePanel"),
  imageUploadTrigger: document.querySelector("#imageUploadTrigger"),
  imageUpload: document.querySelector("#imageUpload"),
  imageInfo: document.querySelector("#imageInfo"),
  drawingSourcePanel: document.querySelector("#drawingSourcePanel"),
  drawingCanvas: document.querySelector("#drawingCanvas"),
  drawingBrush: document.querySelector("#drawingBrush"),
  clearDrawing: document.querySelector("#clearDrawing"),
  expandDrawing: document.querySelector("#expandDrawing"),
  drawingStageActions: document.querySelector("#drawingStageActions"),
  drawingResultToggle: document.querySelector("#drawingResultToggle"),
  collapseDrawing: document.querySelector("#collapseDrawing"),
  fillPreset: document.querySelector("#fillPreset"),
  fillText: document.querySelector("#fillText"),
  fontSourceButtons: document.querySelector("#fontSourceButtons"),
  fontSelect: document.querySelector("#fontSelect"),
  fontWeight: document.querySelector("#fontWeight"),
  compositionSelect: document.querySelector("#compositionSelect"),
  colorModeButtons: document.querySelector("#colorModeButtons"),
  colorModeButtonList: Array.from(document.querySelectorAll("[data-color-mode]")),
  solidColorPanel: document.querySelector("#solidColorPanel"),
  gradientColorPanel: document.querySelector("#gradientColorPanel"),
  artColor: document.querySelector("#artColor"),
  backgroundColor: document.querySelector("#backgroundColor"),
  colorSwatches: Array.from(document.querySelectorAll("[data-color-target][data-color-value]")),
  gradientFrom: document.querySelector("#gradientFrom"),
  gradientTo: document.querySelector("#gradientTo"),
  gradientStopHandles: Array.from(document.querySelectorAll("[data-gradient-stop]")),
  gradientDirectionButtons: document.querySelector("#gradientDirectionButtons"),
  gradientDirectionButtonList: Array.from(document.querySelectorAll("[data-gradient-direction]")),
  gradientPreview: document.querySelector("#gradientPreview"),
  inkRange: document.querySelector("#inkRange"),
  animationSelect: document.querySelector("#animationSelect"),
  gridToggle: document.querySelector("#gridToggle"),
  exportBackground: document.querySelector("#exportBackground"),
  exportScale: document.querySelector("#exportScale"),
  sizeRange: document.querySelector("#sizeRange"),
  detailRange: document.querySelector("#detailRange"),
  thresholdRange: document.querySelector("#thresholdRange"),
  sizeValue: document.querySelector("#sizeValue"),
  detailValue: document.querySelector("#detailValue"),
  thresholdValue: document.querySelector("#thresholdValue"),
  inkValue: document.querySelector("#inkValue"),
  modeButtons: Array.from(document.querySelectorAll(".mode-button")),
  artCanvas: document.querySelector("#artCanvas"),
  maskCanvas: document.querySelector("#maskCanvas"),
  previewFrame: document.querySelector("#previewFrame"),
  textOutput: document.querySelector("#textOutput"),
  downloadPng: document.querySelector("#downloadPng"),
  downloadSvg: document.querySelector("#downloadSvg"),
  copyText: document.querySelector("#copyText"),
  downloadHtml: document.querySelector("#downloadHtml"),
  downloadGif: document.querySelector("#downloadGif"),
};

const state = {
  sourceMode: "text",
  sourceImage: null,
  sourceImageName: "",
  drawingPointerId: null,
  drawingHasInk: false,
  drawingExpanded: false,
  drawingResultView: false,
  lang: window.localStorage.getItem("arabicAsciiLang") || "ar",
  mode: "code",
  style: "code",
  renderId: 0,
  imageProcessId: 0,
  animationId: 0,
  fontSource: "basic",
  basicFonts: [],
  localFontsLoaded: false,
  availableFonts: [],
  fontWeightsByFamily: new Map(),
  currentFontFamily: "",
  colorMode: "solid",
  gradientDirection: "down",
  gradientFromPosition: 0,
  gradientToPosition: 100,
  gradientDraggingStop: null,
  deviceFonts: [],
  lastArt: null,
  lastFamily: "",
  lastText: "",
  lastFileBase: "arabic-ascii",
  canvasZoom: 1,
  canvasPanX: 0,
  canvasPanY: 0,
  canvasPointerId: null,
  canvasDragStartX: 0,
  canvasDragStartY: 0,
  canvasDragPanX: 0,
  canvasDragPanY: 0,
  artboardPreset: "wide",
  sidebarCollapsed: false,
};

const DEFAULT_FILL = "01IM:;/\\.,{}[]";
const MASK_WIDTH = 1800;
const MASK_HEIGHT = 980;
const CANVAS_CELL_WIDTH = 12;
const CANVAS_CELL_HEIGHT = 15;
const TEXT_CELL_ASPECT = 1.7;
const SHADE_RAMP = " .,:;irsXA253hMHGS#9B&@";
const PREVIEW_BACKGROUND = "#ffffff";
const GRID_COLOR = "#d6d6d6";
const ANIMATION_EXPORT_DURATION = 2400;
const ANIMATION_EXPORT_FPS = 24;
const GIF_EXPORT_SCALE = 1;
const PREVIEW_PIXEL_SCALE = 2;
const GIFENC_MODULE_URL = "https://cdn.jsdelivr.net/npm/gifenc@1.0.3/dist/gifenc.esm.js";
const BACKGROUND_REMOVAL_MODULE_URL = "https://esm.sh/@imgly/background-removal@1.7.0?bundle";
const BACKGROUND_REMOVAL_PUBLIC_PATH = "https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/";
const ARTBOARD_PRESETS = {
  square: { width: 520, height: 520 },
  story: { width: 360, height: 640 },
  post: { width: 448, height: 560 },
  wide: { width: 640, height: 360 },
  a4: { width: 420, height: 594 },
  a4Landscape: { width: 594, height: 420 },
};
const ARTBOARD_ART_INSET = 0.12;
let backgroundRemovalModulePromise = null;
let gifEncoderModulePromise = null;

const UI_TEXT = {
  ar: {
    outputPanel: "معاينة فن الأسكي",
    canvasTools: "أدوات اللوحة",
    zoomOut: "تصغير",
    zoomIn: "تكبير",
    zoomFit: "ملاءمة اللوحة",
    artboardSizes: "مقاسات اللوحة",
    artboardSquare: "مربع 1:1",
    artboardStory: "ستوري 9:16",
    artboardPost: "بوست 4:5",
    artboardWide: "عرضي 16:9",
    artboardA4: "A4 عمودي",
    artboardA4Landscape: "A4 عرضي",
    sidebar: "الشريط",
    sidebarToggle: "طي الشريط الجانبي",
    export: "تصدير",
    exportText: "نص",
    exportOptions: "خيارات التصدير",
    artCanvas: "معاينة فن الأسكي الناتج",
    drawingCanvas: "لوحة الرسم",
    showResult: "عرض النتيجة",
    editDrawing: "تعديل الرسم",
    back: "رجوع",
    textOutput: "النص القابل للنسخ",
    source: "النص",
    random: "عشوائي",
    text: "نص",
    image: "صورة",
    drawing: "رسم",
    uploadImage: "رفع صورة",
    imageInfo: "ارفع صورة وسيتم قص الخلفية تلقائياً",
    brushSize: "حجم الفرشاة",
    clear: "مسح",
    expandCanvas: "تكبير اللوحة",
    canvasExpanded: "اللوحة مكبرة",
    symbols: "الأسلوب",
    customSymbols: "رموز مخصصة",
    fillSymbols: "رموز التعبئة",
    presetCode: "كود / كلاسيكي",
    presetNumbers: "أرقام",
    presetDensity: "درجات كثافة",
    presetGeometric: "هندسي",
    presetPunctuation: "نقاط وفواصل",
    presetLatin: "حروف لاتينية",
    presetCustom: "أخرى",
    customFill: "رموز تعبئة مخصصة",
    fillStyle: "شكل التعبئة",
    modeCode: "رموز كود",
    modeShade: "تدرج ASCII",
    modeSolid: "كتلة",
    modeOrnament: "زخرفة",
    fonts: "الخطوط",
    colorFonts: "اللون والخطوط",
    color: "اللون",
    colorMode: "نمط لون الرموز",
    solidColor: "لون واحد",
    gradientColor: "تدرج",
    fontSource: "مصدر الخطوط",
    basicFonts: "خطوط أساسية",
    deviceFonts: "خطوط الجهاز",
    colorWeight: "اللون والسماكة",
    artColor: "لون الرسم",
    symbolColor: "لون الرموز",
    backgroundColor: "لون الخلفية",
    gradientFrom: "من",
    gradientTo: "إلى",
    gradientDirection: "اتجاه التدرج",
    gradientFromStop: "نقطة بداية التدرج",
    gradientToStop: "نقطة نهاية التدرج",
    gradientDown: "من الأعلى للأسفل",
    gradientRight: "من اليمين لليسار",
    gradientDiagonal: "قطري",
    gradientRadial: "دائري",
    inkDensity: "كثافة الحبر",
    inkStrength: "قوة الحبر",
    size: "المقاسات",
    shapeSize: "حجم الشكل",
    symbolDetail: "دقة الرموز",
    edgeSensitivity: "حساسية الحواف",
    motionShape: "الحركة والشكل",
    animation: "الحركة",
    animNone: "ثابت",
    animScan: "مسح ضوئي",
    animFlicker: "وميض رموز",
    animWave: "موجة",
    animReveal: "ظهور تدريجي",
    animOrbit: "مدار خفيف",
    animGlitch: "خلل رقمي",
    animRain: "مطر رموز",
    animType: "كتابة سريعة",
    animBreathe: "نبض هادئ",
    animJitter: "اهتزاز خفيف",
    composition: "تكوين الرسم",
    compositionNormal: "عادي",
    compositionArc: "قوس",
    compositionCircle: "دائري",
    showGrid: "إظهار الشبكة في المعاينة",
    settings: "إعدادات التوليد",
    appTitle: "استوديو الأسكي العربي",
    asciiArt: "",
    language: "اختيار اللغة",
    removeBg: "قص الخلفية...",
    loadCutModel: "تحميل نموذج القص",
    prepareCut: "تجهيز القص",
    cutDone: "تم قص الخلفية",
    originalImageUsed: "استخدمت الصورة الأصلية",
    imageLoadFailed: "تعذر تحميل الصورة",
    localFontsUnavailable: "فحص خطوط الجهاز غير متاح",
    noLocalFonts: "لم يتم العثور على خطوط محلية",
    localFontsFailed: "تعذر فحص خطوط الجهاز",
  },
  en: {
    outputPanel: "ASCII art preview",
    canvasTools: "Canvas tools",
    zoomOut: "Zoom out",
    zoomIn: "Zoom in",
    zoomFit: "Fit artboard",
    artboardSizes: "Artboard sizes",
    artboardSquare: "Square 1:1",
    artboardStory: "Story 9:16",
    artboardPost: "Post 4:5",
    artboardWide: "Landscape 16:9",
    artboardA4: "A4 portrait",
    artboardA4Landscape: "A4 landscape",
    sidebar: "Sidebar",
    sidebarToggle: "Collapse sidebar",
    export: "Export",
    exportText: "Text",
    exportOptions: "Export options",
    artCanvas: "Generated ASCII art preview",
    drawingCanvas: "Drawing canvas",
    showResult: "Show result",
    editDrawing: "Edit drawing",
    back: "Back",
    textOutput: "Copyable text",
    source: "Text",
    random: "Random",
    text: "Text",
    image: "Image",
    drawing: "Draw",
    uploadImage: "Upload image",
    imageInfo: "Upload an image to remove the background automatically",
    brushSize: "Brush size",
    clear: "Clear",
    expandCanvas: "Expand canvas",
    canvasExpanded: "Canvas expanded",
    symbols: "Style",
    customSymbols: "Custom symbols",
    fillSymbols: "Fill symbols",
    presetCode: "Code / classic",
    presetNumbers: "Numbers",
    presetDensity: "Density ramp",
    presetGeometric: "Geometric",
    presetPunctuation: "Dots and punctuation",
    presetLatin: "Latin letters",
    presetCustom: "Custom",
    customFill: "Custom fill symbols",
    fillStyle: "Fill style",
    modeCode: "Code symbols",
    modeShade: "ASCII gradient",
    modeSolid: "Block",
    modeOrnament: "Ornament",
    fonts: "Fonts",
    colorFonts: "Color and fonts",
    color: "Color",
    colorMode: "Symbol color mode",
    solidColor: "Solid",
    gradientColor: "Gradient",
    fontSource: "Font source",
    basicFonts: "Basic fonts",
    deviceFonts: "Device fonts",
    colorWeight: "Color and weight",
    artColor: "Art color",
    symbolColor: "Symbol color",
    backgroundColor: "Background color",
    gradientFrom: "From",
    gradientTo: "To",
    gradientDirection: "Gradient direction",
    gradientFromStop: "Gradient start stop",
    gradientToStop: "Gradient end stop",
    gradientDown: "Top to bottom",
    gradientRight: "Left to right",
    gradientDiagonal: "Diagonal",
    gradientRadial: "Radial",
    inkDensity: "Ink density",
    inkStrength: "Ink strength",
    size: "Size",
    shapeSize: "Shape size",
    symbolDetail: "Symbol detail",
    edgeSensitivity: "Edge sensitivity",
    motionShape: "Motion and shape",
    animation: "Animation",
    animNone: "Static",
    animScan: "Scan line",
    animFlicker: "Symbol flicker",
    animWave: "Wave",
    animReveal: "Reveal",
    animOrbit: "Soft orbit",
    animGlitch: "Digital glitch",
    animRain: "Symbol rain",
    animType: "Fast typing",
    animBreathe: "Soft pulse",
    animJitter: "Light jitter",
    composition: "Composition",
    compositionNormal: "Normal",
    compositionArc: "Arc",
    compositionCircle: "Circle",
    showGrid: "Show grid in preview",
    settings: "Generator settings",
    appTitle: "Arabic ASCII Studio",
    asciiArt: "",
    language: "Language",
    removeBg: "Removing background...",
    loadCutModel: "Loading cutout model",
    prepareCut: "Preparing cutout",
    cutDone: "Background removed",
    originalImageUsed: "Original image used",
    imageLoadFailed: "Could not load image",
    localFontsUnavailable: "Device font scan is unavailable",
    noLocalFonts: "No local fonts found",
    localFontsFailed: "Could not scan device fonts",
  },
};

function t(key) {
  return UI_TEXT[state.lang][key] || UI_TEXT.ar[key] || key;
}

function cssFontFamily(family) {
  const safeFamily = String(family || "sans-serif").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${safeFamily}", "Geeza Pro", "Noto Naskh Arabic", "Noto Sans Arabic", Tahoma, Arial, sans-serif`;
}

function fileBase(text) {
  const normalized = text
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .slice(0, 32);
  return normalized || "arabic-ascii";
}

function loadBackgroundRemovalModule() {
  if (!backgroundRemovalModulePromise) {
    backgroundRemovalModulePromise = import(/* @vite-ignore */ BACKGROUND_REMOVAL_MODULE_URL);
  }

  return backgroundRemovalModulePromise;
}

function loadGifEncoderModule() {
  if (!gifEncoderModulePromise) {
    gifEncoderModulePromise = import(/* @vite-ignore */ GIFENC_MODULE_URL);
  }

  return gifEncoderModulePromise;
}

function isAnimated() {
  return elements.animationSelect.value !== "none";
}

function formatModelProgress(key, loaded, total) {
  if (!total || total <= 0) return t("removeBg");
  const percent = Math.min(100, Math.max(0, Math.round((loaded / total) * 100)));
  if (key.includes("model")) return `${t("loadCutModel")} ${percent}%`;
  return `${t("prepareCut")} ${percent}%`;
}

function graphemes(text) {
  const clean = String(text || "").replace(/\s+/g, "");
  if (!clean) return ["#"];
  if ("Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("ar", { granularity: "grapheme" });
    return Array.from(segmenter.segment(clean), (part) => part.segment).filter(Boolean);
  }
  return Array.from(clean);
}

function applyLanguage(lang) {
  state.lang = lang === "en" ? "en" : "ar";
  window.localStorage.setItem("arabicAsciiLang", state.lang);
  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-attr]").forEach((node) => {
    node.dataset.i18nAttr.split(";").forEach((entry) => {
      const [attribute, key] = entry.split(":");
      if (attribute && key) node.setAttribute(attribute, t(key));
    });
  });

  elements.languageButtons.forEach((button) => {
    const isActive = button.dataset.lang === state.lang;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (state.sourceImageName || state.sourceMode !== "image") {
    elements.imageInfo.textContent = state.sourceMode === "image" ? elements.imageInfo.textContent : t("imageInfo");
  }

  syncDrawingView();
}

function updateRangeLabels() {
  elements.sizeValue.textContent = elements.sizeRange.value;
  elements.detailValue.textContent = elements.detailRange.value;
  elements.thresholdValue.textContent = elements.thresholdRange.value;
  elements.inkValue.textContent = elements.inkRange.value;
  [elements.sizeRange, elements.detailRange, elements.thresholdRange, elements.inkRange, elements.drawingBrush].forEach(updateRangeFill);
}

function updateRangeFill(range) {
  if (!range) return;
  const min = Number(range.min || 0);
  const max = Number(range.max || 100);
  const value = Number(range.value || 0);
  const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;
  range.style.setProperty("--value-percent", `${Math.max(0, Math.min(100, percent))}%`);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function applyCanvasTransform() {
  if (!elements.canvasContent) return;
  elements.canvasContent.style.setProperty("--canvas-pan-x", `${state.canvasPanX}px`);
  elements.canvasContent.style.setProperty("--canvas-pan-y", `${state.canvasPanY}px`);
  elements.canvasContent.style.setProperty("--canvas-zoom", String(state.canvasZoom));
  if (elements.zoomReadout) {
    elements.zoomReadout.textContent = `${Math.round(state.canvasZoom * 100)}%`;
  }
}

function setCanvasZoom(nextZoom) {
  state.canvasZoom = clamp(nextZoom, 0.25, 3);
  applyCanvasTransform();
}

function fitCanvasToStage() {
  if (!elements.canvasStage || !elements.artboard) return;
  const stageRect = elements.canvasStage.getBoundingClientRect();
  const preset = ARTBOARD_PRESETS[state.artboardPreset] || ARTBOARD_PRESETS.wide;
  const zoom = Math.min((stageRect.width - 96) / preset.width, (stageRect.height - 96) / preset.height, 1.4);
  state.canvasPanX = 0;
  state.canvasPanY = 0;
  setCanvasZoom(clamp(zoom, 0.35, 1.4));
}

function setArtboardMenu(open) {
  if (!elements.artboardMenu || !elements.artboardMenuToggle) return;
  elements.artboardMenu.classList.toggle("is-open", open);
  elements.artboardMenuToggle.setAttribute("aria-expanded", String(open));
}

function setArtboardPreset(presetName) {
  const preset = ARTBOARD_PRESETS[presetName] || ARTBOARD_PRESETS.wide;
  state.artboardPreset = presetName in ARTBOARD_PRESETS ? presetName : "wide";
  elements.artboard.style.setProperty("--artboard-width", `${preset.width}px`);
  elements.artboard.style.setProperty("--artboard-height", `${preset.height}px`);
  elements.artboard.dataset.artboard = state.artboardPreset;
  elements.artboardPresetButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.artboardPreset === state.artboardPreset);
  });
  setArtboardMenu(false);
  fitCanvasToStage();
  if (state.lastArt) {
    drawPreview(state.lastArt, 0);
  }
}

function beginCanvasPan(event) {
  if (event.button !== 0 || event.target.closest("button, input, select, textarea, .preview-frame")) return;
  event.preventDefault();
  state.canvasPointerId = event.pointerId;
  state.canvasDragStartX = event.clientX;
  state.canvasDragStartY = event.clientY;
  state.canvasDragPanX = state.canvasPanX;
  state.canvasDragPanY = state.canvasPanY;
  elements.canvasStage.setPointerCapture(event.pointerId);
  elements.canvasStage.classList.add("is-panning");
}

function continueCanvasPan(event) {
  if (state.canvasPointerId !== event.pointerId) return;
  event.preventDefault();
  state.canvasPanX = state.canvasDragPanX + (event.clientX - state.canvasDragStartX);
  state.canvasPanY = state.canvasDragPanY + (event.clientY - state.canvasDragStartY);
  applyCanvasTransform();
}

function endCanvasPan(event) {
  if (state.canvasPointerId !== event.pointerId) return;
  state.canvasPointerId = null;
  if (elements.canvasStage.hasPointerCapture(event.pointerId)) {
    elements.canvasStage.releasePointerCapture(event.pointerId);
  }
  elements.canvasStage.classList.remove("is-panning");
}

function handleCanvasWheel(event) {
  if (!elements.canvasStage?.contains(event.target)) return;
  event.preventDefault();
  if (event.ctrlKey || event.metaKey || Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
    const direction = event.deltaY > 0 ? -1 : 1;
    setCanvasZoom(state.canvasZoom + direction * 0.08);
    return;
  }
  state.canvasPanX -= event.deltaX;
  state.canvasPanY -= event.deltaY;
  applyCanvasTransform();
}

function toggleSidebar() {
  state.sidebarCollapsed = !state.sidebarCollapsed;
  elements.appShell.classList.toggle("is-sidebar-collapsed", state.sidebarCollapsed);
  elements.sidebarToggle.setAttribute("aria-expanded", String(!state.sidebarCollapsed));
  window.requestAnimationFrame(fitCanvasToStage);
}

function scheduleRender() {
  const renderId = ++state.renderId;
  window.requestAnimationFrame(() => {
    if (renderId === state.renderId) {
      renderArt().catch((error) => {
        console.error(error);
      });
    }
  });
}

function applyFillPreset() {
  const preset = elements.fillPreset.value;
  if (preset === "custom") {
    elements.fillText.focus();
    return;
  }

  elements.fillText.value = preset;
  scheduleRender();
}

function handleCustomFillInput() {
  if (elements.fillText.value !== elements.fillPreset.value) {
    elements.fillPreset.value = "custom";
  }

  scheduleRender();
}

function randomizeText() {
  const samples = [
    "حب",
    "سلام",
    "نور",
    "حلم",
    "أثر",
    "عمّان",
    "حرية",
    "ذاكرة",
  ];
  const fills = [DEFAULT_FILL, "0123456789", ".-:=+*#%@", "[]{}()/\\<>", ".,:;"];
  const modes = Array.from(elements.modeButtons);
  const text = samples[Math.floor(Math.random() * samples.length)];
  const fill = fills[Math.floor(Math.random() * fills.length)];
  const button = modes[Math.floor(Math.random() * modes.length)] || modes[0];

  elements.sourceText.value = text;
  elements.fillText.value = button?.dataset.fillValue || fill;
  elements.fillPreset.value = "custom";

  if (button) {
    setMode(button.dataset.mode, button.dataset.style || button.dataset.mode);
  } else {
    scheduleRender();
  }
}

function toggleAccordion(button) {
  const section = button.closest(".accordion-section");
  const isOpen = !section.classList.contains("is-open");
  section.classList.toggle("is-open", isOpen);
  button.setAttribute("aria-expanded", String(isOpen));
  if (isOpen) {
    scrollSectionIntoPanel(section);
  }
}

function scrollSectionIntoPanel(section) {
  const panel = section.closest(".control-panel");
  if (!panel) return;

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      const panelRect = panel.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      const headerHeight = panel.querySelector(".panel-title")?.offsetHeight || 0;
      const exportHeight = document.querySelector(".export-dock")?.offsetHeight || 0;
      const topEdge = panelRect.top + headerHeight + 12;
      const bottomEdge = panelRect.bottom - exportHeight - 12;
      let target = panel.scrollTop;

      if (sectionRect.bottom > bottomEdge) {
        target += sectionRect.bottom - bottomEdge;
      }

      if (sectionRect.top < topEdge) {
        target += sectionRect.top - topEdge;
      }

      panel.scrollTo({
        top: Math.max(0, target),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    });
  });
}

function setSourceMode(mode) {
  state.sourceMode = mode;
  elements.sourceModeButtons.querySelectorAll("[data-source-mode]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.sourceMode === mode);
  });
  elements.textSourceField.classList.toggle("is-hidden", mode !== "text");
  elements.imageSourcePanel.classList.toggle("is-hidden", mode !== "image");
  elements.drawingSourcePanel.classList.toggle("is-hidden", mode !== "drawing");
  if (mode !== "drawing") {
    setDrawingExpanded(false);
    setDrawingResultView(false);
  }
  syncDrawingView();
  scheduleRender();
}

function syncDrawingView() {
  const isDrawing = state.sourceMode === "drawing";
  elements.appShell.classList.toggle("is-drawing-expanded", isDrawing && state.drawingExpanded);
  elements.previewFrame.classList.toggle("is-drawing-source", isDrawing);
  elements.previewFrame.classList.toggle("is-drawing-result", isDrawing && state.drawingResultView);
  elements.drawingCanvas.classList.toggle("is-hidden", !isDrawing || state.drawingResultView);
  elements.drawingStageActions.classList.toggle("is-hidden", !isDrawing || !state.drawingExpanded);
  elements.drawingResultToggle.textContent = state.drawingResultView ? t("editDrawing") : t("showResult");
  elements.expandDrawing.textContent = state.drawingExpanded ? t("canvasExpanded") : t("expandCanvas");
}

function setDrawingExpanded(expanded) {
  state.drawingExpanded = Boolean(expanded);
  if (state.drawingExpanded) {
    state.drawingResultView = false;
  }
  syncDrawingView();
}

function setDrawingResultView(enabled) {
  state.drawingResultView = Boolean(enabled);
  syncDrawingView();
}

function drawingPoint(event) {
  const rect = elements.drawingCanvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * elements.drawingCanvas.width,
    y: ((event.clientY - rect.top) / rect.height) * elements.drawingCanvas.height,
  };
}

function drawingContext() {
  return elements.drawingCanvas.getContext("2d", { willReadFrequently: true });
}

function clearDrawingCanvas() {
  const ctx = drawingContext();
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, elements.drawingCanvas.width, elements.drawingCanvas.height);
  ctx.restore();
  state.drawingHasInk = false;
  setDrawingResultView(false);
  if (state.sourceMode === "drawing") scheduleRender();
}

function beginDrawing(event) {
  event.preventDefault();
  state.drawingPointerId = event.pointerId;
  elements.drawingCanvas.setPointerCapture(event.pointerId);

  const point = drawingPoint(event);
  const ctx = drawingContext();
  ctx.beginPath();
  ctx.moveTo(point.x, point.y);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#111111";
  ctx.lineWidth = Number(elements.drawingBrush.value) || 18;
  ctx.lineTo(point.x + 0.01, point.y + 0.01);
  ctx.stroke();
  state.drawingHasInk = true;
  if (state.sourceMode === "drawing") scheduleRender();
}

function continueDrawing(event) {
  if (state.drawingPointerId !== event.pointerId) return;
  event.preventDefault();
  const point = drawingPoint(event);
  const ctx = drawingContext();
  ctx.lineWidth = Number(elements.drawingBrush.value) || 18;
  ctx.lineTo(point.x, point.y);
  ctx.stroke();
  state.drawingHasInk = true;
  if (state.sourceMode === "drawing") scheduleRender();
}

function endDrawing(event) {
  if (state.drawingPointerId !== event.pointerId) return;
  state.drawingPointerId = null;
  if (elements.drawingCanvas.hasPointerCapture(event.pointerId)) {
    elements.drawingCanvas.releasePointerCapture(event.pointerId);
  }
  if (state.sourceMode === "drawing") scheduleRender();
}

function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image failed to load"));
    };

    image.src = url;
  });
}

async function removeImageBackground(file, processId) {
  const { removeBackground } = await loadBackgroundRemovalModule();
  if (processId !== state.imageProcessId) return null;

  const blob = await removeBackground(file, {
    publicPath: BACKGROUND_REMOVAL_PUBLIC_PATH,
    model: "isnet_quint8",
    device: "cpu",
    proxyToWorker: false,
    output: {
      format: "image/png",
      quality: 1,
    },
    progress: (key, loaded, total) => {
      if (processId === state.imageProcessId) {
        elements.imageInfo.textContent = formatModelProgress(key, loaded, total);
      }
    },
  });

  if (processId !== state.imageProcessId) return null;
  return loadImageFile(blob);
}

async function handleImageUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const processId = ++state.imageProcessId;

  try {
    state.sourceImage = null;
    state.sourceImageName = file.name.replace(/\.[^.]+$/, "");
    setSourceMode("image");
    elements.imageInfo.textContent = t("removeBg");

    try {
      const cutoutImage = await removeImageBackground(file, processId);
      if (processId !== state.imageProcessId) return;
      state.sourceImage = cutoutImage;
      elements.imageInfo.textContent = `${file.name} · ${t("cutDone")}`;
    } catch (modelError) {
      console.warn("Background removal failed; using original image.", modelError);
      if (processId !== state.imageProcessId) return;
      state.sourceImage = await loadImageFile(file);
      elements.imageInfo.textContent = `${file.name} · ${t("originalImageUsed")}`;
    }

    scheduleRender();
  } catch (error) {
    console.error(error);
    state.sourceImage = null;
    elements.imageInfo.textContent = t("imageLoadFailed");
    scheduleRender();
  }

  event.target.value = "";
}

function normalizeFontText(value) {
  return String(value || "").trim().toLocaleLowerCase();
}

function seedFontRegistry() {
  state.basicFonts = Array.from(elements.fontSelect.options).map((option) => {
    return { family: option.value, label: option.textContent || option.value };
  });
  state.basicFonts.forEach((font) => {
    state.fontWeightsByFamily.set(font.family, defaultWeights());
  });
  state.availableFonts = uniqueFonts(state.basicFonts);
  state.currentFontFamily = elements.fontSelect.value || state.availableFonts[0]?.family || "Geeza Pro";
  renderWeightOptions();
}

function uniqueFonts(fonts) {
  const fontMap = new Map();
  fonts.forEach((font) => {
    const cleanFamily = String(font.family || "").trim();
    if (!cleanFamily || fontMap.has(cleanFamily)) return;
    fontMap.set(cleanFamily, {
      family: cleanFamily,
      label: String(font.label || cleanFamily).trim() || cleanFamily,
    });
  });
  return Array.from(fontMap.values()).sort((a, b) => a.label.localeCompare(b.label));
}

function defaultWeights() {
  return [
    { label: "Regular · 400", value: "400" },
    { label: "Semi Bold · 600", value: "600" },
    { label: "Bold · 800", value: "800" },
  ];
}

function styleNameToWeight(styleName) {
  const normalized = normalizeFontText(styleName);
  if (!normalized || normalized === "normal" || normalized === "regular" || normalized === "book") return "400";
  if (normalized.includes("thin")) return "100";
  if (normalized.includes("extra light") || normalized.includes("ultra light")) return "200";
  if (normalized.includes("light")) return "300";
  if (normalized.includes("medium")) return "500";
  if (normalized.includes("semi bold") || normalized.includes("semibold") || normalized.includes("demi bold")) return "600";
  if (normalized.includes("extra bold") || normalized.includes("ultra bold")) return "800";
  if (normalized.includes("black") || normalized.includes("heavy")) return "900";
  if (normalized.includes("bold")) return "700";
  return "400";
}

function dedupeWeights(weights) {
  const byValue = new Map();
  weights.forEach((weight) => {
    const value = String(weight.value || "400");
    const label = String(weight.label || value).trim() || value;
    const visibleLabel = label.includes(value) ? label : `${label} · ${value}`;
    if (!byValue.has(value)) byValue.set(value, { label: visibleLabel, value });
  });
  return Array.from(byValue.values()).sort((a, b) => Number(a.value) - Number(b.value));
}

function localFonts() {
  return uniqueFonts(state.deviceFonts);
}

function getFontLabel(family) {
  return state.availableFonts.find((font) => font.family === family)?.label || family || "";
}

function filteredFonts(query) {
  const normalizedQuery = normalizeFontText(query);
  if (!normalizedQuery) return state.availableFonts;

  return state.availableFonts.filter((font) => {
    return (
      normalizeFontText(font.label).includes(normalizedQuery) ||
      normalizeFontText(font.family).includes(normalizedQuery)
    );
  });
}

function renderFontOptions(query = "") {
  const matches = filteredFonts(query);
  const selectedFamily = state.currentFontFamily;

  elements.fontSelect.textContent = "";

  if (!matches.length) {
    const emptyOption = new Option("لا يوجد خط بهذا الاسم", "");
    emptyOption.disabled = true;
    elements.fontSelect.append(emptyOption);
    return;
  }

  matches.forEach((font) => {
    elements.fontSelect.append(new Option(font.label, font.family));
  });

  if (matches.some((font) => font.family === selectedFamily)) {
    elements.fontSelect.value = selectedFamily;
  }

  renderWeightOptions();
}

function syncFontSourceButtons() {
  elements.fontSourceButtons.querySelectorAll("[data-font-source]").forEach((button) => {
    const active = button.dataset.fontSource === state.fontSource;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-checked", String(active));
  });
}

function setAvailableFonts(fonts, preferredFamily = state.currentFontFamily) {
  state.availableFonts = uniqueFonts(fonts);

  if (!state.availableFonts.length) {
    renderFontOptions();
    renderWeightOptions();
    return;
  }

  const preferred = state.availableFonts.find((font) => font.family === preferredFamily);
  state.currentFontFamily = (preferred || state.availableFonts[0]).family;
  renderFontOptions();
  elements.fontSelect.value = state.currentFontFamily;
  renderWeightOptions();
  scheduleRender();
}

function showLocalFontMessage(message) {
  const fonts = localFonts();

  if (fonts.length) {
    setAvailableFonts(fonts);
    return;
  }

  state.availableFonts = [];
  elements.fontSelect.textContent = "";
  const emptyOption = new Option("لا توجد خطوط محلية", "");
  emptyOption.disabled = true;
  elements.fontSelect.append(emptyOption);
  elements.fontWeight.textContent = "";
  const weightOption = new Option(message, "400");
  weightOption.disabled = true;
  elements.fontWeight.append(weightOption);
}

function showBasicFonts() {
  state.fontSource = "basic";
  syncFontSourceButtons();
  setAvailableFonts(state.basicFonts);
}

async function showLocalFonts() {
  state.fontSource = "local";
  syncFontSourceButtons();

  if (!state.localFontsLoaded) {
    await scanLocalFonts();
    return;
  }

  setAvailableFonts(localFonts());
}

function setFontFamily(family) {
  const font = state.availableFonts.find((item) => item.family === family);
  if (!font) return;

  state.currentFontFamily = font.family;
  renderFontOptions();
  elements.fontSelect.value = font.family;
  renderWeightOptions();
  scheduleRender();
}

function renderWeightOptions() {
  const previousWeight = elements.fontWeight.value || "400";
  const weights = state.fontWeightsByFamily.get(state.currentFontFamily) || defaultWeights();
  const normalizedWeights = dedupeWeights(weights);

  elements.fontWeight.textContent = "";
  normalizedWeights.forEach((weight) => {
    elements.fontWeight.append(new Option(weight.label, weight.value));
  });

  const preferred = normalizedWeights.find((weight) => weight.value === previousWeight) || normalizedWeights[0];
  if (preferred) elements.fontWeight.value = preferred.value;
}

async function loadSelectedFont(size) {
  const family = state.currentFontFamily || elements.fontSelect.value;
  const weight = elements.fontWeight.value;
  if (document.fonts && family) {
    await document.fonts.load(`${weight} ${size}px ${cssFontFamily(family)}`);
    await document.fonts.ready;
  }
}

function drawMask(lines, family, weight, requestedSize) {
  const canvas = elements.maskCanvas;
  canvas.width = MASK_WIDTH;
  canvas.height = MASK_HEIGHT;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.clearRect(0, 0, MASK_WIDTH, MASK_HEIGHT);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.direction = "rtl";

  const maxWidth = MASK_WIDTH - 140;
  const maxHeight = MASK_HEIGHT - 130;
  let fontSize = requestedSize;

  for (let i = 0; i < 7; i += 1) {
    ctx.font = `${weight} ${fontSize}px ${cssFontFamily(family)}`;
    const widest = Math.max(...lines.map((line) => ctx.measureText(line).width), 1);
    const lineHeight = fontSize * 1.16;
    const totalHeight = lineHeight * lines.length;
    const fit = Math.min(maxWidth / widest, maxHeight / totalHeight, 1);
    if (fit >= 0.995) break;
    fontSize = Math.max(28, fontSize * fit);
  }

  ctx.font = `${weight} ${fontSize}px ${cssFontFamily(family)}`;
  const lineHeight = fontSize * 1.16;
  const startY = MASK_HEIGHT / 2 - ((lines.length - 1) * lineHeight) / 2;

  lines.forEach((line, index) => {
    ctx.fillText(line, MASK_WIDTH / 2, startY + index * lineHeight);
  });

  return ctx.getImageData(0, 0, MASK_WIDTH, MASK_HEIGHT);
}

function averageCornerColor(data, width, height) {
  const samples = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ];
  const color = { r: 0, g: 0, b: 0 };
  let count = 0;

  samples.forEach(([x, y]) => {
    const index = (y * width + x) * 4;
    const alpha = data[index + 3] / 255;
    color.r += data[index] * alpha;
    color.g += data[index + 1] * alpha;
    color.b += data[index + 2] * alpha;
    count += alpha;
  });

  if (!count) return { r: 255, g: 255, b: 255 };
  return {
    r: color.r / count,
    g: color.g / count,
    b: color.b / count,
  };
}

function drawImageMask(image) {
  const canvas = elements.maskCanvas;
  canvas.width = MASK_WIDTH;
  canvas.height = MASK_HEIGHT;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.clearRect(0, 0, MASK_WIDTH, MASK_HEIGHT);

  const scale = Math.min((MASK_WIDTH - 140) / image.naturalWidth, (MASK_HEIGHT - 120) / image.naturalHeight);
  const drawWidth = Math.max(1, Math.round(image.naturalWidth * scale));
  const drawHeight = Math.max(1, Math.round(image.naturalHeight * scale));
  const offsetX = Math.round((MASK_WIDTH - drawWidth) / 2);
  const offsetY = Math.round((MASK_HEIGHT - drawHeight) / 2);
  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

  const imageData = ctx.getImageData(0, 0, MASK_WIDTH, MASK_HEIGHT);
  const { data, width, height } = imageData;
  const bg = averageCornerColor(data, width, height);
  const threshold = Number(elements.thresholdRange.value) / 100;

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3] / 255;
    const luminance = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
    const dr = data[i] - bg.r;
    const dg = data[i + 1] - bg.g;
    const db = data[i + 2] - bg.b;
    const distance = Math.sqrt(dr * dr + dg * dg + db * db) / 441.7;
    const darkness = 1 - luminance;
    const score = alpha < 0.98 ? alpha : Math.max(distance, darkness * 0.62);
    const isInk = alpha > 0.06 && score >= threshold;

    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    data[i + 3] = isInk ? 255 : 0;
  }

  return imageData;
}

function drawDrawingMask() {
  const canvas = elements.maskCanvas;
  canvas.width = MASK_WIDTH;
  canvas.height = MASK_HEIGHT;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.clearRect(0, 0, MASK_WIDTH, MASK_HEIGHT);

  const source = elements.drawingCanvas;
  const scale = Math.min((MASK_WIDTH - 140) / source.width, (MASK_HEIGHT - 120) / source.height);
  const drawWidth = Math.max(1, Math.round(source.width * scale));
  const drawHeight = Math.max(1, Math.round(source.height * scale));
  const offsetX = Math.round((MASK_WIDTH - drawWidth) / 2);
  const offsetY = Math.round((MASK_HEIGHT - drawHeight) / 2);
  ctx.drawImage(source, offsetX, offsetY, drawWidth, drawHeight);

  const imageData = ctx.getImageData(0, 0, MASK_WIDTH, MASK_HEIGHT);
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3] / 255;
    const luminance = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
    const isInk = alpha > 0.05 && luminance < 0.88;

    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    data[i + 3] = isInk ? 255 : 0;
  }

  return imageData;
}

function findInkBounds(imageData) {
  const { data, width, height } = imageData;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 12) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (minX > maxX || minY > maxY) {
    return null;
  }

  const pad = 34;
  return {
    minX: Math.max(0, minX - pad),
    minY: Math.max(0, minY - pad),
    maxX: Math.min(width - 1, maxX + pad),
    maxY: Math.min(height - 1, maxY + pad),
  };
}

function cellCoverage(imageData, x1, y1, x2, y2) {
  const { data, width, height } = imageData;
  const left = Math.max(0, Math.floor(x1));
  const top = Math.max(0, Math.floor(y1));
  const right = Math.min(width - 1, Math.ceil(x2));
  const bottom = Math.min(height - 1, Math.ceil(y2));
  const step = Math.max(1, Math.floor(Math.min(right - left + 1, bottom - top + 1) / 7));
  let hits = 0;
  let total = 0;

  for (let y = top; y <= bottom; y += step) {
    for (let x = left; x <= right; x += step) {
      total += 1;
      if (data[(y * width + x) * 4 + 3] > 22) {
        hits += 1;
      }
    }
  }

  return total ? hits / total : 0;
}

function charForCell(mode, coverage, fillUnits, fillIndex) {
  if (mode === "solid") return "#";
  if (mode === "shade") {
    const shadeIndex = Math.max(1, Math.min(SHADE_RAMP.length - 1, Math.round(coverage * (SHADE_RAMP.length - 1))));
    return SHADE_RAMP[shadeIndex];
  }
  return fillUnits[fillIndex % fillUnits.length];
}

function buildTextArt(imageData, bounds, text, filler) {
  const cols = Number(elements.detailRange.value);
  const cropWidth = bounds.maxX - bounds.minX + 1;
  const cropHeight = bounds.maxY - bounds.minY + 1;
  const rows = Math.max(8, Math.ceil((cropHeight / cropWidth) * cols / TEXT_CELL_ASPECT));
  const gate = Number(elements.thresholdRange.value) / 100;
  const fillUnits = graphemes(filler || text);
  const lines = [];
  const cells = [];
  let fillIndex = 0;

  for (let row = 0; row < rows; row += 1) {
    let line = "";
    for (let col = 0; col < cols; col += 1) {
      const x1 = bounds.minX + (col / cols) * cropWidth;
      const x2 = bounds.minX + ((col + 1) / cols) * cropWidth;
      const y1 = bounds.minY + (row / rows) * cropHeight;
      const y2 = bounds.minY + ((row + 1) / rows) * cropHeight;
      const coverage = cellCoverage(imageData, x1, y1, x2, y2);

      if (coverage >= gate) {
        const char = charForCell(state.mode, coverage, fillUnits, fillIndex);
        line += char;
        cells.push({ row, col, char, coverage });
        fillIndex += 1;
      } else {
        line += " ";
      }
    }
    lines.push(line.replace(/\s+$/g, ""));
  }

  return { lines, cells, cols, rows };
}

function getArtColors() {
  const artColor = elements.artColor?.value || "#111111";
  const bgColor = elements.backgroundColor?.value || PREVIEW_BACKGROUND;
  const gradientFrom = elements.gradientFrom?.value || "#9b51e0";
  const gradientTo = elements.gradientTo?.value || "#ff6a3d";
  const fromPosition = Math.max(0, Math.min(100, state.gradientFromPosition));
  const toPosition = Math.max(0, Math.min(100, state.gradientToPosition));
  return {
    artColor,
    bgColor,
    colorMode: state.colorMode,
    gradientFrom,
    gradientTo,
    fromPosition,
    toPosition,
    gradientDirection: state.gradientDirection,
  };
}

function gradientStops(colors) {
  return [
    { color: colors.gradientFrom, position: colors.fromPosition / 100 },
    { color: colors.gradientTo, position: colors.toPosition / 100 },
  ].sort((a, b) => a.position - b.position);
}

function hexToRgb(hex) {
  const clean = String(hex || "#000000").replace("#", "");
  const normalized = clean.length === 3
    ? clean.split("").map((char) => char + char).join("")
    : clean.padEnd(6, "0").slice(0, 6);
  const value = Number.parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgbCss({ r, g, b }) {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

function mixRgb(from, to, amount) {
  return {
    r: from.r + (to.r - from.r) * amount,
    g: from.g + (to.g - from.g) * amount,
    b: from.b + (to.b - from.b) * amount,
  };
}

function getArtBounds(art, metrics, scale) {
  if (!art.cells.length) {
    return {
      minX: 0,
      minY: 0,
      maxX: metrics.width,
      maxY: metrics.height,
      centerX: metrics.width / 2,
      centerY: metrics.height / 2,
      width: metrics.width,
      height: metrics.height,
    };
  }

  const halfWidth = (metrics.cellWidth || CANVAS_CELL_WIDTH * scale) * 0.56;
  const halfHeight = (metrics.cellHeight || CANVAS_CELL_HEIGHT * scale) * 0.58;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  art.cells.forEach((cell) => {
    const position = getCellPosition(cell, art, metrics);
    minX = Math.min(minX, position.x - halfWidth);
    minY = Math.min(minY, position.y - halfHeight);
    maxX = Math.max(maxX, position.x + halfWidth);
    maxY = Math.max(maxY, position.y + halfHeight);
  });

  minX = Math.max(0, minX);
  minY = Math.max(0, minY);
  maxX = Math.min(metrics.width, maxX);
  maxY = Math.min(metrics.height, maxY);

  return {
    minX,
    minY,
    maxX,
    maxY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  };
}

function gradientPositionForPoint(position, bounds, direction) {
  if (direction === "right") {
    return (position.x - bounds.minX) / bounds.width;
  }

  if (direction === "diagonal") {
    const dx = bounds.width;
    const dy = bounds.height;
    const length = dx * dx + dy * dy || 1;
    return ((position.x - bounds.minX) * dx + (position.y - bounds.minY) * dy) / length;
  }

  if (direction === "radial") {
    const radius = Math.max(bounds.width, bounds.height) / 2 || 1;
    return Math.hypot(position.x - bounds.centerX, position.y - bounds.centerY) / radius;
  }

  return (position.y - bounds.minY) / bounds.height;
}

function colorForGradientPosition(position, bounds, colors) {
  const stops = gradientStops(colors);
  const first = stops[0];
  const last = stops[stops.length - 1];
  const t = Math.max(0, Math.min(1, gradientPositionForPoint(position, bounds, colors.gradientDirection)));

  if (t <= first.position) {
    return first.color;
  }

  if (t >= last.position) {
    return last.color;
  }

  const span = Math.max(0.001, last.position - first.position);
  const amount = (t - first.position) / span;
  return rgbCss(mixRgb(hexToRgb(first.color), hexToRgb(last.color), amount));
}

function createArtFill(ctx, art, metrics, colors, scale) {
  if (colors.colorMode !== "gradient") {
    return colors.artColor;
  }

  const bounds = getArtBounds(art, metrics, scale);

  if (colors.gradientDirection === "radial") {
    const radius = Math.max(bounds.width, bounds.height) / 2;
    const gradient = ctx.createRadialGradient(
      bounds.centerX,
      bounds.centerY,
      0,
      bounds.centerX,
      bounds.centerY,
      radius
    );
    gradientStops(colors).forEach((stop) => gradient.addColorStop(stop.position, stop.color));
    return gradient;
  }

  const points = {
    right: [bounds.minX, bounds.centerY, bounds.maxX, bounds.centerY],
    diagonal: [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY],
    down: [bounds.centerX, bounds.minY, bounds.centerX, bounds.maxY],
  }[colors.gradientDirection] || [bounds.centerX, bounds.minY, bounds.centerX, bounds.maxY];
  const gradient = ctx.createLinearGradient(...points);
  gradientStops(colors).forEach((stop) => gradient.addColorStop(stop.position, stop.color));
  return gradient;
}

function currentArtCssColor() {
  const colors = getArtColors();
  if (colors.colorMode === "gradient") {
    const stops = gradientStops(colors)
      .map((stop) => `${stop.color} ${Math.round(stop.position * 100)}%`)
      .join(", ");
    if (colors.gradientDirection === "radial") {
      return `radial-gradient(circle, ${stops})`;
    }
    return `linear-gradient(${colors.gradientDirection === "right" ? "90deg" : colors.gradientDirection === "diagonal" ? "135deg" : "180deg"}, ${stops})`;
  }
  return colors.artColor;
}

function updateGradientPreview() {
  if (!elements.gradientPreview) return;
  const colors = getArtColors();
  elements.gradientPreview.style.background = currentArtCssColor();
  elements.gradientStopHandles.forEach((handle) => {
    const isFrom = handle.dataset.gradientStop === "from";
    handle.style.setProperty("--stop-position", `${isFrom ? colors.fromPosition : colors.toPosition}%`);
    handle.style.setProperty("--stop-color", isFrom ? colors.gradientFrom : colors.gradientTo);
  });
}

function updateColorPanels() {
  elements.colorModeButtonList.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.colorMode === state.colorMode);
  });
  elements.solidColorPanel?.classList.toggle("is-hidden", state.colorMode !== "solid");
  elements.gradientColorPanel?.classList.toggle("is-hidden", state.colorMode !== "gradient");
  elements.gradientDirectionButtonList.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.gradientDirection === state.gradientDirection);
  });
  updateGradientPreview();
}

function syncColorSwatches(target) {
  const input = target === "background" ? elements.backgroundColor : elements.artColor;
  if (!input) return;
  const value = input.value.toLowerCase();
  elements.colorSwatches
    .filter((button) => button.dataset.colorTarget === target)
    .forEach((button) => {
      button.classList.toggle("is-active", button.dataset.colorValue.toLowerCase() === value);
    });
}

function updateColorCssVars() {
  const colors = getArtColors();
  document.documentElement.style.setProperty("--art-color", colors.artColor);
  document.documentElement.style.setProperty("--art-bg", colors.bgColor);
}

function getLayoutMetrics(art, scale) {
  const composition = elements.compositionSelect.value;
  const cellWidth = CANVAS_CELL_WIDTH * scale;
  const cellHeight = CANVAS_CELL_HEIGHT * scale;
  const baseWidth = Math.max(1, art.cols * cellWidth);
  const baseHeight = Math.max(1, art.rows * cellHeight);

  if (composition === "circle") {
    const size = Math.ceil(Math.max(baseWidth, baseHeight * 2.18, 420 * scale));
    const radiusOuter = size / 2 - 14 * scale;
    return {
      composition,
      cols: art.cols,
      rows: art.rows,
      cellWidth,
      cellHeight,
      width: size,
      height: size,
      centerX: size / 2,
      centerY: size / 2,
      radiusOuter,
      radiusInner: Math.max(12 * scale, radiusOuter - baseHeight),
    };
  }

  if (composition === "arc") {
    const curve = Math.max(48 * scale, Math.min(135 * scale, baseWidth * 0.11));
    return {
      composition,
      cols: art.cols,
      rows: art.rows,
      cellWidth,
      cellHeight,
      width: Math.ceil(baseWidth),
      height: Math.ceil(baseHeight + curve + 18 * scale),
      curve,
    };
  }

  return {
    composition,
    cols: art.cols,
    rows: art.rows,
    cellWidth,
    cellHeight,
    width: Math.ceil(baseWidth),
    height: Math.ceil(baseHeight),
  };
}

function getArtboardCanvasSize(scale = 1) {
  const preset = ARTBOARD_PRESETS[state.artboardPreset] || ARTBOARD_PRESETS.wide;
  return {
    width: Math.max(1, Math.round(preset.width * scale)),
    height: Math.max(1, Math.round(preset.height * scale)),
  };
}

function getArtboardFit(bounds, targetWidth, targetHeight) {
  const inset = Math.max(18, Math.min(targetWidth, targetHeight) * ARTBOARD_ART_INSET);
  const availableWidth = Math.max(1, targetWidth - inset * 2);
  const availableHeight = Math.max(1, targetHeight - inset * 2);
  const scale = Math.min(availableWidth / bounds.width, availableHeight / bounds.height);
  return {
    scale,
    x: targetWidth / 2 - bounds.centerX * scale,
    y: targetHeight / 2 - bounds.centerY * scale,
  };
}

function drawGrid(ctx, art, metrics, gridColor, scale) {
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = Math.max(1, scale);

  if (metrics.composition === "circle") {
    for (let row = 0; row <= art.rows; row += 2) {
      const radius = metrics.radiusOuter - row * metrics.cellHeight;
      if (radius <= metrics.radiusInner) break;
      ctx.beginPath();
      ctx.arc(metrics.centerX, metrics.centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (let col = 0; col < art.cols; col += 4) {
      const angle = -Math.PI / 2 + (col / art.cols) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(
        metrics.centerX + Math.cos(angle) * metrics.radiusInner,
        metrics.centerY + Math.sin(angle) * metrics.radiusInner
      );
      ctx.lineTo(
        metrics.centerX + Math.cos(angle) * metrics.radiusOuter,
        metrics.centerY + Math.sin(angle) * metrics.radiusOuter
      );
      ctx.stroke();
    }
  } else {
    for (let x = 0; x < metrics.width; x += metrics.cellWidth) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, metrics.height);
      ctx.stroke();
    }
    for (let y = 0; y < metrics.height; y += metrics.cellHeight) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(metrics.width, y + 0.5);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function getCellPosition(cell, art, metrics) {
  if (metrics.composition === "circle") {
    const angle = -Math.PI / 2 + ((cell.col + 0.5) / art.cols) * Math.PI * 2;
    const radius = metrics.radiusOuter - (cell.row + 0.54) * metrics.cellHeight;
    return {
      x: metrics.centerX + Math.cos(angle) * radius,
      y: metrics.centerY + Math.sin(angle) * radius,
      rotation: angle + Math.PI / 2,
      scanPosition: (angle + Math.PI * 1.5) % (Math.PI * 2),
    };
  }

  const x = cell.col * metrics.cellWidth + metrics.cellWidth / 2;
  let y = cell.row * metrics.cellHeight + metrics.cellHeight * 0.55;
  let rotation = 0;

  if (metrics.composition === "arc") {
    const t = art.cols > 1 ? cell.col / (art.cols - 1) : 0.5;
    y = metrics.curve + y - Math.sin(t * Math.PI) * metrics.curve * 0.82;
    rotation = Math.cos(t * Math.PI) * -0.18;
  }

  return { x, y, rotation, scanPosition: y };
}

function getCellAlpha(cell, position, metrics, animation, timestamp, scale) {
  if (animation === "scan") {
    if (metrics.composition === "circle") {
      const cycle = Math.PI * 2;
      const scan = ((timestamp / 1700) % 1) * cycle;
      const rawDistance = Math.abs(position.scanPosition - scan);
      const distance = Math.min(rawDistance, cycle - rawDistance);
      return 0.42 + Math.max(0, 1 - distance / 0.34) * 0.58;
    }

    const scanY = ((timestamp / 1700) % 1) * metrics.height;
    const distance = Math.abs(position.scanPosition - scanY);
    return 0.42 + Math.max(0, 1 - distance / (62 * scale)) * 0.58;
  }

  if (animation === "flicker") {
    const pulse = Math.sin(timestamp / 75 + cell.col * 1.7 + cell.row * 0.91);
    return pulse > -0.18 ? 1 : 0.58;
  }

  if (animation === "wave") {
    const pulse = Math.sin(timestamp / 260 + cell.col * 0.18 + cell.row * 0.42);
    return 0.78 + (pulse + 1) * 0.11;
  }

  if (animation === "reveal") {
    const cycle = (timestamp / 2600) % 1;
    const positionRatio = (cell.col / Math.max(1, metrics.cols || 1)) * 0.72 + (cell.row / Math.max(1, metrics.rows || 1)) * 0.28;
    const head = cycle * 1.35 - 0.12;
    const distance = head - positionRatio;
    if (distance < 0) return 0.08;
    return Math.min(1, 0.18 + distance / 0.16);
  }

  if (animation === "type") {
    const cycle = (timestamp / 1800) % 1;
    const indexRatio = (cell.row * Math.max(1, metrics.cols) + cell.col) / Math.max(1, metrics.cols * metrics.rows);
    const distance = cycle * 1.18 - indexRatio;
    if (distance < 0) return 0;
    return Math.min(1, 0.35 + distance / 0.08);
  }

  if (animation === "rain") {
    const cycle = (timestamp / 1500 + seededNoise(cell.col, 0, 2) * 0.44) % 1;
    const rowRatio = cell.row / Math.max(1, metrics.rows);
    const distance = Math.abs(rowRatio - cycle);
    return 0.32 + Math.max(0, 1 - distance / 0.12) * 0.68;
  }

  if (animation === "orbit") {
    const pulse = Math.sin(timestamp / 520 + cell.col * 0.25 + cell.row * 0.36);
    return 0.86 + (pulse + 1) * 0.07;
  }

  if (animation === "breathe") {
    const pulse = Math.sin(timestamp / 520);
    return 0.72 + (pulse + 1) * 0.14;
  }

  if (animation === "jitter") {
    const noise = seededNoise(cell.col, cell.row, Math.floor(timestamp / 90));
    return noise > 0.88 ? 0.7 : 1;
  }

  if (animation === "glitch") {
    const noise = seededNoise(cell.col, cell.row, Math.floor(timestamp / 120));
    return noise > 0.94 ? 0.42 : 1;
  }

  return 1;
}

function seededNoise(col, row, frame) {
  const raw = Math.sin(col * 12.9898 + row * 78.233 + frame * 37.719) * 43758.5453;
  return raw - Math.floor(raw);
}

function getAnimationTransform(cell, position, metrics, animation, timestamp, scale) {
  if (animation === "wave") {
    return {
      x: position.x,
      y: position.y + Math.sin(timestamp / 260 + cell.col * 0.18 + cell.row * 0.42) * 3.4 * scale,
      rotation: position.rotation,
      char: cell.char,
    };
  }

  if (animation === "orbit") {
    const phase = timestamp / 680 + cell.col * 0.21 + cell.row * 0.47;
    return {
      x: position.x + Math.cos(phase) * 1.7 * scale,
      y: position.y + Math.sin(phase) * 1.7 * scale,
      rotation: position.rotation + Math.sin(phase) * 0.035,
      char: cell.char,
    };
  }

  if (animation === "rain") {
    const fall = ((timestamp / 1500 + seededNoise(cell.col, cell.row, 5) * 0.34) % 1) - 0.5;
    return {
      x: position.x,
      y: position.y + fall * 4.2 * scale,
      rotation: position.rotation,
      char: cell.char,
    };
  }

  if (animation === "breathe") {
    const pulse = Math.sin(timestamp / 520) * 0.018;
    return {
      x: position.x,
      y: position.y,
      rotation: position.rotation + pulse,
      char: cell.char,
    };
  }

  if (animation === "jitter") {
    const frame = Math.floor(timestamp / 90);
    const noise = seededNoise(cell.col, cell.row, frame);
    return {
      x: position.x + (noise - 0.5) * 2.8 * scale,
      y: position.y + (seededNoise(cell.row, cell.col, frame) - 0.5) * 2.2 * scale,
      rotation: position.rotation,
      char: cell.char,
    };
  }

  if (animation === "glitch") {
    const frame = Math.floor(timestamp / 120);
    const noise = seededNoise(cell.col, cell.row, frame);
    if (noise > 0.92) {
      const chars = elements.fillText.value.trim() || DEFAULT_FILL;
      const units = graphemes(chars);
      const char = units[Math.floor(noise * units.length) % units.length] || cell.char;
      return {
        x: position.x + (noise > 0.965 ? 4 : -3) * scale,
        y: position.y,
        rotation: position.rotation,
        char,
      };
    }
  }

  return {
    x: position.x,
    y: position.y,
    rotation: position.rotation,
    char: cell.char,
  };
}

function drawArtCanvas(canvas, art, options = {}) {
  const outputScale = options.scale || 1;
  const fitToArtboard = options.fitToArtboard !== false;
  const renderScale = fitToArtboard ? 1 : outputScale;
  const metrics = getLayoutMetrics(art, renderScale);
  const naturalArtBounds = getArtBounds(art, metrics, renderScale);
  const target = fitToArtboard
    ? getArtboardCanvasSize(outputScale)
    : { width: metrics.width, height: metrics.height };
  const fit = fitToArtboard ? getArtboardFit(naturalArtBounds, target.width, target.height) : { scale: 1, x: 0, y: 0 };
  const colors = getArtColors();
  const includeBackground = options.includeBackground !== false;
  const includeGrid = options.includeGrid === true && includeBackground;
  const animation = options.animation || "none";
  const timestamp = options.timestamp || 0;
  const inkStrength = Math.max(1, Math.min(5, Number(elements.inkRange.value || 3)));
  const glyphWeight = Math.max(Number(elements.fontWeight.value || 800), inkStrength >= 3 ? 800 : 700);
  const glyphSize = Math.max(8, Math.round(13 * renderScale));
  const strokeWidth = Math.max(0, (inkStrength - 1) * 0.24 * renderScale);

  if (canvas.width !== target.width) canvas.width = target.width;
  if (canvas.height !== target.height) canvas.height = target.height;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, target.width, target.height);

  if (includeBackground) {
    ctx.fillStyle = colors.bgColor;
    ctx.fillRect(0, 0, target.width, target.height);
  }

  ctx.save();
  ctx.translate(fit.x, fit.y);
  ctx.scale(fit.scale, fit.scale);

  if (includeGrid) {
    drawGrid(ctx, art, metrics, GRID_COLOR, renderScale);
  }

  ctx.font = `${glyphWeight} ${glyphSize}px "Courier New", "Menlo", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.direction = "ltr";
  const artBounds = naturalArtBounds;
  const artFill = colors.colorMode === "gradient" ? null : createArtFill(ctx, art, metrics, colors, renderScale);
  if (artFill) {
    ctx.fillStyle = artFill;
    ctx.strokeStyle = artFill;
  }
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.lineWidth = strokeWidth;

  art.cells.forEach((cell) => {
    const position = getCellPosition(cell, art, metrics);
    const alpha = getCellAlpha(cell, position, metrics, animation, timestamp, renderScale);
    const animated = getAnimationTransform(cell, position, metrics, animation, timestamp, renderScale);
    ctx.save();
    ctx.globalAlpha = alpha;
    if (colors.colorMode === "gradient") {
      const cellColor = colorForGradientPosition(position, artBounds, colors);
      ctx.fillStyle = cellColor;
      ctx.strokeStyle = cellColor;
    }
    ctx.translate(animated.x, animated.y);
    ctx.rotate(animated.rotation);
    if (strokeWidth > 0) {
      ctx.strokeText(animated.char, 0, 0);
    }
    ctx.fillText(animated.char, 0, 0);
    ctx.restore();
  });

  ctx.restore();
}

function drawPreview(art, timestamp = 0) {
  updateColorCssVars();
  updateGradientPreview();
  const pixelScale = Math.max(PREVIEW_PIXEL_SCALE, Math.min(3, window.devicePixelRatio || 1));
  drawArtCanvas(elements.artCanvas, art, {
    scale: pixelScale,
    includeBackground: true,
    includeGrid: elements.gridToggle?.checked || false,
    animation: elements.animationSelect.value,
    timestamp,
  });
}

function stopAnimationLoop() {
  if (state.animationId) {
    window.cancelAnimationFrame(state.animationId);
    state.animationId = 0;
  }
}

function updateAnimation() {
  const animation = elements.animationSelect.value;
  elements.previewFrame.classList.toggle("is-scan", animation === "scan");
  elements.previewFrame.classList.toggle("is-flicker", animation === "flicker");
  updateExportOptions();
}

function updateExportOptions() {
  const animated = isAnimated();
  if (elements.downloadGif) {
    elements.downloadGif.disabled = !animated;
  }
}

function startAnimationLoop() {
  stopAnimationLoop();
  updateAnimation();

  if (!state.lastArt) return;

  if (elements.animationSelect.value === "none") {
    drawPreview(state.lastArt, 0);
    return;
  }

  const tick = (timestamp) => {
    drawPreview(state.lastArt, timestamp);
    state.animationId = window.requestAnimationFrame(tick);
  };

  state.animationId = window.requestAnimationFrame(tick);
}

function trimTransparentCanvas(sourceCanvas, padding) {
  const ctx = sourceCanvas.getContext("2d");
  const { width, height } = sourceCanvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const { data } = imageData;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] > 0) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) return sourceCanvas;

  const left = Math.max(0, minX - padding);
  const top = Math.max(0, minY - padding);
  const cropWidth = Math.min(width - left, maxX - minX + 1 + padding * 2);
  const cropHeight = Math.min(height - top, maxY - minY + 1 + padding * 2);
  const trimmed = document.createElement("canvas");
  trimmed.width = cropWidth;
  trimmed.height = cropHeight;
  trimmed.getContext("2d").drawImage(sourceCanvas, left, top, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
  return trimmed;
}

function createExportCanvas(options = {}) {
  const scale = options.scale || Number(elements.exportScale.value || 4);
  const includeBackground = options.includeBackground ?? elements.exportBackground.checked;
  const animation = options.animation || "none";
  const timestamp = options.timestamp || 0;
  const canvas = document.createElement("canvas");
  drawArtCanvas(canvas, state.lastArt, {
    scale,
    includeBackground,
    includeGrid: includeBackground && (elements.gridToggle?.checked || false),
    animation,
    timestamp,
  });

  if (includeBackground) return canvas;
  return trimTransparentCanvas(canvas, Math.round(22 * scale));
}

async function renderArt() {
  stopAnimationLoop();
  updateRangeLabels();
  updateAnimation();
  const rawText = elements.sourceText.value.trim() || "حب";
  const lines = rawText.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const filler = elements.fillText.value.trim() || DEFAULT_FILL;
  const family = state.currentFontFamily || elements.fontSelect.value || "Geeza Pro";
  const weight = elements.fontWeight.value;
  const requestedSize = Number(elements.sizeRange.value);
  let imageData;
  let fileBaseSource = rawText;

  if (state.sourceMode === "image") {
    if (!state.sourceImage) {
      state.lastArt = null;
      state.lastText = "";
      elements.textOutput.textContent = "";
      const ctx = elements.artCanvas.getContext("2d");
      ctx.clearRect(0, 0, elements.artCanvas.width, elements.artCanvas.height);
      return;
    }

    imageData = drawImageMask(state.sourceImage);
    fileBaseSource = state.sourceImageName || "image-ascii";
  } else if (state.sourceMode === "drawing") {
    if (!state.drawingHasInk) {
      state.lastArt = null;
      state.lastText = "";
      elements.textOutput.textContent = "";
      const ctx = elements.artCanvas.getContext("2d");
      ctx.clearRect(0, 0, elements.artCanvas.width, elements.artCanvas.height);
      return;
    }

    imageData = drawDrawingMask();
    fileBaseSource = "drawing-ascii";
  } else {
    await loadSelectedFont(requestedSize);
    imageData = drawMask(lines.length ? lines : ["حب"], family, weight, requestedSize);
  }

  const bounds = findInkBounds(imageData);
  if (!bounds) {
    elements.textOutput.textContent = "";
    return;
  }

  const art = buildTextArt(imageData, bounds, rawText, filler);
  state.lastArt = art;
  state.lastFamily = family;
  state.lastText = art.lines.join("\n");
  state.lastFileBase = fileBase(fileBaseSource);
  if (elements.charReadout) {
    elements.charReadout.textContent = `${art.cols} × ${art.rows} chars`;
  }

  drawPreview(art, 0);
  elements.textOutput.textContent = state.lastText;
  const colors = getArtColors();
  if (colors.colorMode === "gradient") {
    elements.textOutput.style.color = "transparent";
    elements.textOutput.style.backgroundImage = currentArtCssColor();
    elements.textOutput.style.backgroundClip = "text";
    elements.textOutput.style.webkitBackgroundClip = "text";
  } else {
    elements.textOutput.style.color = colors.artColor;
    elements.textOutput.style.backgroundImage = "none";
    elements.textOutput.style.backgroundClip = "";
    elements.textOutput.style.webkitBackgroundClip = "";
  }
  elements.textOutput.style.backgroundColor = colors.bgColor;
  elements.textOutput.style.fontWeight = String(
    Math.max(Number(elements.fontWeight.value || 800), Number(elements.inkRange.value || 3) >= 3 ? 800 : 700)
  );
  startAnimationLoop();
}

async function scanLocalFonts() {
  if (!("queryLocalFonts" in window)) {
    showLocalFontMessage(t("localFontsUnavailable"));
    return;
  }

  try {
    const availableFonts = await window.queryLocalFonts();
    const families = Array.from(new Set(availableFonts.map((font) => font.family).filter(Boolean))).sort((a, b) => a.localeCompare(b));
    const weightMap = new Map();

    availableFonts.forEach((font) => {
      if (!font.family) return;
      const label = font.style || font.fullName || "Regular";
      const value = styleNameToWeight(label);
      if (!weightMap.has(font.family)) weightMap.set(font.family, []);
      weightMap.get(font.family).push({ label, value });
    });

    const arabicHint = families.find((family) => /arabic|naskh|kufi|amiri|geeza|scheherazade|ruqaa|dubai|cairo|tajawal/i.test(family));
    state.deviceFonts = families.map((family) => ({ label: family, family }));
    families.forEach((family) => {
      state.fontWeightsByFamily.set(family, dedupeWeights(weightMap.get(family) || defaultWeights()));
    });
    state.localFontsLoaded = true;

    const fonts = localFonts();
    if (!fonts.length) {
      showLocalFontMessage(t("noLocalFonts"));
      return;
    }

    setAvailableFonts(fonts, arabicHint || state.currentFontFamily);
  } catch (error) {
    console.error(error);
    showLocalFontMessage(t("localFontsFailed"));
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[char];
  });
}

function downloadPngFile() {
  if (!state.lastArt) {
    return;
  }

  const exportCanvas = createExportCanvas();
  exportCanvas.toBlob((blob) => {
    if (!blob) {
      return;
    }
    downloadBlob(blob, `${state.lastFileBase}.png`);
  }, "image/png");
}

function downloadSvgFile() {
  if (!state.lastText) return;
  const lines = state.lastText.split("\n");
  const charWidth = 7.8;
  const lineHeight = 13;
  const width = Math.ceil(Math.max(1, ...lines.map((line) => line.length)) * charWidth + 40);
  const height = Math.ceil(Math.max(1, lines.length) * lineHeight + 40);
  const colors = getArtColors();
  const fill = colors.colorMode === "gradient" ? 'url(#symbolGradient)' : escapeHtml(colors.artColor);
  const stops = gradientStops(colors)
    .map((stop) => `<stop offset="${Math.round(stop.position * 100)}%" stop-color="${escapeHtml(stop.color)}"/>`)
    .join("");
  const defs = colors.colorMode === "gradient"
    ? `<defs><linearGradient id="symbolGradient" x1="0%" y1="0%" x2="${colors.gradientDirection === "down" ? "0%" : "100%"}" y2="${colors.gradientDirection === "right" ? "0%" : "100%"}">${stops}</linearGradient></defs>`
    : "";
  const textLines = lines
    .map((line, index) => `<text x="20" y="${28 + index * lineHeight}">${escapeHtml(line)}</text>`)
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
${defs}
<g fill="${fill}" font-family="Courier New, Menlo, monospace" font-size="11" font-weight="800" xml:space="preserve">
${textLines}
</g>
</svg>`;
  downloadBlob(new Blob([svg], { type: "image/svg+xml" }), `${state.lastFileBase}.svg`);
}

async function copyTextExport() {
  if (!state.lastText) return;
  try {
    await navigator.clipboard.writeText(state.lastText);
  } catch {
    downloadBlob(new Blob([state.lastText], { type: "text/plain" }), `${state.lastFileBase}.txt`);
  }
}

function downloadHtmlFile() {
  if (!state.lastText) return;
  const colors = getArtColors();
  const color = escapeHtml(colors.artColor);
  const textColorCss = colors.colorMode === "gradient"
    ? `color: transparent; background: ${currentArtCssColor()}; -webkit-background-clip: text; background-clip: text;`
    : `color: ${color};`;
  const html = `<!doctype html>
<html lang="${state.lang}" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(state.lastFileBase)}</title>
  <style>
    body { margin: 0; padding: 32px; background: transparent; }
    pre { margin: 0; font: 800 11px/0.92 "Courier New", Menlo, monospace; white-space: pre; ${textColorCss} }
  </style>
</head>
<body><pre>${escapeHtml(state.lastText)}</pre></body>
</html>`;
  downloadBlob(new Blob([html], { type: "text/html" }), `${state.lastFileBase}.html`);
}

function setAnimatedExportBusy(busy) {
  if (elements.downloadGif && isAnimated()) {
    elements.downloadGif.disabled = busy;
  }
}

function renderAnimationFrame(canvas, timestamp, scale) {
  drawArtCanvas(canvas, state.lastArt, {
    scale,
    includeBackground: true,
      includeGrid: elements.gridToggle?.checked || false,
    animation: elements.animationSelect.value,
    timestamp,
  });
}

async function downloadGifFile() {
  if (!state.lastArt || !isAnimated()) return;

  setAnimatedExportBusy(true);
  try {
    const { GIFEncoder, quantize, applyPalette } = await loadGifEncoderModule();
    const gif = GIFEncoder();
    const canvas = document.createElement("canvas");
    const frameCount = Math.round((ANIMATION_EXPORT_DURATION / 1000) * ANIMATION_EXPORT_FPS);
    const delay = Math.round(1000 / ANIMATION_EXPORT_FPS);

    for (let frame = 0; frame < frameCount; frame += 1) {
      const timestamp = (frame / frameCount) * ANIMATION_EXPORT_DURATION;
      renderAnimationFrame(canvas, timestamp, GIF_EXPORT_SCALE);
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const palette = quantize(imageData.data, 96);
      const index = applyPalette(imageData.data, palette);
      gif.writeFrame(index, canvas.width, canvas.height, { palette, delay });

      if (frame % 8 === 0) {
        await new Promise((resolve) => window.setTimeout(resolve, 0));
      }
    }

    gif.finish();
    downloadBlob(new Blob([gif.bytes()], { type: "image/gif" }), `${state.lastFileBase}.gif`);
  } finally {
    setAnimatedExportBusy(false);
  }
}

function setMode(mode, style = mode) {
  state.mode = mode;
  state.style = style;
  elements.modeButtons.forEach((button) => {
    button.classList.toggle("is-active", (button.dataset.style || button.dataset.mode) === style);
  });
  const activeButton = elements.modeButtons.find((button) => (button.dataset.style || button.dataset.mode) === style);
  if (activeButton?.dataset.fillValue) {
    elements.fillText.value = activeButton.dataset.fillValue;
    elements.fillPreset.value = "custom";
  }
  scheduleRender();
}

function setColorMode(mode) {
  state.colorMode = mode === "gradient" ? "gradient" : "solid";
  updateColorPanels();
  scheduleRender();
}

function setGradientDirection(direction) {
  state.gradientDirection = ["down", "right", "diagonal", "radial"].includes(direction) ? direction : "down";
  updateColorPanels();
  scheduleRender();
}

function setGradientStopPosition(stop, value) {
  const clamped = Math.max(0, Math.min(100, value));
  if (stop === "from") {
    state.gradientFromPosition = Math.min(clamped, state.gradientToPosition - 1);
  } else {
    state.gradientToPosition = Math.max(clamped, state.gradientFromPosition + 1);
  }
  updateGradientPreview();
  scheduleRender();
}

function setGradientStopFromPointer(stop, clientX) {
  if (!elements.gradientPreview) return;
  const rect = elements.gradientPreview.getBoundingClientRect();
  const raw = ((clientX - rect.left) / rect.width) * 100;
  setGradientStopPosition(stop, raw);
}

function beginGradientStopDrag(event) {
  const handle = event.target.closest("[data-gradient-stop]");
  if (!handle) return;
  state.gradientDraggingStop = handle.dataset.gradientStop;
  handle.setPointerCapture?.(event.pointerId);
  setGradientStopFromPointer(state.gradientDraggingStop, event.clientX);
}

function continueGradientStopDrag(event) {
  if (!state.gradientDraggingStop) return;
  setGradientStopFromPointer(state.gradientDraggingStop, event.clientX);
}

function endGradientStopDrag() {
  state.gradientDraggingStop = null;
}

[
  elements.sourceText,
  elements.compositionSelect,
  elements.artColor,
  elements.backgroundColor,
  elements.gradientFrom,
  elements.gradientTo,
  elements.inkRange,
  elements.animationSelect,
  elements.exportBackground,
  elements.fontWeight,
  elements.sizeRange,
  elements.detailRange,
  elements.thresholdRange,
].filter(Boolean).forEach((control) => {
  control.addEventListener("input", scheduleRender);
  control.addEventListener("change", scheduleRender);
});

[elements.artColor, elements.backgroundColor, elements.gradientFrom, elements.gradientTo].filter(Boolean).forEach((control) => {
  control.addEventListener("input", () => {
    syncColorSwatches("art");
    syncColorSwatches("background");
    updateGradientPreview();
  });
  control.addEventListener("change", () => {
    syncColorSwatches("art");
    syncColorSwatches("background");
    updateGradientPreview();
  });
});

elements.colorModeButtons?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-color-mode]");
  if (!button) return;
  setColorMode(button.dataset.colorMode);
});

elements.gradientDirectionButtons?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-gradient-direction]");
  if (!button) return;
  setGradientDirection(button.dataset.gradientDirection);
});

elements.gradientStopHandles.forEach((handle) => {
  handle.addEventListener("pointerdown", beginGradientStopDrag);
  handle.addEventListener("pointermove", continueGradientStopDrag);
  handle.addEventListener("pointerup", endGradientStopDrag);
  handle.addEventListener("pointercancel", endGradientStopDrag);
});

elements.colorSwatches.forEach((button) => {
  button.addEventListener("click", () => {
    const input = button.dataset.colorTarget === "background" ? elements.backgroundColor : elements.artColor;
    if (!input) return;
    input.value = button.dataset.colorValue;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
});

elements.fillPreset.addEventListener("change", applyFillPreset);
elements.fillText.addEventListener("input", handleCustomFillInput);
elements.randomizeText.addEventListener("click", randomizeText);
elements.accordionButtons.forEach((button) => {
  button.addEventListener("click", () => toggleAccordion(button));
});
elements.sourceModeButtons.addEventListener("click", (event) => {
  const button = event.target.closest("[data-source-mode]");
  if (button) setSourceMode(button.dataset.sourceMode);
});
elements.imageUploadTrigger.addEventListener("click", () => elements.imageUpload.click());
elements.imageUpload.addEventListener("change", handleImageUpload);
elements.drawingCanvas.addEventListener("pointerdown", beginDrawing);
elements.drawingCanvas.addEventListener("pointermove", continueDrawing);
elements.drawingCanvas.addEventListener("pointerup", endDrawing);
elements.drawingCanvas.addEventListener("pointercancel", endDrawing);
elements.drawingCanvas.addEventListener("pointerleave", endDrawing);
elements.clearDrawing.addEventListener("click", clearDrawingCanvas);
elements.expandDrawing.addEventListener("click", () => setDrawingExpanded(true));
elements.collapseDrawing.addEventListener("click", () => setDrawingExpanded(false));
elements.drawingResultToggle.addEventListener("click", () => setDrawingResultView(!state.drawingResultView));
elements.fontSourceButtons.addEventListener("click", (event) => {
  const button = event.target.closest("[data-font-source]");
  if (!button) return;

  if (button.dataset.fontSource === "local") {
    showLocalFonts().catch((error) => {
      console.error(error);
    });
  } else {
    showBasicFonts();
  }
});
elements.fontSelect.addEventListener("change", () => setFontFamily(elements.fontSelect.value));
elements.zoomOut.addEventListener("click", () => setCanvasZoom(state.canvasZoom - 0.1));
elements.zoomIn.addEventListener("click", () => setCanvasZoom(state.canvasZoom + 0.1));
elements.artboardMenuToggle.addEventListener("click", () => {
  setArtboardMenu(!elements.artboardMenu.classList.contains("is-open"));
});
elements.artboardPresetButtons.forEach((button) => {
  button.addEventListener("click", () => setArtboardPreset(button.dataset.artboardPreset));
});
elements.canvasStage.addEventListener("pointerdown", beginCanvasPan);
elements.canvasStage.addEventListener("pointermove", continueCanvasPan);
elements.canvasStage.addEventListener("pointerup", endCanvasPan);
elements.canvasStage.addEventListener("pointercancel", endCanvasPan);
elements.canvasStage.addEventListener("wheel", handleCanvasWheel, { passive: false });
elements.sidebarToggle.addEventListener("click", toggleSidebar);
elements.downloadPng.addEventListener("click", downloadPngFile);
elements.downloadSvg.addEventListener("click", downloadSvgFile);
elements.copyText.addEventListener("click", () => {
  copyTextExport().catch((error) => {
    console.error(error);
  });
});
if (elements.downloadHtml) {
  elements.downloadHtml.addEventListener("click", downloadHtmlFile);
}
if (elements.downloadGif) {
  elements.downloadGif.addEventListener("click", () => {
    downloadGifFile().catch((error) => {
      console.error(error);
    });
  });
}
elements.languageToggle.addEventListener("click", (event) => {
  const button = event.target.closest("[data-lang]");
  if (button) applyLanguage(button.dataset.lang);
});

document.addEventListener("click", (event) => {
  if (!elements.artboardMenu.contains(event.target)) {
    setArtboardMenu(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setArtboardMenu(false);
    if (state.drawingExpanded) {
      setDrawingExpanded(false);
    }
  }
});

window.addEventListener("resize", fitCanvasToStage);

elements.modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode, button.dataset.style || button.dataset.mode));
});

updateRangeLabels();
seedFontRegistry();
renderFontOptions("");
syncFontSourceButtons();
updateExportOptions();
updateColorPanels();
syncColorSwatches("art");
syncColorSwatches("background");
updateColorCssVars();
clearDrawingCanvas();
setArtboardPreset("wide");
applyLanguage(state.lang);
scheduleRender();

return {
  destroy() {
    stopAnimationLoop();
    window.removeEventListener("resize", fitCanvasToStage);
  },
};
}
