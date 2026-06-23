const elements = {
  sourceModeButtons: document.querySelector("#sourceModeButtons"),
  sourceText: document.querySelector("#sourceText"),
  textSourceField: document.querySelector(".text-source-field"),
  imageSourcePanel: document.querySelector("#imageSourcePanel"),
  imageUploadTrigger: document.querySelector("#imageUploadTrigger"),
  imageUpload: document.querySelector("#imageUpload"),
  imageInfo: document.querySelector("#imageInfo"),
  fillPreset: document.querySelector("#fillPreset"),
  fillText: document.querySelector("#fillText"),
  fontSourceButtons: document.querySelector("#fontSourceButtons"),
  fontSelect: document.querySelector("#fontSelect"),
  fontWeight: document.querySelector("#fontWeight"),
  compositionSelect: document.querySelector("#compositionSelect"),
  artColor: document.querySelector("#artColor"),
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
  tabButtons: Array.from(document.querySelectorAll(".tab-button")),
  artCanvas: document.querySelector("#artCanvas"),
  maskCanvas: document.querySelector("#maskCanvas"),
  previewFrame: document.querySelector("#previewFrame"),
  textOutput: document.querySelector("#textOutput"),
  exportMenu: document.querySelector("#exportMenu"),
  exportToggle: document.querySelector("#exportToggle"),
  downloadPng: document.querySelector("#downloadPng"),
  downloadGif: document.querySelector("#downloadGif"),
};

const state = {
  sourceMode: "text",
  sourceImage: null,
  sourceImageName: "",
  mode: "code",
  tab: "canvas",
  renderId: 0,
  imageProcessId: 0,
  animationId: 0,
  fontSource: "basic",
  basicFonts: [],
  localFontsLoaded: false,
  availableFonts: [],
  fontWeightsByFamily: new Map(),
  currentFontFamily: "",
  deviceFonts: [],
  lastArt: null,
  lastFamily: "",
  lastText: "",
  lastFileBase: "arabic-ascii",
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
const GIFENC_MODULE_URL = "https://cdn.jsdelivr.net/npm/gifenc@1.0.3/dist/gifenc.esm.js";
const BACKGROUND_REMOVAL_MODULE_URL = "https://esm.sh/@imgly/background-removal@1.7.0?bundle";
const BACKGROUND_REMOVAL_PUBLIC_PATH = "https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/";
let backgroundRemovalModulePromise = null;
let gifEncoderModulePromise = null;

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
    backgroundRemovalModulePromise = import(BACKGROUND_REMOVAL_MODULE_URL);
  }

  return backgroundRemovalModulePromise;
}

function loadGifEncoderModule() {
  if (!gifEncoderModulePromise) {
    gifEncoderModulePromise = import(GIFENC_MODULE_URL);
  }

  return gifEncoderModulePromise;
}

function isAnimated() {
  return elements.animationSelect.value !== "none";
}

function formatModelProgress(key, loaded, total) {
  if (!total || total <= 0) return "قص الخلفية...";
  const percent = Math.min(100, Math.max(0, Math.round((loaded / total) * 100)));
  if (key.includes("model")) return `تحميل نموذج القص ${percent}%`;
  return `تجهيز القص ${percent}%`;
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

function updateRangeLabels() {
  elements.sizeValue.textContent = elements.sizeRange.value;
  elements.detailValue.textContent = elements.detailRange.value;
  elements.thresholdValue.textContent = elements.thresholdRange.value;
  elements.inkValue.textContent = elements.inkRange.value;
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

function setSourceMode(mode) {
  state.sourceMode = mode;
  elements.sourceModeButtons.querySelectorAll("[data-source-mode]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.sourceMode === mode);
  });
  elements.textSourceField.classList.toggle("is-hidden", mode !== "text");
  elements.imageSourcePanel.classList.toggle("is-hidden", mode !== "image");
  scheduleRender();
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
    elements.imageInfo.textContent = "قص الخلفية...";

    try {
      const cutoutImage = await removeImageBackground(file, processId);
      if (processId !== state.imageProcessId) return;
      state.sourceImage = cutoutImage;
      elements.imageInfo.textContent = `${file.name} · تم قص الخلفية`;
    } catch (modelError) {
      console.warn("Background removal failed; using original image.", modelError);
      if (processId !== state.imageProcessId) return;
      state.sourceImage = await loadImageFile(file);
      elements.imageInfo.textContent = `${file.name} · استخدمت الصورة الأصلية`;
    }

    scheduleRender();
  } catch (error) {
    console.error(error);
    state.sourceImage = null;
    elements.imageInfo.textContent = "تعذر تحميل الصورة";
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
  const artColor = elements.artColor.value || "#111111";
  const bgColor = PREVIEW_BACKGROUND;
  return { artColor, bgColor };
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
  const scale = options.scale || 1;
  const metrics = getLayoutMetrics(art, scale);
  const { artColor, bgColor } = getArtColors();
  const includeBackground = options.includeBackground !== false;
  const includeGrid = options.includeGrid === true && includeBackground;
  const animation = options.animation || "none";
  const timestamp = options.timestamp || 0;
  const inkStrength = Math.max(1, Math.min(5, Number(elements.inkRange.value || 3)));
  const glyphWeight = Math.max(Number(elements.fontWeight.value || 800), inkStrength >= 3 ? 800 : 700);
  const glyphSize = Math.max(8, Math.round(13 * scale));
  const strokeWidth = Math.max(0, (inkStrength - 1) * 0.24 * scale);

  if (canvas.width !== metrics.width) canvas.width = metrics.width;
  if (canvas.height !== metrics.height) canvas.height = metrics.height;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, metrics.width, metrics.height);

  if (includeBackground) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, metrics.width, metrics.height);
  }

  if (includeGrid) {
    drawGrid(ctx, art, metrics, GRID_COLOR, scale);
  }

  ctx.font = `${glyphWeight} ${glyphSize}px "Courier New", "Menlo", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.direction = "ltr";
  ctx.fillStyle = artColor;
  ctx.strokeStyle = artColor;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.lineWidth = strokeWidth;

  art.cells.forEach((cell) => {
    const position = getCellPosition(cell, art, metrics);
    const alpha = getCellAlpha(cell, position, metrics, animation, timestamp, scale);
    const animated = getAnimationTransform(cell, position, metrics, animation, timestamp, scale);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(animated.x, animated.y);
    ctx.rotate(animated.rotation);
    if (strokeWidth > 0) {
      ctx.strokeText(animated.char, 0, 0);
    }
    ctx.fillText(animated.char, 0, 0);
    ctx.restore();
  });
}

function drawPreview(art, timestamp = 0) {
  drawArtCanvas(elements.artCanvas, art, {
    scale: 1,
    includeBackground: true,
    includeGrid: elements.gridToggle.checked,
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
  elements.downloadGif.disabled = !animated;
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
    includeGrid: includeBackground && elements.gridToggle.checked,
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

  drawPreview(art, 0);
  elements.textOutput.textContent = state.lastText;
  elements.textOutput.style.color = elements.artColor.value || "#111111";
  elements.textOutput.style.backgroundColor = "transparent";
  elements.textOutput.style.fontWeight = String(
    Math.max(Number(elements.fontWeight.value || 800), Number(elements.inkRange.value || 3) >= 3 ? 800 : 700)
  );
  startAnimationLoop();
}

async function scanLocalFonts() {
  if (!("queryLocalFonts" in window)) {
    showLocalFontMessage("فحص خطوط الجهاز غير متاح");
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
      showLocalFontMessage("لم يتم العثور على خطوط محلية");
      return;
    }

    setAvailableFonts(fonts, arabicHint || state.currentFontFamily);
  } catch (error) {
    console.error(error);
    showLocalFontMessage("تعذر فحص خطوط الجهاز");
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

function setAnimatedExportBusy(busy) {
  if (isAnimated()) {
    elements.downloadGif.disabled = busy;
  }
}

function renderAnimationFrame(canvas, timestamp, scale) {
  drawArtCanvas(canvas, state.lastArt, {
    scale,
    includeBackground: true,
    includeGrid: elements.gridToggle.checked,
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

function setMode(mode) {
  state.mode = mode;
  elements.modeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mode === mode);
  });
  scheduleRender();
}

function setTab(tab) {
  state.tab = tab;
  elements.tabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === tab);
  });
  elements.artCanvas.classList.toggle("is-hidden", tab !== "canvas");
  elements.textOutput.classList.toggle("is-hidden", tab !== "text");
}

function setExportMenu(open) {
  elements.exportMenu.classList.toggle("is-open", open);
  elements.exportToggle.setAttribute("aria-expanded", String(open));
}

function toggleExportMenu() {
  setExportMenu(!elements.exportMenu.classList.contains("is-open"));
}

[
  elements.sourceText,
  elements.compositionSelect,
  elements.artColor,
  elements.inkRange,
  elements.animationSelect,
  elements.gridToggle,
  elements.exportBackground,
  elements.fontWeight,
  elements.sizeRange,
  elements.detailRange,
  elements.thresholdRange,
].forEach((control) => {
  control.addEventListener("input", scheduleRender);
  control.addEventListener("change", scheduleRender);
});

elements.fillPreset.addEventListener("change", applyFillPreset);
elements.fillText.addEventListener("input", handleCustomFillInput);
elements.sourceModeButtons.addEventListener("click", (event) => {
  const button = event.target.closest("[data-source-mode]");
  if (button) setSourceMode(button.dataset.sourceMode);
});
elements.imageUploadTrigger.addEventListener("click", () => elements.imageUpload.click());
elements.imageUpload.addEventListener("change", handleImageUpload);
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
elements.exportToggle.addEventListener("click", toggleExportMenu);
elements.downloadPng.addEventListener("click", downloadPngFile);
elements.downloadGif.addEventListener("click", () => {
  downloadGifFile().catch((error) => {
    console.error(error);
  });
});

[elements.downloadPng, elements.downloadGif].forEach((button) => {
  button.addEventListener("click", () => setExportMenu(false));
});

document.addEventListener("click", (event) => {
  if (!elements.exportMenu.contains(event.target)) {
    setExportMenu(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setExportMenu(false);
  }
});

elements.modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

elements.tabButtons.forEach((button) => {
  button.addEventListener("click", () => setTab(button.dataset.tab));
});

updateRangeLabels();
seedFontRegistry();
renderFontOptions("");
syncFontSourceButtons();
updateExportOptions();
setTab("canvas");
scheduleRender();
